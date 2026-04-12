import { Control, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { ManufacturerType, TechType } from '@/@types/tech.types'
import { AdaptableCard, RichTextEditor } from '@/components/shared'
import { FormItem, Input, Option, Select } from '@/components/ui'
import { countries } from '@/constants/countries.constant'
import { TechService } from '@/services/tech.service'
import { FormModel } from './EquipmentForm'

type BasicInformationFieldsProps = {
	control: Control<FormModel>
	isSubmitting?: boolean
}

const BasicInformationFields = ({ control, isSubmitting = false }: BasicInformationFieldsProps) => {
	const { t } = useTranslation()

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

	return (
		<AdaptableCard divider className='mb-4'>
			<h5>{t('Основная информация')}</h5>
			<p className='mb-6'>{t('Раздел для настройки основной информации о продукте')}</p>

			<div
				// className='grid grid-cols-2 gap-4'
				className='grid grid-cols-1 sm:grid-cols-2 gap-4'
			>
				<Controller
					control={control}
					name={'model_name_ru'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Модель')} invalid={invalid} errorMessage={error && error.message}>
							<Input
								type='text'
								placeholder={t('Введите модель')}
								value={field.value}
								onChange={field.onChange}
								invalid={invalid}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Модель обязателен')
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
									isClearable
									isDisabled={isSubmitting}
									isLoading={isLoadingManufacturers}
									noOptionsMessage={() => t('Нет производителей')}
									placeholder={t('Выберите производителя')}
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
					rules={{
						required: t('Производитель обязателен')
					}}
				/>
			</div>

			<div
				// className='grid grid-cols-3 gap-4'
				className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
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
									isClearable
									isDisabled={isSubmitting}
									noOptionsMessage={() => t('Нет стран')}
									placeholder={t('Выберите страну')}
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
					rules={{
						required: t('Страна обязателен')
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
							<FormItem label={t('Тип')} invalid={invalid} errorMessage={error && error.message}>
								<Select
									field={field}
									isClearable
									isDisabled={isSubmitting}
									isLoading={isLoadingTypes}
									noOptionsMessage={() => t('Нет типов')}
									placeholder={t('Выберите тип')}
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
					rules={{
						required: t('Тип обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'measure_unit'}
					render={({ field, fieldState: { invalid, error } }) => {
						const units = [
							{
								id: 1,
								name_ru: 'шт.',
								name_uz: 'шт.'
							}
						]

						const options: Option[] = units.map((u) => ({
							label: u.name_ru,
							value: u.id
						}))

						return (
							<FormItem
								label={t('Единица измерения')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<Select
									field={field}
									isClearable
									isDisabled={isSubmitting}
									noOptionsMessage={() => t('Нет ед. изм.')}
									placeholder={t('Выберите ед. изм.')}
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
					rules={{
						required: t('Единица измерения обязателен')
					}}
				/>
			</div>

			<div
				// className='grid grid-cols-2 gap-4'
				className='grid grid-cols-1 sm:grid-cols-2 gap-4'
			>
				<Controller
					control={control}
					name={'code_1c'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Код 1C')} invalid={invalid} errorMessage={error && error.message}>
							<Input
								type='text'
								placeholder={t('Введите код 1C')}
								value={field.value}
								onChange={field.onChange}
								invalid={invalid}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Код 1C обязателен')
					}}
				/>

				{/*<Controller*/}
				{/*	control={control}*/}
				{/*	name={'ikpu_code'}*/}
				{/*	render={({ field, fieldState: { invalid, error } }) => (*/}
				{/*		<FormItem label={t('ИКПУ')} invalid={invalid} errorMessage={error && error.message}>*/}
				{/*			<FormPatternInput*/}
				{/*				field={field}*/}
				{/*				format='#################'*/}
				{/*				mask='_'*/}
				{/*				placeholder={t('Введите ИКПУ')}*/}
				{/*				value={field.value}*/}
				{/*				onValueChange={(e) => field.onChange(e.value)}*/}
				{/*				invalid={invalid}*/}
				{/*			/>*/}
				{/*		</FormItem>*/}
				{/*	)}*/}
				{/*	rules={{*/}
				{/*		required: t('ИКПУ обязателен'),*/}
				{/*		minLength: {*/}
				{/*			value: 17,*/}
				{/*			message: t('Минимум 17 символа')*/}
				{/*		}*/}
				{/*	}}*/}
				{/*/>*/}
			</div>

			<Controller
				control={control}
				name={'description'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem label={t('Описание')} invalid={invalid} errorMessage={error && error.message}>
						<RichTextEditor value={field.value} onChange={field.onChange} />
					</FormItem>
				)}
			/>
		</AdaptableCard>
	)
}

export default BasicInformationFields
