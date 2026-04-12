import { Dispatch, SetStateAction, useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import {
	MeasureUnitEnum,
	Tech,
	TechStockOperation,
	TechStockOperationActionEnum
} from '@/@types/tech.types'
import { FormNumericInput } from '@/components/shared'
import {
	Button,
	Drawer,
	FormItem,
	Notification,
	Option,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'

type Props = {
	id: number
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
	refetch?: () => Promise<unknown>
}

type FormModel = {
	tech: number
	unit_value: number
	count: number
	price: number
	vat: number
	tech_price_with_vat: number
	action: TechStockOperationActionEnum | null
}

const IncomingEdit = ({ id, isOpen, setIsOpen, refetch }: Props) => {
	const { t } = useTranslation()

	const { data: tech, isLoading: isLoadingTech } = useQuery({
		queryKey: ['get tech', id],
		queryFn: () => TechService.getById<Tech>(Number(id)),
		select: ({ data }) => data
	})

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs'],
		queryFn: () => TechService.getAllTechs<Tech[]>(),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncCreateStockOperation, isPending: isPendingCreateStockOperation } =
		useMutation({
			mutationKey: ['create stock operation'],
			mutationFn: (data: FormModel) =>
				TechService.createStockOperation<TechStockOperation, FormModel>(data),
			async onSuccess() {
				if (refetch) await refetch()

				toast.push(<Notification type='success' title={t('Обновлен успешно')} duration={2000} />, {
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

	const { control, handleSubmit, reset } = useForm<FormModel>({
		mode: 'onChange'
	})

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		if (!tech) return

		const isChangeCount = tech.count !== data.count
		const isChangePrice = Number(tech.price) !== data.price

		if (!isChangeCount && !isChangePrice) {
			setIsOpen(false)
			toast.push(<Notification type='success' title={t('Сохранен')} duration={2000} />, {
				placement: 'top-center'
			})
		}

		const changeCountData: FormModel = {
			...data,
			unit_value: data.count,
			action: TechStockOperationActionEnum.COUNT_CHANGE
		}

		const changePriceData: FormModel = {
			...data,
			unit_value: data.price,
			action: TechStockOperationActionEnum.PRICE_CHANGE
		}

		if (isChangeCount)
			await mutateAsyncCreateStockOperation(changeCountData).finally(() => setIsOpen(false))
		if (isChangePrice)
			await mutateAsyncCreateStockOperation(changePriceData).finally(() => setIsOpen(false))
	}

	useEffect(() => {
		if (tech) {
			reset({
				tech: tech.id,
				unit_value: MeasureUnitEnum.PIECES,
				count: tech.count,
				price: Number(tech.price),
				vat: tech.vat,
				tech_price_with_vat: tech.tech_price_with_vat,
				action: null
			})
		}
	}, [tech, reset])

	return (
		<Drawer
			title={t('Редактировать')}
			isOpen={isOpen}
			footer={
				<div className='grid grow grid-cols-2 gap-2'>
					<Button size='md' className='grow' onClick={() => setIsOpen(false)}>
						{t('Отмена')}
					</Button>
					<Button
						size='md'
						variant='solid'
						className='grow'
						loading={isLoadingTech || isPendingCreateStockOperation}
						onClick={handleSubmit(onSubmit)}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
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
								isDisabled={true}
								isClearable
								isLoading={isLoadingTech || isLoadingTechs}
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

			<Controller
				control={control}
				name={'unit_value'}
				render={({ field, fieldState: { invalid, error } }) => {
					const options: Option[] = [{ label: `${t('шт')}.`, value: MeasureUnitEnum.PIECES }]

					return (
						<FormItem
							label={t('Единица измерения')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							<Select
								field={field}
								isClearable
								isDisabled={true}
								noOptionsMessage={() => t('Нет единицы измерения')}
								placeholder={t('Выберите единицу измерения')}
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
				name={'count'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem label={t('Количество')} invalid={invalid} errorMessage={error && error.message}>
						{isLoadingTech ? (
							<Skeleton height={44} />
						) : (
							<FormNumericInput
								field={field}
								invalid={invalid}
								placeholder={t('Укажите количество')}
								value={field.value}
								// onValueChange={(e) => field.onChange(e.floatValue??'')}
								onValueChange={(e) => field.onChange(e.floatValue ?? null)}

							/>
						)}
					</FormItem>
				)}
				rules={{
					required: t('Количество обязателен'),
					validate: (v) => (Number(v) > 0 ? true : t('Количество должно быть больше 0')),
				}}

			/>

			<Controller
				control={control}
				name={'price'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem
						label={t('Продажная цена')}
						invalid={invalid}
						errorMessage={error && error.message}
					>
						{isLoadingTech ? (
							<Skeleton height={44} />
						) : (
							<FormNumericInput
								field={field}
								invalid={invalid}
								placeholder={t('Укажите цену')}
								value={field.value}
								// onValueChange={(e) => field.onChange(e.floatValue??'')}
								onValueChange={(e) => field.onChange(e.floatValue ?? null)}

							/>
						)}
					</FormItem>
				)}
				rules={{
					required: t('Продажная цена обязателен'),
					validate: (v) => (Number(v) > 0 ? true : t('Цена должна быть больше 0')),
				}}

			/>

			<Controller
				control={control}
				name={'vat'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem label={t('НДС')} invalid={invalid} errorMessage={error && error.message}>
						{isLoadingTech ? (
							<Skeleton height={44} />
						) : (
							<FormNumericInput
								disabled={true}
								field={field}
								invalid={invalid}
								suffix='%'
								placeholder={t('Укажите НДС')}
								value={field.value}
								onValueChange={(e) => field.onChange(e.floatValue??'')}
							/>
						)}
					</FormItem>
				)}
			/>

			<Controller
				control={control}
				name={'tech_price_with_vat'}
				render={({ field, fieldState: { invalid, error } }) => (
					<FormItem label={t('Цена с НДС')} invalid={invalid} errorMessage={error && error.message}>
						{isLoadingTech ? (
							<Skeleton height={44} />
						) : (
							<FormNumericInput
								disabled={true}
								field={field}
								invalid={invalid}
								placeholder={t('Укажите цену с НДС')}
								value={field.value}
								onValueChange={(e) => field.onChange(e.floatValue??'')}
							/>
						)}
					</FormItem>
				)}
			/>
		</Drawer>
	)
}

export default IncomingEdit
