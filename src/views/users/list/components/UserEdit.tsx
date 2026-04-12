import { forwardRef, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import type { Branch, Region } from '@/@types/dataset.types'
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
	first_name: string
	last_name: string
	middle_name: string
	pinfl: string
	phone_number: string // UI’da faqat 9 ta raqam
	username: string
	password?: string
	confirm_password?: string
}

type UpdateUserRequest = {
	role?: UserRoleTextEnum
	region?: number | null
	branch?: number | null
	profile?: Partial<{
		first_name: string
		last_name: string
		middle_name: string
		pinfl: string
		phone_number: string
		username: string
		password?: string
		confirm_password?: string
	}>
}

const NO_REGION_ROLES = new Set<UserRoleEnum>([
	UserRoleEnum.ACCOUNTANT,
	UserRoleEnum.ADMIN,
	UserRoleEnum.FINANCE,
	UserRoleEnum.JURIST,
	UserRoleEnum.MARKETING,
	UserRoleEnum.UZMASHLIZING,
	UserRoleEnum.ZAMPRED
])

const toNineDigits = (raw?: string) =>
	(raw || '').toString().replace(/\D/g, '').replace(/^998/, '').slice(-9)
const toApiPhone = (v?: string) => (v && v.length === 9 ? `998${v}` : undefined)

const isInvalid = (
	name: keyof FormModel,
	errors: Partial<Record<keyof FormModel, string | undefined>>,
	touched: Partial<Record<keyof FormModel, boolean>>,
	submitCount: number
) => Boolean(errors[name] && (touched[name] || submitCount > 0))

function buildDiff(initial: FormModel, current: FormModel): UpdateUserRequest {
	const out: UpdateUserRequest = { profile: {} }
	const setIf = (k: keyof NonNullable<UpdateUserRequest['profile']>, v?: string) => {
		if (v !== undefined) out.profile![k] = v
	}

	if (current.role != null && current.role !== initial.role)
		out.role = userRoleNumToText(current.role)
	if (current.region !== initial.region) out.region = current.region ?? null
	;(['first_name', 'last_name', 'middle_name', 'username', 'pinfl'] as const).forEach((k) => {
		const cur = (current[k] as string | undefined)?.trim?.()
		const ini = (initial[k] as string | undefined)?.trim?.()
		if (cur && cur !== ini) setIf(k, cur)
	})

	const cur9 = current.phone_number?.replace(/\D/g, '')
	const ini9 = initial.phone_number?.replace(/\D/g, '')
	if (cur9 && cur9 !== ini9) {
		const apiPhone = toApiPhone(cur9)
		if (apiPhone) setIf('phone_number', apiPhone)
	}

	if (current.password) {
		setIf('password', current.password)
		if (current.confirm_password) setIf('confirm_password', current.confirm_password)
	}

	if (out.profile && Object.keys(out.profile).length === 0) delete out.profile

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
>(({ values, onSubmitComplete, isSubmitting, roles, regions }, ref) => {
	const { t } = useTranslation()

	const schemaCore = {
		first_name: Yup.string().required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		last_name: Yup.string().required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		middle_name: Yup.string().required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v)),
		pinfl: Yup.string()
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('pinfl-14', t('ПИНФЛ должен состоять из 14 цифр'), (v) => !v || /^\d{14}$/.test(v)),
		phone_number: Yup.string().required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('uz-phone-9', t('Номер должен состоять из 9 цифр'), (v) => !v || /^\d{9}$/.test(v)),
		username: Yup.string().required(t('Поле обязательно'))
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('min3', t('Минимум 3 символа'), (v) => !v || String(v).length >= 3),
		password: Yup.string()
			.nullable()
			.transform((v) => (v?.trim?.() === '' ? undefined : v))
			.test('len', t('Пароль не может быть короче 6 символов'), (v) => !v || v.length >= 6)
			.test(
				'chars',
				t('Разрешены только буквы и цифры'),
				(v) => !v || /^[A-Za-z0-9_-]*$/.test(v || '')
			),
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

	const makeValidationSchema = () =>
		Yup.object().shape({
			role: Yup.number().nullable().required(t('Поле обязательно')),
			region: Yup.number()
				.nullable()
				.when('role', ([role], s: any) =>
					role && !NO_REGION_ROLES.has(role) ? s.required(t('Выберите область')) : s
				),
			...schemaCore
		})

	const validationSchema = useMemo(() => makeValidationSchema(), [values.role])

	return (
		<Formik
			enableReinitialize
			innerRef={ref}
			initialValues={values}
			validationSchema={validationSchema}
			onSubmit={onSubmitComplete}
		>
			{({ values, touched, errors, submitCount }) => {
				const isRegionExist = values.role != null && !NO_REGION_ROLES.has(values.role)

				const roleOptions = roles.map((r) => ({ label: userRoleTextToName(r.name), value: r.id }))
				const regionOptions: Option[] = regions.map((r) => ({ label: r.name_ru, value: r.id }))

				return (
					<Form>
						<FormContainer>
							<FormItem
								label={t('Должность')}
								invalid={isInvalid('role', errors, touched, submitCount)}
								errorMessage={errors.role}
							>
								<Field name='role'>
									{({ field, form }: FieldProps) => (
										<Select
											placeholder={t('Выберите роль')}
											isDisabled={!roles.length || isSubmitting}
											isClearable
											field={field}
											form={form}
											options={roleOptions}
											value={roleOptions.find((o) => o.value === values.role) || null}
											onChange={(opt) => {
												const v = opt?.value != null ? Number(opt.value) : null
												form.setFieldValue('role', v)
												form.setFieldValue('region', null)
												form.setFieldValue('branch', null)
											}}
										/>
									)}
								</Field>
							</FormItem>

							{isRegionExist && (
								<FormItem
									label={t('Филиал')}
									invalid={isInvalid('region', errors, touched, submitCount)}
									errorMessage={errors.region}
								>
									<Field name='region'>
										{({ field, form }: FieldProps) => (
											<Select
												placeholder={t('Выберите филиал')}
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
											value={field.value ?? ''}
											onValueChange={(e) => {
												const only = String(e?.formattedValue ?? '').replace(/\D/g, '')
												const nine = only.replace(/^998/, '').slice(-9)
												form.setFieldValue(field.name, nine)
											}}
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
									autoComplete='new-password'
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
									name='confirm_password'
									autoComplete='new-password'
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
})
UserEditForm.displayName = 'UserEditForm'

const UserEdit = ({ id, role, isOpen, setIsOpen, refetch }: Props) => {
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const canFetch = Boolean(isOpen && id != null && role != null)
	const { t } = useTranslation()

	// Spravochniklar
	const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
		queryKey: ['roles'],
		queryFn: () => UserService.getAllRoles<{ id: number; name: UserRoleTextEnum }[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})
	const { data: regions = [], isLoading: isLoadingRegions } = useQuery({
		queryKey: ['regions'],
		queryFn: () => DatasetService.getAllRegions<Region[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})

	// User initial
	const {
		data: initial,
		isLoading: isLoadingUser,
		isError
	} = useQuery({
		queryKey: ['user-by-id-role', { id, role }],
		queryFn: () =>
			UserService.getByIdAndRole<{
				id: number
				profile: User
				region?: Region | null
				branch?: Branch | null
			}>(id!, role!),
		enabled: canFetch,
		refetchOnWindowFocus: false,
		select: (res) => {
			const u = res?.data?.profile as User | undefined

			const branchObj = (res?.data as any)?.branch ?? (u as any)?.branch ?? null

			const regionId =
				(u as any)?.region?.id ??
				branchObj?.region?.id ?? // 👈 asosiy tuzatish
				(res?.data as any)?.region?.id ??
				null

			// const regionId = (u as any)?.region?.id ?? (res?.data as any)?.region?.id ?? null
			// const branchId = (u as any)?.branch?.id ?? (res?.data as any)?.branch?.id ?? null
			const roleText = (u as any)?.role ?? (res?.data as any)?.role ?? null
			const roleIdRaw = (u as any)?.role_id ?? (res?.data as any)?.role_id ?? null

			const base: FormModel & {
				__roleText?: UserRoleTextEnum | null
				__roleId?: number | string | null
			} = {
				role: null, // roles kelgach map qilamiz
				region: regionId,
				first_name: u?.first_name ?? '',
				last_name: u?.last_name ?? '',
				middle_name: u?.middle_name ?? '',
				pinfl: (u as any)?.pinfl ?? '',
				username: u?.username ?? '',
				phone_number: toNineDigits(u?.phone_number),
				password: '',
				confirm_password: '',
				__roleText: roleText,
				__roleId: roleIdRaw
			}

			return base
		}
	})

	// initial.role ni roles kelgach to‘ldiramiz
	const resolvedInitial: FormModel | undefined = useMemo(() => {
		if (!initial) return initial

		const apiRoleId =
			(initial as any).__roleId ??
			(initial as any)?.role_id ??
			(initial as any)?.profile?.role_id ??
			null

		if (!initial.role && roles.length) {
			if (apiRoleId != null) return { ...initial, role: Number(apiRoleId) as UserRoleEnum }
			const roleText = (initial as any).__roleText ?? role
			if (roleText) {
				const found = roles.find((r) => r.name === roleText)
				if (found?.id != null) return { ...initial, role: Number(found.id) as UserRoleEnum }
			}
		}

		return initial
	}, [initial, roles, role])

	if (isError) {
		toast.push(<Notification type='danger' title={t('Не удалось загрузить пользователя')} />, {
			placement: 'top-center'
		})
	}

	// const isBranchRole = (r: string | UserRoleTextEnum | null | undefined) =>
	//   String(r ?? '').toLowerCase().startsWith('branch')

	// UPDATE (branch_* → branch_users) | generiksiz chaqiruv
	const { mutateAsync: updateUser, isPending } = useMutation({
		mutationKey: ['update user', id],
		mutationFn: (payload: UpdateUserRequest) => {
			if (id == null) throw new Error('Missing id')

			// 1) Yangi rol text’ini aniqlaymiz (payload.role → form.role → prop role)
			const formRoleId = formikRef.current?.values.role
			const mapRoleIdToText = (rid?: number | null): UserRoleTextEnum | undefined => {
				if (rid == null) return undefined
				const fromList = roles.find((r) => Number(r.id) === Number(rid))?.name

				return fromList ?? (userRoleNumToText ? (userRoleNumToText(Number(rid)) as any) : undefined)
			}
			const selectedRoleText = String(
				payload.role ?? mapRoleIdToText(formRoleId) ?? role ?? ''
			).toLowerCase()

			// console.log(selectedRoleText)

			// 2) branch_* bo‘lsa → maxsus endpoint
			if (String(selectedRoleText).toLowerCase().startsWith('branch')) {
				// return UserService.getBranchUserById(id)
				return UserService.update((role ?? selectedRoleText) as any, id, payload)
			}

			// 3) Oddiy holat: mavjud endpoint
			return UserService.update((role ?? selectedRoleText) as any, id, payload)
		},
		async onSuccess() {
			if (refetch) await refetch()
			toast.push(
				<Notification type='success' title={t('Пользователь обновлен')} duration={2000} />,
				{
					placement: 'top-center'
				}
			)
		},
		onError(error) {
			const normalized = normalizeApiErrors(error)
			if (formikRef.current) {
				applyApiErrorsToFormik(formikRef.current, normalized, {
					alias: {
						'profile.first_name': 'first_name',
						'profile.last_name': 'last_name',
						'profile.middle_name': 'middle_name',
						'profile.pinfl': 'pinfl',
						'profile.phone_number': 'phone_number',
						'profile.username': 'username',
						'profile.password': 'password',
						'profile.confirm_password': 'confirm_password',
						role: 'role',
						region: 'region',
						branch: 'branch'
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

		// touched=true qilamiz
		const allTouched = Object.keys(values).reduce(
			(acc, k) => {
				acc[k as keyof FormModel] = true as any

				return acc
			},
			{} as Record<keyof FormModel, boolean>
		)
		setTouched(allTouched, true)

		// validate
		const errors = await validateForm()
		if (Object.keys(errors || {}).length > 0) {
			toast.push(
				<Notification type='danger' title={t('Исправьте ошибки в форме')} duration={2500} />,
				{
					placement: 'top-center'
				}
			)

			return
		}

		// diff
		const payload = buildDiff(resolvedInitial, values)
		if (
			!payload.profile &&
			payload.role === undefined &&
			payload.region === undefined &&
			payload.branch === undefined
		) {
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

	const loadingAny = isLoadingUser || isLoadingRoles || isLoadingRegions

	return (
		<Drawer
			key={`${id ?? 'x'}-${role ?? 'x'}`}
			title={t('Редактирование пользователя')}
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
					<Button size='md' variant='solid' onClick={onSave} disabled={isPending || loadingAny}>
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
					roles={roles}
					regions={regions}
					// onSubmitComplete={() => setIsOpen(false)}
					onSubmitComplete={() => {
						/* noop — formik orqali bevosita drawer yopilmasin.
							 Saqlashni faqat pastdagi "Сохранить" tugma (onSave) bajaradi. */
					}}
				/>
			)}
		</Drawer>
	)
}

export default UserEdit
