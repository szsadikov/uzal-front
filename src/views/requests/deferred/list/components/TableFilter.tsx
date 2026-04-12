import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
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
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../DeferredList'

import { useQuery } from '@tanstack/react-query'
import { DatasetService } from '@/services/dataset.service'
import type { Branch } from '@/@types/dataset.types'

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

// RU oylar: value = 1..12
// const MONTH_OPTIONS_RU = [
// 	{ label: 'Январь', value: 1 },
// 	{ label: 'Февраль', value: 2 },
// 	{ label: 'Март', value: 3 },
// 	{ label: 'Апрель', value: 4 },
// 	{ label: 'Май', value: 5 },
// 	{ label: 'Июнь', value: 6 },
// 	{ label: 'Июль', value: 7 },
// 	{ label: 'Август', value: 8 },
// 	{ label: 'Сентябрь', value: 9 },
// 	{ label: 'Октябрь', value: 10 },
// 	{ label: 'Ноябрь', value: 11 },
// 	{ label: 'Декабрь', value: 12 }
// ]

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		const { t } = useTranslation()

		const { data: branches, isLoading: isLoadingBranches } = useQuery({
			queryKey: ['get branches'],
			queryFn: () => DatasetService.getAllBranches<Branch[]>(),
			select: ({ data }) => data
		})

		return (
			<Formik enableReinitialize innerRef={ref} initialValues={values} onSubmit={onSubmitComplete}>
				{/* eslint-disable-next-line no-empty-pattern */}
				{({}) => (
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
											<Select
												placeholder={t('Выберите филиал')}
												isClearable
												isLoading={isLoadingBranches}
												field={field}
												form={form}
												options={options}
												value={options.find((o) => o.value === values.branch) || null}
												onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? '')}
												noOptionsMessage={() => t('Нет филиалов')}
											/>
										)
									}}
								</Field>
							</FormItem>
							{/* 1) Дата оплаты: YYYY-MM-DD (start/end) */}
							<FormItem label={t('Дата оплаты')}>
								<div className='grid grid-cols-2 gap-2'>
									<Field name='date_of_payment_start'>
										{({ field, form }: FieldProps) => (
											<DatePicker
												placeholder='YYYY-MM-DD'
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
												placeholder='YYYY-MM-DD'
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

							{/* 2) Месяц: RU label, value = 1..12 */}
							{/*<FormItem label={t('Месяц')}>*/}
							{/*	<Field name='month_overdue'>*/}
							{/*		{({ field, form }: FieldProps) => (*/}
							{/*			<Select*/}
							{/*				placeholder={t('Выберите месяц')}*/}
							{/*				isClearable*/}
							{/*				field={field}*/}
							{/*				form={form}*/}
							{/*				options={MONTH_OPTIONS_RU}*/}
							{/*				value={*/}
							{/*					values.month_overdue*/}
							{/*						? (MONTH_OPTIONS_RU.find(*/}
							{/*								(o) => Number(o.value) === Number(values.month_overdue)*/}
							{/*							) ?? null)*/}
							{/*						: null*/}
							{/*				}*/}
							{/*				onChange={(opt) =>*/}
							{/*					form.setFieldValue(field.name, opt ? Number(opt.value) : '')*/}
							{/*				}*/}
							{/*			/>*/}
							{/*		)}*/}
							{/*	</Field>*/}
							{/*</FormItem>*/}

							{/* 3) Дата отложенности: YYYY-MM-DDTHH:mm (start/end) */}
							<FormItem label={t('Дата отложенности')}>
								<div className='grid grid-cols-2 gap-2'>
									<Field name='delayed_time_start'>
										{({ field, form }: FieldProps) => (
											<DatePicker
												placeholder='YYYY-MM-DD'
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

									<Field name='delayed_time_end'>
										{({ field, form }: FieldProps) => (
											<DatePicker
												placeholder='YYYY-MM-DD'
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

							{/* 4) Общая сумма: от/до */}
							<FormItem label={t('Общая сумма')}>
								<div className='grid grid-cols-2 gap-2'>
									<Field name='total_amount_start'>
										{({ field, form }: FieldProps) => (
											<Input
												inputMode='numeric'
												placeholder={t('От')}
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
												placeholder={t('До')}
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
	const { t } = useTranslation()

	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const openDrawer = () => setIsOpen(true)
	const onDrawerClose = () => setIsOpen(false)

	const formSubmit = () => {
		if (!formikRef.current) return
		// bo‘sh qiymatlarni tozalaymiz — APIga keraksiz param ketmasin
		const v = { ...formikRef.current.values }
		Object.keys(v).forEach((k) => {
			// @ts-ignore
			if (v[k] === '' || v[k] === null) delete v[k]
		})
		onSubmit(v)
		setIsOpen(false)
	}

	// UserFilter.tsx (inside the component)
	const activeFilterKeys = [
		// 'status',
		'sms_status',
		// 'search',
		'month_overdue',
		'date_of_payment_start',
		'date_of_payment_end',
		'total_amount_start',
		'total_amount_end',
		'delayed_time_start',
		'delayed_time_end'
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
				onClick={openDrawer}
			>
				<span>{t('Фильтр')}</span>
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />
				)}
			</Button>

			<Drawer
				title='Фильтр'
				isOpen={isOpen}
				footer={<DrawerFooter onCancel={onDrawerClose} onSaveClick={formSubmit} />}
				onClose={onDrawerClose}
				onRequestClose={onDrawerClose}
			>
				<FilterForm ref={formikRef} values={values} onSubmitComplete={formSubmit} />
			</Drawer>
		</>
	)
}

export default TableFilter
