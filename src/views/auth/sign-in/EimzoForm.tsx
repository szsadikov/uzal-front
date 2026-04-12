import Select from 'react-select'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import type { CommonProps } from '@/@types/common'
import Alert from '@/components/ui/Alert'
import Button from '@/components/ui/Button'
import { FormContainer, FormItem } from '@/components/ui/Form'
import useAuth from '@/utils/hooks/useAuth' // useAuth dan foydalanamiz
import { KeyItem, useEimzo } from '@/utils/hooks/useEimzo'
import useTimeOutMessage from '@/utils/hooks/useTimeOutMessage'
import { useTranslation } from 'react-i18next'

// Custom Select komponenti uchun tip
type OptionType = {
	label: string
	value: string
}

interface EimzoFormProps extends CommonProps {
	disableSubmit?: boolean
}

type EimzoFormSchema = {
	eimzoKey: string
}

const validationSchema = Yup.object().shape({
	eimzoKey: Yup.string().required('E-IMZO kalit tanlanishi shart')
})

const EimzoForm = (props: EimzoFormProps) => {
	const { disableSubmit = false, className } = props
	const [message, setMessage] = useTimeOutMessage()
	const { keys, loading, error } = useEimzo()
	const { signIn } = useAuth()

	const { t } = useTranslation()

	// Kalitlar select uchun variantlarga aylanadi
	const eimzoOptions: OptionType[] = keys.map((k: KeyItem) => ({
		label: `${k.CN || t("Noma'lum")} (${k.serialNumber}, ${k.type || 'unknown'}, ${k.validTo})`,
		value: k.serialNumber
	}))

	const onSignIn = async (
		values: EimzoFormSchema,
		setSubmitting: (isSubmitting: boolean) => void
	) => {
		try {
			setSubmitting(true)
			setMessage('') // Oldingi xabarlarni tozalash

			const selectedKey = keys.find((k: KeyItem) => k.serialNumber === values.eimzoKey)

			if (!selectedKey) {
				setMessage(t('Kalit topilmadi'))

				return
			}

			// Kalitni yuklash va E-IMZO popup chiqishi
			const keyId = await new Promise((resolve, reject) => {
				window.EIMZOClient.loadKey(
					selectedKey,
					(id: string) => resolve(id),
					(message: string) => reject(new Error(message || t('Kalitni yuklashda xatolik')))
				)
			})

			// PINFL ni sertifikatdan olish
			const pinfl = selectedKey.PINFL || selectedKey.tin || ''
			if (!pinfl) {
				setMessage(t('PINFL sertifikatda topilmadi'))

				return
			}

			// Imzolash uchun ma'lumot tayyorlash
			const payloadData = {
				pinfl: pinfl
			}

			// Imzolash (E-IMZO popup da parol tasdiqlanadi)
			const signedData: string = await new Promise((resolve, reject) => {
				window.EIMZOClient.createPkcs7(
					keyId,
					JSON.stringify(payloadData),
					null, // Timestamper ixtiyoriy
					(pkcs7: string) => resolve(pkcs7),
					(message: string) => reject(new Error(message || t('Imzolashda xatolik')))
				)
			})

			// API ga yuborishni signIn ga topshirish
			const result = await signIn({
				pinfl: pinfl as string,
				eimzo_key: signedData
			})

			if (result?.status === 'failed') {
				setMessage(result.message)
			} else {
				setMessage(t('Muvaffaqiyatli yuborildi!'))
			}
		} catch (error) {
			setMessage(`${t('Jarayonda xatolik yuz berdi')}: ` + (error as Error).message)
		} finally {
			setSubmitting(false)
		}
	}

	// Tanlangan qiymatni Formik bilan sinxronlashtirish uchun
	const handleChange = (
		option: OptionType | null,
		setFieldValue: (field: string, value: any) => void
	) => {
		setFieldValue('eimzoKey', option ? option.value : '')
	}

	return (
		<div className={className}>
			{error && (
				<Alert showIcon className='mb-4' type='danger'>
					<>{error}</>
				</Alert>
			)}
			{message && (
				<Alert showIcon className='mb-4' type='danger'>
					<>{message}</>
				</Alert>
			)}
			{loading && (
				<Alert showIcon className='mb-4' type='info'>
					Kalitlar yuklanmoqda...
				</Alert>
			)}
			<Formik
				initialValues={{ eimzoKey: '' }}
				validationSchema={validationSchema}
				onSubmit={(values, { setSubmitting }) => {
					if (!disableSubmit) {
						onSignIn(values, setSubmitting)
					} else {
						setSubmitting(false)
					}
				}}
			>
				{({ touched, errors, setFieldValue, values, isSubmitting }) => (
					<Form>
						<FormContainer>
							<FormItem
								label={t('ЭЦП калитни танланг')}
								invalid={(errors.eimzoKey && touched.eimzoKey) as boolean}
								errorMessage={errors.eimzoKey}
							>
								<Select
									name='eimzoKey'
									options={eimzoOptions}
									value={eimzoOptions.find((option) => option.value === values.eimzoKey) || null}
									onChange={(option) => handleChange(option, setFieldValue)}
									placeholder={t('Калитни танланг')}
									isDisabled={loading || !!error}
								/>
							</FormItem>
							<Button block loading={isSubmitting} variant='solid' type='submit'>
								{isSubmitting ? `${t('Выполняется вход')}...` : t('Войти')}
							</Button>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</div>
	)
}

export default EimzoForm
