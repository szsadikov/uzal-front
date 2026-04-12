import { useRef, useState, forwardRef } from 'react'
import { Formik, Form, Field, FieldProps, FormikProps } from 'formik'
import * as Yup from 'yup'
import dayjs from 'dayjs'
import { Button, Drawer, FormContainer, FormItem, DatePicker } from '@/components/ui'

type FormModel = { delayed_time: Date | null }

type Props = { onSubmit: (delayed_time: string) => void; isSubmitting?: boolean }

const validationSchema = Yup.object().shape({
	delayed_time: Yup.date().typeError('Выберите дату').required('Выберите дату')
})

const RequestForm = forwardRef<FormikProps<FormModel>, { initialValues: FormModel }>(
	({ initialValues }, ref) => (
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
							<h6 className='mb-2'>Дата и время отсрочки</h6>
							<Field name='delayed_time'>
								{({ field, form }: FieldProps) => (
									<DatePicker
										value={field.value}
										onChange={(date) => form.setFieldValue(field.name, date)}
										placeholder='Выберите дату и время'
									/>
								)}
							</Field>
						</FormItem>
					</FormContainer>
				</Form>
			)}
		</Formik>
	)
)

const RequestAdd = ({ onSubmit, isSubmitting }: Props) => {
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
				Отложить
			</Button>

			<Drawer
				title='Отложить заявления'
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
							Отмена
						</Button>
						<Button
							size='md'
							variant='solid'
							onClick={handleSave}
							disabled={isSubmitting}
							loading={isSubmitting}
						>
							Отложить
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
