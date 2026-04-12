import { useEffect, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ContractApplication, Customer, Sale } from '@/@types/contract.types'
import type { Branch } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { FormNumericInput, FormPatternInput } from '@/components/shared'
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
import { ContractService } from '@/services/contract.service'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { UserService } from '@/services/user.service'
import { useAppSelector } from '@/store'
import useDebounce from '@/utils/hooks/useDebounce'
import { validPhone } from '@/utils/regex'

type Props = {
	refetch?: () => Promise<unknown>
}

type FormModel = Pick<
	ContractApplication,
	'stir' | 'company_name' | 'phone_number' | 'total_amount'
> & {
	branch: number | null
	tech: number | null
	sales: number | null
}

const STIR_SIZE = 9

const NewApplicationsAdd = ({ refetch }: Props) => {
	const { t } = useTranslation()
	const { user } = useAppSelector((state) => state.auth.session)

	const [isOpen, setIsOpen] = useState(false)
	const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
	const [stir, setStir] = useState('')
	const debouncedStir = useDebounce(stir, 500)

	const {
		data: customer,
		isLoading: isLoadingCustomer,
		isSuccess: isSuccessCustomer
	} = useQuery({
		queryKey: ['get customer by inn', debouncedStir],
		queryFn: () => CustomerService.getByInn<Customer>(debouncedStir),
		select: ({ data }) => data,
		enabled: !!debouncedStir && debouncedStir.length === STIR_SIZE
	})

	const { data: branches, isLoading: isLoadingBranches } = useQuery({
		queryKey: ['get branches'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>(),
		select: ({ data }) => data,
		enabled: isOpen
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

	const { mutateAsync: mutateAsyncCreate, isPending: isPendingCreate } = useMutation({
		mutationKey: ['create applications'],
		mutationFn: (data: FormModel) =>
			ContractService.createApplications<ContractApplication, FormModel>(data),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification type='success' title={t('Заявка создана')} duration={2000} />, {
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

	const { control, setValue, handleSubmit } = useForm<FormModel>({
		mode: 'onChange'
	})

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		if (
			!customer ||
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={3000} />, {
				placement: 'top-center'
			})

			return
		}

		const formData: FormModel = {
			...data,
			phone_number: data.phone_number ? '998' + data.phone_number : ''
		}

		await mutateAsyncCreate(formData).finally(() => setIsOpen(false))
	}

	useEffect(() => {
		if (
			isSuccessCustomer &&
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			setValue('company_name', '')
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={2000} />, {
				placement: 'top-center'
			})
		} else if (isSuccessCustomer) {
			setValue('company_name', customer.data.Наименование)
		}
	}, [isSuccessCustomer])

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				{t('Добавить')}
			</Button>

			<Drawer
				title={t('Добавить заявку')}
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
							loading={isPendingCreate}
							onClick={handleSubmit(onSubmit)}
						>
							{t('Добавить')}
						</Button>
					</div>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<Controller
					control={control}
					name={'stir'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('ИНН')} invalid={invalid} errorMessage={error && error.message}>
							<FormPatternInput
								field={field}
								invalid={invalid}
								format='#########'
								mask='_'
								placeholder={t('Введите ИНН')}
								value={field.value}
								onValueChange={(e) => {
									setStir(e.value)
									field.onChange(e.value)
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

				<Controller
					control={control}
					name={'company_name'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Организация')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							{isLoadingCustomer ? (
								<Skeleton height={44} />
							) : (
								<Input
									disabled={true}
									field={field}
									invalid={invalid}
									type='text'
									placeholder={t('Введите название организации')}
									value={field.value}
									onChange={field.onChange}
								/>
							)}
						</FormItem>
					)}
					rules={{
						required: t('Поле обязательно')
					}}
				/>

				<Controller
					control={control}
					name={'phone_number'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Телефон')} invalid={invalid} errorMessage={error && error.message}>
							<FormPatternInput
								field={field}
								invalid={invalid}
								format='## ### ## ##'
								mask='_'
								inputPrefix='+998 '
								placeholder='__-___-__-__'
								value={field.value}
								onValueChange={(e) => field.onChange(e.value)}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Номер телефона обязателен'),
						pattern: {
							value: validPhone,
							message: t('Неверный номер телефона')
						}
					}}
				/>

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
									isDisabled={user.role === UserRoleTextEnum.SALES}
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
											setValue('total_amount', '')
											setValue('sales', null)
										} else {
											field.onChange(null)
											setSelectedBranch(null)
											setValue('tech', null)
											setValue('total_amount', '')
											setValue('sales', null)
										}
									}}
								/>
							</FormItem>
						)
					}}
					rules={{
						required: t('Филиал обязателен')
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
									noOptionsMessage={() => t('Нет техники')}
									placeholder={t('Выберите технику')}
									options={options}
									value={options.filter((option) => option.value === field.value)}
									onChange={(option) => {
										if (option) {
											field.onChange(option.value)
											const tech = techs?.find((t) => t.id === option.value)
											if (tech) setValue('total_amount', tech.price)
										} else {
											field.onChange(null)
											setValue('total_amount', '')
										}
									}}
								/>
							</FormItem>
						)
					}}
					rules={{
						required: t('Техника обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'total_amount'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem label={t('Сумма')} invalid={invalid} errorMessage={error && error.message}>
							<FormNumericInput
								field={field}
								invalid={invalid}
								placeholder={t('Введите сумму')}
								disabled={true}
								value={field.value}
								onValueChange={(e) => field.onChange(e.floatValue??'')}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Поле обязательно')
					}}
				/>

				{user.role === UserRoleTextEnum.MARKETING && (
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
										invalid={invalid}
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
						rules={{
							required: t('Исполнитель обязателен')
						}}
					/>
				)}
			</Drawer>
		</>
	)
}

export default NewApplicationsAdd
