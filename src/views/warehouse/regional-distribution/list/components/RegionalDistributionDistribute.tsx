import { useEffect, useState } from 'react'
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineTrash, HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { Region } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import { Button, Drawer, FormItem, Notification, Option, Select, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import useResponsive from '@/utils/hooks/useResponsive'

type Props = {
	refetchDistributions?: () => Promise<unknown>
	refetchRegions?: () => Promise<unknown>
}

type FormModelItem = {
	tech: number | null
	region: number | null
	count: number | null
}

type FormModel = {
	items: FormModelItem[]
}

const ITEMS_MAX_SIZE = 10

const RegionalDistributionDistribute = ({ refetchDistributions, refetchRegions }: Props) => {
	const { t } = useTranslation()
	const { windowWidth, larger } = useResponsive()
	const [isOpen, setIsOpen] = useState(false)

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

	const { mutateAsync: mutateAsyncCreateDistribution, isPending: isPendingCreateDistribution } =
		useMutation({
			mutationKey: ['create distribution'],
			mutationFn: (data: FormModelItem) =>
				TechService.createDistribution<FormModel & { id: number }, FormModelItem>(data),
			async onSuccess() {
				if (refetchDistributions) await refetchDistributions()
				if (refetchRegions) await refetchRegions()

				toast.push(<Notification type='success' title={t('Распределено')} duration={2000} />, {
					placement: 'top-center'
				})
			},
			onError(error) {
				const message = errorCatch(error)

				toast.push(<Notification type='danger' title={message} duration={2000} />, {
					placement: 'top-center'
				})
			}
		})

	const { control, handleSubmit, reset, watch } = useForm<FormModel>({
		mode: 'onChange',
		defaultValues: {
			items: [
				{
					tech: null,
					region: null,
					count: null
				}
			]
		}
	})

	const { fields, append, remove } = useFieldArray({ control, name: 'items' })

	// Drawer yopilganda formani reset qilish
	useEffect(() => {
		if (!isOpen) {
			reset({
				items: [
					{
						tech: null,
						region: null,
						count: null
					}
				]
			})
		}
	}, [isOpen, reset])

	// Formadagi barcha itemslarni kuzatish
	const watchedItems = watch('items')

	// Tanlangan tech uchun undistributed_count ni olish
	const getAvailableCount = (techId: number | null): number => {
		if (!techId || !techs) return 0
		const selectedTech = techs.find((tech) => tech.id === techId)
		return selectedTech?.count || 0
	}

	// Har bir tech uchun formada qancha ishlatilganini hisoblash
	const getUsedCount = (techId: number | null, currentIndex: number): number => {
		if (!techId) return 0
		return watchedItems.reduce((sum, item, index) => {
			if (index === currentIndex) return sum
			if (item.tech === techId && item.count) {
				return sum + item.count
			}
			return sum
		}, 0)
	}

	// Hamma tanlangan texnikalar uchun jami qolgan sonni hisoblash
	const getTotalAvailableCount = (): number => {
		const uniqueTechs = new Set(watchedItems.map((item) => item.tech).filter(Boolean))
		let total = 0

		uniqueTechs.forEach((techId) => {
			const available = getAvailableCount(techId as number)
			const used = watchedItems.reduce((sum, item) => {
				if (item.tech === techId && item.count) {
					return sum + item.count
				}
				return sum
			}, 0)
			total += available - used
		})

		return total
	}

	const onSubmit: SubmitHandler<FormModel> = (data) => {
		data.items.map(async (item) => {
			await mutateAsyncCreateDistribution(item).finally(() => setIsOpen(false))
		})
	}

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				onClick={() => setIsOpen(true)}
			>
				{t('Распределить')}
			</Button>

			<Drawer
				title={t('Распределение')}
				width={larger.lg ? windowWidth - 453 : windowWidth}
				isOpen={isOpen}
				footer={
					<div className='ml-auto grid grid-cols-2 gap-2'>
						<Button size='md' className='grow' onClick={() => setIsOpen(false)}>
							{t('Отмена')}
						</Button>
						<Button
							size='md'
							variant='solid'
							className='grow'
							loading={isPendingCreateDistribution}
							onClick={handleSubmit(onSubmit)}
						>
							{t('Сохранить')}
						</Button>
					</div>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				{/* rows container */}
				<div className='flex flex-col gap-4'>
					{fields.map((field, index) => {
						const selectedTechId = watchedItems[index]?.tech
						const availableCount = getAvailableCount(selectedTechId)
						const usedCount = getUsedCount(selectedTechId, index)
						const remainingCount = availableCount - usedCount

						return (
							<div
								key={field.id}
								// Mobile: 1 col, sm: 2 cols, lg: original 5-col layout
								className={
									'grid grid-cols-1 items-start gap-4 rounded-md p-2 sm:grid-cols-2 ' +
									'lg:grid-cols-[36px_1fr_1fr_1fr_36px] lg:items-center lg:gap-4 lg:px-0 lg:py-3'
								}
							>
								{/* Index */}
								<div className='flex items-center justify-start text-sm font-semibold sm:col-span-2 lg:col-span-1 lg:justify-center'>
									{index + 1}
								</div>

								{/* Tech select */}
								<div className='col-span-1'>
									<Controller
										control={control}
										name={`items.${index}.tech` as const}
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
										rules={{
											required: t('Техника обязателен')
										}}
									/>
								</div>

								{/* Region select */}
								<div className='col-span-1'>
									<Controller
										control={control}
										name={`items.${index}.region` as const}
										render={({ field, fieldState: { invalid, error } }) => {
											const options: Option[] = regions
												? regions.map((region) => ({
														label: region.name_ru,
														value: region.id
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
														isLoading={isLoadingRegions}
														noOptionsMessage={() => t('Нет областей')}
														placeholder={t('Выберите область')}
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
											required: t('Область обязателен')
										}}
									/>
								</div>

								{/* Count */}
								<div className='col-span-1'>
									<Controller
										control={control}
										name={`items.${index}.count` as const}
										render={({ field, fieldState: { invalid, error } }) => (
											<FormItem
												label={t('Количество')}
												invalid={invalid}
												errorMessage={error && error.message}
											>
												<FormNumericInput
													field={field}
													invalid={invalid}
													placeholder={t('Укажите количество')}
													value={field.value ? field.value : undefined}
													onValueChange={(e) => field.onChange(e.floatValue??'')}
												/>
											</FormItem>
										)}
										rules={{
											required: t('Количество обязателен'),
											validate: (value) => {
												if (!value) return true
												if (selectedTechId && value > remainingCount) {
													return `Максимум: ${remainingCount}`
												}
												return true
											}
										}}
									/>
								</div>

								{/* Delete button */}
								<div className='col-span-1 flex items-start justify-start sm:col-span-2 sm:justify-start lg:col-span-1 lg:flex lg:items-center lg:justify-center'>
									<Button
										className='text-red-600 hover:text-red-500 active:text-red-700'
										variant='plain'
										size='sm'
										icon={<HiOutlineTrash />}
										type='button'
										disabled={fields.length === 1}
										onClick={() => remove(index)}
									/>
								</div>
							</div>
						)
					})}

					{fields.length !== ITEMS_MAX_SIZE && (
						<div className='mx-12 my-4 text-right'>
							{watchedItems.some((item) => item.tech) && (
								<>
									{t('Доступно')}: {getTotalAvailableCount()} {t('единиц')}
								</>
							)}
						</div>
					)}

					{/* Add button - mobile full, sm+ small and left like old design */}
					<div className='px-4'>
						<div className='w-full sm:w-auto sm:pl-12'>
							<Button
								className='px-5'
								variant='solid'
								block
								size='sm'
								disabled={isPendingCreateDistribution || fields.length >= ITEMS_MAX_SIZE}
								icon={<HiPlusCircle className='text-white' />}
								type='button'
								onClick={() => append({ tech: null, region: null, count: null } as FormModelItem)}
							>
								{t('Добавить')}
							</Button>
						</div>
					</div>
				</div>
			</Drawer>
		</>
	)
}

export default RegionalDistributionDistribute
