// UserFilter.tsx (faqat muhim o'zgartirishlar kiritilgan versiya)
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import type { Branch } from '@/@types/dataset.types'
import { Badge, Button, Drawer, FormItem, Option, Select } from '@/components/ui'
import DatePickerRange from '@/components/ui/DatePicker/DatePickerRange'
import { DatasetService } from '@/services/dataset.service'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../UsersRegistryList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
	currentUserRoleText?: string | null
}

const UserFilter = ({ values, onSubmit }: Props) => {
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

	const formSubmit = (data: FilterQueries) => {
		const formData: FilterQueries = {
			...data,
			// registration_date_start: data.registration_date_start
			// 	? formatDate(data.registration_date_start, 'YYYY-MM-DD')
			// 	: null,
			// registration_date_end: data.registration_date_end
			// 	? formatDate(data.registration_date_end, 'YYYY-MM-DD')
			// 	: null,
			last_login_start: data.last_login_start
				? formatDate(data.last_login_start, 'YYYY-MM-DD')
				: null,
			last_login_end: data.last_login_end ? formatDate(data.last_login_end, 'YYYY-MM-DD') : null
		}

		onSubmit(formData)
		setIsOpen(false)
	}

	// UserFilter.tsx (inside the component)
	const activeFilterKeys = [
		'registration_date_start',
		'registration_date_end',
		'region',
		'device',
		'last_login_start',
		'last_login_end'
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
				<FormItem label={t('ДАТА РЕГИСТРАЦИИ')}>
					<DatePickerRange
						clearable
						placeholder={t('Выберите дату')}
						inputFormat='DD.MM.YYYY'
						// defaultValue={[
						// 	getValues('registration_date_start') as Date,
						// 	getValues('registration_date_end') as Date
						// ]}
						// onChange={(dates) => {
						// 	setValue('registration_date_start', dates[0])
						// 	setValue('registration_date_end', dates[1])
						// }}
					/>
				</FormItem>

				<Controller
					control={control}
					name={'region'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = branches
							? branches.map((branch) => ({
									label: branch.name,
									value: branch.id
								}))
							: []

						return (
							<FormItem
								label={t('Область')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									isLoading={isLoadingBranches}
									noOptionsMessage={() => t('Нет областей')}
									placeholder={t('Выберите область')}
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

				<Controller
					control={control}
					name={'device'}
					render={({ field, fieldState: { invalid, error } }) => {
						const deviceOptions: Option[] = [
							{ label: t('Телефон'), value: 'phone' },
							{ label: t('Компьютер'), value: 'computer' }
						]

						return (
							<FormItem
								label={t('Устройство')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									noOptionsMessage={() => t('Нет устройств')}
									placeholder={t('Выберите область')}
									options={deviceOptions}
									value={deviceOptions.filter((option) => option.value === field.value)}
									onChange={(option) =>
										option ? field.onChange(option.value) : field.onChange(null)
									}
								/>
							</FormItem>
						)
					}}
				/>

				<FormItem label={t('Активность')}>
					<DatePickerRange
						clearable
						placeholder={t('Выберите дату')}
						inputFormat='DD.MM.YYYY'
						defaultValue={[
							getValues('last_login_start') as Date,
							getValues('last_login_end') as Date
						]}
						onChange={(dates) => {
							setValue('last_login_start', dates[0])
							setValue('last_login_end', dates[1])
						}}
					/>
				</FormItem>
			</Drawer>
		</>
	)
}

export default UserFilter
