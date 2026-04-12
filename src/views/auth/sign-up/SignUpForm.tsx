import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { SignUpCredential } from '@/@types/auth.types'
import type { CommonProps } from '@/@types/common'
import { Customer } from '@/@types/contract.types'
import type { Region } from '@/@types/dataset.types'
import { User } from '@/@types/user.types'
import { ActionLink, FormPatternInput, PasswordInput } from '@/components/shared'
import {
	Button,
	Checkbox,
	FormItem,
	Input,
	Notification,
	Option,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { errorCatch } from '@/services/api.helpers'
import { AuthService } from '@/services/auth.service'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { signInSuccess, useAppDispatch } from '@/store'
import useDebounce from '@/utils/hooks/useDebounce'
import { useQueryParams } from '@/utils/hooks/useQueryParams'
import { validPhone } from '@/utils/regex'

interface SignUpFormProps extends CommonProps {
	signInUrl?: string
}

type FormModel = Pick<
	SignUpCredential,
	| 'stir'
	| 'company_name'
	| 'account_number'
	| 'region'
	| 'mfo'
	| 'bank_details'
	| 'address'
	| 'director_name'
	| 'is_remember'
> &
	Pick<User, 'username' | 'phone_number'> & {
		password: string
		confirm_password: string
	}

const STIR_SIZE = 9

const SignUpForm = (props: SignUpFormProps) => {
	const { className, signInUrl = '/sign-in' } = props

	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const queryParams = useQueryParams()
	const navigate = useNavigate()

	const [stir, setStir] = useState('')
	const debouncedStir = useDebounce(stir, 500)

	const { control, handleSubmit, setValue, watch, reset } = useForm<FormModel>({
		mode: 'onChange',
		defaultValues: {
			is_remember: true
		}
	})

	const {
		data: customer,
		isLoading: isLoadingCustomer,
		isSuccess: isSuccessCustomer
	} = useQuery({
		queryKey: ['get customer by inn', debouncedStir],
		queryFn: () => CustomerService.getByInn<Customer>(debouncedStir),
		select: ({ data }) => data,
		enabled: !!debouncedStir && debouncedStir.length === STIR_SIZE
	})

	const { data: regions, isLoading: isLoadingRegions } = useQuery({
		queryKey: ['get regions'],
		queryFn: () => DatasetService.getAllRegions<Region[]>(),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncRegister, isPending: isPendingRegister } = useMutation({
		mutationKey: ['register'],
		mutationFn: (data: SignUpCredential) => AuthService.register(data),
		onSuccess({ data }) {
			if (data.token && data.user) dispatch(signInSuccess({ token: data.token, user: data.user }))

			const redirectUrl = queryParams.get(REDIRECT_URL_KEY)
			navigate(redirectUrl ? redirectUrl : appConfig.authenticatedEntryPath)
		},
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={3000} />, {
				placement: 'top-center'
			})
		}
	})

	const onSubmit = async (data: FormModel) => {
		if (
			!customer ||
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={2000} />, {
				placement: 'top-center'
			})

			return
		}

		const formData: SignUpCredential = {
			stir: data.stir,
			company_name: data.company_name,
			region: data.region,
			mfo: data.mfo,
			bank_details: data.bank_details,
			account_number: data.account_number,
			address: data.address,
			director_name: data.director_name,
			profile: {
				username: data.username,
				password: data.password,
				phone_number: data.phone_number ? '998' + data.phone_number : ''
			}
		}

		await mutateAsyncRegister(formData).finally(() => reset())
	}

	useEffect(() => {
		if (
			isSuccessCustomer &&
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			setValue('company_name', '')
			setValue('account_number', '')
			setValue('address', '')
			setValue('mfo', '')
			setValue('bank_details', '')
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={2000} />, {
				placement: 'top-center'
			})
		} else if (isSuccessCustomer) {
			setValue('company_name', customer.data.Наименование)
			setValue('account_number', customer.data.ОсновнойРасчетныйСчет)
			setValue('address', customer.data.Адрес)
			setValue('mfo', customer.data.БанкМФО)
			setValue('bank_details', customer.data.БанкНаименование)
		}
	}, [isSuccessCustomer])

	return (
		<div className={className}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className='grid grid-cols-2 gap-x-4'>
					<Controller
						control={control}
						name={'stir'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem label={t('ИНН')} invalid={invalid} errorMessage={error && error.message}>
								<FormPatternInput
									field={field}
									format='#########'
									mask='_'
									placeholder={t('Введите ИНН')}
									value={field.value}
									onValueChange={(e) => {
										setStir(e.value)
										field.onChange(e.value)
									}}
									invalid={invalid}
								/>
							</FormItem>
						)}
						rules={{
							required: t('ИНН обязателен'),
							minLength: {
								value: 9,
								message: t('Минимум 9 символа')
							}
						}}
					/>

					<Controller
						control={control}
						name={'company_name'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Наименование юр.лица')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Input
										disabled={true}
										type='text'
										placeholder={t('Введите наименование')}
										value={field.value}
										onChange={field.onChange}
									/>
								)}
							</FormItem>
						)}
					/>

					<Controller
						control={control}
						name={'region'}
						render={({ field, fieldState: { invalid, error } }) => {
							const options: Option[] = regions
								? regions.map((region) => ({
										label: region.name_ru,
										value: region.id
									}))
								: []

							return (
								<FormItem
									label={t('Область')}
									invalid={invalid}
									errorMessage={error && error.message}
								>
									<Select
										field={field}
										isClearable
										isDisabled={isPendingRegister}
										isLoading={isLoadingRegions}
										noOptionsMessage={() => t('Нет областей')}
										placeholder={t('Выберите область')}
										options={options}
										value={options.filter((option) => option.value === field.value)}
										onChange={(option) =>
											option ? field.onChange(option.value) : field.onChange(null)
										}
										invalid={invalid}
									/>
								</FormItem>
							)
						}}
						rules={{
							required: t('Область обязателен')
						}}
					/>

					<Controller
						control={control}
						name={'account_number'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Расчетный счет')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Input
										disabled={true}
										type='text'
										placeholder={t('Введите номер счета')}
										value={field.value}
										onChange={field.onChange}
										invalid={invalid}
									/>
								)}
							</FormItem>
						)}
					/>
				</div>

				<Controller
					control={control}
					name={'address'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Адрес')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									disabled={true}
									type='text'
									placeholder={t('Введите адрес')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
							)}
						</FormItem>
					)}
				/>

				<div className='grid grid-cols-2 gap-x-4'>
					<Controller
						control={control}
						name={'mfo'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem label={t('МФО')} invalid={invalid} errorMessage={error && error.message}>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Input
										disabled={true}
										type='text'
										placeholder={t('Введите МФО')}
										value={field.value}
										onChange={field.onChange}
										invalid={invalid}
									/>
								)}
							</FormItem>
						)}
					/>

					<Controller
						control={control}
						name={'bank_details'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem label={t('Банк')} invalid={invalid} errorMessage={error && error.message}>
								{isLoadingCustomer ? (
									<Skeleton height={44} />
								) : (
									<Input
										disabled={true}
										type='text'
										placeholder={t('Введите наименование')}
										value={field.value}
										onChange={field.onChange}
										invalid={invalid}
									/>
								)}
							</FormItem>
						)}
					/>

					<Controller
						control={control}
						name={'director_name'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Директор')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Input
									type='text'
									placeholder={t('Введите ФИО')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
							</FormItem>
						)}
						rules={{
							required: t('Директор обязателен')
						}}
					/>

					<Controller
						control={control}
						name={'phone_number'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Телефон')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<FormPatternInput
									field={field}
									format='## ### ## ##'
									mask='_'
									inputPrefix='+998 '
									placeholder='__-___-__-__'
									value={field.value}
									onValueChange={(e) => field.onChange(e.value)}
									invalid={invalid}
								/>
							</FormItem>
						)}
						rules={{
							required: t('Номер телефона обязателен'),
							pattern: {
								value: validPhone,
								message: t('Неверный номер телефона')
							}
						}}
					/>
				</div>

				<Controller
					control={control}
					name={'username'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Логин')} invalid={invalid} errorMessage={error && error.message}>
							<Input
								type='text'
								placeholder={t('Введите логин')}
								value={field.value}
								onChange={field.onChange}
								invalid={invalid}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Логин обязателен'),
						minLength: {
							value: 3,
							message: t('Минимум 3 символа')
						}
					}}
				/>

				<Controller
					control={control}
					name={'password'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Пароль')} invalid={invalid} errorMessage={error && error.message}>
							<PasswordInput
								autoComplete='off'
								placeholder={t('Введите пароль')}
								value={field.value}
								onChange={field.onChange}
								invalid={invalid}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Пароль обязателен'),
						minLength: {
							value: 3,
							message: t('Минимум 3 символа')
						}
					}}
				/>

				<Controller
					control={control}
					name={'confirm_password'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Подтвердить пароль')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							<PasswordInput
								autoComplete='off'
								placeholder={t('Повторите пароль')}
								value={field.value}
								onChange={field.onChange}
								invalid={invalid}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Подтверждение обязательно'),
						minLength: {
							value: 3,
							message: t('Минимум 3 символа')
						},
						validate: (value) => value === watch('password') || t('Пароли не совпадают')
					}}
				/>

				<div className='my-6 flex justify-between'>
					<Controller
						control={control}
						name={'is_remember'}
						render={({ field }) => (
							<Checkbox checked={field.value} onChange={field.onChange}>
								{t('Запомнить меня')}
							</Checkbox>
						)}
					/>
				</div>

				<Button
					block
					loading={isPendingRegister}
					variant='solid'
					type='submit'
					// disabled={!isValid}
				>
					{t('Зарегистрироваться')}
				</Button>

				<div className='mt-4 text-center'>
					<span>{t('Уже есть аккаунт?')} </span>
					<ActionLink to={signInUrl}>{t('Авторизация')}</ActionLink>
				</div>
			</form>
		</div>
	)
}

export default SignUpForm
