// src/views/components/UserForm.tsx
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { UserRoleEnum, UserRoleTextEnum } from '@/@types/user.types'
import { FormPatternInput, PasswordInput } from '@/components/shared'
import { DatePicker, FormContainer, FormItem, Input, Select, Skeleton } from '@/components/ui'
import { UserService } from '@/services/user.service'
import { userRoleTextToName } from '@/utils/format'

/* Helpers (dayjs guard + YMD) */
interface DayjsLike {
	format: (fmt: string) => string
}

const isDayjsLike = (x: unknown): x is DayjsLike =>
	typeof x === 'object' &&
	x !== null &&
	'format' in (x as any) &&
	typeof (x as any).format === 'function'

type YmdLike = Date | DayjsLike | string | number | null | undefined

const fromYMDLocal = (s?: string | null): Date | null => {
	if (!s) return null
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s)
	if (!m) return null

	return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}
const toYMD = (d: YmdLike): string | null => {
	if (d == null) return null
	if (isDayjsLike(d)) return d.format('YYYY-MM-DD')
	const dt = d instanceof Date ? d : new Date(d)
	if (Number.isNaN(dt.getTime())) return null
	const y = dt.getFullYear()
	const m = String(dt.getMonth() + 1).padStart(2, '0')
	const day = String(dt.getDate()).padStart(2, '0')

	return `${y}-${m}-${day}`
}

/* Local types */
// src/views/components/UserForm.tsx
export type FormModel = {
	username: string
	first_name: string
	middle_name: string
	last_name: string
	phone_number: string
	email: string
	pinfl: string
	password: string
	role: number | UserRoleEnum | null
	role_text?: UserRoleTextEnum | string | null // 🔹 qo‘shdik: enum ham, string ham bo‘lishi mumkin
	procuration_date: string | null
	procuration_number: number | null
	is_active: boolean
}

type UserFormProps = {
	values: FormModel
	onSubmitComplete: (values: FormModel) => void
	isSubmitting?: boolean
	disableRoleChange?: boolean // edit da rostlash uchun
}

type RoleOption = { label: string; value: number }

const UserForm = forwardRef<FormikProps<FormModel>, UserFormProps>(
	({ values, onSubmitComplete, isSubmitting = false, disableRoleChange = false }, ref) => {
		const { t } = useTranslation()

		// const validationSchema = Yup.object().shape({
		// 	role: Yup.number().required(t('Поле обязательно')),
		// 	username: Yup.string().required(t('Поле обязательно')),
		// 	// edit uchun password optional bo'lishi mumkin, lekin add da required
		// 	password: Yup.string().nullable(),
		// 	procuration_date: Yup.string()
		// 		.nullable()
		// 		.when('role', {
		// 			is: (r: number) => r === UserRoleEnum.BRANCH_DIRECTOR,
		// 			then: (s: any) =>
		// 				s
		// 					.required(t('Укажите дату доверенности'))
		// 					.matches(/^\d{4}-\d{2}-\d{2}$/, t('Формат: YYYY-MM-DD')),
		// 			otherwise: (s: any) => s.nullable().notRequired()
		// 		}),
		// 	procuration_number: Yup.number()
		// 		.typeError(t('Только число'))
		// 		.integer(t('Только целое число'))
		// 		.nullable()
		// 		.when('role', {
		// 			is: (r: number) => r === UserRoleEnum.BRANCH_DIRECTOR,
		// 			then: (s: any) => s.required(t('Укажите номер доверенности')),
		// 			otherwise: (s: any) => s.nullable().notRequired()
		// 		})
		// })

		const validationSchema = Yup.object().shape({
			role: Yup.number().required(t('Поле обязательно')),

			first_name: Yup.string().required(t('Поле обязательно')),
			last_name: Yup.string().required(t('Поле обязательно')),

			middle_name: Yup.string().nullable(), // agar shart bo'lmasa

			pinfl: Yup.string()
				.required(t('Поле обязательно'))
				.matches(/^\d{14}$/, t('Ровно 14 цифр')),

			phone_number: Yup.string()
				.required(t('Поле обязательно'))
				// sizda mask "## ### ## ##" — backendga `998` prefiks bilan boradi:
				.matches(/^\d{9}$/, t('Формат: 9 цифр')),

			username: Yup.string().required(t('Поле обязательно')),
			password: Yup.string().required(t('Поле обязательно')), // ADD holati uchun required

			// BRANCH_DIRECTOR bo'lsa — quyidagilar majburiy:
			procuration_date: Yup.string()
				.nullable()
				.when('role', {
					is: (r: number) => r === UserRoleEnum.BRANCH_DIRECTOR,
					then: (s: any) =>
						s
							.required(t('Укажите дату доверенности'))
							.matches(/^\d{4}-\d{2}-\d{2}$/, t('Формат: YYYY-MM-DD')),
					otherwise: (s: any) => s.nullable().notRequired()
				}),
			procuration_number: Yup.number()
				.typeError(t('Только число'))
				.integer(t('Только целое число'))
				.nullable()
				.when('role', {
					is: (r: number) => r === UserRoleEnum.BRANCH_DIRECTOR,
					then: (s: any) => s.required(t('Укажите номер доверенности')),
					otherwise: (s: any) => s.nullable().notRequired()
				})
		})

		const { data: roles, isLoading: isLoadingRoles } = useQuery({
			queryKey: ['get roles'],
			queryFn: () =>
				UserService.getAllRoles<{ id: number; name: UserRoleTextEnum }[]>({ type: 'branch' }),
			select: ({ data }) => data
		})

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={onSubmitComplete}
			>
				{({ values, touched, errors, setFieldValue }) => {
					// const isBranchDirector = Number(values.role) === UserRoleEnum.BRANCH_DIRECTOR

					const isBranchDirector =
						Number(values.role) === UserRoleEnum.BRANCH_DIRECTOR ||
						values.role_text === UserRoleTextEnum.BRANCH_DIRECTOR ||
						values.role_text === 'branch_director'

					// Formik render ichida:
					if (!isLoadingRoles && roles?.length && !values.role && values.role_text) {
						const match = roles.find((r) => String(r.name) === String(values.role_text))
						if (match) {
							setFieldValue('role', Number(match.id))
						}
					}

					return (
						<Form>
							<FormContainer>
								<FormItem
									invalid={!!(errors.role && touched.role)}
									errorMessage={errors.role as string | undefined}
								>
									<h6 className='mb-4'>{t('Должность')}</h6>
									{isLoadingRoles ? (
										<Skeleton height={44} />
									) : (
										roles && (
											<Field name='role'>
												{({ field, form }: FieldProps<number | null, FormModel>) => {
													const options: RoleOption[] = roles.map((r) => ({
														label: userRoleTextToName(r.name) ?? t('Неизвестно'),
														value: Number(r.id)
													}))

													return (
														<Select<RoleOption, false>
															placeholder={t('Выберите роль')}
															isDisabled={disableRoleChange || !options.length || isSubmitting}
															isClearable
															field={field}
															form={form}
															options={options}
															value={options.find((o) => o.value === values.role) ?? null}
															onChange={(option) => {
																form.setFieldValue(field.name, option?.value ?? null)
																if (option?.value !== UserRoleEnum.BRANCH_DIRECTOR) {
																	setFieldValue('procuration_date', null)
																	setFieldValue('procuration_number', null)
																}
															}}
														/>
													)
												}}
											</Field>
										)
									)}
								</FormItem>

								<div className='grid grid-cols-2 gap-4'>
									<FormItem
										invalid={!!(errors.first_name && touched.first_name)}
										errorMessage={errors.first_name as string | undefined}
									>
										<h6 className='mb-4'>{t('Имя')}</h6>
										<Field
											name='first_name'
											type='text'
											placeholder={t('Введите имя')}
											component={Input}
										/>
									</FormItem>

									<FormItem
										invalid={!!(errors.last_name && touched.last_name)}
										errorMessage={errors.last_name as string | undefined}
									>
										<h6 className='mb-4'>{t('Фамилия')}</h6>
										<Field
											name='last_name'
											type='text'
											placeholder={t('Введите фамилию')}
											component={Input}
										/>
									</FormItem>
								</div>

								<FormItem
									invalid={!!(errors.middle_name && touched.middle_name)}
									errorMessage={errors.middle_name as string | undefined}
								>
									<h6 className='mb-4'>{t('Отчество')}</h6>
									<Field
										name='middle_name'
										type='text'
										placeholder={t('Введите отчество')}
										component={Input}
									/>
								</FormItem>

								<FormItem
									invalid={!!(errors.pinfl && touched.pinfl)}
									errorMessage={errors.pinfl as string | undefined}
								>
									<h6 className='mb-4'>{t('ПИНФЛ')}</h6>
									<Field name='pinfl'>
										{({ field, form }: FieldProps<string, FormModel>) => (
											<FormPatternInput
												form={form}
												field={field}
												format='##############'
												mask='_'
												inputMode='numeric'
												value={field.value ?? ''}
												onValueChange={(e: { value?: string }) => {
													const v = String(e?.value ?? '')
														.replace(/\D/g, '')
														.slice(0, 14)
													form.setFieldValue(field.name, v)
												}}
											/>
										)}
									</Field>
								</FormItem>

								<FormItem
									invalid={!!(errors.phone_number && touched.phone_number)}
									errorMessage={errors.phone_number as string | undefined}
								>
									<h6 className='mb-4'>{t('Номер телефона')}</h6>
									<Field name='phone_number'>
										{({ field, form }: FieldProps<string, FormModel>) => (
											<FormPatternInput
												form={form}
												field={field}
												format='## ### ## ##'
												mask='_'
												inputPrefix='+998 '
												placeholder='__-___-__-__'
												value={field.value ?? ''}
												onValueChange={(e: { floatValue?: number; value?: string }) =>
													form.setFieldValue(field.name, e?.floatValue ?? e?.value ?? '')
												}
											/>
										)}
									</Field>
								</FormItem>

								{isBranchDirector && (
									<>
										<FormItem
											invalid={!!(errors.procuration_date && touched.procuration_date)}
											errorMessage={errors.procuration_date as string | undefined}
										>
											<h6 className='mb-4'>{t('Дата доверенности')}</h6>
											<Field name='procuration_date'>
												{({ field, form }: FieldProps<string | null, FormModel>) => (
													<DatePicker
														value={fromYMDLocal(field.value)}
														placeholder='YYYY-MM-DD'
														onChange={(val: Date | null) =>
															form.setFieldValue(field.name, toYMD(val))
														}
														inputFormat='YYYY-MM-DD'
													/>
												)}
											</Field>
										</FormItem>

										<FormItem
											invalid={!!(errors.procuration_number && touched.procuration_number)}
											errorMessage={errors.procuration_number as string | undefined}
										>
											<h6 className='mb-4'>{t('Номер доверенности')}</h6>
											<Field name='procuration_number'>
												{({ field, form }: FieldProps<number | null, FormModel>) => (
													<Input
														{...field}
														type='text'
														inputMode='numeric'
														placeholder={t('Введите номер')}
														onChange={(e) => {
															const v = e.target.value.replace(/\D/g, '')
															form.setFieldValue(field.name, v ? Number(v) : null)
														}}
														value={field.value ?? ''}
													/>
												)}
											</Field>
										</FormItem>
									</>
								)}

								<FormItem
									invalid={!!(errors.username && touched.username)}
									errorMessage={errors.username as string | undefined}
								>
									<h6 className='mb-4'>{t('Логин')}</h6>
									<Field
										name='username'
										type='text'
										placeholder={t('Введите логин')}
										component={Input}
									/>
								</FormItem>

								<FormItem
									invalid={!!(errors.password && touched.password)}
									errorMessage={errors.password as string | undefined}
								>
									<h6 className='mb-4'>{t('Пароль')}</h6>
									<Field
										name='password'
										autoComplete='off'
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

export default UserForm
