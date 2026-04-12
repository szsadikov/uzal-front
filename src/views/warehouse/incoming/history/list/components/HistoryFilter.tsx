import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineFilter } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import isEmpty from 'lodash/isEmpty'
import { Tech } from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import { Badge, Button, Drawer, FormItem, Option, Select } from '@/components/ui'
import { TechService } from '@/services/tech.service'
import { FilterQueries } from '../HistoryList'

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

const IncomingFilter = ({ values, onSubmit }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const { data: deliveries, isLoading: isLoadingDeliveries } = useQuery({
		queryKey: ['get uniq deliveries'],
		queryFn: () => TechService.getUniqDeliveries<string[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs'],
		queryFn: () => TechService.getAllTechs<Tech[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})

	const { control, handleSubmit } = useForm<FilterQueries>({
		mode: 'onChange'
	})

	const formSubmit: SubmitHandler<FilterQueries> = (data) => {
		onSubmit(data)
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
					name={'delivery'}
					render={({ field, fieldState: { invalid, error } }) => {
						const options: Option[] = deliveries
							? deliveries.map((delivery) => ({
								label: delivery,
								value: delivery
							}))
							: []

						return (
							<FormItem
								label={t('Поставщик')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									isLoading={isLoadingDeliveries}
									noOptionsMessage={() => t('Нет поставщиков')}
									placeholder={t('Выберите поставщика')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) =>
										option ? field.onChange(option.value) : field.onChange(null)
									}
									invalid={invalid}
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
									invalid={invalid}
								/>
							</FormItem>
						)
					}}
				/>

				<div className='flex flex-col'>
					<label className='form-label mb-2'>{t('Количество')}</label>
					<div className='grid grid-cols-2 gap-4'>
						{/* TODO: Поставщик */}

						{/* TODO: Техника */}

						<Controller
							control={control}
							name={'count_start'}
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
							name={'count_end'}
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

				<div className='flex flex-col'>
					<label className='form-label mb-2'>{t('Сумма')}</label>
					<div className='grid grid-cols-2 gap-4'>
						<Controller
							control={control}
							name={'price_start'}
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
							name={'price_end'}
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
			</Drawer>
		</>
	)
}

export default IncomingFilter
