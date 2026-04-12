import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import type { Region } from '@/@types/dataset.types'
import { Customer } from '@/@types/contract.types'
import { User, UserRoleEnum, UserRoleTextEnum } from '@/@types/user.types'
import { FormPatternInput, PasswordInput } from '@/components/shared'
import {
	Button,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Notification,
	Option,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { UserService } from '@/services/user.service'
import { applyApiErrorsToFormik, normalizeApiErrors } from '@/utils/formikApiError'
import useDebounce from '@/utils/hooks/useDebounce'

type Props = {
	id: number | null
	role: UserRoleTextEnum | null
	isOpen: boolean
	setIsOpen: (v: boolean) => void
	refetch?: () => Promise<unknown>
}

type FormModel = {
	role: UserRoleEnum | null
	region: number | null
	inn: string
	company_name: string
	account_number: string
	address: string
	mfo: string
	bank: string
	director: string
	phone_number: string
	username: string
	password?: string
	confirm_password?: string
}

type UpdateLesseeRequest = {
	region?: number | null
	stir?: string
	company_name?: string | null
	account_number?: string | null
	mfo?: string | null
	bank_details?: string | null
	address?: string | null
	director_name?: string | null
	profile?: Partial<{
		username: string
		phone_number: string
		password?: string
		role?: number | null
	}>
}

const INN_SIZE = 9

const toNineDigits = (raw?: string) =>
	(raw || '').toString().replace(/\D/g, '').replace(/^998/, '').slice(-9)
const toApiPhone = (v?: string) => (v && v.length === 9 ? `998${v}` : undefined)

const isInvalid = (
	name: keyof FormModel,
	errors: Partial<Record<keyof FormModel, string | undefined>>,
	touched: Partial<Record<keyof FormModel, boolean>>,
	submitCount: number
) => Boolean(errors[name] && (touched[name] || submitCount > 0))

function buildDiff(initial: FormModel, current: FormModel): UpdateLesseeRequest {
	const out: UpdateLesseeRequest = {}
	const trim = (v?: string | null) => (v ?? '').trim()

	if (current.region !== initial.region) out.region = current.region ?? null
	if (trim(current.inn) && trim(current.inn) !== trim(initial.inn)) out.stir = trim(current.inn)
	if (trim(current.company_name) !== trim(initial.company_name))
		out.company_name = trim(current.company_name) || null
	if (trim(current.account_number) !== trim(initial.account_number))
		out.account_number = trim(current.account_number) || null
	if (trim(current.mfo) !== trim(initial.mfo)) out.mfo = trim(current.mfo) || null
	if (trim(current.bank) !== trim(initial.bank)) out.bank_details = trim(current.bank) || null
	if (trim(current.address) !== trim(initial.address)) out.address = trim(current.address) || null
	if (trim(current.director) !== trim(initial.director))
		out.director_name = trim(current.director) || null

	const prof: NonNullable<UpdateLesseeRequest['profile']> = {}
	if (trim(current.username) !== trim(initial.username)) prof.username = trim(current.username)
	const cur9 = current.phone_number?.replace(/\D/g, '')
	const ini9 = initial.phone_number?.replace(/\D/g, '')
	if (cur9 && cur9 !== ini9) {
		const apiPhone = toApiPhone(cur9)
		if (apiPhone) prof.phone_number = apiPhone
	}
	if (current.password) prof.password = current.password
	if (Object.keys(prof).length) out.profile = prof

	return out
}

const UserEditForm = forwardRef<
	FormikProps<FormModel>,
	{
		values: FormModel
		onSubmitComplete: (values: FormModel) => void
		isSubmitting?: boolean
		roles: { id: number; name: UserRoleTextEnum }[]
		regions: Region[]
	}
>(({ values, onSubmitComplete, isSubmitting, regions }, ref) => {
	const { t } = useTranslation()

	// ✅ INN avtoto'ldirish uchun state
	const [innValue, setInnValue] = useState(values.inn || '')
	const debouncedInn = useDebounce(innValue, 500)

	// ✅ Faqat initial inn bilan farqli bo'lganda (ya'ni foydalanuvchi o'zgartirsa) query ishlaydi
	const [initialInn] = useState(values.inn || '')
	const isInnChanged = debouncedInn !== initialInn

	const {
		data: customer,
		isLoading: isLoadingCustomer,
		isSuccess: isSuccessCustomer
	} = useQuery({
		queryKey: ['get customer by inn (user-edit)', debouncedInn],
		queryFn: () => CustomerService.getByInn<Customer>(debouncedInn),
		select: ({ data }) => data,
		// ✅ Faqat 9 ta raqam bo'lganda VA foydalanuvchi o'zgartirsa so'rov yuboriladi
		enabled: !!debouncedInn && debouncedInn.length === INN_SIZE && isInnChanged
	})

	const formikRef = ref as React.RefObject<FormikProps<FormModel>>

	// ✅ Customer kelganda maydonlarni to'ldirish (UserAdd va SignUpForm kabi)
	useEffect(() => {
		if (!formikRef?.current || !isSuccessCustomer) return

		const { setFieldValue } = formikRef.current

		const isServiceError =
			customer?.data?.СообщитьПользователю ===
			'Ошибка на стороне поставщика сервиса. Сервис не доступен'

		if (isServiceError) {
			setFieldValue('company_name', '')
			setFieldValue('account_number', '')
			setFieldValue('address', '')
			setFieldValue('mfo', '')
			setFieldValue('bank', '')
			toast.push(
				<Notification type='danger' title={t('Не действительный ИНН')} duration={2000} />,
				{ placement: 'top-center' }
			)
		} else if (customer?.data) {
			setFieldValue('company_name', customer.data.Наименование || '')
			setFieldValue('account_number', customer.data.ОсновнойРасчетныйСчет || '')
			setFieldValue('address', customer.data.Адрес || '')
			setFieldValue('mfo', customer.data.БанкМФО || '')
			setFieldValue('bank', customer.data.БанкНаименование || '')
		}
	}, [isSuccessCustomer, customer])

	const schemaCore = {
		inn: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('digits', t('Некорректный формат'), (v) => !v || /^\d+$/.test(v)),
		company_name: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		account_number: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('digits', t('Некорректный формат'), (v) => !v || /^\d+$/.test(v)),
		address: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		mfo: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('digits', t('Некорректный формат'), (v) => !v || /^\d+$/.test(v)),
		bank: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		director: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		phone_number: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('uz-phone-9', t('Некорректный формат'), (v) => !v || /^\d{9}$/.test(v)),
		username: Yup.string()
			.required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('min3', t('Минимум 3 символа'), (v) => !v || String(v).length >= 3),
		password: Yup.string()
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('len', t('Пароль не может быть короче 6 символов'), (v) => !v || v.length >= 6)
			.test('chars', t('Разрешены только буквы и цифры'), (v) => !v || /^[A-Za-z0-9_-]*$/.test(v || '')),
		confirm_password: Yup.string()
			.nullable()
			.when('password', {
				is: (pw: unknown) => typeof pw === 'string' && pw.length > 0,
				then: (s) =>
					s
						.required(t('Подтвердите пароль'))
						.oneOf([Yup.ref('password')], t('Пароли не совпадают')),
				otherwise: (s) => s.notRequired()
			})
	}

	const validationSchema = useMemo(
		() =>
			Yup.object().shape({
				role: Yup.number().nullable().notRequired(),
				region: Yup.number().nullable().required(t('Выберите область')),
				...schemaCore
			}),
		[values.role]
	)

	return (
		<Formik
			enableReinitialize
			innerRef={ref}
			initialValues={values}
			validationSchema={validationSchema}
			onSubmit={onSubmitComplete}
		>
			{({ values, touched, errors, submitCount }) => {
				const regionOptions: Option[] = regions.map((r) => ({ label: r.name_ru, value: r.id }))

				return (
					<Form>
						<FormContainer>
							<FormItem
								label={t('Область')}
								invalid={isInvalid('region', errors, touched, submitCount)}
								errorMessage={errors.region}
							>
								<Field name='region'>
									{({ field, form }: FieldProps) => (
										<Select
											placeholder={t('Выберите область')}
											isDisabled={!regions.length || isSubmitting}
											isClearable
											field={field}
											form={form}
											options={regionOptions}
											value={regionOptions.find((o) => o.value === values.region) || null}
											onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? null)}
										/>
									)}
								</Field>
							</FormItem>

							{/* ✅ INN — o'zgartirilsa avtoto'ldiradi */}
							<FormItem
								label={t('ИНН')}
								invalid={isInvalid('inn', errors, touched, submitCount)}
								errorMessage={errors.inn}
							>
								<Field name='inn'>
									{({ field, form }: FieldProps) => (
										<Input
											{...field}
											type='text'
											placeholder={t('Введите ИНН')}
											disabled={isSubmitting}
											suffix={isLoadingCustomer ? <span className='animate-spin'>⟳</span> : null}
											onChange={(e) => {
												const val = e.target.value.replace(/\D/g, '')
												form.setFieldValue(field.name, val)
												setInnValue(val)
											}}
										/>
									)}
								</Field>
							</FormItem>

							{/* ✅ Avtoto'ldiriladigan maydonlar — INN o'zgarganda disabled */}
							<FormItem
								label={t('Наименование юл.лица')}
								invalid={isInvalid('company_name', errors, touched, submitCount)}
								errorMessage={errors.company_name}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Field
										name='company_name'
										type='text'
										placeholder={t('Введите наименование')}
										component={Input}
										disabled={isSubmitting || isLoadingCustomer}
									/>
								)}
							</FormItem>

							<FormItem
								label={t('Расчетный счет')}
								invalid={isInvalid('account_number', errors, touched, submitCount)}
								errorMessage={errors.account_number}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Field
										name='account_number'
										type='text'
										placeholder={t('Введите номер счета')}
										component={Input}
										disabled={isSubmitting || isLoadingCustomer}
									/>
								)}
							</FormItem>

							<FormItem
								label={t('Адрес')}
								invalid={isInvalid('address', errors, touched, submitCount)}
								errorMessage={errors.address}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Field
										name='address'
										type='text'
										placeholder={t('Введите адрес')}
										component={Input}
										disabled={isSubmitting || isLoadingCustomer}
									/>
								)}
							</FormItem>

							<FormItem
								label={t('МФО')}
								invalid={isInvalid('mfo', errors, touched, submitCount)}
								errorMessage={errors.mfo}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Field
										name='mfo'
										type='text'
										placeholder={t('Введите МФО')}
										component={Input}
										disabled={isSubmitting || isLoadingCustomer}
									/>
								)}
							</FormItem>

							<FormItem
								label={t('Банк')}
								invalid={isInvalid('bank', errors, touched, submitCount)}
								errorMessage={errors.bank}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Field
										name='bank'
										type='text'
										placeholder={t('Введите наименование')}
										component={Input}
										disabled={isSubmitting || isLoadingCustomer}
									/>
								)}
							</FormItem>

							{/* ✅ Director va qolganlar — har doim qo'lda tahrirlanadi */}
							<FormItem
								label={t('Директор')}
								invalid={isInvalid('director', errors, touched, submitCount)}
								errorMessage={errors.director}
							>
								<Field
									name='director'
									type='text'
									placeholder={t('Введите ФИО')}
									component={Input}
									disabled={isSubmitting}
								/>
							</FormItem>

							<FormItem
								label={t('Номер телефона')}
								invalid={isInvalid('phone_number', errors, touched, submitCount)}
								errorMessage={errors.phone_number}
							>
								<Field name='phone_number'>
									{({ field, form }: FieldProps) => (
										<FormPatternInput
											form={form}
											field={field}
											format='## ### ## ##'
											mask='_'
											inputPrefix='+998 '
											placeholder='__ ___ __ __'
											value={field.value}
											disabled={isSubmitting}
											onValueChange={(e) =>
												form.setFieldValue(field.name, (e?.formattedValue || '').replace(/\D/g, ''))
											}
										/>
									)}
								</Field>
							</FormItem>

							<FormItem
								label={t('Логин')}
								invalid={isInvalid('username', errors, touched, submitCount)}
								errorMessage={errors.username}
							>
								<Field
									name='username'
									type='text'
									placeholder={t('Введите логин')}
									component={Input}
									disabled={isSubmitting}
								/>
							</FormItem>

							<FormItem
								label={t('Пароль')}
								invalid={isInvalid('password', errors, touched, submitCount)}
								errorMessage={errors.password}
							>
								<Field
									name='password'
									autoComplete='off'
									placeholder={t('Введите пароль')}
									component={PasswordInput}
									disabled={isSubmitting}
								/>
							</FormItem>

							<FormItem
								label={t('Подтвердить пароль')}
								invalid={isInvalid('confirm_password', errors, touched, submitCount)}
								errorMessage={errors.confirm_password}
							>
								<Field
									autoComplete='off'
									name='confirm_password'
									placeholder={t('Повторите пароль')}
									component={PasswordInput}
									disabled={isSubmitting}
								/>
							</FormItem>
						</FormContainer>
					</Form>
				)
			}}
		</Formik>
	)
})

const UserEdit = ({ id, isOpen, setIsOpen, refetch }: Props) => {
	const { t } = useTranslation()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const canFetch = Boolean(id && isOpen)

	const { data: regions = [], isLoading: isLoadingRegions } = useQuery({
		queryKey: ['regions'],
		queryFn: () => DatasetService.getAllRegions<Region[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})

	const { data: initial, isLoading: isLoadingUser, isError } = useQuery({
		queryKey: ['lessee-by-id', { id }],
		queryFn: () => UserService.getLesseeById<any>(id!),
		enabled: canFetch,
		refetchOnWindowFocus: false,
		select: (res) => {
			const lessee = res?.data ?? {}
			const p = lessee?.profile as User | undefined

			const base: FormModel = {
				role: null,
				region: lessee?.region?.id ?? null,
				inn: lessee?.stir ?? '',
				company_name: lessee?.company_name ?? '',
				account_number: lessee?.account_number ?? '',
				address: lessee?.address ?? '',
				mfo: lessee?.mfo ?? '',
				bank: lessee?.bank_details ?? '',
				director: lessee?.director_name ?? '',
				username: p?.username ?? '',
				phone_number: toNineDigits(p?.phone_number),
				password: '',
				confirm_password: ''
			}

			return base
		}
	})

	const resolvedInitial: FormModel | undefined = useMemo(() => initial, [initial])

	if (isError) {
		toast.push(<Notification type='danger' title={t('Не удалось загрузить клиента')} />, {
			placement: 'top-center'
		})
	}

	const { mutateAsync: updateUser, isPending } = useMutation({
		mutationKey: ['update lessee', id],
		mutationFn: (payload: UpdateLesseeRequest) => {
			if (id == null) throw new Error('Missing id')
			return UserService.update('lessee' as any, id, payload as any)
		},
		async onSuccess() {
			if (refetch) await refetch()
			toast.push(<Notification type='success' title={t('Клиент обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const normalized = normalizeApiErrors(error)
			if (formikRef.current) {
				applyApiErrorsToFormik(formikRef.current, normalized, {
					alias: {
						stir: 'inn',
						bank_details: 'bank',
						director_name: 'director',
						region: 'region',
						'profile.phone_number': 'phone_number',
						'profile.username': 'username',
						'profile.password': 'password'
					}
				})

				const hasAny = Object.keys(normalized.field).length || normalized.nonField.length
				if (hasAny) {
					toast.push(
						<Notification type='danger' title={t('Исправьте ошибки в форме')} duration={2500} />,
						{ placement: 'top-center' }
					)
					return
				}
			}

			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onSave = async () => {
		if (!formikRef.current || !resolvedInitial) return
		const { values, setTouched, validateForm } = formikRef.current

		const allTouched = Object.keys(values).reduce(
			(acc, k) => {
				acc[k as keyof FormModel] = true as any
				return acc
			},
			{} as Record<keyof FormModel, boolean>
		)
		setTouched(allTouched, true)

		const errors = await validateForm()
		if (Object.keys(errors || {}).length > 0) {
			toast.push(
				<Notification type='danger' title={t('Исправьте ошибки в форме')} duration={2500} />,
				{ placement: 'top-center' }
			)
			return
		}

		const payload = buildDiff(resolvedInitial, values)
		if (!payload.profile && Object.keys(payload).length === 0) {
			setIsOpen(false)
			return
		}

		try {
			await updateUser(payload)
			setIsOpen(false)
		} catch {
			/* onError universal */
		}
	}

	const loadingAny = isLoadingUser || isLoadingRegions

	return (
		<Drawer
			key={`${id ?? 'x'}`}
			title={t('Редактирование клиента')}
			isOpen={isOpen}
			footer={
				<div className='w-full text-right'>
					<Button
						size='md'
						className='mr-2'
						onClick={() => setIsOpen(false)}
						disabled={isPending || loadingAny}
					>
						{t('Отмена')}
					</Button>
					<Button
						size='md'
						variant='solid'
						onClick={onSave}
						disabled={isPending || loadingAny}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
			{loadingAny || !resolvedInitial ? (
				<div className='space-y-3'>
					<Skeleton height={24} />
					<Skeleton height={44} />
					<Skeleton height={24} />
					<Skeleton height={44} />
					<Skeleton height={24} />
					<Skeleton height={44} />
				</div>
			) : (
				<UserEditForm
					ref={formikRef}
					values={resolvedInitial}
					isSubmitting={isPending || loadingAny}
					roles={[]}
					regions={regions}
					onSubmitComplete={() => {
						/* noop */
					}}
				/>
			)}
		</Drawer>
	)
}

export default UserEdit
