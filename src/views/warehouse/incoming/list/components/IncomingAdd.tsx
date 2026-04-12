import { useState } from 'react'
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineTrash, HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Customer } from '@/@types/contract.types'
import { Tech, TechStockOperation, TechStockOperationActionEnum } from '@/@types/tech.types'
import { ConfirmDialog, FormNumericInput, FormPatternInput } from '@/components/shared'
import {
	Button,
	Drawer,
	FormItem,
	Input,
	Notification,
	Option,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { CustomerService } from '@/services/customer.service'
import { TechService } from '@/services/tech.service'
import useResponsive from '@/utils/hooks/useResponsive'

type Props = {
	refetch?: () => Promise<unknown>
}

type FormModelItem = {
	tech: number | null
	price: number | null
	action: TechStockOperationActionEnum | null
	invoice: string
	stir: string
	delivery: string
	unit_value: number | null
}

type FormModel = {
	items: FormModelItem[]
}

const STIR_SIZE = 9
const ITEMS_MAX_SIZE = 10

const IncomingAdd = ({ refetch }: Props) => {
	const { t } = useTranslation()
	const { windowWidth, larger } = useResponsive()

	const [isOpen, setIsOpen] = useState(false)

	const [isConfirmOpen, setIsConfirmOpen] = useState(false)

	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs'],
		queryFn: () => TechService.getAllTechs<Tech[]>(),
		select: ({ data }) => data,
		enabled: isOpen
	})

	const { mutateAsync: mutateAsyncCustomer, isPending: isPendingCustomer } = useMutation({
		mutationKey: ['get customer by inn'],
		mutationFn: (stir: string) => CustomerService.getByInn<Customer>(stir),
		onSuccess({ data: res }) {
			if (
				res.data.СообщитьПользователю === 'Ошибка на стороне поставщика сервиса. Сервис не доступен'
			) {
				toast.push(<Notification type='danger' title='Не действительный ИНН' duration={3000} />, {
					placement: 'top-center'
				})
			}
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const { mutateAsync: mutateAsyncCreateStockOperation, isPending: isPendingCreateStockOperation } =
		useMutation({
			mutationKey: ['create stock operation'],
			mutationFn: (data: FormModelItem) =>
				TechService.createStockOperation<TechStockOperation, FormModelItem>(data),
			async onSuccess() {
				if (refetch) await refetch()

				toast.push(<Notification type='success' title={t('Приход выполнен')} duration={2000} />, {
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

	const DEFAULT_VALUES: FormModel = {
		items: [
			{
				tech: null,
				price: null,
				action: null,
				invoice: '',
				stir: '',
				delivery: '',
				unit_value: null
			}
		]
	}

	const { control, handleSubmit, setValue, getValues, reset } = useForm<FormModel>({
		mode: 'onChange',
		defaultValues: DEFAULT_VALUES
	})

	const { fields, append, remove } = useFieldArray({ control, name: 'items' })

	const isEmptyItem = (item?: any) => {
		if (!item) return true

		return (
			!item.tech &&
			!item.price &&
			!item.unit_value &&
			!item.action &&
			!(item.invoice || '').trim() &&
			!(item.stir || '').trim() &&
			!(item.delivery || '').trim()
		)
	}

	const hasUnsavedValues = () => {
		const items = getValues('items') || []

		return items.some((item) => !isEmptyItem(item))
	}

	const closeDrawerSafely = () => {
		if (hasUnsavedValues()) {
			setIsConfirmOpen(true)

			return
		}

		reset(DEFAULT_VALUES)
		setIsOpen(false)
	}
	const onConfirmDiscard = () => {
		reset(DEFAULT_VALUES)
		setIsConfirmOpen(false)
		setIsOpen(false)
	}

	const onCancelDiscard = () => {
		setIsConfirmOpen(false)
	}


	// const onSubmit: SubmitHandler<FormModel> = (data) => {
	// 	data.items.map(async (item) => {
	// 		const formData: FormModelItem = { ...item, action: TechStockOperationActionEnum.INCOME }
	//
	// 		await mutateAsyncCreateStockOperation(formData).finally(() => setIsOpen(false))
	// 	})
	// }

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		const items = (data.items || []).filter((item) => !isEmptyItem(item))

		try {
			// ✅ ketma-ket jo‘natamiz (bittasi xato bo‘lsa, drawer yopilmaydi)
			for (const item of items) {
				const formData: FormModelItem = {
					...item,
					action: TechStockOperationActionEnum.INCOME,
				}

				await mutateAsyncCreateStockOperation(formData)
			}

			// ✅ mana shu joy formni tozalaydi
			reset(DEFAULT_VALUES)
			setIsOpen(false)
		} catch (e) {
			// onError ichida toast bor, shu yerda drawer-ni yopmaymiz
		}
	}


	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				{t('Приход')}
			</Button>

			<Drawer
				title={t('Приход техники')}
				width={larger.lg ? windowWidth - 99 : windowWidth}
				isOpen={isOpen}
				footer={
					<div className='ml-auto grid grid-cols-2 gap-2'>
						<Button type='button' size='md' className='grow' onClick={closeDrawerSafely}>
							{t('Отмена')}
						</Button>
						<Button
							type='button'
							size='md'
							variant='solid'
							className='grow'
							loading={isPendingCreateStockOperation}
							onClick={handleSubmit(onSubmit)}
						>
							{t('Сохранить')}
						</Button>
					</div>
				}
				onClose={closeDrawerSafely}
				onRequestClose={closeDrawerSafely}
				// onClose={() => setIsOpen(false)}
				// onRequestClose={() => setIsOpen(false)}
			>
				{/* container for all rows; keep vertical stacking between rows */}
				<div className='flex flex-col gap-4'>
					{fields.map((field, index) => (
						<div
							key={field.id}
							className={
								'grid grid-cols-1 items-start gap-4 rounded-md p-2 sm:grid-cols-2 ' +
								'xl:grid-cols-[36px_1fr_1fr_1fr_1fr_1fr_1fr_36px] xl:items-center xl:gap-4 xl:px-0 xl:py-3'
							}

						>
							{/* Index / Number */}
							<div className='flex items-center justify-start text-sm font-semibold sm:col-span-2 lg:col-span-1 lg:justify-center'>
								{index + 1}
							</div>

							{/* Technic select */}
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

							{/* STIR / INN */}
							<div className='col-span-1'>
								<Controller
									control={control}
									name={`items.${index}.stir` as const}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('ИНН')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											<FormPatternInput
												field={field}
												invalid={invalid}
												format='#########'
												mask='_'
												placeholder={t('Введите ИНН')}
												value={field.value}
												onValueChange={async (e) => {
													field.onChange(e.value)
													if (e.value.length === STIR_SIZE) {
														await mutateAsyncCustomer(e.value).then(({ data: customer }) => {
															setValue(`items.${index}.delivery`, customer.data.Наименование)
														})
													}
												}}
											/>
										</FormItem>
									)}
									rules={{
										required: t('ИНН обязателен'),
										minLength: {
											value: 9,
											message: t('Минимум 9 символа')
										}
									}}
								/>
							</div>

							{/* Delivery / Supplier (on small screens span full width under STIR) */}
							<div className='col-span-1 sm:col-span-2 lg:col-span-1'>
								<Controller
									control={control}
									name={`items.${index}.delivery` as const}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Поставщик')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											{isPendingCustomer ? (
												<Skeleton height={44} />
											) : (
												<Input
													disabled={true}
													invalid={invalid}
													type='text'
													placeholder={t('Назв юр лица')}
													value={field.value}
													onChange={field.onChange}
												/>
											)}
										</FormItem>
									)}
									rules={{
										required: t('Поставщик обязателен')
									}}
								/>
							</div>

							{/* Unit value / Count */}
							<div className='col-span-1'>
								<Controller
									control={control}
									name={`items.${index}.unit_value` as const}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Количество')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											<FormNumericInput
												field={field}
												invalid={invalid}
												placeholder={t('Укажите кол-во')}
												value={field.value ? field.value : undefined}
												// onValueChange={(e) => field.onChange(e.floatValue??'')}
												onValueChange={(e) => field.onChange(e.floatValue ?? null)}
											/>
										</FormItem>
									)}
									rules={{
										required: t('Количество обязателен'),
										validate: (v) => (Number(v) > 0 ? true : t('Количество должно быть больше 0'))
									}}
								/>
							</div>

							{/* Price */}
							<div className='col-span-1'>
								<Controller
									control={control}
									name={`items.${index}.price` as const}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Цена')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											<FormNumericInput
												field={field}
												invalid={invalid}
												placeholder={t('Укажите цену')}
												value={field.value ? field.value : undefined}
												// onValueChange={(e) => field.onChange(e.floatValue??'')}
												onValueChange={(e) => field.onChange(e.floatValue ?? null)}
											/>
										</FormItem>
									)}
									rules={{
										required: t('Цена обязателен'),
										validate: (v) => (Number(v) > 0 ? true : t('Цена должна быть больше 0'))
									}}
								/>
							</div>

							{/* Invoice / Contract */}
							<div className='col-span-1'>
								<Controller
									control={control}
									name={`items.${index}.invoice` as const}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Договор')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											<Input
												invalid={invalid}
												type='text'
												placeholder={t('Укажите №договора')}
												value={field.value}
												onChange={field.onChange}
											/>
										</FormItem>
									)}
									rules={{
										required: t('Договор обязателен')
									}}
								/>
							</div>

							{/* Delete button - mobile: after fields; lg: last column */}
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
					))}

					{/* Add button - full width on mobile */}

					<div className='px-4'>
						<div className='w-full sm:w-auto sm:pl-12'>
							<Button
								className='px-5'
								variant='solid'
								size='sm'
								disabled={isPendingCreateStockOperation || fields.length >= ITEMS_MAX_SIZE}
								icon={<HiPlusCircle className='text-white' />}
								type='button'
								onClick={() =>
									append({
										tech: null,
										price: null,
										action: null,
										invoice: '',
										stir: '',
										delivery: '',
										unit_value: null
									} as FormModelItem)
								}
							>
								{t('Добавить')}
							</Button>
						</div>
					</div>
				</div>
			</Drawer>

			<ConfirmDialog
				isOpen={isConfirmOpen}
				type='danger'
				title={t('Вы действительно хотите отменить?')}
				confirmText={t('Ха')}
				cancelText={t('Бекор қилиш')}
				onConfirm={onConfirmDiscard}
				onCancel={onCancelDiscard}
				onClose={onCancelDiscard}
			>
				{t('Введённые данные будут удалены')}
			</ConfirmDialog>


		</>
	)
}

export default IncomingAdd
