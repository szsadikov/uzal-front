// src/pages/tech-monitoring/components/MonitoringForm.tsx
import { forwardRef } from 'react'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { FormContainer, FormItem, Input, Select } from '@/components/ui'

// Typelar
export type FormModel = {
	license_plate_number?: string | null
	condition?: number | null
	vin?: string | null
	engine_number?: string | null
	comment?: string | null
	images?: string[]
	task: number
}

type FormProps = {
	values: FormModel
	onSubmitComplete: (values: FormModel) => void
	isSubmitting?: boolean
}

const validationSchema = Yup.object().shape({
	license_plate_number: Yup.string().max(255).nullable(),
	condition: Yup.number().nullable().oneOf([1, 2, 3]), // enum
	vin: Yup.string().max(255).nullable(),
	engine_number: Yup.string().max(255).nullable(),
	comment: Yup.string().nullable(),
	images: Yup.array().of(Yup.string().url()).max(10),
	task: Yup.number().required('Поле обязательно')
})

const MonitoringForm = forwardRef<FormikProps<FormModel>, FormProps>(
	({ values, onSubmitComplete, isSubmitting = false }, ref) => {
		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={onSubmitComplete}
			>
				{({ values, touched, errors }) => (
					<Form>
						<FormContainer>
							{/* Номер гос.регистрации */}
							<FormItem
								invalid={!!(errors.license_plate_number && touched.license_plate_number)}
								errorMessage={errors.license_plate_number}
							>
								<Field
									name='license_plate_number'
									type='text'
									placeholder='Введите номер автомобиля...'
									component={Input}
								/>
							</FormItem>

							{/* Состояние */}
							<FormItem
								invalid={!!(errors.condition && touched.condition)}
								errorMessage={errors.condition}
							>
								<Field name='condition'>
									{({ field, form }: FieldProps) => {
										const options = [
											{ label: 'Хорошее', value: 1 },
											{ label: 'Среднее', value: 2 },
											{ label: 'Плохое', value: 3 }
										]
										return (
											<Select
												placeholder='Выберите состояние'
												isDisabled={isSubmitting}
												field={field}
												form={form}
												options={options}
												value={options.find((o) => o.value === values.condition) || null}
												onChange={(option) => form.setFieldValue(field.name, option?.value ?? null)}
											/>
										)
									}}
								</Field>
							</FormItem>

							{/* VIN */}
							<FormItem invalid={!!(errors.vin && touched.vin)} errorMessage={errors.vin}>
								<Field name='vin' type='text' placeholder='Введите VIN...' component={Input} />
							</FormItem>

							{/* Номер двигателя */}
							<FormItem
								invalid={!!(errors.engine_number && touched.engine_number)}
								errorMessage={errors.engine_number}
							>
								<Field
									name='engine_number'
									type='text'
									placeholder='Введите номер двигателя...'
									component={Input}
								/>
							</FormItem>

							{/* Комментарий */}
							<FormItem
								invalid={!!(errors.comment && touched.comment)}
								errorMessage={errors.comment}
							>
								<Field
									name='comment'
									type='text'
									placeholder='Введите комментарий...'
									component={Input}
								/>
							</FormItem>

							{/* Task ID */}
							<FormItem invalid={!!(errors.task && touched.task)} errorMessage={errors.task}>
								<Field
									name='task'
									type='number'
									placeholder='Введите ID задания...'
									component={Input}
								/>
							</FormItem>

							{/* Картинки (ссылки) */}
							<FormItem
								invalid={!!(errors.images && touched.images)}
								errorMessage={errors.images as string}
							>
								<Field
									name='images'
									type='text'
									placeholder='Введите ссылки через запятую...'
									component={Input}
								/>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

export default MonitoringForm
