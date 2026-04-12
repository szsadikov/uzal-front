import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AxiosError } from 'axios'
import { Field, type FieldProps, Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import SuccessSvg from '@/assets/svg/SuccessSvg'
import { ActionLink, FormPatternInput, PasswordInput } from '@/components/shared'
import { Alert, Button, FormContainer, FormItem, Input } from '@/components/ui'
import { AuthService } from '@/services/auth.service'
import { extractApiMessage, formatAxiosErrorDualLang } from '@/utils/formatAxiosError'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useTranslation } from 'react-i18next'

interface ForgotPasswordFormProps extends CommonProps {
	disableSubmit?: boolean
	signInUrl?: string
}

type FormModel = {
	username: string
	phone_number: string
	code: string
	password: string
	password_confirmation: string
}

type Step = 'request' | 'verify' | 'reset' | 'done'

const normalizePhone = (raw: string) => {
	const digits = raw.replace(/\D/g, '')

	return digits.startsWith('998') ? digits : '998' + digits
}

// 🔎 nomi bo‘yicha inputni fokuslash (custom Input/PasswordInput bo‘lsa ham ishlaydi)
const focusByName = (name: string) => {
	queueMicrotask(() => {
		const el = document.querySelector<HTMLInputElement>(`input[name="${name}"]`)
		el?.focus()
		el?.select?.()
	})
}

const fmtMMSS = (sec: number) => {
	const m = Math.floor(sec / 60)
	const s = sec % 60

	return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const ForgotPasswordForm = (props: ForgotPasswordFormProps) => {
	const { disableSubmit = false, className, signInUrl = '/sign-in' } = props

	const { t } = useTranslation()

	const navigate = useNavigate()
	const [step, setStep] = useState<Step>('request')
	const [message, setMessage] = useTimeOutMessage()
	const [timer, setTimer] = useState(120)
	const [timerExpired, setTimerExpired] = useState(false)

	// ✅ Bosqichga qarab validatsiya
	const validationSchema = useMemo(() => {
		switch (step) {
			case 'request':
				return Yup.object().shape({
					username: Yup.string().required(t('Введите логин')).min(3, t('Минимум 3 символа')),
					phone_number: Yup.string().required(t('Введите номер телефона'))
				})
			case 'verify':
				return Yup.object().shape({
					username: Yup.string().required(),
					code: Yup.string().required(t('Введите код')).length(6, t('6 символов'))
				})
			case 'reset':
				return Yup.object().shape({
					username: Yup.string().required(),
					code: Yup.string().required(),
					password: Yup.string().required(t('Введите новый пароль')).min(6, t('Минимум 6 символов')),
					password_confirmation: Yup.string()
						.required(t('Подтвердите пароль'))
						.oneOf([Yup.ref('password')], t('Пароли должны совпадать'))
				})
			default:
				return Yup.object()
		}
	}, [step])

	// 🎯 Har bir stepga o‘tganda kerakli inputni auto-focus qilish
	useEffect(() => {
		if (step === 'request') focusByName('username')
		if (step === 'verify') focusByName('code')
		if (step === 'reset') focusByName('password')
	}, [step])

	// ⏳ VERIFY bosqichida timer
	useEffect(() => {
		if (step !== 'verify' || timerExpired) return
		const interval = setInterval(() => {
			setTimer((prev) => {
				if (prev <= 1) {
					clearInterval(interval)
					setTimerExpired(true)

					return 0
				}

				return prev - 1
			})
		}, 1000)

		return () => clearInterval(interval)
	}, [step, timerExpired])

	const handleResend = async (values: FormModel, setSubmitting: (b: boolean) => void) => {
		try {
			setSubmitting(true)
			const phone = normalizePhone(values.phone_number)
			await AuthService.apiForgotPassword({
				username: values.username,
				phone_number: phone
			} as any)
			setTimer(120)
			setTimerExpired(false)
			setMessage(t('Код отправлен повторно'))
		} catch (e) {
			setMessage(
				(e as AxiosError<{ message?: string }>)?.response?.data?.message ||
					t('Не удалось отправить код')
			)
		} finally {
			setSubmitting(false)
		}
	}

	const onSubmit = async (values: FormModel, setSubmitting: (b: boolean) => void) => {

		if (disableSubmit) return setSubmitting(false)
		try {
			setSubmitting(true)

			if (step === 'request') {
				// 1) SMS yuborish
				const phone = normalizePhone(values.phone_number)
				const resp = await AuthService.apiForgotPassword({
					username: values.username,
					phone_number: phone
				} as any)

				if (resp.status === 200 || resp.status === 201) {
					setStep('verify')
					setTimer(120)
					setTimerExpired(false)
				} else {
					setMessage(t('Ошибка при отправке кода'))
				}

				return
			}

			if (step === 'verify') {
				// 2) Kodni tekshirish (check: true)
				const resp = await AuthService.apiResetPassword({
					username: values.username,
					code: values.code,
					check: true
				} as any)

				if (resp.status === 200 || resp.status === 201) {
					setStep('reset')
				} else {
					setMessage(t('Код неверный или истёк срок действия'))
				}

				return
			}

			if (step === 'reset') {
				// 3) Parolni almashtirish (check: false)
				const resp = await AuthService.apiResetPassword({
					username: values.username,
					code: values.code,
					password: values.password,
					password_confirmation: values.password_confirmation,
					check: false
				} as any)

				if (
					resp.status === 200 ||
					resp.status === 201 ||
					(resp.data && (resp.data.value === true || resp.data.success === true))
				) {
					setStep('done')
				} else {
					setMessage(t('Сброс пароля не выполнен'))
				}

				return
			}

			if (step === 'done') {
				navigate(signInUrl) // Gotovo → sign-in

				return
			}
		} catch (err) {
			if (step === 'verify') {
				const short = extractApiMessage(err, { preferFields: ['code'], lang: 'ru' })
				setMessage(short || formatAxiosErrorDualLang(err))
			} else if (step === 'reset') {
				const short = extractApiMessage(err, { preferFields: ['password','password_confirmation'], lang: 'ru' })
				setMessage(short || formatAxiosErrorDualLang(err))
			} else {
				setMessage(formatAxiosErrorDualLang(err))
			}
			// setMessage(
			// // 	(err as AxiosError<{ message: string }>)?.response?.data?.message ||
			// // 		(err as Error).toString() ||
			// // 		'Произошла ошибка'
			// )
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className={className}>
			{step === 'done' ? (
				<div className='flex min-h-[360px] items-center'>
					<div className='mx-auto text-center'>
							<SuccessSvg />
						<h3 className='mb-2 text-2xl font-semibold'>{t('Ваш пароль успешно изменен')}</h3>
						<p className='text-gray-500'>{t('Нажмите ниже для входа в систему')}</p>
					</div>
				</div>
			) : (
				<h3 className='mb-1'>{t('Восстановление пароля')}</h3>
			)}

			{message && (
				<Alert showIcon className='mb-4' type='danger'>
					{message}
				</Alert>
			)}

			<Formik<FormModel>
				initialValues={{
					username: '',
					phone_number: '',
					code: '',
					password: '',
					password_confirmation: ''
				}}
				validationSchema={validationSchema}
				onSubmit={(values, { setSubmitting }) => onSubmit(values, setSubmitting)}
			>
				{({ touched, errors, isSubmitting, values, setFieldValue, setSubmitting, submitForm }) => (
					<Form>
						<FormContainer>
							{step === 'request' && (
								<>
									<FormItem
										label={t('Логин')}
										invalid={!!errors.username && touched.username}
										errorMessage={errors.username}
									>
										<Field
											type='text'
											autoComplete='off'
											name='username'
											placeholder={t('Введите логин')}
											component={Input}
											// autoFocus ham berib qo'yamiz
											autoFocus
										/>
									</FormItem>

									<FormItem
										label={t('Номер телефона')}
										invalid={!!errors.phone_number && touched.phone_number}
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
													onValueChange={(e) => setFieldValue(field.name, e.formattedValue || '')}
												/>
											)}
										</Field>
									</FormItem>
								</>
							)}

							{step === 'verify' && (
								<>
									{/* Username UI’da ko‘rinmaydi */}
									<FormItem
										label={t('Код из СМС')}
										invalid={!!errors.code && touched.code}
										errorMessage={errors.code}
									>
										{/* 🔁 Kod 6 raqamga yetishi bilan avtomatik submit */}
										<Field name='code'>
											{({ field, form }: FieldProps) => (
												<Input
													{...field}
													type='text'
													autoComplete='one-time-code'
													inputMode='numeric'
													pattern='\d*'
													name='code'
													placeholder='_ _ _ _ _ _'
													maxLength={6}
													autoFocus
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														const onlyDigits = e.target.value.replace(/\D/g, '')
														form.setFieldValue('code', onlyDigits)
														if (onlyDigits.length === 5) {
															// ✅ 6 ta raqam — darhol submit (verify → reset)
															submitForm()
														}
													}}
												/>
											)}
										</Field>
									</FormItem>

									<div className='mb-4 text-center'>
										{timerExpired ? (
											<p>
												{t('Время истекло')}.{` `}
												<ActionLink onClick={() => handleResend(values, setSubmitting)}>
													{t('Запросить новый код')}
												</ActionLink>
											</p>
										) : (
											<p>{t('Осталось времени')}: {fmtMMSS(timer)}</p>
										)}
									</div>
								</>
							)}

							{step === 'reset' && (
								<>
									{/* Username/kod UI’da ko‘rinmaydi; form state’da bor */}
									<FormItem
										label={t('Новый пароль')}
										invalid={!!errors.password && touched.password}
										errorMessage={errors.password}
									>
										<Field
											name='password'
											component={PasswordInput}
											placeholder={t('Введите новый пароль')}
											autoFocus
										/>
									</FormItem>

									<FormItem
										label={t('Подтвердите пароль')}
										invalid={!!errors.password_confirmation && touched.password_confirmation}
										errorMessage={errors.password_confirmation}
									>
										<Field
											name='password_confirmation'
											component={PasswordInput}
											placeholder={t('Повторите новый пароль')}
										/>
									</FormItem>
								</>
							)}
						</FormContainer>

						<Button block loading={isSubmitting} variant='solid' type='submit'>
							{step === 'request' && t('Далее')}
							{step === 'verify' && t('Подтвердить код')}
							{step === 'reset' && t('Готово')}
							{step === 'done' && t('Продолжить')}
						</Button>

						{step !== 'done' && (
							<div className='mt-4 text-center'>
								<ActionLink to={signInUrl}>{t('Вспомнили пароль?')}</ActionLink>
							</div>
						)}
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default ForgotPasswordForm
