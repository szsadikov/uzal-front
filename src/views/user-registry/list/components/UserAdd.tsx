import React, { forwardRef, type MouseEvent, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import type { Region } from '@/@types/dataset.types'
import { Customer } from '@/@types/contract.types'
import { User, UserRoleEnum } from '@/@types/user.types'
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
	refetch?: () => Promise<unknown>
}

type FormModel = {
	role: UserRoleEnum
	region: number | null
	branch: number | null
	inn: string
	company_name: string
	account_number: string
	address: string
	mfo: string
	bank: string
	director: string
	phone_number: string
	username: string
	password: string
	confirm_password: string
}

type LesseeCreateRequest = {
	profile: {
		username: string
		phone_number: string
		password: string
		role?: number | null
	}
	region: number | null
	stir: string
	company_name?: string | null
	account_number?: string | null
	mfo?: string | null
	bank_details?: string | null
	address?: string | null
	director_name?: string | null
}

type UserAddFormProps = {
	values: FormModel
	onSubmitComplete: (values: FormModel) => void
	isSubmitting?: boolean
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
	isValid?: boolean
	isSubmitting?: boolean
}

const INN_SIZE = 9

const DEFAULT_VALUES: FormModel = {
	role: undefined as unknown as UserRoleEnum,
	region: null,
	branch: null,
	inn: '',
	company_name: '',
	account_number: '',
	address: '',
	mfo: '',
	bank: '',
	director: '',
	phone_number: '',
	username: '',
	password: '',
	confirm_password: ''
}

const isInvalid = (
	name: keyof FormModel,
	errors: Partial<Record<keyof FormModel, string | undefined>>,
	touched: Partial<Record<keyof FormModel, boolean>>,
	submitCount: number
) => Boolean(errors[name] && (touched[name] || submitCount > 0))

const UserAddForm = forwardRef<FormikProps<FormModel>, UserAddFormProps>(
	({ values, onSubmitComplete, isSubmitting = false }, ref) => {
		const { t } = useTranslation()

		// ✅ INN state for debounced query (like SignUpForm)
		const [innValue, setInnValue] = useState('')
		const debouncedInn = useDebounce(innValue, 500)

		// ✅ Fetch customer by INN
		const {
			data: customer,
			isLoading: isLoadingCustomer,
			isSuccess: isSuccessCustomer
		} = useQuery({
			queryKey: ['get customer by inn (user-add)', debouncedInn],
			queryFn: () => CustomerService.getByInn<Customer>(debouncedInn),
			select: ({ data }) => data,
			enabled: !!debouncedInn && debouncedInn.length === INN_SIZE
		})

		const { data: regions, isLoading: isLoadingRegions } = useQuery({
			queryKey: ['get regions'],
			queryFn: () => DatasetService.getAllRegions<Region[]>(),
			select: ({ data }) => data
		})

		// ✅ Auto-fill fields when customer data arrives (like SignUpForm's useEffect)
		const formikRef = ref as React.RefObject<FormikProps<FormModel>>

		useEffect(() => {
			if (!formikRef?.current) return

			const { setFieldValue } = formikRef.current

			const isServiceError =
				customer?.data?.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'

			if (isSuccessCustomer && isServiceError) {
				setFieldValue('company_name', '')
				setFieldValue('account_number', '')
				setFieldValue('address', '')
				setFieldValue('mfo', '')
				setFieldValue('bank', '')
				toast.push(
					<Notification type='danger' title={t('Не действительный ИНН')} duration={2000} />,
					{ placement: 'top-center' }
				)
			} else if (isSuccessCustomer && customer?.data) {
				setFieldValue('company_name', customer.data.Наименование || '')
				setFieldValue('account_number', customer.data.ОсновнойРасчетныйСчет || '')
				setFieldValue('address', customer.data.Адрес || '')
				setFieldValue('mfo', customer.data.БанкМФО || '')
				setFieldValue('bank', customer.data.БанкНаименование || '')
			}
		}, [isSuccessCustomer, customer])

		const validationSchema = Yup.object().shape({
			role: Yup.number().nullable().notRequired(),

			region: Yup.number().nullable().required(t('Выберите область')),

			inn: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d+$/, t('Некорректный формат')),

			company_name: Yup.string().required(t('Поле обязательно')),

			account_number: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d+$/, t('Некорректный формат')),

			address: Yup.string().required(t('Поле обязательно')),

			mfo: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d+$/, t('Некорректный формат')),

			bank: Yup.string().required(t('Поле обязательно')),

			director: Yup.string().required(t('Поле обязательно')),

			phone_number: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d{9}$/, t('Некорректный формат')),

			username: Yup.string().required(t('Поле обязательно')).min(3, t('Минимум 3 символа')),

			password: Yup.string()
				.required(t('Введите пароль'))
				.min(6, t('Пароль не может быть короче 6 символов'))
				.matches(/^[A-Za-z0-9_-]*$/, t('Разрешены только буквы и цифры')),

			confirm_password: Yup.string()
				.required(t('Подтвердите пароль'))
				.oneOf([Yup.ref('password')], t('Пароли не совпадают'))
		})

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={onSubmitComplete}
			>
				{({ values, touched, errors, submitCount }) => {
					return (
						<Form>
							<FormContainer>
								{/* ✅ INN — triggers auto-fill on change (debounced) */}
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

								{/* ✅ REGION */}
								<FormItem
									label={t('Область')}
									invalid={isInvalid('region', errors, touched, submitCount)}
									errorMessage={errors.region}
								>
									{isLoadingRegions ? (
										<Skeleton height={44} />
									) : (
										regions && (
											<Field name='region'>
												{({ field, form }: FieldProps) => {
													const options: Option[] = regions.map((region) => ({
														label: region.name_ru,
														value: region.id
													}))

													return (
														<Select
															noOptionsMessage={() => t('Нет областей')}
															placeholder={t('Выберите область')}
															isDisabled={!regions.length || isSubmitting}
															isClearable
															field={field}
															form={form}
															options={options}
															value={options.filter((option) => option.value === values.region)}
															onChange={(option) =>
																form.setFieldValue(field.name, option?.value ?? null)
															}
														/>
													)
												}}
											</Field>
										)
									)}
								</FormItem>

								{/* ✅ Auto-filled fields — disabled while loading */}
								<FormItem
									label={t('Наименование юр.лица')}
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
											disabled={true}
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
											disabled={true}
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
											disabled={true}
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
											disabled={true}
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
											disabled={true}
										/>
									)}
								</FormItem>

								{/* ✅ Director — qo'lda kiritiladi */}
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
													form.setFieldValue(
														field.name,
														(e?.formattedValue || '').replace(/\D/g, '')
													)
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
	}
)

const DrawerFooter = ({ onSaveClick, onCancel, isSubmitting = false }: DrawerFooterProps) => {
	const { t } = useTranslation()

	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel} disabled={isSubmitting}>
				{t('Отмена')}
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick} disabled={isSubmitting}>
				{t('Сохранить')}
			</Button>
		</div>
	)
}

const UserAdd = ({ refetch }: Props) => {
	const { t } = useTranslation()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const { mutateAsync: mutateAsyncCreateUser, isPending: isPendingCreateUser } = useMutation({
		mutationKey: ['create lessee'],
		mutationFn: (data: LesseeCreateRequest) => UserService.create<User, LesseeCreateRequest>('lessee' as any, data),
		async onSuccess() {
			if (refetch) await refetch()
			toast.push(<Notification type='success' title={t('Пользователь создан')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const normalized = normalizeApiErrors(error)
			const hasFieldErrors = Object.keys(normalized.field).length > 0

			if (hasFieldErrors && formikRef.current) {
				applyApiErrorsToFormik(formikRef.current, normalized, {
					alias: {
						stir: 'inn',
						bank_details: 'bank',
						director_name: 'director',
						'profile.phone_number': 'phone_number',
						'profile.username': 'username',
						'profile.password': 'password'
					}
				})
				toast.push(
					<Notification type='danger' title={t('Исправьте ошибки в форме')} duration={2500} />,
					{ placement: 'top-center' }
				)
				return
			}

			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const formSubmit = async () => {
		if (!formikRef.current) return
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
				<Notification type='danger' title={t('Заполните обязательные поля')} duration={2500} />,
				{ placement: 'top-center' }
			)
			return
		}

		const v = formikRef.current.values

		const payload: LesseeCreateRequest = {
			profile: {
				username: v.username,
				phone_number: `998${v.phone_number}`,
				password: v.password,
				role: v.role ?? null
			},
			region: v.region ?? null,
			stir: v.inn,
			company_name: v.company_name || null,
			account_number: v.account_number || null,
			mfo: v.mfo || null,
			bank_details: v.bank || null,
			address: v.address || null,
			director_name: v.director || null
		}

		try {
			await mutateAsyncCreateUser(payload)
			setIsOpen(false)
		} catch {
			/* onError universal */
		}
	}

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				{t('Добавить')}
			</Button>

			<Drawer
				title={t('Добавить Клиент')}
				isOpen={isOpen}
				footer={
					<DrawerFooter
						onCancel={() => setIsOpen(false)}
						onSaveClick={formSubmit}
						isSubmitting={isPendingCreateUser}
					/>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<UserAddForm
					ref={formikRef}
					values={DEFAULT_VALUES}
					isSubmitting={isPendingCreateUser}
					onSubmitComplete={() => setIsOpen(false)}
				/>
			</Drawer>
		</>
	)
}

export default UserAdd
