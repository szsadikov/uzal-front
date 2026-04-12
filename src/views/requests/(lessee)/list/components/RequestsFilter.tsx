import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { Field, Form, Formik, FormikProps } from 'formik'
import { Badge, Button, Drawer, FormContainer, FormItem, Input } from '@/components/ui'
import { FilterQueries } from '../RequestsList'

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

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		const { t } = useTranslation()

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				onSubmit={(values) => onSubmitComplete(values)}
			>
				{({ touched, errors }) => (
					<Form>
						<FormContainer>
							<FormItem invalid={errors.model && touched.model} errorMessage={errors.model}>
								<h6 className='mb-4'>{t('Модель')}</h6>
								<Field name='model' type='text' placeholder={t('Введите отчество')} component={Input} />
							</FormItem>

							{/*<FormItem invalid={errors.branch && touched.branch} errorMessage={errors.branch}>*/}
							{/*	<h6 className='mb-4'>Филиал</h6>*/}
							{/*	{isLoadingBranches ? (*/}
							{/*		<Skeleton height={44} />*/}
							{/*	) : (*/}
							{/*		branches && (*/}
							{/*			<Field name='branch'>*/}
							{/*				{({ field, form }: FieldProps) => {*/}
							{/*					const options: Option[] = branches.map((branch) => ({*/}
							{/*						label: branch.region.name_ru,*/}
							{/*						value: branch.region.name_ru*/}
							{/*					}))*/}

							{/*					return (*/}
							{/*						<Select*/}
							{/*							placeholder='Выберите филиал'*/}
							{/*							isDisabled={!branches.length}*/}
							{/*							isClearable*/}
							{/*							field={field}*/}
							{/*							form={form}*/}
							{/*							options={options}*/}
							{/*							value={options.filter((option) => option.value === values.branch)}*/}
							{/*							onChange={(option) => form.setFieldValue(field.name, option?.value)}*/}
							{/*						/>*/}
							{/*					)*/}
							{/*				}}*/}
							{/*			</Field>*/}
							{/*		)*/}
							{/*	)}*/}
							{/*</FormItem>*/}

							{/*<FormItem invalid={errors.tech && touched.tech} errorMessage={errors.tech}>*/}
							{/*	<h6 className='mb-4'>Техника</h6>*/}
							{/*	{isLoadingTechs ? (*/}
							{/*		<Skeleton height={44} />*/}
							{/*	) : (*/}
							{/*		techs && (*/}
							{/*			<Field name='tech'>*/}
							{/*				{({ field, form }: FieldProps) => {*/}
							{/*					if (!techs) return*/}

							{/*					const options = techs.map((tech) => ({*/}
							{/*						label: tech.model_name_ru,*/}
							{/*						value: tech.model_name_ru*/}
							{/*					}))*/}

							{/*					return (*/}
							{/*						<Select*/}
							{/*							placeholder='Выберите технику'*/}
							{/*							isDisabled={!techs.length}*/}
							{/*							isClearable*/}
							{/*							field={field}*/}
							{/*							form={form}*/}
							{/*							options={options}*/}
							{/*							value={options.filter((option) => option.value === values.tech)}*/}
							{/*							onChange={(option) => form.setFieldValue(field.name, option?.value)}*/}
							{/*						/>*/}
							{/*					)*/}
							{/*				}}*/}
							{/*			</Field>*/}
							{/*		)*/}
							{/*	)}*/}
							{/*</FormItem>*/}

							{/*<div className='flex flex-col'>*/}
							{/*	<h6 className='mb-4'>Стоимость</h6>*/}
							{/*	<div className='grid grid-cols-2 gap-4'>*/}
							{/*		<FormItem*/}
							{/*			invalid={*/}
							{/*				errors.overall_contract_amount_start && touched.overall_contract_amount_start*/}
							{/*			}*/}
							{/*			errorMessage={errors.overall_contract_amount_start}*/}
							{/*		>*/}
							{/*			<Field name='overall_contract_amount_start'>*/}
							{/*				{({ field, form }: FieldProps) => (*/}
							{/*					<FormNumericInput*/}
							{/*						thousandSeparator=' '*/}
							{/*						form={form}*/}
							{/*						field={field}*/}
							{/*						placeholder='От'*/}
							{/*						value={field.value}*/}
							{/*						onValueChange={(e) => form.setFieldValue(field.name, e.floatValue)}*/}
							{/*					/>*/}
							{/*				)}*/}
							{/*			</Field>*/}
							{/*		</FormItem>*/}

							{/*		<FormItem*/}
							{/*			invalid={*/}
							{/*				errors.overall_contract_amount_end && touched.overall_contract_amount_end*/}
							{/*			}*/}
							{/*			errorMessage={errors.overall_contract_amount_end}*/}
							{/*		>*/}
							{/*			<Field name='overall_contract_amount_end'>*/}
							{/*				{({ field, form }: FieldProps) => (*/}
							{/*					<FormNumericInput*/}
							{/*						thousandSeparator=' '*/}
							{/*						form={form}*/}
							{/*						field={field}*/}
							{/*						placeholder='До'*/}
							{/*						value={field.value}*/}
							{/*						onValueChange={(e) => form.setFieldValue(field.name, e.floatValue)}*/}
							{/*					/>*/}
							{/*				)}*/}
							{/*			</Field>*/}
							{/*		</FormItem>*/}
							{/*	</div>*/}
							{/*</div>*/}

							{/*<div className='flex flex-col'>*/}
							{/*	<h6 className='mb-4'>Интервал даты</h6>*/}
							{/*	<div className='grid grid-cols-2 gap-4'>*/}
							{/*		<FormItem*/}
							{/*			invalid={errors.contract_date_start && touched.contract_date_start}*/}
							{/*			errorMessage={errors.contract_date_start}*/}
							{/*		>*/}
							{/*			<Field name='contract_date_start'>*/}
							{/*				{({ field, form }: FieldProps) => (*/}
							{/*					<DatePicker*/}
							{/*						placeholder='Дата от'*/}
							{/*						clearable*/}
							{/*						field={field}*/}
							{/*						form={form}*/}
							{/*						value={field.value}*/}
							{/*						onChange={(date) =>*/}
							{/*							form.setFieldValue(*/}
							{/*								field.name,*/}
							{/*								date ? formatDate(date, 'YYYY-MM-DD') : ''*/}
							{/*							)*/}
							{/*						}*/}
							{/*					/>*/}
							{/*				)}*/}
							{/*			</Field>*/}
							{/*		</FormItem>*/}
							{/*		<FormItem*/}
							{/*			invalid={errors.contract_date_end && touched.contract_date_end}*/}
							{/*			errorMessage={errors.contract_date_end}*/}
							{/*		>*/}
							{/*			<Field name='contract_date_end'>*/}
							{/*				{({ field, form }: FieldProps) => (*/}
							{/*					<DatePicker*/}
							{/*						placeholder='Дата до'*/}
							{/*						clearable*/}
							{/*						field={field}*/}
							{/*						form={form}*/}
							{/*						value={field.value}*/}
							{/*						onChange={(date) =>*/}
							{/*							form.setFieldValue(*/}
							{/*								field.name,*/}
							{/*								date ? formatDate(date, 'YYYY-MM-DD') : ''*/}
							{/*							)*/}
							{/*						}*/}
							{/*					/>*/}
							{/*				)}*/}
							{/*			</Field>*/}
							{/*		</FormItem>*/}
							{/*	</div>*/}
							{/*</div>*/}
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
	const { t } = useTranslation()

	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel}>
				{t('Отмена')}
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick}>
				{t('Применить')}
			</Button>
		</div>
	)
}

const RequestsFilter = ({ values, onSubmit }: Props) => {
	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const openDrawer = () => {
		setIsOpen(true)
	}

	const onDrawerClose = () => {
		setIsOpen(false)
	}

	const formSubmit = () => {
		if (formikRef.current) {
			onSubmit(formikRef.current.values)
			setIsOpen(false)
		}
	}

	const activeFilterKeys = ['model'] as const

	const hasActiveFilters = activeFilterKeys.some((k) => {
		const v = (values as any)[k]

		return v !== null && v !== undefined && v !== '' // agar boshqa tur (masalan array/boolean) bo'lsa, kerak bo'lsa shartni kengaytiring
	})

	return (
		<>
			{/*<Button*/}
			{/*	size='sm'*/}
			{/*	className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'*/}
			{/*	icon={<HiOutlineFilter />}*/}
			{/*	onClick={() => openDrawer()}*/}
			{/*>*/}
			{/*	{t('Фильтр')}*/}
			{/*</Button>*/}

			<Button
				size='sm'
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={() => openDrawer()}
			>
				<span>{t('Фильтр')}</span>
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />
				)}
			</Button>
			<Drawer
				title={t('Фильтр')}
				isOpen={isOpen}
				footer={<DrawerFooter onCancel={onDrawerClose} onSaveClick={formSubmit} />}
				onClose={onDrawerClose}
				onRequestClose={onDrawerClose}
			>
				<FilterForm ref={formikRef} values={values} onSubmitComplete={onDrawerClose} />
			</Drawer>
		</>
	)
}

FilterForm.displayName = 'FilterForm'

export default RequestsFilter
