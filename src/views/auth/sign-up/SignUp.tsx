import { useTranslation } from 'react-i18next'
import SignUpForm from './SignUpForm'

const SignUp = () => {
	const { t } = useTranslation()

	return (
		<>
			<div className='mb-8'>
				<h3 className='mb-1'>{t('Регистрация')}</h3>
				<p>{t('Как вы хотите войти в систему?')}</p>
			</div>
			<SignUpForm />
		</>
	)
}

export default SignUp
