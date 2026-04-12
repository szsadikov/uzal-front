import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import type { Branch } from '@/@types/dataset.types'
import {
	Badge,
	Button,
	DatePicker,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Option,
	Select
} from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import { formatDate } from '@/utils/format'
import type { FilterQueries } from '../NewRequestList'

type FilterFormProps = { values: FilterQueries; onSubmitComplete: (values: FilterQueries) => void }
type DrawerFooterProps = {
	onSaveClick: (e: MouseEvent<HTMLButtonElement>) => void
	onCancel: (e: MouseEvent<HTMLButtonElement>) => void
}
type Props = { values: FilterQueries; onSubmit: (filters: FilterQueries) => void }

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		const { t } = useTranslation()

		const { data: branches, isLoading: isLoadingBranches } = useQuery({
			queryKey: ['get branches'],
			queryFn: () => DatasetService.getAllBranches<Branch[]>(),
			select: ({ data }) => data
		})

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				// onSubmit={(vals) => onSubmitComplete({ ...vals, status: 'new' })}
				onSubmit={(vals) => onSubmitComplete(vals)}
			>
				{() => (
					<Form>
						<FormContainer>
							<FormItem label={t('Филиал')}>
								<Field name='branch'>
									{({ field, form }: FieldProps) => {
										const options: Option[] = branches
											? branches.map((branch) => ({
													label: branch.name,
													value: branch.id
												}))
											: []

										return (
											// <Select
											// 	placeholder={t('Выберите филиал')}
											// 	isClearable
											// 	isLoading={isLoadingBranches}
											// 	field={field}
											// 	form={form}
											// 	options={options}
											// 	value={options.find((o) => o.value === values.branch) || null}
											// 	onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? '')}
											// 	noOptionsMessage={() => t('Нет филиалов')}
											// />
                      <Select
                        placeholder={t('Выберите филиал')}
                        isClearable
                        isLoading={isLoadingBranches}
                        field={field}
                        form={form}
                        options={options}
                        value={options.find((o) => o.value === field.value) || null}
                        onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? null)}
                        noOptionsMessage={() => t('Нет филиалов')}
                      />
										)
									}}
								</Field>
							</FormItem>
							{/* Дата оплаты */}
							<FormItem label={t('Дата оплаты')}>
								<div className='grid grid-cols-2 gap-2'>
									<Field name='date_of_payment_start'>
										{({ field, form }: FieldProps) => (
											<DatePicker
												placeholder={'YYYY-MM-DD'}
												clearable
												field={field}
												form={form}
												value={field.value ? new Date(field.value as string) : undefined}
												onChange={(date) =>
													// formda sana uchun qiymatni string (YYYY-MM-DD) ko'rinishida saqlashni davom ettiraylik
													form.setFieldValue(field.name, date ? formatDate(date, 'YYYY-MM-DD') : '')
												}
											/>
										)}
									</Field>
									<Field name='date_of_payment_end'>
										{({ field, form }: FieldProps) => (
											<DatePicker
												placeholder={'YYYY-MM-DD'}
												clearable
												field={field}
												form={form}
												value={field.value ? new Date(field.value as string) : undefined}
												onChange={(date) =>
													// formda sana uchun qiymatni string (YYYY-MM-DD) ko'rinishida saqlashni davom ettiraylik
													form.setFieldValue(field.name, date ? formatDate(date, 'YYYY-MM-DD') : '')
												}
											/>
										)}
									</Field>
								</div>
							</FormItem>

							{/* Общая сумма (От/До) */}
							<FormItem label={t('Общая сумма')}>
								<div className='grid grid-cols-2 gap-2'>
									<Field name='total_amount_start'>
										{({ field, form }: FieldProps) => (
											<Input
												inputMode='numeric'
												placeholder={t('От') ?? 'От'}
												value={field.value ?? ''}
												onChange={(e) =>
													form.setFieldValue(field.name, e.target.value.replace(/[^\d]/g, ''))
												}
											/>
										)}
									</Field>
									<Field name='total_amount_end'>
										{({ field, form }: FieldProps) => (
											<Input
												inputMode='numeric'
												placeholder={t('До') ?? 'До'}
												value={field.value ?? ''}
												onChange={(e) =>
													form.setFieldValue(field.name, e.target.value.replace(/[^\d]/g, ''))
												}
											/>
										)}
									</Field>
								</div>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)
FilterForm.displayName = 'FilterForm'

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

const TableFilter = ({ values, onSubmit }: Props) => {
	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)
	const { t } = useTranslation()

	const submit = () => {
		if (!formikRef.current) return
		const v: any = { ...formikRef.current.values }

		Object.keys(v).forEach((k) => {
			if (v[k] === '' || v[k] === null) delete v[k]
		})

		onSubmit(v)
		setIsOpen(false)
		// const v: any = { status: 'new', ...formikRef.current.values }
		// Object.keys(v).forEach((k) => {
		// 	if (v[k] === '' || v[k] === null) delete v[k]
		// })
		// onSubmit({ ...v, status: 'new' })
		// setIsOpen(false)
	}

	// UserFilter.tsx (inside the component)
	const activeFilterKeys = [
		'branch',
		// 'status',
		'sms_status',
		'month_overdue',
		'date_of_payment_start',
		'date_of_payment_end',
		'total_amount_start',
		'total_amount_end'
	] as const

	const hasActiveFilters = activeFilterKeys.some((k) => {
		const v = (values as any)[k]

		return v !== null && v !== undefined && v !== '' // agar boshqa tur (masalan array/boolean) bo'lsa, kerak bo'lsa shartni kengaytiring
	})

	return (
		<>
			<Button
				size='sm'
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={() => setIsOpen(true)}
			>
				<span>{t('Фильтр')}</span>
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />
				)}
			</Button>

			<Drawer
				title={t('Фильтр')}
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
				footer={<DrawerFooter onCancel={() => setIsOpen(false)} onSaveClick={submit} />}
			>
				<FilterForm ref={formikRef} values={values} onSubmitComplete={submit} />
			</Drawer>
		</>
	)
}

export default TableFilter
