import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { ManufacturerType, TechType } from '@/@types/tech.types'
import { Badge, Button, Drawer, FormItem, Option, Select } from '@/components/ui'
import { countries } from '@/constants/countries.constant'
import { TechService } from '@/services/tech.service'
import { FilterQueries } from '../EquipmentList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const EquipmentFilter = ({ values, onSubmit }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const { data: manufacturers, isLoading: isLoadingManufacturers } = useQuery({
		queryKey: ['get manufacturers'],
		queryFn: () => TechService.getAllManufacturers<ManufacturerType[]>(),
		select: ({ data }) => data
	})

	const { data: types, isLoading: isLoadingTypes } = useQuery({
		queryKey: ['get types'],
		queryFn: () => TechService.getAllTypes<TechType[]>(),
		select: ({ data }) => data
	})

	const { control, handleSubmit } = useForm<FilterQueries>({
		mode: 'onChange'
	})

	const formSubmit: SubmitHandler<FilterQueries> = (data) => {
		onSubmit(data)
		setIsOpen(false)
	}
	const activeFilterKeys = ['country', 'manufacturer', 'type'] as const

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
					name={'country'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = countries.map((c) => ({
							label: c.label,
							value: c.label
						}))

						return (
							<FormItem label={t('Стрaна')} invalid={invalid} errorMessage={error && error.message}>
								<Select
									field={field}
									invalid={invalid}
									isClearable
									noOptionsMessage={() => t('Нет страны')}
									placeholder={t('Выберите стрaну')}
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
					name={'manufacturer'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = manufacturers
							? manufacturers.map((m) => ({
									label: m.name_ru,
									value: m.id
								}))
							: []

						return (
							<FormItem
								label={t('Производитель')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									invalid={invalid}
									isClearable
									isLoading={isLoadingManufacturers}
									noOptionsMessage={() => t('Нет производителей')}
									placeholder={t('Выберите производителя')}
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
					name={'type'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = types
							? types.map((t) => ({
									label: t.name_ru,
									value: t.id
								}))
							: []

						return (
							<FormItem
								label={t('Тип техники')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									invalid={invalid}
									isClearable
									isLoading={isLoadingTypes}
									noOptionsMessage={() => t('Нет типов техники')}
									placeholder={t('Выберите тип техники')}
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
			</Drawer>
		</>
	)
}

export default EquipmentFilter
