import { forwardRef, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Button, DatePicker, Drawer, FormContainer, FormItem } from '@/components/ui'

type FormModel = { delayed_time: Date | null }

type Props = { onSubmit: (delayed_time: string) => void; isSubmitting?: boolean }

const RequestForm = forwardRef<FormikProps<FormModel>, { initialValues: FormModel }>(
	({ initialValues }, ref) => {
		const { t } = useTranslation()

		const validationSchema = Yup.object().shape({
			delayed_time: Yup.date().typeError(t('Выберите дату')).required(t('Выберите дату'))
		})

		return (
			<Formik
				innerRef={ref}
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={() => {}}
			>
				{({ touched, errors }) => (
					<Form>
						<FormContainer>
							<FormItem
								invalid={!!errors.delayed_time && !!touched.delayed_time}
								errorMessage={errors.delayed_time}
							>
								<h6 className='mb-2'>{t('Дата и время отсрочки')}</h6>
								<Field name='delayed_time'>
									{({ field, form }: FieldProps) => (
										<DatePicker
											value={field.value}
											onChange={(date) => form.setFieldValue(field.name, date)}
											placeholder={t('Выберите дату и время')}
										/>
									)}
								</Field>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

const RequestAdd = ({ onSubmit, isSubmitting }: Props) => {
	const { t } = useTranslation()
	const formRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const handleSave = () => {
		if (formRef.current) {
			const date = formRef.current.values.delayed_time
			if (date) {
				const formatted = dayjs(date).format('YYYY-MM-DDTHH:mm:ss')
				onSubmit(formatted)
				setIsOpen(false)
			}
		}
	}

	return (
		<>
			<Button className='w-full lg:w-auto' size='sm' color='blue' onClick={() => setIsOpen(true)}>
				{t('Отложить')}
			</Button>

			<Drawer
				title={t('Отложить заявления')}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				footer={
					<div className='w-full text-right'>
						<Button
							size='md'
							className='mr-2'
							onClick={() => setIsOpen(false)}
							disabled={isSubmitting}
						>
							{t('Отмена')}
						</Button>
						<Button
							size='md'
							variant='solid'
							onClick={handleSave}
							disabled={isSubmitting}
							loading={isSubmitting}
						>
							{t('Отложить')}
						</Button>
					</div>
				}
			>
				<RequestForm ref={formRef} initialValues={{ delayed_time: null }} />
			</Drawer>
		</>
	)
}

export default RequestAdd
