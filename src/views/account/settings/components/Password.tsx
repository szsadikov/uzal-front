import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	HiOutlineDesktopComputer,
	HiOutlineDeviceMobile,
	HiOutlineDeviceTablet,
	HiOutlineTrash
} from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Session } from '@/@types/user.types'
import { PasswordInput } from '@/components/shared'
import {
	Button,
	FormContainer,
	FormItem,
	Input,
	Notification,
	Skeleton,
	Tag,
	toast
} from '@/components/ui'
import Pagination from '@/components/ui/Pagination'
import { errorCatch } from '@/services/api.helpers'
import { ProfileService } from '@/services/profile.service'
import { formatDate } from '@/utils/format'
import { extractApiMessage } from '@/utils/formatAxiosError'
import isLastChild from '@/utils/isLastChild'

type FormModel = {
	old_password: string
	new_password: string
	confirm_new_password: string

	old_username: string
	new_username: string
}

const LoginHistoryIcon = ({ userAgent }: { userAgent: string }) => {
	if (/Mobi|Android/i.test(userAgent)) {
		return <HiOutlineDeviceMobile />
	} else if (/Tablet|iPad/i.test(userAgent)) {
		return <HiOutlineDeviceTablet />
	} else {
		return <HiOutlineDesktopComputer />
	}
}

const Password = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const params = useMemo(() => ({ ...queries }), [queries])

	const validationSchemaPassword = Yup.object().shape({
		old_password: Yup.string().required(t('Пароль обязателен')),
		new_password: Yup.string()
			.required(t('Введите новый пароль'))
			.min(5, t('Пароль не может быть короче 5 символов'))
			.matches(/^[A-Za-z0-9_-]*$/, t('Разрешены только буквы и цифры'))
			.notOneOf([Yup.ref('old_password')], t('Новый пароль должен отличаться от текущего')),
		confirm_new_password: Yup.string()
			.required(t('Подтвердите пароль'))
			.oneOf([Yup.ref('new_password')], t('Пароли не совпадают'))
	})

	const validationSchemaUsername = Yup.object().shape({
		old_username: Yup.string().required(t('Логин обязателен')),
		new_username: Yup.string()
			.required(t('Логин обязателен'))
			.notOneOf([Yup.ref('old_username')], t('Новый логин должен отличаться от текущего'))
	})

	const {
		data: sessions,
		isLoading: isLoadingSessions,
		refetch: refetchSessions
	} = useQuery({
		queryKey: ['get sessions', params],
		queryFn: () => ProfileService.getDeviceSessions<PaginatedResponse<Session[]>>(params),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncPasswordAndUsername, isPending: isPendingPasswordAndUsername } =
		useMutation({
			mutationKey: ['update profile password'],
			mutationFn: (data: FormModel) =>
				ProfileService.updatePasswordAndUsername<FormModel, FormModel>(data),
			onSuccess() {
				toast.push(<Notification type='success' title={t('Обновлен успешно')} duration={2000} />, {
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

	const { mutateAsync: mutateAsyncDeleteSession } = useMutation({
		mutationKey: ['delete session'],
		mutationFn: (id: number) => ProfileService.deleteDevice(id),
		async onSuccess() {
			if (refetchSessions) await refetchSessions()
			toast.push(<Notification type='success' title={t('Сессия удален')} duration={2000} />, {
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

	const onFormSubmit = async (
		values: FormModel,
		setSubmitting: (isSubmitting: boolean) => void,
		resetForm: () => void,
		setFieldError: (field: string, message: string | undefined) => void
	) => {
		setSubmitting(true)
		try {
			await mutateAsyncPasswordAndUsername(values)
			resetForm()
		} catch (err) {
			if (typeof values.old_password !== 'undefined') {
				const msg = extractApiMessage(err, {
					preferFields: ['new_password', 'confirm_new_password', 'password'],
					lang: 'ru'
				})
				setFieldError('new_password', msg)
				setFieldError('confirm_new_password', msg)
			}
			if (typeof values.old_username !== 'undefined') {
				// Login formi
				const msg = extractApiMessage(err, {
					preferFields: ['new_username', 'username'],
					lang: 'ru'
				})
				setFieldError('new_username', msg)
			}
		} finally {
			setSubmitting(false)
		}
	}

	const onDelete = async (id: number) => {
		await mutateAsyncDeleteSession(id)
	}

	// submit bosilganda ham "qizarish" uchun helper (touched || submitCount>0)
	const isInvalid = (
		name: keyof FormModel,
		errors: Partial<Record<keyof FormModel, string | undefined>>,
		touched: Partial<Record<keyof FormModel, boolean>>,
		submitCount: number
	) => Boolean(errors[name] && (touched[name] || submitCount > 0))

	return (
		<>
			<div className='mb-10'>
				<h5>{t('Пароль')}</h5>
				<p>{t('Раздел для настройки основной информации о продукте')}</p>
			</div>

			{/* ===== Password change form ===== */}
			<Formik
				initialValues={
					{
						old_password: '',
						new_password: '',
						confirm_new_password: ''
					} as unknown as FormModel
				}
				validationSchema={validationSchemaPassword}
				onSubmit={(values, { setSubmitting, resetForm, setFieldError }) =>
					onFormSubmit(values, setSubmitting, resetForm, setFieldError)
				}
			>
				{({ touched, errors, isSubmitting, resetForm, submitCount }) => (
					<Form className='mb-10'>
						<FormContainer>
							<div className='mb-4 grid md:grid-cols-3 md:gap-4 last:mb-0'>
								{isPendingPasswordAndUsername ? (
									<div className='flex flex-col'>
										<Skeleton height={21} className='mb-2' />
										<Skeleton height={44} />
									</div>
								) : (
									<FormItem
										label={t('Текущий пароль')}
										invalid={isInvalid('old_password', errors, touched, submitCount)}
										errorMessage={errors.old_password}
									>
										<Field
											autoComplete='off'
											name='old_password'
											placeholder={t('Введите пароль')}
											component={PasswordInput}
										/>
									</FormItem>
								)}

								{isPendingPasswordAndUsername ? (
									<div className='flex flex-col'>
										<Skeleton height={21} className='mb-2' />
										<Skeleton height={44} />
									</div>
								) : (
									<FormItem
										label={t('Новый пароль')}
										invalid={isInvalid('new_password', errors, touched, submitCount)}
										errorMessage={errors.new_password}
									>
										<Field
											autoComplete='off'
											name='new_password'
											placeholder={t('Введите пароль')}
											component={PasswordInput}
										/>
									</FormItem>
								)}

								{isPendingPasswordAndUsername ? (
									<div className='flex flex-col'>
										<Skeleton height={21} className='mb-2' />
										<Skeleton height={44} />
									</div>
								) : (
									<FormItem
										label={t('Повторите пароль')}
										invalid={isInvalid('confirm_new_password', errors, touched, submitCount)}
										errorMessage={errors.confirm_new_password}
									>
										<Field
											autoComplete='off'
											name='confirm_new_password'
											placeholder={t('Введите пароль')}
											component={PasswordInput}
										/>
									</FormItem>
								)}
							</div>

							<div className='mt-4 ltr:text-right'>
								<Button className='ltr:mr-2 rtl:ml-2' type='button' onClick={() => resetForm()}>
									{t('Сбросить')}
								</Button>
								<Button variant='solid' loading={isSubmitting} type='submit'>
									{isSubmitting ? t('Обновляется') : t('Обновить')}
								</Button>
							</div>
						</FormContainer>
					</Form>
				)}
			</Formik>

			{/* ===== Username change form ===== */}
			<Formik
				initialValues={
					{
						old_username: '',
						new_username: ''
					} as unknown as FormModel
				}
				validationSchema={validationSchemaUsername}
				onSubmit={(values, { setSubmitting, resetForm, setFieldError }) =>
					onFormSubmit(values, setSubmitting, resetForm, setFieldError)
				}
			>
				{({ touched, errors, isSubmitting, resetForm, submitCount }) => (
					<Form className='mb-10'>
						<FormContainer>
							<div className='mb-4 grid md:grid-cols-3 md:gap-4 last:mb-0'>
								{isPendingPasswordAndUsername ? (
									<div className='flex flex-col'>
										<Skeleton height={21} className='mb-2' />
										<Skeleton height={44} />
									</div>
								) : (
									<FormItem
										label={t('Текущий логин')}
										invalid={isInvalid('old_username', errors, touched, submitCount)}
										errorMessage={errors.old_username}
									>
										<Field
											autoComplete='off'
											name='old_username'
											placeholder={t('Введите логин')}
											component={Input}
										/>
									</FormItem>
								)}

								{isPendingPasswordAndUsername ? (
									<div className='flex flex-col'>
										<Skeleton height={21} className='mb-2' />
										<Skeleton height={44} />
									</div>
								) : (
									<FormItem
										label={t('Новый логин')}
										invalid={isInvalid('new_username', errors, touched, submitCount)}
										errorMessage={errors.new_username}
									>
										<Field
											autoComplete='off'
											name='new_username'
											placeholder={t('Введите логин')}
											component={Input}
										/>
									</FormItem>
								)}
							</div>

							<div className='mt-4 ltr:text-right'>
								<Button className='ltr:mr-2 rtl:ml-2' type='button' onClick={() => resetForm()}>
									{t('Сбросить')}
								</Button>
								<Button variant='solid' loading={isSubmitting} type='submit'>
									{isSubmitting ? t('Обновляется') : t('Обновить')}
								</Button>
							</div>
						</FormContainer>
					</Form>
				)}
			</Formik>

			{/* ===== Sessions ===== */}
			<div className='mb-10'>
				<h5>{t('Текущие сеансы')}</h5>
				<p>{t('Раздел для настройки основной информации о продукте')}</p>
			</div>

			<div className='rounded-lg border border-gray-200 dark:border-gray-600'>
				{isLoadingSessions ? (
					<>
						<Skeleton height={90} className='mb-1' />
						<Skeleton height={90} className='mb-1' />
						<Skeleton height={90} className='mb-1' />
					</>
				) : sessions && sessions.results.length ? (
					<>
						{sessions.results.map((session, index) => (
							<div
								key={`${session.id}_${index}`}
								className={classNames(
									'flex items-center px-4 py-6',
									!isLastChild(sessions.results, index) &&
										'border-b border-gray-200 dark:border-gray-600'
								)}
							>
								<div className='flex w-full items-center'>
									<div className='text-3xl'>
										<LoginHistoryIcon userAgent={session.user_agent} />
									</div>
									<div className='ml-3 rtl:mr-3'>
										<div className='flex items-center'>
											<div className='font-semibold text-gray-900 dark:text-gray-100'>
												{session.user_agent}
											</div>
											{index === 0 && (
												<Tag className='mx-2 rounded-md border-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-100'>
													<span className='capitalize'>{t('Текущий')}</span>
												</Tag>
											)}
										</div>
										<span>
											{session.ip_address} • {formatDate(session.last_seen, 'DD-MMM-YYYY, hh:mm A')}
										</span>
									</div>
									{index !== 0 && (
										<span
											className='ml-auto inline-block cursor-pointer p-2 text-lg hover:text-red-500'
											onClick={() => onDelete(session.id)}
										>
											<HiOutlineTrash />
										</span>
									)}
								</div>
							</div>
						))}

						<Pagination
							className='px-4 py-6'
							onChange={(page) => setQueries((prev) => ({ ...prev, page }))}
							pageSize={params.size}
							total={sessions?.count || 0}
						/>
					</>
				) : (
					<div className='px-4 py-6'>{t('Сессии не найдены')}</div>
				)}
			</div>
		</>
	)
}

export default Password
