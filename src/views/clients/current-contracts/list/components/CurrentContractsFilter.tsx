import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import type { Branch } from '@/@types/dataset.types'
import { FormNumericInput } from '@/components/shared'
import { Badge, Button, Drawer, FormItem, Option, Select } from '@/components/ui'
import DatePickerRange from '@/components/ui/DatePicker/DatePickerRange'
import { DatasetService } from '@/services/dataset.service'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../CurrentContractsList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const CurrentContractsFilter = ({ values, onSubmit }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const { data: branches, isLoading: isLoadingBranches } = useQuery({
		queryKey: ['get branches'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>(),
		select: ({ data }) => data
	})

	const { control, getValues, setValue, handleSubmit } = useForm<FilterQueries>({
		mode: 'onChange'
	})

	const formSubmit: SubmitHandler<FilterQueries> = (data) => {
		const formData: FilterQueries = {
			...data,
			contract_date_start: data.contract_date_start
				? formatDate(data.contract_date_start, 'YYYY-MM-DD')
				: null,
			contract_date_end: data.contract_date_end
				? formatDate(data.contract_date_end, 'YYYY-MM-DD')
				: null
		}

		onSubmit(formData)
		setIsOpen(false)
	}

	const activeFilterKeys = [
		'branch',
		'overall_contract_amount_start',
		'overall_contract_amount_end',
		'contract_date_start',
		'contract_date_end'
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
				{/*{!isEmpty(values) && (*/}
				{/*	<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />*/}
				{/*)}*/}
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />
				)}
			</Button>

			<Drawer
				title={t('Фильтр')}
				isOpen={isOpen}
				footer={
					<div className='grid grow grid-cols-2 gap-2'>
						<Button size='md' className='grow' onClick={() => setIsOpen(false)}>
							{t('Отмена')}
						</Button>
						<Button size='md' variant='solid' className='grow' onClick={handleSubmit(formSubmit)}>
							{t('Применить')}
						</Button>
					</div>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<Controller
					control={control}
					name={'branch'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = branches
							? branches.map((branch) => ({
									label: branch.name,
									value: branch.id
								}))
							: []

						return (
							<FormItem label={t('Филиал')} invalid={invalid} errorMessage={error && error.message}>
								<Select
									field={field}
									invalid={invalid}
									isClearable
									isLoading={isLoadingBranches}
									noOptionsMessage={() => t('Нет филиалов')}
									placeholder={t('Выберите филиал')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) =>
										option ? field.onChange(option.value) : field.onChange(null)
									}
								/>
							</FormItem>
						)
					}}
				/>

				<div className='flex flex-col'>
					<label className='form-label mb-2'>{t('Сумма')}</label>
					<div className='grid grid-cols-2 gap-4'>
						<Controller
							control={control}
							name={'overall_contract_amount_start'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('От')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue ?? '')}
									/>
								</FormItem>
							)}
						/>

						<Controller
							control={control}
							name={'overall_contract_amount_end'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('До')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue ?? '')}
									/>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<FormItem label={t('Дата договора')}>
					<DatePickerRange
						clearable
						placeholder={t('Выберите дату')}
						inputFormat='DD.MM.YYYY'
						defaultValue={[
							getValues('contract_date_start') as Date,
							getValues('contract_date_end') as Date
						]}
						onChange={(dates) => {
							setValue('contract_date_start', dates[0])
							setValue('contract_date_end', dates[1])
						}}
					/>
				</FormItem>
			</Drawer>
		</>
	)
}

export default CurrentContractsFilter
