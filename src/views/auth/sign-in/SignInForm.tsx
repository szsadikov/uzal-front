import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { SignInCredential } from '@/@types/auth.types'
import type { CommonProps } from '@/@types/common'
import { ActionLink, PasswordInput } from '@/components/shared'
import { Button, Checkbox, FormItem, Input, Notification, toast } from '@/components/ui'
import useAuth from '@/utils/hooks/useAuth'

interface SignInFormProps extends CommonProps {
	forgotPasswordUrl?: string
	signUpUrl?: string
}

const SignInForm = (props: SignInFormProps) => {
	const { className, forgotPasswordUrl = '/forgot-password', signUpUrl = '/sign-up' } = props

	const { t } = useTranslation()
	const { signIn } = useAuth()
	const location = useLocation()

	const { control, handleSubmit, formState: { isSubmitting } } = useForm<SignInCredential>({
		mode: 'onChange',
		defaultValues: {
			is_remember: false
		}
	})

	const onSubmit: SubmitHandler<SignInCredential> = async (data) => {
		const result = await signIn(data)

		if (result && result.status === 'failed') {
			toast.push(
				<Notification type='danger' title={result.message} duration={3000} />,
				{ placement: 'top-center' }
			)
		}
	}

	return (
		<div className={`mx-auto w-full max-w-lg min-w-0 sm:max-w-xl sm:px-0 ${className ?? ''}`}>
			<form onSubmit={handleSubmit(onSubmit)}>
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

				<div className='my-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
					<Controller
						control={control}
						name={'is_remember'}
						render={({ field }) => (
							<Checkbox checked={field.value} onChange={field.onChange}>
								{t('Запомнить меня')}
							</Checkbox>
						)}
					/>
					<ActionLink to={forgotPasswordUrl}>{t('Забыли пароль?')}</ActionLink>
				</div>

				<Button
					block
					loading={isSubmitting}
					variant='solid'
					type='submit'
				>
					{t('Войти')}
				</Button>

				{location.search.includes('client') && (
					<div className='mt-4 text-center'>
						<span>{t('У вас нет аккаунта?')}</span>
						<ActionLink to={signUpUrl} className='ml-1'>
							{t('Регистрация')}
						</ActionLink>
					</div>
				)}
			</form>
		</div>
	)
}

export default SignInForm
