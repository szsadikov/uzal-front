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
	Option,
	Select
} from '@/components/ui'
import type { FilterQueries } from '../TasksList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
	branchOptions: Option[]
}

// YYYY-MM-DD string
const toIsoDate = (d?: Date | string | null) =>
	d ? (d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10)) : ''

const FilterForm = forwardRef<
	FormikProps<FilterQueries>,
	{
		values: FilterQueries
		onSubmitComplete: (v: FilterQueries) => void
		branchOptions: Option[]
	}
>(({ values, onSubmitComplete, branchOptions }, ref) => {
	const { t } = useTranslation()

	const STATUS_OPTIONS: Option[] = [
		// { label: 'Новая', value: 1 },
		{ label: t('В ожидании'), value: 1 },
		{ label: t('Выполнен'), value: 2 }
	]

	return (
		<Formik enableReinitialize innerRef={ref} initialValues={values} onSubmit={onSubmitComplete}>
			{({ values, setFieldValue }) => (
				<Form>
					<FormContainer>
						{/* Filial */}
						<FormItem>
							<h6 className='mb-2'>{t('Филиал')}</h6>
							<Field name='branch'>
								{({ field, form }: FieldProps) => (
									<Select
										className='h-11'
										placeholder={t('Выберите филиал')}
										isClearable
										field={field}
										form={form}
										options={branchOptions}
										value={branchOptions.find((o) => o.value === form.values.branch) || null}
										onChange={(opt) => form.setFieldValue(field.name, (opt as any)?.value ?? null)}
									/>
								)}
							</Field>
						</FormItem>

						{/* Status */}
						<FormItem>
							<h6 className='mb-2'>{t('Статус задачи')}</h6>
							<Field name='status'>
								{({ field, form }: FieldProps) => (
									<Select
										className='h-11'
										placeholder={t('Статус задачи')}
										isClearable
										field={field}
										form={form}
										options={STATUS_OPTIONS}
										value={STATUS_OPTIONS.find((o) => o.value === form.values.status) || null}
										onChange={(opt) => form.setFieldValue(field.name, (opt as any)?.value ?? null)}
									/>
								)}
							</Field>
						</FormItem>

						{/* Sana oraliği (deadline_start / deadline_end) */}
						<FormItem>
							<h6 className='mb-2'>{t('Дата выполнения')}</h6>
							<div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
								<Field name='deadline_start'>
									{({ field }: FieldProps) => (
										<DatePicker
											inputFormat='YYYY-MM-DD'
											className='h-11'
											placeholder='YYYY-MM-DD'
											value={values.deadline_start ? new Date(values.deadline_start) : null}
											maxDate={values.deadline_end ? new Date(values.deadline_end) : undefined}
											onChange={(val) => {
												const next = toIsoDate(val as any)
												setFieldValue(field.name, next || null)
												if (next && values.deadline_end && next > values.deadline_end) {
													setFieldValue('deadline_end', null)
												}
											}}
											clearable
										/>
									)}
								</Field>

								<Field name='deadline_end'>
									{({ field }: FieldProps) => (
										<DatePicker
											inputFormat='YYYY-MM-DD'
											className='h-11'
											placeholder='YYYY-MM-DD'
											value={values.deadline_end ? new Date(values.deadline_end) : null}
											minDate={values.deadline_start ? new Date(values.deadline_start) : undefined}
											onChange={(val) => {
												const next = toIsoDate(val as any)
												setFieldValue(field.name, next || null)
												if (next && values.deadline_start && next < values.deadline_start) {
													setFieldValue('deadline_start', null)
												}
											}}
											clearable
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
})

const DrawerFooter = ({
	onSaveClick,
	onCancel
}: {
	onSaveClick: (e: MouseEvent<HTMLButtonElement>) => void
	onCancel: (e: MouseEvent<HTMLButtonElement>) => void
}) => {
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

export default function TableFilter({ values, onSubmit, branchOptions }: Props) {
	const { t } = useTranslation()

	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const submit = () => {
		if (!formikRef.current) return
		onSubmit(formikRef.current.values)
		setIsOpen(false)
	}

	const activeFilterKeys = ['branch', 'status', 'deadline_start', 'deadline_end'] as const

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
				footer={<DrawerFooter onCancel={() => setIsOpen(false)} onSaveClick={submit} />}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<FilterForm
					ref={formikRef}
					values={values}
					onSubmitComplete={submit}
					branchOptions={branchOptions}
				/>
			</Drawer>
		</>
	)
}
