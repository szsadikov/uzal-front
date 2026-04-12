import { Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
// import { ActionLink, PasswordInput } from '@/components/shared'
import { Alert, Button } from '@/components/ui'
import useAuth from '@/utils/hooks/useAuth'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useTranslation } from 'react-i18next'

interface SignInFormProps extends CommonProps {
	disableSubmit?: boolean
	forgotPasswordUrl?: string
	signUpUrl?: string
}

type SignInFormSchema = {
	username: string
	password: string
	rememberMe: boolean
}

const validationSchema = Yup.object().shape({
	username: Yup.string().required('Please enter your user name'),
	password: Yup.string().required('Please enter your password'),
	rememberMe: Yup.bool()
})

const OneIdForm = (props: SignInFormProps) => {
	const { disableSubmit = false, className } = props
	const { t } = useTranslation()

	const [message, setMessage] = useTimeOutMessage()

	const { signIn } = useAuth()

	const onSignIn = async (
		values: SignInFormSchema,
		setSubmitting: (isSubmitting: boolean) => void
	) => {
		const { username, password } = values
		setSubmitting(true)

		const result = await signIn({ username, password })

		if (result?.status === 'failed') {
			console.log(result.message)
			setMessage(result.message)
		}

		setSubmitting(false)
	}

	return (
		<div className={className}>
			{message && (
				<Alert showIcon className='mb-4' type='danger'>
					<>{message}</>
				</Alert>
			)}
			<Formik
				initialValues={{
					username: 'itsaln',
					password: 'qwerty123',
					rememberMe: true
				}}
				validationSchema={validationSchema}
				onSubmit={(values, { setSubmitting }) => {
					if (!disableSubmit) {
						onSignIn(values, setSubmitting)
					} else {
						setSubmitting(false)
					}
				}}
			>
				{({ isSubmitting }) => (
					<Button block loading={isSubmitting} variant='solid' type='submit'>
						{isSubmitting ? `${t('Выполняется вход')}...` : 'OneId'}
					</Button>
				)}
			</Formik>
		</div>
	)
}

export default OneIdForm
