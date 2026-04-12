import { useEffect, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineUpload, HiOutlineUser } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Customer, Lessee } from '@/@types/contract.types'
import type { Region } from '@/@types/dataset.types'
import { User, UserRoleTextEnum } from '@/@types/user.types'
import { FormPatternInput } from '@/components/shared'
import {
	Avatar,
	Button,
	FormItem,
	Input,
	Notification,
	Option,
	Select,
	Skeleton,
	toast,
	Upload
} from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { ProfileService } from '@/services/profile.service'
import { UserService } from '@/services/user.service'
import { signInSuccess, useAppDispatch, useAppSelector } from '@/store'
import { trimPhoneNumber } from '@/utils/format'
import useDebounce from '@/utils/hooks/useDebounce'
import { validEmail, validPhone } from '@/utils/regex'

export type FormModelProfileForm = User

export type FormModelLesseeProfileForm = Pick<
	Lessee,
	'company_name' | 'stir' | 'address' | 'account_number' | 'mfo' | 'bank_details' | 'director_name'
> & {
	region: number
} & Pick<User, 'phone_number' | 'profile_picture'>

const STIR_SIZE = 9

const ProfileForm = () => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()

	const {
		data: profile,
		isLoading: isLoadingProfile,
		refetch: refetchProfile
	} = useQuery({
		queryKey: ['get profile'],
		queryFn: () => ProfileService.getProfile<User>(),
		select: ({ data }) => {
			dispatch(signInSuccess({ user: data }))

			return data
		}
	})

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update profile'],
		mutationFn: (data: FormData) => ProfileService.updateProfile<User, FormData>(data),
		async onSuccess() {
			if (refetchProfile) await refetchProfile()
			toast.push(<Notification type='success' title={t('Профиль обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const { control, setValue, handleSubmit, reset } = useForm<FormModelProfileForm>({
		mode: 'onChange'
	})

	const onSubmit: SubmitHandler<FormModelProfileForm> = async (data) => {
		const formData = new FormData()

		const isUploadedProfileImage = data.profile_picture && data.profile_picture.includes('blob')

		if (isUploadedProfileImage) {
			const response = await fetch(data.profile_picture)
			const blob = await response.blob()
			const mimeType = blob.type
			const extension = mimeType.split('/')[1]
			const fileName = data.profile_picture.split('/').pop() || 'file'
			const file = new File([blob], `${fileName}.${extension}`, { type: mimeType })
			formData.append('profile_picture', file)
		}

		formData.append('first_name', data.first_name)
		formData.append('last_name', data.last_name)
		formData.append('middle_name', data.middle_name)
		formData.append('role', data.role)
		formData.append('phone_number', '998' + data.phone_number)
		formData.append('email', data.email)
		formData.append('pinfl', data.pinfl)

		await mutateAsyncUpdate(formData)
	}

	const beforeUpload = (file: FileList | null) => {
		let valid: boolean | string = true
		const allowedFileType = ['image/jpeg', 'image/png']
		const maxFileSize = 5 * 1024 * 1024 // 5 MB

		if (file) {
			for (const f of file) {
				if (!allowedFileType.includes(f.type)) {
					valid = t('Пожалуйста, загрузите файл .jpeg или .png!')
				}

				if (f.size >= maxFileSize) {
					valid = t('Файл не должен превышать 5 МБ!')
				}
			}
		}

		return valid
	}

	const handleUpload = (fileList: File[]) => {
		const latestUpload = fileList.length - 1
		const image = URL.createObjectURL(fileList[latestUpload])
		setValue('profile_picture', image)
	}

	useEffect(() => {
		if (profile) {
			reset({
				...profile,
				profile_picture: API_SERVER_URL + profile.profile_picture,
				phone_number: trimPhoneNumber(profile.phone_number)
			})
		}
	}, [profile, reset])

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className='mb-6'>
				<h4>{t('Главные настройки')}</h4>
				<p className='text-muted-foreground text-sm'>
					{t('Раздел для настройки основной информации о продукте')}
				</p>
			</div>

			<Controller
				control={control}
				name={'profile_picture'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem className='mb-6' invalid={invalid} errorMessage={error && error.message}>
						<div className='flex w-full justify-center sm:justify-start'>
							<Upload
								className='cursor-pointer'
								showList={false}
								uploadLimit={1}
								beforeUpload={beforeUpload}
								onChange={handleUpload}
							>
								{/*{field.value ? (*/}
								{/*	<Avatar*/}
								{/*		className='border-2 border-white shadow-lg dark:border-gray-800'*/}
								{/*		size={125}*/}
								{/*		shape='circle'*/}
								{/*		src={field.value}*/}
								{/*	/>*/}
								{/*) : (*/}
								{/*	<Avatar*/}
								{/*		className='border-2 border-white shadow-lg dark:border-gray-800'*/}
								{/*		size={125}*/}
								{/*		shape='circle'*/}
								{/*		icon={<HiOutlineUpload />}*/}
								{/*	/>*/}
								{/*)}*/}

								<div className='relative'>
									<Avatar
										className='border-2 border-white shadow-lg dark:border-gray-800'
										size={125}
										shape='circle'
										src={field.value}
										icon={!field.value ? <HiOutlineUpload /> : undefined}
									/>

									{/* overlay — hoverda ko'rinadi */}
									<div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100'>
										<div className='flex items-center gap-2'>
											<HiOutlineUpload className='h-6 w-6 text-white' />
											<span className='text-sm text-white'>{t('Редактировать')}</span>
										</div>
									</div>
								</div>
							</Upload>
						</div>
					</FormItem>
				)}
			/>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'first_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Имя')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите имя')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>

				<Controller
					control={control}
					name={'last_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Фамилия')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите фамилию')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>

				<Controller
					control={control}
					name={'middle_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Отчество')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите отчество')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>
			</div>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'role'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Должность')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите роль')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
					rules={{
						required: t('Должность обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'phone_number'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Телефон')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<FormPatternInput
									className='w-full'
									field={field}
									invalid={invalid}
									format='(##) ### ## ##'
									mask='_'
									inputPrefix='+998 '
									placeholder='__-___-__-__'
									value={field.value}
									onValueChange={(e) => field.onChange(e.value)}
								/>
							)}
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

				<Controller
					control={control}
					name={'email'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('E-mail')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите почту')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
					rules={{
						pattern: {
							value: validEmail,
							message: t('Неверный e-mail')
						}
					}}
				/>
			</div>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'pinfl'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('ПИНФЛ')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingProfile ? (
								<Skeleton height={44} />
							) : (
								<FormPatternInput
									className='w-full'
									field={field}
									invalid={invalid}
									format='##############'
									mask='_'
									placeholder={t('Введите ПИНФЛ')}
									value={field.value}
									onValueChange={(e) => field.onChange(e.value)}
								/>
							)}
						</FormItem>
					)}
					rules={{
						minLength: {
							value: 14,
							message: t('Минимум 14 символа')
						}
					}}
				/>
			</div>

			<div className='mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end'>
				<Button
					className='w-full sm:w-auto ltr:mr-0 sm:ltr:mr-2 rtl:ml-0 sm:rtl:ml-2'
					type='button'
					disabled={isLoadingProfile || isPendingUpdate}
					onClick={() => reset()}
				>
					{t('Сбросить')}
				</Button>
				<Button
					className='w-full sm:w-auto'
					type='submit'
					variant='solid'
					loading={isLoadingProfile || isPendingUpdate}
				>
					{t('Обновить')}
				</Button>
			</div>
		</form>
	)
}

const LesseeProfileForm = ({ user }: { user: User }) => {
	const { t } = useTranslation()

	const [stir, setStir] = useState('')
	const debouncedStir = useDebounce(stir, 500)

	const {
		data: lessee,
		isLoading: isLoadingLessee,
		refetch: refetchLessee
	} = useQuery({
		queryKey: ['get lessee'],
		queryFn: () => UserService.getLesseeById<Lessee>(user.role_id),
		select: ({ data }) => data,
		enabled: user.role === UserRoleTextEnum.LESSEE
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

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update user by role'],
		mutationFn: (data: FormData) => UserService.updatePartially(user.role, user.role_id, data),
		async onSuccess() {
			if (refetchLessee) await refetchLessee()
			toast.push(<Notification type='success' title={t('Профиль обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const { control, setValue, handleSubmit, reset } = useForm<FormModelLesseeProfileForm>({
		mode: 'onChange'
	})

	const onSubmit: SubmitHandler<FormModelLesseeProfileForm> = async (data) => {
		if (
			!customer ||
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={3000} />, {
				placement: 'top-center'
			})

			return
		}

		const formData = new FormData()

		const isUploadedProfileImage = data.profile_picture && data.profile_picture.includes('blob')

		if (isUploadedProfileImage) {
			const response = await fetch(data.profile_picture)
			const blob = await response.blob()
			const mimeType = blob.type
			const extension = mimeType.split('/')[1]
			const fileName = data.profile_picture.split('/').pop() || 'file'
			const file = new File([blob], `${fileName}.${extension}`, { type: mimeType })
			formData.append('profile_picture', file)
		}

		formData.append('company_name', data.company_name)
		formData.append('stir', data.stir)
		formData.append('region', String(data.region))
		formData.append('address', data.address)
		formData.append('account_number', data.account_number)
		formData.append('mfo', data.mfo)
		formData.append('bank_details', data.bank_details)
		formData.append('director_name', data.director_name)
		formData.append('phone_number', '998' + data.phone_number)

		await mutateAsyncUpdate(formData)
	}

	const beforeUpload = (file: FileList | null) => {
		let valid: boolean | string = true
		const allowedFileType = ['image/jpeg', 'image/png']
		const maxFileSize = 5 * 1024 * 1024 // 5 MB

		if (file) {
			for (const f of file) {
				if (!allowedFileType.includes(f.type)) {
					valid = t('Пожалуйста, загрузите файл .jpeg или .png!')
				}

				if (f.size >= maxFileSize) {
					valid = t('Файл не должен превышать 5 МБ!')
				}
			}
		}

		return valid
	}

	const handleUpload = (fileList: File[]) => {
		const latestUpload = fileList.length - 1
		const image = URL.createObjectURL(fileList[latestUpload])
		setValue('profile_picture', image)
	}

	useEffect(() => {
		if (
			isSuccessCustomer &&
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			setValue('company_name', '')
			setValue('address', '')
			setValue('account_number', '')
			setValue('mfo', '')
			setValue('bank_details', '')
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={2000} />, {
				placement: 'top-center'
			})
		} else if (isSuccessCustomer) {
			setValue('company_name', customer.data.Наименование)
			setValue('address', customer.data.Адрес)
			setValue('account_number', customer.data.ОсновнойРасчетныйСчет)
			setValue('mfo', customer.data.БанкМФО)
			setValue('bank_details', customer.data.БанкНаименование)
		}
	}, [isSuccessCustomer])

	useEffect(() => {
		if (lessee) {
			reset({
				company_name: lessee.company_name,
				stir: lessee.stir,
				address: lessee.address,
				account_number: lessee.account_number,
				mfo: lessee.mfo,
				bank_details: lessee.bank_details,
				director_name: lessee.director_name,
				region: lessee.region.id,
				phone_number: trimPhoneNumber(lessee.profile.phone_number),
				profile_picture: lessee.profile.profile_picture
			})
		}
	}, [lessee, reset])

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className='mb-6'>
				<h4>{t('Главные настройки')}</h4>
				<p className='text-muted-foreground text-sm'>
					{t('Раздел для настройки основной информации о продукте')}
				</p>
			</div>

			<Controller
				control={control}
				name={'profile_picture'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem className='mb-6' invalid={invalid} errorMessage={error && error.message}>
						<div className='flex w-full justify-center sm:justify-start'>
							<Upload
								className='cursor-pointer'
								showList={false}
								uploadLimit={1}
								beforeUpload={beforeUpload}
								onChange={handleUpload}
							>
								{/*{field.value ? (*/}
								{/*	<Avatar*/}
								{/*		className='border-2 border-white shadow-lg dark:border-gray-800'*/}
								{/*		size={125}*/}
								{/*		shape='circle'*/}
								{/*		src={field.value}*/}
								{/*		icon={<HiOutlineUser />}*/}
								{/*	/>*/}
								{/*) : (*/}
								{/*	<Avatar*/}
								{/*		className='border-2 border-white shadow-lg dark:border-gray-800'*/}
								{/*		size={125}*/}
								{/*		shape='circle'*/}
								{/*		icon={<HiOutlineUpload />}*/}
								{/*	/>*/}
								{/*)}*/}

								<div className='relative'>
									<Avatar
										className='border-2 border-white shadow-lg dark:border-gray-800'
										size={125}
										shape='circle'
										src={field.value}
										icon={!field.value ? <HiOutlineUpload /> : <HiOutlineUser />}
									/>

									<div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity hover:opacity-100'>
										<div className='flex items-center gap-2'>
											<HiOutlineUpload className='h-6 w-6 text-white' />
											<span className='text-sm text-white'>{t('Редактировать')}</span>
										</div>
									</div>
								</div>
							</Upload>
						</div>
					</FormItem>
				)}
			/>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'company_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Наименование организации')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('ООО “Наименование организации”')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>

				<Controller
					control={control}
					name={'stir'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('ИНН')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<FormPatternInput
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									format='#########'
									mask='_'
									placeholder={t('Введите ИНН')}
									value={field.value}
									onValueChange={(e) => {
										setStir(e.value)
										field.onChange(e.value)
									}}
								/>
							)}
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
									className='w-full'
									field={field}
									invalid={invalid}
									isClearable
									isDisabled={true}
									isLoading={isLoadingRegions}
									noOptionsMessage={() => t('Нет областей')}
									placeholder={t('Выберите область')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) =>
										option ? field.onChange(option.value) : field.onChange(null)
									}
								/>
							</FormItem>
						)
					}}
					rules={{
						required: t('Область обязателен')
					}}
				/>
			</div>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'address'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Адрес')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите адрес')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
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
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите расчетный счет')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>

				<Controller
					control={control}
					name={'mfo'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('МФО')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите МФО')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>
			</div>

			<div className='mb-6 grid grid-cols-1 gap-4 last:mb-0 md:grid-cols-3'>
				<Controller
					control={control}
					name={'bank_details'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Банк')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee || isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Наименование банка')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
				/>

				<Controller
					control={control}
					name={'director_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Директор')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee ? (
								<Skeleton height={44} />
							) : (
								<Input
									className='w-full'
									type='text'
									field={field}
									invalid={invalid}
									placeholder={t('ФИО директора')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
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
						<FormItem label={t('Телефон')} invalid={invalid} errorMessage={error && error.message}>
							{isLoadingLessee ? (
								<Skeleton height={44} />
							) : (
								<FormPatternInput
									className='w-full'
									field={field}
									invalid={invalid}
									format='(##) ### ## ##'
									mask='_'
									inputPrefix='+998 '
									placeholder='__-___-__-__'
									value={field.value}
									onValueChange={(e) => field.onChange(e.value)}
								/>
							)}
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

			<div className='mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end'>
				<Button
					className='w-full sm:w-auto ltr:mr-0 sm:ltr:mr-2 rtl:ml-0 sm:rtl:ml-2'
					type='button'
					disabled={isLoadingLessee || isLoadingCustomer || isPendingUpdate}
					onClick={() => reset()}
				>
					{t('Сбросить')}
				</Button>
				<Button
					className='w-full sm:w-auto'
					type='submit'
					variant='solid'
					loading={isLoadingLessee || isLoadingCustomer || isPendingUpdate}
				>
					{t('Обновить')}
				</Button>
			</div>
		</form>
	)
}

const Profile = () => {
	const { user } = useAppSelector((state) => state.auth.session)

	return user.role === UserRoleTextEnum.LESSEE ? <LesseeProfileForm user={user} /> : <ProfileForm />
}

export default Profile
