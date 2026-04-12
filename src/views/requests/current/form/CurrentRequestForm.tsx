/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FormikHelpers } from 'formik'
import { Field, FieldProps, Form, Formik, FormikProps, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { PaginatedResponse } from '@/@types/common'
import { CurrentRequestContract } from '@/@types/contract.types'
import { FormPatternInput } from '@/components/shared'
import { FormContainer, FormItem, Input, Select } from '@/components/ui'
import { CustomerService } from '@/services/customer.service'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { DatasetService } from '@/services/dataset.service'
import { Branch } from '@/@types/dataset.types'
import { JuristContact, JuristContactsService } from '@/views/jurist/contracts/jurist-contacts.service'
import { formatPrice } from '@/utils/format'

export type FormModel = {
	code: string
	stir: string | null
	contract: number | null
	company_name: string | null
	phone_number: string | null
	overdue_amount: string | null
	main_amount_of_payment: string | null
	address: string | null
	tech_name: string | null
	html_document?: string | null
	pdf_document?: string | null
	// Yurist uchun yangi maydonlar
	jurist_full_name: string | null
	jurist_role: string | null
	jurist_phone: string | null
}

type OneCResponse<T> = { data: T }
export type CompanyPayload = Record<string, string>

type FormProps = {
	values: FormModel
	onSubmitComplete: (values: FormModel) => void
	isSubmitting?: boolean
	onValuesChange?: (values: FormModel) => void
	onCompanyDataChange?: (payload: CompanyPayload | null) => void
	onContractDataChange?: (payload: CurrentRequestContract | null) => void
}

const FormObserver = ({ onChange }: { onChange?: (vals: FormModel) => void }) => {
	const { values } = useFormikContext<FormModel>()
	useEffect(() => {
		onChange?.(values)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [values])

	return null
}

const PAGE_SIZE = 50
const sanitizeStir = (s: string) => (s || '').replace(/\D/g, '')

const CurrentRequestForm = forwardRef<FormikProps<FormModel>, FormProps>(
	(
		{
			values,
			onSubmitComplete,
			isSubmitting,
			onValuesChange,
			onCompanyDataChange,
			onContractDataChange,
		},
		ref
	) => {
		type Opt = { label: string; value: number; data: CurrentRequestContract }

		const { t } = useTranslation()

		// Contract infinite scroll / filtering
		const [contractOptions, setContractOptions] = useState<Opt[]>([])
		const [page, setPage] = useState(1)
		const [hasMore, setHasMore] = useState(true)
		const [isLoadingContracts, setIsLoadingContracts] = useState(false)
		const loadedIdsRef = useRef<Set<number>>(new Set())

		// STIR filter
		const [currentFilterStir, setCurrentFilterStir] = useState<string | null>(null)
		const lastLoadedStirRef = useRef<string | null>(null)

		// Branch — contract tanlanganda branch.id keladi → disable
		// Agar kelmasa → user tanlaydi (enabled)
		const [branchFromContract, setBranchFromContract] = useState<number | null>(null)
		const [branchNameFromContract, setBranchNameFromContract] = useState<string | null>(null)
		const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
		const [branches, setBranches] = useState<Branch[]>([])
		const [isLoadingBranches, setIsLoadingBranches] = useState(false)

		// Yurist ro'yxati (faqat birinchisini avtomatik tanlaymiz, select ko'rsatilmaydi)

		const validationSchema = Yup.object().shape({
			code: Yup.string().trim().max(100, t('Макс. 100 символов')),
			contract: Yup.number().nullable().required(t('Поле обязательно')),
			company_name: Yup.string().trim().max(255, t('Макс. 255 символов')),
			stir: Yup.string().trim().max(255, t('Макс. 255 символов')).required(t('Поле обязательно')),
			phone_number: Yup.string()
				.transform((v) => v ?? '')
				.test('uz-phone', t('Телефон должен быть 9 или 12 цифр'), (v) => {
					const d = String(v || '').replace(/\D/g, '')

					return d.length === 9 || (d.length === 12 && d.startsWith('998'))
				})
				.required(t('Поле обязательно')),
			overdue_amount: Yup.string().trim(),
		})

		// ===== Branch va Juristlarni yuklash =====

		const loadBranches = async () => {
			if (branches.length > 0) return
			setIsLoadingBranches(true)
			try {
				const res = await DatasetService.getAllBranches<Branch[]>()
				setBranches(res.data ?? [])
			} catch {
				setBranches([])
			} finally {
				setIsLoadingBranches(false)
			}
		}

		const loadJuristsByBranch = async (branchId: number, setFieldValue?: FormikHelpers<FormModel>['setFieldValue']) => {
			try {
				const res = await JuristContactsService.getAll({ branch: branchId, size: 100 })
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const results = (res.data as any)?.results ?? res.data ?? []
				const jurists = results as JuristContact[]

				// Birinchi yuristni avtomatik tanlaymiz
				if (jurists.length > 0 && setFieldValue) {
					const first = jurists[0]
					setFieldValue('jurist_full_name', first.full_name)
					setFieldValue('jurist_role', first.role ?? null)
					setFieldValue('jurist_phone', first.phone_number ?? null)
				}
			} catch (_e) {
				// xato bo'lsa default qiymatlar qoladi
			}
		}

		// Branch o'zgarganda yuristlarni yuklash — contract onChange da chaqiriladi

		// ===== 1C Kompaniya =====
		const fetchCompanyByStir = async (
			stir: string,
			setFieldValue: FormikHelpers<FormModel>['setFieldValue']
		) => {
			if (!stir) return
			try {
				const res = await PaymentNoticeService.getCompanyByStir<OneCResponse<CompanyPayload>>(stir)
				const payload = res?.data?.data ?? (res as any)?.data ?? null
				if (payload) {
					const name =
						(payload as any)['Наименование'] ||
						(payload as any)['name'] ||
						''
					setFieldValue('company_name', name)
					onCompanyDataChange?.(payload as CompanyPayload)
				}
			} catch {
				onCompanyDataChange?.(null)
			}
		}

		// ===== Contract infinite scroll =====
		const fetchContractsPage = async (
			nextPage: number,
			reset = false,
			filterStir?: string | null
		) => {
			if (isLoadingContracts) return
			setIsLoadingContracts(true)
			try {
				const stir = filterStir ?? currentFilterStir ?? undefined

				const params: Record<string, unknown> = {
					overdue_amount_start: 1,
					page: nextPage,
					size: PAGE_SIZE,
					stir,
				}

				const res =
					await CustomerService.getAllCurrentContracts<PaginatedResponse<CurrentRequestContract[]>>(
						params
					)

				const results = res?.data?.results ?? []
				const count = res?.data?.count ?? results.length

				const fresh: Opt[] = results
					.filter((it) => !loadedIdsRef.current.has(it.id))
					.map((item) => ({
						label: item.contract_id,
						value: item.id,
						data: item,
					}))

				fresh.forEach((o) => loadedIdsRef.current.add(o.value))

				if (reset) setContractOptions(fresh)
				else setContractOptions((prev) => [...prev, ...fresh])

				const computedHasMore = (res?.data as any)?.next != null || nextPage * PAGE_SIZE < count
				setHasMore(computedHasMore)
				setPage(nextPage)
			} catch {
				if (reset) setContractOptions([])
				setHasMore(false)
			} finally {
				setIsLoadingContracts(false)
			}
		}

		const resetAndLoadByStir = async (
			rawStir: string,
			setFieldValue: FormikHelpers<FormModel>['setFieldValue']
		) => {
			const stir = sanitizeStir(rawStir)
			setFieldValue('stir', stir)

			await fetchCompanyByStir(stir, setFieldValue)

			setCurrentFilterStir(stir)
			loadedIdsRef.current.clear()
			setContractOptions([])
			setHasMore(true)
			setPage(0)

			setFieldValue('contract', null)
			setFieldValue('overdue_amount', '')
			setFieldValue('main_amount_of_payment', '')
			setFieldValue('address', '')
			setFieldValue('tech_name', '')
			setFieldValue('phone_number', '')
			setFieldValue('code', '')
			setFieldValue('jurist_full_name', null)
			setFieldValue('jurist_role', null)
			setFieldValue('jurist_phone', null)
			setBranchFromContract(null)
			setBranchNameFromContract(null)
			setSelectedBranchId(null)
			onContractDataChange?.(null)

			await fetchContractsPage(1, true, stir)
			lastLoadedStirRef.current = stir
		}

		const handleMenuOpen = () => {
			if (!contractOptions.length && currentFilterStir) {
				loadedIdsRef.current.clear()
				void fetchContractsPage(1, true, currentFilterStir)
			}
		}

		const handleMenuScrollToBottom = () => {
			if (hasMore && !isLoadingContracts && currentFilterStir) {
				void fetchContractsPage(page + 1, false, currentFilterStir)
			}
		}

		return (
			<Formik<FormModel>
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={(vals) => onSubmitComplete(vals)}
			>
				{(formik) => {
					const { values, touched, errors, setFieldValue } = formik

					return (
						<Form className="mt-8">
							<FormObserver onChange={onValuesChange} />

							<FormContainer>
								{/* STIR */}
								<FormItem invalid={!!(errors.stir && touched.stir)} errorMessage={errors.stir}>
									<h6 className="mb-2">{t('ИНН')}</h6>
									<Field name="stir">
										{({ field }: FieldProps) => (
											<Input
												{...field}
												invalid={!!errors.stir}
												type="text"
												placeholder={t("Введите ИНН и нажмите Enter...")}
												onKeyDown={async (e) => {
													if (e.key === 'Enter' && field.value) {
														e.preventDefault()
														await resetAndLoadByStir(field.value, setFieldValue)
													}
												}}
												onBlur={async () => {
													const cleanStir = (field.value || '').replace(/\D/g, '')
													if (cleanStir) {
														if (lastLoadedStirRef.current !== cleanStir) {
															await resetAndLoadByStir(cleanStir, setFieldValue)
														}
													} else {
														setCurrentFilterStir(null)
														loadedIdsRef.current.clear()
														setContractOptions([])
														setFieldValue('contract', null)
														setFieldValue('overdue_amount', '')
														setFieldValue('main_amount_of_payment', '')
														setFieldValue('address', '')
														setFieldValue('tech_name', '')
														setFieldValue('phone_number', '')
														setFieldValue('company_name', '')
														setFieldValue('code', '')
														setFieldValue('jurist_full_name', null)
														setFieldValue('jurist_role', null)
														setFieldValue('jurist_phone', null)
														setBranchFromContract(null)
														setSelectedBranchId(null)
														lastLoadedStirRef.current = null
														onContractDataChange?.(null)
													}
												}}
											/>
										)}
									</Field>
								</FormItem>

								{/* Company Name */}
								<FormItem
									invalid={!!(errors.company_name && touched.company_name)}
									errorMessage={errors.company_name}
								>
									<h6 className="mb-2">{t('Название компании')}</h6>
									<Field name="company_name" type="text" component={Input} disabled />
								</FormItem>

								{/* Contract Select */}
								<FormItem
									invalid={!!(errors.contract && touched.contract)}
									errorMessage={errors.contract}
								>
									<h6 className="mb-2">{t('Контракт')}</h6>
									<Field name="contract">
										{({ field, form }: FieldProps) => (
											<Select
												placeholder={
													currentFilterStir
														? isLoadingContracts
															? t('Загрузка...')
															: t('Выберите контракт')
														: t('Сначала введите STIR и нажмите Enter')
												}
												isClearable
												isDisabled={!!isSubmitting || !currentFilterStir}
												field={field}
												form={form}
												options={contractOptions}
												value={contractOptions.find((opt) => opt.value === values.contract) || null}
												onMenuOpen={handleMenuOpen}
												onMenuScrollToBottom={handleMenuScrollToBottom}
												onChange={(option: Opt | null) => {
													form.setFieldValue(field.name, option?.value ?? null)

													if (option?.data) {
														const c = option.data
														form.setFieldValue(
															'overdue_amount',
															c.overdue_amount != null ? String(c.overdue_amount) : ''
														)
														form.setFieldValue(
															'main_amount_of_payment',
															c.overall_contract_amount != null
																? String(c.overall_contract_amount)
																: ''
														)
														form.setFieldValue('tech_name', (c as any)?.tech_name ?? '')
														const addr =
															(c as any)?.address ??
															(c as any)?.customer_address ??
															(c as any)?.client_address ??
															''
														form.setFieldValue('address', addr)
														form.setFieldValue('phone_number', (c as any)?.client_phone_number ?? '')
														onContractDataChange?.(c)

														// === Branch logikasi ===
														const branchId = (c as any)?.branch?.id ?? (c as any)?.branch ?? null
														const branchName = (c as any)?.branch?.name ?? null
														const numBranchId = branchId ? Number(branchId) : null
														setBranchFromContract(numBranchId)
														setBranchNameFromContract(branchName)
														setSelectedBranchId(null)

														// Yurist fieldlarini tozalab, birinchi yuristni avtomatik olamiz
														form.setFieldValue('jurist_full_name', null)
														form.setFieldValue('jurist_role', null)
														form.setFieldValue('jurist_phone', null)

														if (numBranchId) {
															void loadJuristsByBranch(numBranchId, form.setFieldValue)
														} else {
															// Branch kelmasa — branches ro'yxatini yuk (branch select uchun)
															void loadBranches()
														}
													} else {
														form.setFieldValue('overdue_amount', '')
														form.setFieldValue('main_amount_of_payment', '')
														form.setFieldValue('tech_name', '')
														form.setFieldValue('phone_number', '')
														form.setFieldValue('address', '')
														form.setFieldValue('code', '')
														form.setFieldValue('jurist_full_name', null)
														form.setFieldValue('jurist_role', null)
														form.setFieldValue('jurist_phone', null)
														setBranchFromContract(null)
														setBranchNameFromContract(null)
														setSelectedBranchId(null)
														onContractDataChange?.(null)
													}
												}}
											/>
										)}
									</Field>
								</FormItem>

								{/* Branch Select — contract tanlangandan keyin ko'rinadi */}
								{values.contract != null && (
									<FormItem>
										<h6 className="mb-2">{t('Филиал')}</h6>
										{branchFromContract ? (
											// Branch contractdan kelgan — disabled, nom ko'rsatiladi
											<Input
												disabled
												value={
													branchNameFromContract ??
													branches.find((b) => b.id === branchFromContract)?.name ??
													`Branch #${branchFromContract}`
												}
											/>
										) : (
											// Branch kelmadi — user tanlaydi
											<Select
												placeholder={
													isLoadingBranches
														? t('Загрузка филиалов...')
														: t('Выберите филиал')
												}
												isLoading={isLoadingBranches}
												options={branches.map((b) => ({ label: b.name, value: b.id }))}
												value={
													selectedBranchId
														? branches
														.map((b) => ({ label: b.name, value: b.id }))
														.find((o) => o.value === selectedBranchId) ?? null
														: null
												}
												onChange={(opt: { label: string; value: number } | null) => {
													const id = opt?.value ?? null
													setSelectedBranchId(id)
													setFieldValue('jurist_full_name', null)
													setFieldValue('jurist_role', null)
													setFieldValue('jurist_phone', null)
													if (id) {
														void loadJuristsByBranch(id, setFieldValue)
													}
												}}
												onMenuOpen={() => {
													if (!branches.length) void loadBranches()
												}}
											/>
										)}
									</FormItem>
								)}

								{/* Address */}
								<FormItem invalid={!!(errors.address && touched.address)} errorMessage={errors.address}>
									<h6 className="mb-2">{t('Адрес')}</h6>
									<Field name="address" type="text" component={Input} disabled />
								</FormItem>

								{/* Tech name */}
								<FormItem invalid={!!(errors.tech_name && touched.tech_name)} errorMessage={errors.tech_name}>
									<h6 className="mb-2">{t('Техника')}</h6>
									<Field name="tech_name" type="text" component={Input} disabled />
								</FormItem>

								{/* Main amount */}
								<FormItem
									invalid={!!(errors.main_amount_of_payment && touched.main_amount_of_payment)}
									errorMessage={errors.main_amount_of_payment}
								>
									<h6 className="mb-2">{t('Сумма договора')}</h6>
									<Field name="main_amount_of_payment">
										{({ field }: FieldProps) => (
											<Input
												{...field}
												disabled
												readOnly
												value={
													field.value && !Number.isNaN(Number(field.value))
														? formatPrice(Number(field.value))
														: field.value ?? ''
												}
											/>
										)}
									</Field>
								</FormItem>

								{/* Overdue */}
								<FormItem
									invalid={!!(errors.overdue_amount && touched.overdue_amount)}
									errorMessage={errors.overdue_amount}
								>
									<h6 className="mb-2">{t('Сумма просрочки')}</h6>
									<Field name="overdue_amount">
										{({ field }: FieldProps) => (
											<Input
												{...field}
												disabled
												readOnly
												value={
													field.value && !Number.isNaN(Number(field.value))
														? formatPrice(Number(field.value))
														: field.value ?? ''
												}
											/>
										)}
									</Field>
								</FormItem>

								{/* Phone */}
								<FormItem
									invalid={!!(errors.phone_number && touched.phone_number)}
									errorMessage={errors.phone_number}
								>
									<h6 className="mb-2">{t('Телефон')}</h6>
									<Field name="phone_number">
										{({ field, form }: FieldProps) => (
											<FormPatternInput
												form={form}
												field={field}
												format="## ### ## ##"
												mask="_"
												inputPrefix="+998 "
												placeholder="__-___-__-__"
												value={field.value}
												onValueChange={(v) => {
													const raw =
														typeof v?.value === 'string'
															? v.value
															: v?.value != null
																? String(v.value)
																: ''
													form.setFieldValue(field.name, raw)
												}}
											/>
										)}
									</Field>
								</FormItem>
							</FormContainer>
						</Form>
					)
				}}
			</Formik>
		)
	}
)

// @ts-ignore
export default CurrentRequestForm
