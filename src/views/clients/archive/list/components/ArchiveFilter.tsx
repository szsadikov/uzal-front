import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import isEmpty from 'lodash/isEmpty'
import { ContractStatusEnum } from '@/@types/contract.types'
import type { Branch } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import { Badge, Button, Drawer, FormItem, Select } from '@/components/ui'
import DatePickerRange from '@/components/ui/DatePicker/DatePickerRange'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { formatDate } from '@/utils/format'
import { Option } from '@/views/monitoring/tasklist/form/Form'
import { FilterQueries } from '../ArchiveList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const NewContractsFilter = ({ values, onSubmit }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)
	const [regionId, setRegionId] = useState<number | null>(null)

	const { data: branches, isLoading: isLoadingBranches } = useQuery({
		queryKey: ['get branches'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>(),
		select: ({ data }) => data
	})

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs', regionId],
		queryFn: () => TechService.getAllTechs<Tech[]>({ region: regionId }),
		select: ({ data }) => data
	})

	const { control, getValues, setValue, handleSubmit } = useForm<FilterQueries>({
		mode: 'onChange'
	})

	const formSubmit: SubmitHandler<FilterQueries> = (data) => {
		const formData: FilterQueries = {
			...data,
			to_created_at: data.to_created_at ? formatDate(data.to_created_at, 'YYYY-MM-DD') : null,
			from_created_at: data.from_created_at ? formatDate(data.from_created_at, 'YYYY-MM-DD') : null
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
									invalid={invalid}
									isClearable
									isLoading={isLoadingBranches}
									noOptionsMessage={() => t('Нет филиалов')}
									placeholder={t('Выберите филиал')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) => {
										if (option) {
											field.onChange(option.value)
											setRegionId(option.value)
										} else {
											field.onChange(null)
											setRegionId(null)
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
									invalid={invalid}
									isClearable
									isLoading={isLoadingTechs}
									noOptionsMessage={() => 'Нет техники'}
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
							{ label: t('Ожидание оплаты'), value: ContractStatusEnum.PENDING_TRANSFER },
							{ label: t('Ожидание выдачи техники'), value: ContractStatusEnum.DEPOSIT_PAID },
							{ label: t('Выдача техники'), value: ContractStatusEnum.TECH_GIVEN },
							{ label: t('Отменен'), value: ContractStatusEnum.CANCELED },
							{ label: t('Переуступка'), value: ContractStatusEnum.CLIENT_CHANGED },
							{ label: t('Возврат средств'), value: ContractStatusEnum.TECH_RETURNED }
						]

						return (
							<FormItem label={t('Статус')} invalid={invalid} errorMessage={error && error.message}>
								<Select
									field={field}
									invalid={invalid}
									isClearable
									noOptionsMessage={() => t('Нет филиалов')}
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

				<div className='flex flex-col'>
					<label className='form-label mb-2'>{t('Сумма')}</label>
					<div className='grid grid-cols-2 gap-4'>
						<Controller
							control={control}
							name={'from_price'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('От')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
						/>

						<Controller
							control={control}
							name={'to_price'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('До')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
						/>
					</div>
				</div>

				<div className='flex flex-col'>
					<label className='form-label mb-2'>{t('Очередь')}</label>
					<div className='grid grid-cols-2 gap-4'>
						<Controller
							control={control}
							name={'from_queue_position'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('От')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
						/>

						<Controller
							control={control}
							name={'to_queue_position'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('От')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
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
							getValues('from_created_at') as Date,
							getValues('to_created_at') as Date
						]}
						onChange={(dates) => {
							setValue('from_created_at', dates[0])
							setValue('to_created_at', dates[1])
						}}
					/>
				</FormItem>
			</Drawer>
		</>
	)
}

export default NewContractsFilter
