// CurrentRequestsFilter.tsx
import { forwardRef, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import dayjs from 'dayjs'
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
import type { FilterQueries } from '../CurrentList'

import { useQuery } from '@tanstack/react-query'
import { DatasetService } from '@/services/dataset.service'
import type { Branch } from '@/@types/dataset.types'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

type FilterFormProps = {
	values: FilterQueries
	onSubmitComplete: (values: FilterQueries) => void
}

/** --- Helperlar --- */
const formatDate = (d?: Date | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '')
// const formatDateTime = (d?: Date | null) => (d ? dayjs(d).format('YYYY-MM-DD') : '')
const parseToDate = (val?: string) => (val ? new Date(val) : null)

/** --- Form --- */
const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		const { t } = useTranslation()

		const SMS_STATUS_OPTIONS: Option[] = [
			// { label: 'Подтверждено', value: 'confirmed' },
			{ label: t('Доставлено'), value: 'confirmed' },
			{ label: t('Прочитано'), value: 'read' },
			{ label: t('Не доставлено'), value: 'not_send' },
			{ label: t('Отправлено'), value: 'send' },
			{ label: t('В ожидании'), value: 'pending' },
			{ label: t('Ошибка'), value: 'failed' }
		]

		const { data: branches, isLoading: isLoadingBranches } = useQuery({
			queryKey: ['get branches'],
			queryFn: () => DatasetService.getAllBranches<Branch[]>(),
			select: ({ data }) => data
		})

		return (
			<Formik enableReinitialize innerRef={ref} initialValues={values} onSubmit={onSubmitComplete}>
				{({ values, setFieldValue }) => (
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
							{/* 1) Дата оплаты (диапазон) */}
							<FormItem label={t('Дата оплаты')}>
								<div className='grid grid-cols-2 gap-2'>
									<DatePicker
										placeholder='YYYY-MM-DD'
										value={parseToDate(values.date_of_payment_start)}
										onChange={(d) => setFieldValue('date_of_payment_start', formatDate(d))}
									/>
									<DatePicker
										placeholder='YYYY-MM-DD'
										value={parseToDate(values.date_of_payment_end)}
										onChange={(d) => setFieldValue('date_of_payment_end', formatDate(d))}
									/>
								</div>
							</FormItem>

							{/* 2) Статус талабнома */}
							{/*<FormItem label="Статус талабнома">*/}
							{/*	<Field name="process_status">*/}
							{/*		{({ field, form }: FieldProps) => (*/}
							{/*			<Select*/}
							{/*				placeholder="Выберите статус"*/}
							{/*				isClearable*/}
							{/*				field={field}*/}
							{/*				form={form}*/}
							{/*				options={PROCESS_STATUS_OPTIONS}*/}
							{/*				value={PROCESS_STATUS_OPTIONS.find(o => o.value === values.process_status) || null}*/}
							{/*				onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? '')}*/}
							{/*			/>*/}
							{/*		)}*/}
							{/*	</Field>*/}
							{/*</FormItem>*/}

							{/* 3) Общая сумма (от/до) */}
							<FormItem label={t('Общая сумма')}>
								<div className='grid grid-cols-2 gap-2'>
									<Input
										inputMode='numeric'
										placeholder={t('От')}
										value={values.total_amount_start ?? ''}
										onChange={(e) =>
											setFieldValue('total_amount_start', e.target.value.replace(/[^\d]/g, ''))
										}
									/>
									<Input
										inputMode='numeric'
										placeholder={t('До')}
										value={values.total_amount_end ?? ''}
										onChange={(e) =>
											setFieldValue('total_amount_end', e.target.value.replace(/[^\d]/g, ''))
										}
									/>
								</div>
							</FormItem>

							{/* 5) СМС Статус */}
							<FormItem label={t('СМС Статус')}>
								<Field name='sms_status'>
									{({ field, form }: FieldProps) => (
										<Select
											placeholder={t('Выберите СМС статус')}
											isClearable
											field={field}
											form={form}
											options={SMS_STATUS_OPTIONS}
											value={SMS_STATUS_OPTIONS.find((o) => o.value === values.sms_status) || null}
											onChange={(opt) => form.setFieldValue(field.name, opt?.value ?? '')}
										/>
									)}
								</Field>
							</FormItem>

							{/* 6) Дата отложенности (диапазон) */}
							{/*<FormItem label="Дата отложенности">*/}
							{/*	<div className="grid grid-cols-2 gap-2">*/}
							{/*		<DatePicker*/}
							{/*			placeholder="YYYY-MM-DD"*/}
							{/*			value={parseToDate(values.delayed_time_start)}*/}
							{/*			onChange={(d) => setFieldValue('delayed_time_start', formatDateTime(d))}*/}
							{/*		/>*/}
							{/*		<DatePicker*/}
							{/*			placeholder="YYYY-MM-DD"*/}
							{/*			value={parseToDate(values.delayed_time_end)}*/}
							{/*			onChange={(d) => setFieldValue('delayed_time_end', formatDateTime(d))}*/}
							{/*		/>*/}
							{/*	</div>*/}
							{/*</FormItem>*/}
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

FilterForm.displayName = 'FilterForm'

const CurrentRequestsFilter = ({ values, onSubmit }: Props) => {
	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const { t } = useTranslation()

	const save = () => {
		if (!formikRef.current) return
		const v = { ...formikRef.current.values }

		// Bo‘sh qiymatlarni tozalash (APIga keraksiz param ketmasin)
		Object.keys(v).forEach((k) => {
			// @ts-ignore
			if (v[k] === '' || v[k] === null) delete v[k]
		})
		onSubmit(v)
		setIsOpen(false)
	}

	const activeFilterKeys = [
		'branch',
		'status',
		'sms_status',
		'process_status',
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
				footer={
					<div className='w-full text-right'>
						<Button size='md' className='mr-2' onClick={() => setIsOpen(false)}>
							{t('Отмена')}
						</Button>
						<Button size='md' variant='solid' onClick={save}>
							{t('Сохранить')}
						</Button>
					</div>
				}
			>
				<FilterForm ref={formikRef} values={values} onSubmitComplete={save} />
			</Drawer>
		</>
	)
}

export default CurrentRequestsFilter
