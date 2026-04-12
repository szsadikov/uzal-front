import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiArrowCircleRight } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Region } from '@/@types/dataset.types'
import { Tech, TechDistributeOperationActionEnum } from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import { Button, Drawer, FormItem, Notification, Option, Select, toast } from '@/components/ui'
import { useConfig } from '@/components/ui/ConfigProvider'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import useResponsive from '@/utils/hooks/useResponsive'

type Props = {
	refetchDistributions?: () => Promise<unknown>
	refetchRegions?: () => Promise<unknown>
}

type FormModel = {
	tech: number
	action: TechDistributeOperationActionEnum
	from_region: number
	to_region: number
	count: number
}

const RegionalDistributionRedistribution = ({ refetchDistributions, refetchRegions }: Props) => {
	const { t } = useTranslation()
	const { windowWidth, larger } = useResponsive()
	const [isOpen, setIsOpen] = useState(false)
	const { themeColor, primaryColorLevel } = useConfig()

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs'],
		queryFn: () => TechService.getAllTechs<Tech[]>(),
		select: ({ data }) => data
	})

	const { data: regions, isLoading: isLoadingRegions } = useQuery({
		queryKey: ['get regions'],
		queryFn: () => DatasetService.getAllRegions<Region[]>(),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncCreateRedistribution, isPending: isPendingCreateRedistribution } =
		useMutation({
			mutationKey: ['create redistribution'],
			mutationFn: (data: FormModel) =>
				TechService.createDistributeOperation<FormModel & { id: number }, FormModel>(data),
			async onSuccess({ data }) {
				if (refetchDistributions) await refetchDistributions()
				if (refetchRegions) await refetchRegions()

				toast.push(
					<Notification type="success" title={`${t('Распределено')} ${data.id}`} duration={2000} />,
					{
						placement: 'top-center'
					}
				)
			},
			onError(error) {
				const message = errorCatch(error)

				toast.push(<Notification type="danger" title={message} duration={2000} />, {
					placement: 'top-center'
				})
			}
		})

	const { control, handleSubmit } = useForm<FormModel>({
		mode: 'onChange'
	})

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		const formData: FormModel = {
			...data,
			action: TechDistributeOperationActionEnum.REDISTRIBUTE
		}

		await mutateAsyncCreateRedistribution(formData).finally(() => setIsOpen(false))
	}

	// compute arrow color class safely (fallback)
	const arrowClass = `text-${themeColor}-${primaryColorLevel}`

	return (
		<>
			<Button
				variant="solid"
				size="sm"
				className="mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2"
				onClick={() => setIsOpen(true)}
			>
				{t('Изменить')}
			</Button>

			<Drawer
				title={t('Перераспределение')}
				width={larger.lg ? windowWidth - 453 : windowWidth}
				isOpen={isOpen}
				footer={
					<div className="ml-auto grid grid-cols-2 gap-2">
						<Button size="md" className="grow" onClick={() => setIsOpen(false)}>
							{t('Отмена')}
						</Button>
						<Button
							size="md"
							variant="solid"
							className="grow"
							loading={isPendingCreateRedistribution}
							onClick={handleSubmit(onSubmit)}
						>
							{t('Сохранить')}
						</Button>
					</div>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				{/* Responsive grid:
            - mobile: 1 column (stack)
            - sm: 2 columns
            - lg: original 5-column layout
        */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start lg:grid-cols-[1fr_1fr_1fr_34px_1fr] lg:items-center lg:gap-4 lg:py-2">
					{/* Tech */}
					<div className="col-span-1">
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
									<FormItem label={t('Техника')} invalid={invalid} errorMessage={error && error.message}>
										<Select
											field={field}
											isClearable
											isLoading={isLoadingTechs}
											noOptionsMessage={() => t('Нет техники')}
											placeholder={t('Выберите технику')}
											options={options}
											value={options.filter((option) => option.value === field.value)}
											onChange={(option) => (option ? field.onChange(option.value) : field.onChange(null))}
											invalid={invalid}
										/>
									</FormItem>
								)
							}}
							rules={{
								required: t('Техника обязателен')
							}}
						/>
					</div>

					{/* From region */}
					<div className="col-span-1">
						<Controller
							control={control}
							name={'from_region'}
							render={({ field, fieldState: { invalid, error } }) => {
								const options: Option[] = regions
									? regions.map((region) => ({
										label: region.name_ru,
										value: region.id
									}))
									: []

								return (
									<FormItem label={t('Область')} invalid={invalid} errorMessage={error && error.message}>
										<Select
											field={field}
											isClearable
											isLoading={isLoadingRegions}
											noOptionsMessage={() => t('Нет областей')}
											placeholder={t('Выберите область')}
											options={options}
											value={options.filter((option) => option.value === field.value)}
											onChange={(option) => (option ? field.onChange(option.value) : field.onChange(null))}
											invalid={invalid}
										/>
									</FormItem>
								)
							}}
							rules={{
								required: t('Область обязателен')
							}}
						/>
					</div>

					{/* Count */}
					<div className="col-span-1">
						<Controller
							control={control}
							name={'count'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem label={t('Количество')} invalid={invalid} errorMessage={error && error.message}>
									<FormNumericInput
										field={field}
										invalid={invalid}
										placeholder={t('Укажите количество')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.floatValue??'')}
									/>
								</FormItem>
							)}
							rules={{
								required: t('Количество обязателен')
							}}
						/>
					</div>

					{/* Arrow icon: center on lg, but on mobile it will be a full-width row between from/to if desired */}
					<div className="text-center my-2 sm:col-span-2 lg:col-span-1 lg:my-0">
						<HiArrowCircleRight className={`mx-auto ${arrowClass}`} />
					</div>

					{/* To region */}
					<div className="col-span-1">
						<Controller
							control={control}
							name={'to_region'}
							render={({ field, fieldState: { invalid, error } }) => {
								const options: Option[] = regions
									? regions.map((region) => ({
										label: region.name_ru,
										value: region.id
									}))
									: []

								return (
									<FormItem label={t('Область')} invalid={invalid} errorMessage={error && error.message}>
										<Select
											field={field}
											isClearable
											isLoading={isLoadingRegions}
											noOptionsMessage={() => t('Нет областей')}
											placeholder={t('Выберите область')}
											options={options}
											value={options.filter((option) => option.value === field.value)}
											onChange={(option) => (option ? field.onChange(option.value) : field.onChange(null))}
											invalid={invalid}
										/>
									</FormItem>
								)
							}}
							rules={{
								required: t('Область обязателен')
							}}
						/>
					</div>
				</div>
			</Drawer>
		</>
	)
}

export default RegionalDistributionRedistribution
