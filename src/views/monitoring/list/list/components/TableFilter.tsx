import { forwardRef, type MouseEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import {
	Badge,
	Button,
	DatePicker,
	Drawer,
	FormContainer,
	FormItem,
	Option,
	Select
} from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { mapToOptionsSuffixFirst } from '@/utils/localize'
import { FilterQueries } from '../MonitoringList'

type FilterFormProps = {
	values: FilterQueries
	onSubmitComplete: (values: FilterQueries) => void
	branchOptions: Option[]
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
}

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
	branchOptions: Option[]
}

function toIsoDate(val: any): string {
	if (!val) return ''
	const d = val instanceof Date ? val : new Date(val)
	if (Number.isNaN(d.getTime())) return ''

	return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		const { t, i18n } = useTranslation()

		const [branchMapLoaded, setBranchMapLoaded] = useState(false)
		const [branchOptionsLocal, setBranchOptionsLocal] = useState<Option[]>([])
		const [branchIdToRegionId, setBranchIdToRegionId] = useState<Map<number, number>>(new Map())

		const [tempRegionId, setTempRegionId] = useState<number | null>(null)
		const [techOptionsLocal, setTechOptionsLocal] = useState<Option[]>([])
		const [techLoading, setTechLoading] = useState(false)
		const [techError, setTechError] = useState<string | null>(null)

		/** Состояние (o'zgarmagan) */
		const CONDITION_OPTIONS: Option[] = [
			{ label: t('Отличное'), value: '1' },
			{ label: t('Хорошее'), value: '2' },
			{ label: t('Плохое'), value: '3' }
		]

		// 🔹 Region tanlangach texnikalarni faqat shu paytda fetch qilamiz
		useEffect(() => {
			let cancelled = false
			const run = async () => {
				if (!tempRegionId) return
				setTechLoading(true)
				setTechError(null)
				try {
					const res = await TechService.getAllTechs({
						isAll: true,
						is_tech_monitoring: true,
						// Backenddagi nomga moslang: 'region' yoki 'region_id'
						tech_monitoring_region: tempRegionId
					})
					const list = Array.isArray((res as any)?.data) ? (res as any).data : (res as any)

					// i18n dan hozirgi tilni olamiz
					const opts = mapToOptionsSuffixFirst(list ?? [], i18n.language, { valueField: 'id' })

					if (!cancelled) setTechOptionsLocal(opts)

					// const list = Array.isArray((res as any)?.data) ? (res as any).data : (res as any)
					// const opts: Option[] = (list ?? [])
					// 	.filter((t: any) => !!t?.id)
					// 	.map((t: any) => ({
					// 		label: t?.name ?? t?.tech_name ?? `#${t.id}`,
					// 		value: t.id
					// 	}))
					// if (!cancelled) setTechOptionsLocal(opts)
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
				} catch (e) {
					if (!cancelled) setTechError(t('Не удалось загрузить технику'))
				} finally {
					if (!cancelled) setTechLoading(false)
				}
			}
			run()

			return () => {
				cancelled = true
			}
		}, [tempRegionId])

		useEffect(() => {
			if (values.branch && branchIdToRegionId.size > 0) {
				setTempRegionId(branchIdToRegionId.get(Number(values.branch)) ?? null)
			}
		}, [values.branch, branchIdToRegionId])

		useEffect(() => {
			const loadBranches = async () => {
				if (branchMapLoaded) return
				try {
					const res = await DatasetService.getAllBranches<any[]>()
					const list = Array.isArray((res as any)?.data) ? (res as any).data : (res as any) || []

					const map = new Map<number, number>()
					const opts: Option[] = []

					for (const b of list) {
						const id = Number(b?.id)
						const regId = Number(b?.region?.id)
						if (id && regId) map.set(id, regId)
						if (id) opts.push({ label: b?.name, value: id })
					}

					setBranchIdToRegionId(map)
					setBranchOptionsLocal(opts)
					setBranchMapLoaded(true)
				} catch {
					/* empty */
				}
			}

			loadBranches()
		}, [])

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				onSubmit={(vals) => onSubmitComplete(vals)}
			>
				{({ touched, errors, values, setFieldValue }) => {
					// Sana orasidagi cheklovlar
					const fromDate = values.from_updated_at ? new Date(values.from_updated_at as any) : null
					const toDate = values.to_updated_at ? new Date(values.to_updated_at as any) : null

					return (
						<Form>
							<FormContainer>
								{/* Filial */}
								<FormItem>
									<h6 className='mb-2'>{t('Филиалы')}</h6>
									<Field name='branch'>
										{({ field, form }: FieldProps) => (
											<Select
												className='h-11'
												classNamePrefix='uzal'
												placeholder={t('Выберите филиал')}
												isClearable
												field={field}
												form={form}
												options={branchOptionsLocal}
												value={branchOptionsLocal.filter((o) => o.value === form.values.branch)}
												onMenuOpen={async () => {
													if (branchMapLoaded) return
													try {
														const res = await DatasetService.getAllBranches<any[]>()
														const list = Array.isArray((res as any)?.data)
															? (res as any).data
															: (res as any) || []
														const map = new Map<number, number>()
														const opts: Option[] = []
														for (const b of list) {
															const id = Number(b?.id)
															const regId = Number(b?.region?.id)
															if (id && regId) map.set(id, regId)
															if (id) {
																opts.push({
																	label: b?.name || b?.region?.name_latin || `#${id}`,
																	value: id
																	// xohlasangiz meta ham berishingiz mumkin, lekin hozir map ishlatyapmiz
																})
															}
														}
														setBranchIdToRegionId(map)
														setBranchOptionsLocal(opts)
														setBranchMapLoaded(true)
													} catch {
														// jim
													}
												}}
												onChange={(opt) => {
													const nextBranch = (opt as any)?.value ?? null
													form.setFieldValue(field.name, nextBranch)
													form.setFieldValue('tech', null)

													// ✅ tanlangan filialdan regionId ni olamiz
													const regId =
														nextBranch != null
															? (branchIdToRegionId.get(Number(nextBranch)) ?? null)
															: null

													setTempRegionId(regId)
													setTechOptionsLocal([]) // eskisini tozalaymiz
													setTechError(null)
												}}
											/>
										)}
									</Field>
								</FormItem>

								{/* Texnika */}
								<FormItem>
									<h6 className='mb-2'>{t('Техника')}</h6>
									<Field name='tech'>
										{({ field, form }: FieldProps) => (
											<Select
												className='h-11'
												classNamePrefix='uzal'
												placeholder={
													tempRegionId
														? techLoading
															? t('Загрузка…')
															: (techError ?? t('Выберите технику'))
														: t('Сначала выберите филиал')
												}
												isClearable
												isDisabled={!tempRegionId || techLoading}
												field={field}
												form={form}
												options={techOptionsLocal}
												value={techOptionsLocal.filter((o) => o.value === form.values.tech)}
												onChange={(opt) =>
													form.setFieldValue(field.name, (opt as any)?.value ?? null)
												}
											/>
										)}
									</Field>
								</FormItem>

								{/* Состояние */}
								<FormItem
									className='md:col-span-1'
									invalid={!!errors.condition && !!touched.condition}
									errorMessage={errors.condition as string}
								>
									<h6 className='mb-2'>{t('Состояние')}</h6>
									<Field name='condition'>
										{({ field, form }: FieldProps) => (
											<Select
												className='h-11'
												classNamePrefix='uzal'
												placeholder={t('Выберите состояние')}
												isClearable
												field={field}
												form={form}
												options={CONDITION_OPTIONS}
												value={CONDITION_OPTIONS.filter((o) => o.value === form.values.condition)}
												onChange={(opt) =>
													form.setFieldValue(field.name, (opt as any)?.value ?? null)
												}
											/>
										)}
									</Field>
								</FormItem>

								{/* Интервал даты */}
								<FormItem
									className='md:col-span-2'
									invalid={
										(!!errors.from_updated_at && !!touched.from_updated_at) ||
										(!!errors.to_updated_at && !!touched.to_updated_at)
									}
								>
									<h6 className='mb-2'>{t('Интервал даты')}</h6>

									<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
										{/* From */}
										<Field name='from_updated_at'>
											{({ field }: FieldProps) => (
												<DatePicker
													inputFormat='YYYY-MM-DD'
													className='h-11'
													placeholder='YYYY-MM-DD'
													value={fromDate}
													maxDate={toDate ?? undefined}
													onChange={(val) => {
														const next = val ? toIsoDate(val) : ''
														setFieldValue(field.name, next)
														// agar from > to bo‘lsa, to ni bo‘shatamiz
														if (
															next &&
															values.to_updated_at &&
															next > String(values.to_updated_at)
														) {
															setFieldValue('to_updated_at', '')
														}
													}}
													clearable
												/>
											)}
										</Field>

										{/* To */}
										<Field name='to_updated_at'>
											{({ field }: FieldProps) => (
												<DatePicker
													inputFormat='YYYY-MM-DD'
													className='h-11'
													placeholder='YYYY-MM-DD'
													value={toDate}
													minDate={fromDate ?? undefined}
													onChange={(val) => {
														const next = val ? toIsoDate(val) : ''
														setFieldValue(field.name, next)
														// agar to < from bo‘lsa, from ni bo‘shatamiz
														if (
															next &&
															values.from_updated_at &&
															next < String(values.from_updated_at)
														) {
															setFieldValue('from_updated_at', '')
														}
													}}
													clearable
												/>
											)}
										</Field>
									</div>
								</FormItem>
							</FormContainer>
						</Form>
					)
				}}
			</Formik>
		)
	}
)

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
	const { t } = useTranslation()

	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel}>
				{t('Отмена')}
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick}>
				{t('Применить')}
			</Button>
		</div>
	)
}

const TableFilter = ({ values, onSubmit, branchOptions }: Props) => {
	const { t } = useTranslation()

	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const formSubmit = () => {
		if (formikRef.current) {
			onSubmit(formikRef.current.values)
			setIsOpen(false)
		}
	}

	// Klaviatura qisqa tugmalari: Enter=apply, Esc=close
	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Enter') formSubmit()
			if (e.key === 'Escape') setIsOpen(false)
		}
		window.addEventListener('keydown', onKey)

		return () => window.removeEventListener('keydown', onKey)
	}, [isOpen])

	const hasActiveFilters = Boolean(
		values.branch ||
			values.tech ||
			values.condition ||
			values.from_updated_at ||
			values.to_updated_at
	)

	return (
		<>
			<Button
				size='sm'
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={() => setIsOpen(true)}
			>
				<span>{t('Фильтр')}</span>
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 bg-indigo-500 p-1' />
				)}
			</Button>

			<Drawer
				title={t('Фильтр')}
				isOpen={isOpen}
				footer={<DrawerFooter onCancel={() => setIsOpen(false)} onSaveClick={formSubmit} />}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<FilterForm
					ref={formikRef}
					values={values}
					onSubmitComplete={formSubmit}
					branchOptions={branchOptions}
				/>
			</Drawer>
		</>
	)
}

FilterForm.displayName = 'FilterForm'
export default TableFilter
