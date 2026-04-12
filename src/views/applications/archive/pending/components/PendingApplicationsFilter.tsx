import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import isEmpty from 'lodash/isEmpty'
import { ContractApplicationStatusEnum, Sale } from '@/@types/contract.types'
import type { Branch } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import { Badge, Button, Drawer, FormItem, Option, Select } from '@/components/ui'
import DatePickerRange from '@/components/ui/DatePicker/DatePickerRange'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { UserService } from '@/services/user.service'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../PendingApplicationsList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const NewApplicationsFilter = ({ values, onSubmit }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)
	const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)

	const { data: branches, isLoading: isLoadingBranches } = useQuery({
		queryKey: ['get branches'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>(),
		select: ({ data }) => data
	})

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs', selectedBranch],
		queryFn: () =>
			TechService.getAllTechs<Tech[]>({ region: selectedBranch ? selectedBranch.region.id : null }),
		select: ({ data }) => data,
		enabled: isOpen || !!selectedBranch
	})

	const { data: sales, isLoading: isLoadingSales } = useQuery({
		queryKey: ['get sales', selectedBranch],
		queryFn: () =>
			UserService.getAllSales<Sale[]>({ branch: selectedBranch ? selectedBranch.id : null }),
		select: ({ data }) => data,
		enabled: isOpen || !!selectedBranch
	})

	const { control, getValues, setValue, handleSubmit } = useForm<FilterQueries>({
		mode: 'onChange'
	})

	const formSubmit = (data: FilterQueries) => {
		const formData: FilterQueries = {
			...data,
			application_date_start: data.application_date_start
				? formatDate(data.application_date_start, 'YYYY-MM-DD')
				: null,
			application_date_end: data.application_date_end
				? formatDate(data.application_date_end, 'YYYY-MM-DD')
				: null
		}

		onSubmit(formData)
		setIsOpen(false)
	}

	return (
		<>
			<Button
				size='sm'
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={() => setIsOpen(true)}
			>
				<span>{t('Фильтр')}</span>
				{!isEmpty(values) && (
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
									isClearable
									isLoading={isLoadingBranches}
									noOptionsMessage={() => t('Нет филиалов')}
									placeholder={t('Выберите филиал')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) => {
										if (option) {
											field.onChange(option.value)
											const branch = branches?.find((b) => b.id === option.value)
											if (branch) setSelectedBranch(branch)

											setValue('tech', null)
											setValue('sales', null)
										} else {
											field.onChange(null)
											setSelectedBranch(null)
											setValue('tech', null)
											setValue('sales', null)
										}
									}}
								/>
							</FormItem>
						)
					}}
				/>

				<Controller
					control={control}
					name={'tech'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = techs
							? techs.map((tech) => ({
								label: tech.model_name_ru,
								value: tech.id
							}))
							: []

						return (
							<FormItem
								label={t('Техника')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									isLoading={isLoadingTechs}
									noOptionsMessage={() => t('Нет техники')}
									placeholder={t('Выберите технику')}
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
					name={'status'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = [
							{ label: t('Новое'), value: ContractApplicationStatusEnum.NEW },
							{ label: t('Назначен'), value: ContractApplicationStatusEnum.ASSIGNED },
							{
								label: t('Сбор документов'),
								value: ContractApplicationStatusEnum.DOCUMENT_GATHERING
							},
							{ label: t('Комиссия'), value: ContractApplicationStatusEnum.IN_COMMISSION },
							{ label: t('Отказано'), value: ContractApplicationStatusEnum.REJECTED },
							{
								label: t('Составлен договор'),
								value: ContractApplicationStatusEnum.CONTRACT_CREATED
							}
						]

						return (
							<FormItem label={t('Статус')} invalid={invalid} errorMessage={error && error.message}>
								<Select
									field={field}
									isClearable
									noOptionsMessage={() => t('Нет статусов')}
									placeholder={t('Выберите статус')}
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
					name={'sales'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = sales
							? sales.map((sale) => ({
								label: `${sale.profile.first_name} ${sale.profile.middle_name} ${sale.profile.last_name}`,
								value: sale.id
							}))
							: []

						return (
							<FormItem
								label={t('Исполнитель')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									isLoading={isLoadingSales}
									noOptionsMessage={() => t('Нет исполнителей')}
									placeholder={t('Выберите исполнителя')}
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
							name={'total_amount_start'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										placeholder={t('От')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
						/>

						<Controller
							control={control}
							name={'total_amount_end'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										placeholder={t('До')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<FormItem label={t('Дата заявки')}>
					<DatePickerRange
						clearable
						placeholder={t('Выберите дату')}
						inputFormat='DD.MM.YYYY'
						defaultValue={[
							getValues('application_date_start') as Date,
							getValues('application_date_end') as Date
						]}
						onChange={(dates) => {
							setValue('application_date_start', dates[0])
							setValue('application_date_end', dates[1])
						}}
					/>
				</FormItem>
			</Drawer>
		</>
	)
}

export default NewApplicationsFilter
