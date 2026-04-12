import { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { pdf, PDFViewer } from '@react-pdf/renderer'
import { useMutation, useQuery } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import { Contract, ContractLoanTypeEnum, Customer, DefaultContract } from '@/@types/contract.types'
import { ConstMetric } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { FormNumericInput, FormPatternInput } from '@/components/shared'
import {
	Button,
	DatePicker,
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
import { formatDate, numToWordUz } from '@/utils/format'
import useDebounce from '@/utils/hooks/useDebounce'
// import useResponsive from '@/utils/hooks/useResponsive'
import ContractDocument from '../../add/ContractDocument'

type Props = {
	contract: Contract
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
	refetch?: () => Promise<unknown>
}

export type FormModel = Omit<Contract, 'id' | 'pkm' | 'created_at'> & {
	pkm: number | null
	pkm_top_content: string | null
	pkm_bottom_content: string | null
}

export type PaymentRow = {
	number: number
	balance: number
	date: Date | Dayjs | string
	days: number
	principal: number
	interest: number
	total: number
}

const STIR_SIZE = 9

const ReplaceTechDrawer = ({ contract, isOpen, setIsOpen, refetch }: Props) => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	// const { windowWidth, larger } = useResponsive()

	const [selectedTech, setSelectedTech] = useState(contract.tech_obj)
	const [stir, setStir] = useState(contract.stir)
	const debouncedStir = useDebounce(stir, 500)
	const [tableData, setTableData] = useState<PaymentRow[] | null>(null)
	const [totals, setTotals] = useState<{
		totalPrincipal: number
		totalInterest: number
		totalAmount: number
	} | null>(null)

	const { data: newContract, isLoading: isLoadingNewContract } = useQuery({
		queryKey: ['get new contract'],
		queryFn: () => ContractService.getNewContract<DefaultContract>({ region: contract.region }),
		select: ({ data }) => data
	})
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
	const { data: techs, isLoading: isLoadingTechs } = useQuery({
		queryKey: ['get techs'],
		queryFn: () => TechService.getAllTechs<Tech[]>({ region: contract.region }),
		select: ({ data }) => data
	})
	const { data: metric, isLoading: isLoadingMetric } = useQuery({
		queryKey: ['get const metric by id'],
		queryFn: () => DatasetService.getConstMetricById<ConstMetric>(1),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncReplaceTech, isPending: isPendingReplaceTech } = useMutation({
		mutationKey: ['update replace tech'],
		mutationFn: ({ id, data }: { id: number; data: FormData }) =>
			ContractService.updateReplaceTech(id, data),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification title={t('Техника заменено')} type='success' duration={2500} />, {
				placement: 'top-center'
			})
			navigate('/clients/new-contracts')
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setIsOpen(false)
		}
	})

	const { control, setValue, watch, handleSubmit, reset } = useForm<FormModel>({
		mode: 'onChange'
	})

	const deposit_percentage = watch('deposit_percentage')
	const	rent_percent = watch('rent_percent')
	const	rent_period = watch('rent_period')
	const	contract_date = watch('contract_date')
	const	loan_type = watch('loan_type')

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

		if (!newContract || !customer || !metric) {
			toast.push(
				<Notification type='danger' title='Ошибка при заполнении формы' duration={3000} />,
				{
					placement: 'top-center'
				}
			)

			return
		}

		const pdfBlob = await pdf(
			<ContractDocument
				values={data}
				contract={newContract}
				customer={customer}
				metric={metric}
				tech={selectedTech}
				tableData={tableData}
				totals={totals}
			/>
		).toBlob()

		const pdfUrl = URL.createObjectURL(pdfBlob)
		const pdfMimeType = pdfBlob.type
		const pdfExtension = pdfMimeType.split('/')[1]
		const pdfFileName = pdfUrl.split('/').pop() || 'file'
		const pdfDocument = new File([pdfBlob], `${pdfFileName}.${pdfExtension}`, { type: pdfMimeType })

		const formData = new FormData()

		formData.append('pdf_document', pdfDocument)
		formData.append('code', data.code)
		formData.append('contract_date', formatDate(data.contract_date, 'YYYY-MM-DD'))
		formData.append('region', String(data.region))
		formData.append('branch_region', data.branch_region)
		formData.append('branch_city', data.branch_city)
		formData.append('branch_street', data.branch_street)
		formData.append('branch_house', data.branch_house)
		formData.append('branch_director', data.branch_director)
		formData.append('procuration_date', formatDate(data.procuration_date, 'YYYY-MM-DD'))
		formData.append('procuration_number', String(data.procuration_number))
		formData.append('tech', String(data.tech))
		formData.append('tech_model', data.tech_model)
		formData.append('tech_type', data.tech_type)
		formData.append('tech_manufacturer', data.tech_manufacturer)
		formData.append('deposit_percentage', data.deposit_percentage)
		formData.append('price_with_vat', data.price_with_vat)
		formData.append('price_with_vat_in_words', data.price_with_vat_in_words)
		formData.append('price_with_gps', data.price_with_gps)
		formData.append('price_with_gps_in_words', data.price_with_gps_in_words)
		formData.append('rent_percent', data.rent_percent)
		formData.append('rent_percent_in_words', data.rent_percent_in_words)
		formData.append('rent_period', String(data.rent_period))
		formData.append('rent_period_in_words', data.rent_period_in_words)
		formData.append('loan_type', String(data.loan_type))
		formData.append('payment_period', String(data.payment_period))
		formData.append('client_company_name', data.client_company_name)
		formData.append('client_director', data.client_director)
		formData.append('client_district', data.client_district)
		formData.append('client_village', data.client_village)
		formData.append('client_bank', data.client_bank)
		formData.append('hr', data.hr)
		formData.append('mfo', data.mfo)
		formData.append('stir', data.stir)
		formData.append('oked', data.oked)
		formData.append('fond', String(data.fond))
		formData.append('dummy_contract', String(data.dummy_contract))
		if (data.pkm) formData.append('pkm', String(data.pkm))

		await mutateAsyncReplaceTech({ id: contract.id, data: formData })
	}

	useEffect(() => {
		if (
			isSuccessCustomer &&
			customer.data.СообщитьПользователю ===
				'Ошибка на стороне поставщика сервиса. Сервис не доступен'
		) {
			toast.push(<Notification type='danger' title='Не действительный ИНН' duration={2000} />, {
				placement: 'top-center'
			})

			setValue('client_company_name', '')
			setValue('hr', '')
			setValue('client_district', '')
			setValue('client_village', '')
			setValue('mfo', '')
			setValue('oked', '')
			setValue('client_bank', '')
		} else if (isSuccessCustomer) {
			setValue('client_company_name', customer.data.Наименование)
			setValue('hr', customer.data.ОсновнойРасчетныйСчет)
			setValue('client_district', customer.data.Адрес)
			setValue('client_village', customer.data.Адрес)
			setValue('mfo', customer.data.БанкМФО)
			setValue('oked', customer.data.КодОКЕД)
			setValue('client_bank', customer.data.БанкНаименование)
		}
	}, [isSuccessCustomer])

	useEffect(() => {
		if (contract) {
			reset({
				...contract,
				deposit_percentage: Number(contract.deposit_percentage).toFixed(0),
				price_with_vat: Number(contract.price_with_vat).toFixed(0),
				price_with_gps: Number(contract.price_with_gps).toFixed(0),
				rent_percent: Number(contract.rent_percent).toFixed(0),
				contract_date: new Date(contract.contract_date),
				pkm: contract.pkm ? contract.pkm.id : null,
				pkm_top_content: contract.pkm ? contract.pkm.top_content : null,
				pkm_bottom_content: contract.pkm ? contract.pkm.bottom_content : null
			})
		}
	}, [contract, reset])

	useEffect(() => {
		if (!selectedTech || !deposit_percentage || !rent_percent || !rent_period || !contract_date || !loan_type) return

		const creditAmount = Number(selectedTech.tech_price_with_vat) * (1 - Number(deposit_percentage) / 100)
		const annualRate = Number(rent_percent)
		const months = Number(rent_period).toFixed(0)
		const quarterlyRate = annualRate / 4 / 100
		const totalPayments = Number(months) / 3
		const startDate = dayjs(contract_date)

		const payments: PaymentRow[] = []
		let balance = creditAmount
		let prevDate = startDate

		const passedDays = startDate.date() - 1
		const daysIn0 = startDate.daysInMonth()
		const daysIn1 = startDate.add(1, 'month').daysInMonth()
		const daysIn2 = startDate.add(2, 'month').daysInMonth()
		const daysFirst = daysIn0 + daysIn1 + daysIn2 - passedDays
		const firstPaymentDate = startDate.add(daysFirst, 'day')

		if (loan_type === ContractLoanTypeEnum.ANNUITY) {
			const annuityPayment =
				(creditAmount * quarterlyRate * Math.pow(1 + quarterlyRate, totalPayments)) /
				(Math.pow(1 + quarterlyRate, totalPayments) - 1)

			for (let i = 1; i <= totalPayments; i++) {
				const currentDate = i === 1 ? firstPaymentDate : prevDate.add(3, 'month')
				const days = currentDate.diff(prevDate, 'day')

				const interest = +(balance * quarterlyRate).toFixed(2)
				const principal = +(annuityPayment - interest).toFixed(2)
				balance = +(balance - principal).toFixed(2)

				payments.push({
					number: i,
					balance: Math.max(balance, 0),
					date: currentDate.subtract(1, 'day'),
					days,
					principal,
					interest,
					total: +(principal + interest).toFixed(2)
				})

				prevDate = currentDate
			}
		}

		else if (loan_type === ContractLoanTypeEnum.DIFFERENTIATED) {
			const principalPart = +(creditAmount / totalPayments).toFixed(2)

			for (let i = 1; i <= totalPayments; i++) {
				const currentDate = i === 1 ? firstPaymentDate : prevDate.add(3, 'month')
				const days = currentDate.diff(prevDate, 'day')

				const interest = +(balance * quarterlyRate).toFixed(2)
				const principal = principalPart
				const total = +(principal + interest).toFixed(2)
				balance = +(balance - principal).toFixed(2)

				payments.push({
					number: i,
					balance: Math.max(balance, 0),
					date: currentDate.subtract(1, 'day'),
					days,
					principal,
					interest,
					total
				})

				prevDate = currentDate
			}
		}

		const totalPrincipal = +payments.reduce((s, r) => s + r.principal, 0).toFixed(2)
		const totalInterest = +payments.reduce((s, r) => s + r.interest, 0).toFixed(2)
		const diff = creditAmount - +totalPrincipal
		if (Math.abs(diff) > 0.5 && payments.length > 0) {
			payments[payments.length - 1].principal = +(
				payments[payments.length - 1].principal + diff
			).toFixed(2)
			payments[payments.length - 1].total = +(payments[payments.length - 1].total + diff).toFixed(2)
		}

		setTableData(payments)
		setTotals({
			totalPrincipal: Math.round(creditAmount),
			totalInterest: Math.round(+totalInterest),
			totalAmount: Math.round(creditAmount + +totalInterest)
		})
	}, [selectedTech, deposit_percentage, rent_percent, rent_period, contract_date, loan_type])

	return (
		<Drawer
			// width={larger.lg ? windowWidth - 315 : windowWidth}
			title={t('Замена техники')}
			isOpen={isOpen}
			footer={
				<div className='ml-auto grid grid-cols-2 gap-2'>
					<Button
						size='md'
						className='grow'
						disabled={isPendingReplaceTech}
						onClick={() => setIsOpen(false)}
					>
						{t('Отмена')}
					</Button>
					<Button
						size='md'
						variant='solid'
						className='grow'
						loading={isPendingReplaceTech}
						onClick={handleSubmit(onSubmit)}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
			placement='right'
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
			<div className='grid grid-cols-3 gap-8'>
				<div className='col-span-2 hidden'>
					{isLoadingNewContract || isLoadingCustomer || isLoadingTechs || isLoadingMetric ? (
						<Skeleton className='h-full w-full' />
					) : (
						<PDFViewer style={{ width: '100%', height: '100%', marginBottom: 24 }}>
							<ContractDocument
								values={{
									code: watch('code'),
									contract_date: watch('contract_date'),
									region: watch('region'),
									branch_region: watch('branch_region'),
									branch_city: watch('branch_city'),
									branch_street: watch('branch_street'),
									branch_house: watch('branch_house'),
									branch_director: watch('branch_director'),
									procuration_date: watch('procuration_date'),
									procuration_number: watch('procuration_number'),
									tech: watch('tech'),
									tech_model: watch('tech_model'),
									tech_type: watch('tech_type'),
									tech_manufacturer: watch('tech_manufacturer'),
									tech_obj: watch('tech_obj'),
									deposit_percentage: watch('deposit_percentage'),
									price_with_vat: watch('price_with_vat'),
									price_with_vat_in_words: watch('price_with_vat_in_words'),
									price_with_gps: watch('price_with_gps'),
									price_with_gps_in_words: watch('price_with_gps_in_words'),
									rent_percent: watch('rent_percent'),
									rent_percent_in_words: watch('rent_percent_in_words'),
									rent_period: watch('rent_period'),
									rent_period_in_words: watch('rent_period_in_words'),
									loan_type: watch('loan_type'),
									payment_period: watch('payment_period'),
									client_company_name: watch('client_company_name'),
									client_director: watch('client_director'),
									client_district: watch('client_district'),
									client_village: watch('client_village'),
									client_bank: watch('client_bank'),
									hr: watch('hr'),
									mfo: watch('mfo'),
									stir: watch('stir'),
									oked: watch('oked'),
									fond: watch('fond'),
									dummy_contract: watch('dummy_contract'),
									pdf_document: watch('pdf_document'),
									contract_application: watch('contract_application'),
									pkm: watch('pkm'),
									pkm_top_content: watch('pkm_top_content'),
									pkm_bottom_content: watch('pkm_bottom_content'),
									files: watch('files'),
									new_files: watch('new_files'),
									deleted_files: watch('deleted_files')
								}}
								contract={newContract}
								customer={customer}
								metric={metric}
								tech={selectedTech}
								tableData={tableData}
								totals={totals}
							/>
						</PDFViewer>
					)}
				</div>

				<div className='col-span-3'>
					<div className='grid grid-cols-2 gap-4'>
						<Controller
							control={control}
							name={'code'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem
									label={t('Номер договора')}
									invalid={invalid}
									errorMessage={error && error.message}
								>
									<Input
										disabled={true}
										type='text'
										placeholder={t('Введите номер')}
										value={field.value}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
							rules={{
								required: t('Номер договора обязателен')
							}}
						/>

						<Controller
							control={control}
							name={'contract_date'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem
									label={t('Дата договора')}
									invalid={invalid}
									errorMessage={error && error.message}
								>
									<DatePicker
										field={field}
										disabled={true}
										clearable
										placeholder={t('Выберите дату')}
										inputFormat='DD.MM.YYYY'
										value={field.value as Date}
										onChange={(date) => field.onChange(date)}
									/>
								</FormItem>
							)}
							rules={{
								required: t('Дата договора обязателен')
							}}
						/>
					</div>

					<Controller
						control={control}
						name={'stir'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem label={t('ИНН')} invalid={invalid} errorMessage={error && error.message}>
								<FormPatternInput
									disabled={true}
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
										isLoading={isLoadingTechs || isLoadingMetric}
										noOptionsMessage={() => t('Нет техники')}
										placeholder={t('Выберите технику')}
										options={options}
										value={options.filter((option) => option.value === field.value)}
										onChange={(option) => {
											if (option) {
												field.onChange(option.value)
												const tech = techs?.find((t) => t.id === option.value)

												if (tech) {
													setSelectedTech(tech)
													setValue('tech_model', tech.model_name_uz)
													setValue('tech_type', tech.type.name_uz)
													setValue('tech_manufacturer', tech.manufacturer.name_uz)

													if (metric) {
														const price_with_vat =
															Number(tech.tech_price_with_vat)
														const price_with_gps =
															price_with_vat + Number(metric.gps) * (1 + Number(metric.vat) / 100)

														setValue('price_with_vat', String(price_with_vat.toFixed(0)))
														setValue(
															'price_with_vat_in_words',
															numToWordUz(price_with_vat.toFixed(0))
														)
														setValue('price_with_gps', String(price_with_gps.toFixed(0)))
														setValue(
															'price_with_gps_in_words',
															numToWordUz(price_with_gps.toFixed(0))
														)
													}
												}
											} else {
												field.onChange(null)
												setValue('price_with_vat', '')
												setValue('price_with_vat_in_words', '')
												setValue('price_with_gps', '')
												setValue('price_with_gps_in_words', '')
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
						name={'deposit_percentage'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem label={t('Аванс')} invalid={invalid} errorMessage={error && error.message}>
								{isLoadingMetric ? (
									<Skeleton height={44} />
								) : (
									<FormNumericInput
										disabled={true}
										field={field}
										invalid={invalid}
										suffix='%'
										placeholder={t('Введите % аванса')}
										value={field.value}
										onValueChange={(e) => field.onChange(e.value??'')}
									/>
								)}
							</FormItem>
						)}
						rules={{
							required: t('Аванс обязателен')
						}}
					/>

					<Controller
						control={control}
						name={'rent_percent'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Процент лизинга')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<FormNumericInput
									disabled={true}
									field={field}
									invalid={invalid}
									suffix='%'
									placeholder={t('Укажите %')}
									value={field.value}
									onValueChange={(e) => {
										field.onChange(e.value??'')
										if (e.floatValue) setValue('rent_percent_in_words', numToWordUz(e.floatValue))
									}}
								/>
							</FormItem>
						)}
						rules={{
							required: t('Поле обязателен')
						}}
					/>

					<Controller
						control={control}
						name={'rent_period'}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Срок лизинга (мес.)')}
								invalid={invalid}
								errorMessage={error && error.message}
							>
								<FormNumericInput
									disabled={true}
									field={field}
									invalid={invalid}
									placeholder={t('Укажите кол-во')}
									value={field.value}
									onValueChange={(e) => {
										field.onChange(e.floatValue??'')
										if (e.floatValue) setValue('rent_period_in_words', numToWordUz(e.floatValue))
									}}
								/>
							</FormItem>
						)}
						rules={{
							required: t('Поле обязателен')
						}}
					/>
				</div>
			</div>
		</Drawer>
	)
}

export default ReplaceTechDrawer
