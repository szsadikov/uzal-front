import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import type { Region } from '@/@types/dataset.types'
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
import { DatasetService } from '@/services/dataset.service'
import { UserService } from '@/services/user.service'
import { userRoleNumToText, userRoleTextToName } from '@/utils/format'
import { applyApiErrorsToFormik, normalizeApiErrors } from '@/utils/formikApiError'
// import { mapToOptionsSuffixFirst } from '@/utils/localize'

type Props = {
	refetch?: () => Promise<unknown>
}

type FormModel = {
	role: UserRoleEnum
	region: number | null
	branch: number | null
	first_name: string
	last_name: string
	middle_name: string
	pinfl: string
	phone_number: string // faqat 9 ta raqam ('xx xxx xx xx')
	username: string
	password: string
	confirm_password: string
}

type CreateUserRequest = {
	role: UserRoleTextEnum
	region: number | null
	branch: number | null
	profile: FormModel
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

const NO_REGION_ROLES = new Set<UserRoleEnum>([
	UserRoleEnum.ACCOUNTANT,
	UserRoleEnum.ADMIN,
	UserRoleEnum.FINANCE,
	UserRoleEnum.JURIST,
	UserRoleEnum.MARKETING,
	UserRoleEnum.UZMASHLIZING,
	UserRoleEnum.ZAMPRED,
	UserRoleEnum.ZAMPREDMONITORING
])

const DEFAULT_VALUES: FormModel = {
	role: undefined as unknown as UserRoleEnum,
	region: null,
	branch: null,
	first_name: '',
	last_name: '',
	middle_name: '',
	pinfl: '',
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

		const { data: roles, isLoading: isLoadingRoles } = useQuery({
			queryKey: ['get roles'],
			queryFn: () => UserService.getAllRoles<{ id: number; name: UserRoleTextEnum }[]>(),
			select: ({ data }) => data
		})

		const { data: regions, isLoading: isLoadingRegions } = useQuery({
			queryKey: ['get regions'],
			queryFn: () => DatasetService.getAllRegions<Region[]>(),
			select: ({ data }) => data
		})

		const validationSchema = Yup.object().shape({
			role: Yup.number().required(t('Поле обязательно')),
			region: Yup.number()
				.nullable()
				.when('role', ([role], schema: any) =>
					role && !NO_REGION_ROLES.has(role)
						? schema.required(t('Выберите область'))
						: schema.notRequired().nullable()
				),
			first_name: Yup.string().required(t('Поле обязательно')),
			last_name: Yup.string().required(t('Поле обязательно')),
			middle_name: Yup.string().notRequired(),
			pinfl: Yup.string().matches(/^\d{14}$/, t('ПИНФЛ должен состоять из 14 цифр')),
			phone_number: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d{9}$/, t('Номер должен состоять из 9 цифр')),
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
					// const isRegionExist =
					// 	values.role !== UserRoleEnum.ACCOUNTANT &&
					// 	values.role !== UserRoleEnum.ADMIN &&
					// 	values.role !== UserRoleEnum.FINANCE &&
					// 	values.role !== UserRoleEnum.JURIST &&
					// 	values.role !== UserRoleEnum.MARKETING &&
					// 	values.role !== UserRoleEnum.UZMASHLIZING &&
					// 	values.role !== UserRoleEnum.ZAMPRED

					const isRegionExistRole = values.role != null && !NO_REGION_ROLES.has(values.role)

					return (
						<Form>
							<FormContainer>
								<FormItem
									label={t('Должность')}
									invalid={isInvalid('role', errors, touched, submitCount)}
									errorMessage={errors.role}
								>
									{isLoadingRoles ? (
										<Skeleton height={44} />
									) : (
										roles && (
											<Field name='role'>
												{({ field, form }: FieldProps) => {
													const options = roles.map((role) => ({
														label: userRoleTextToName(role.name),
														value: role.id
													}))

													return (
														<Select
															noOptionsMessage={() => t('Нет ролей')}
															placeholder={t('Выберите роль')}
															isDisabled={!roles.length || isSubmitting}
															isClearable
															field={field}
															form={form}
															options={options}
															value={options.filter((option) => option.value === values.role)}
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

								{isRegionExistRole && (
									<FormItem
										label={t('Филиал')}
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

														// const options = mapToOptionsSuffixFirst(regions ?? [], i18n.language, { valueField: 'id' })

														return (
															<Select
																noOptionsMessage={() => t('Нет филиалов')}
																placeholder={t('Выберите филиал')}
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
								)}

								<div className='grid grid-cols-2 gap-4'>
									<FormItem
										label={t('Имя')}
										invalid={isInvalid('first_name', errors, touched, submitCount)}
										errorMessage={errors.first_name}
									>
										<Field
											name='first_name'
											type='text'
											placeholder={t('Введите имя')}
											component={Input}
										/>
									</FormItem>

									<FormItem
										label={t('Фамилия')}
										invalid={isInvalid('last_name', errors, touched, submitCount)}
										errorMessage={errors.last_name}
									>
										<Field
											name='last_name'
											type='text'
											placeholder={t('Введите фамилию')}
											component={Input}
										/>
									</FormItem>
								</div>

								<FormItem
									label={t('Отчество')}
									invalid={isInvalid('middle_name', errors, touched, submitCount)}
									errorMessage={errors.middle_name}
								>
									<Field
										name='middle_name'
										type='text'
										placeholder={t('Введите отчество')}
										component={Input}
									/>
								</FormItem>

								<FormItem
									label={t('ПИНФЛ')}
									invalid={isInvalid('pinfl', errors, touched, submitCount)}
									errorMessage={errors.pinfl}
								>
									<Field name='pinfl'>
										{({ field, form }: FieldProps) => (
											<FormPatternInput
												form={form}
												field={field}
												format='##############'
												mask='_'
												placeholder={t('Введите ПИНФЛ')}
												value={field.value}
												onValueChange={(e) => form.setFieldValue(field.name, e.floatValue)}
											/>
										)}
									</Field>
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
												placeholder='__-___-__-__'
												value={field.value}
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
									/>
								</FormItem>

								<FormItem
									label={t('Повторите пароль')}
									invalid={isInvalid('confirm_password', errors, touched, submitCount)}
									errorMessage={errors.confirm_password}
								>
									<Field
										autoComplete='off'
										name='confirm_password'
										placeholder={t('Введите пароль')}
										component={PasswordInput}
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
		mutationKey: ['create user'],
		mutationFn: (data: CreateUserRequest) =>
			data.role.includes('branch')
				? UserService.createBranchUser<User, CreateUserRequest>(data)
				: UserService.create<User, CreateUserRequest>(data.role, data),
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
						// kerak bo‘lsa mapping qo‘shing, mas: 'user.email': 'email'
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

		// 1) Hamma maydonlarni touched=true qilamiz (bo‘shlari qizarsin)
		const allTouched = Object.keys(values).reduce(
			(acc, k) => {
				acc[k as keyof FormModel] = true as any

				return acc
			},
			{} as Record<keyof FormModel, boolean>
		)
		setTouched(allTouched, true)

		// 2) Validatsiya — xato bo‘lsa, toast va return
		const errors = await validateForm()
		if (Object.keys(errors || {}).length > 0) {
			toast.push(
				<Notification type='danger' title={t('Заполните обязательные поля')} duration={2500} />,
				{ placement: 'top-center' }
			)

			return
		}

		// 3) Valid — formData hosil qilib yuboramiz
		const v = formikRef.current.values
		const formData: CreateUserRequest = {
			role: userRoleNumToText(v.role),
			profile: {
				...v,
				phone_number: `998${v.phone_number}` // prefix +998
			},
			region: v.region ?? null,
			branch: v.branch ?? null
		}

		try {
			await mutateAsyncCreateUser(formData)
			setIsOpen(false) // faqat muvaffaqiyatda yoping
		} catch {
			// onError universal handler field/toast ishini qiladi — bu yerda qo‘shimcha ish shart emas
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
				title={t('Добавить пользователя')}
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
