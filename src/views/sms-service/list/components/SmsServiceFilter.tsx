import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { HiOutlineFilter } from 'react-icons/hi'
import { Field, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { Button, Drawer, FormContainer, FormItem, Input } from '@/components/ui'
import { FilterQueries } from '../SmsServiceList'

type FilterFormProps = {
	values: FilterQueries
	onSubmitComplete: (values: FilterQueries) => void
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
}

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const validationSchema = Yup.object().shape({
	day_count: Yup.number()
		.typeError('Введите число')
		.min(0, 'Не может быть меньше 0')
		.max(2147483647, 'Слишком большое число')
		.optional()
})

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={(vals) => onSubmitComplete(vals)}
			>
				{({ touched, errors }) => (
					<Form>
						<FormContainer>
							<FormItem
								label='Количество дней'
								invalid={!!errors.day_count && touched.day_count}
								errorMessage={errors.day_count}
							>
								<Field
									type='number'
									name='day_count'
									placeholder='Введите количество дней'
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

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel}>
				Отмена
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick}>
				Сохранить
			</Button>
		</div>
	)
}

const SmsServiceFilter = ({ values, onSubmit }: Props) => {
	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const openDrawer = () => setIsOpen(true)
	const onDrawerClose = () => setIsOpen(false)

	const formSubmit = () => {
		if (formikRef.current) {
			onSubmit(formikRef.current.values)
			setIsOpen(false)
		}
	}

	return (
		<>
			<Button
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={openDrawer}
			>
				Фильтр
			</Button>

			<Drawer
				title='Фильтр'
				isOpen={isOpen}
				footer={<DrawerFooter onCancel={onDrawerClose} onSaveClick={formSubmit} />}
				onClose={onDrawerClose}
				onRequestClose={onDrawerClose}
			>
				<FilterForm
					ref={formikRef}
					values={values}
					onSubmitComplete={(vals) => {
						onSubmit(vals)
						onDrawerClose()
					}}
				/>
			</Drawer>
		</>
	)
}

FilterForm.displayName = 'FilterForm'

export default SmsServiceFilter
