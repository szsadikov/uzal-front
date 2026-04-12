import { useEffect, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiOutlineUpload } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { pdf } from '@react-pdf/renderer'
import { useMutation, useQuery } from '@tanstack/react-query'
import dayjs, { Dayjs } from 'dayjs'
import { FileType } from '@/@types/common'
import {
	Contract,
	ContractLoanTypeEnum,
	ContractPaymentPeriodEnum,
	Customer,
	DefaultContract,
	Pkm
} from '@/@types/contract.types'
import { Branch, ConstMetric } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import {
	AdaptableCard,
	ConfirmDialog,
	FormNumericInput,
	FormPatternInput
} from '@/components/shared'
import {
	Button,
	Checkbox,
	DatePicker,
	FormItem,
	Input,
	Notification,
	Option,
	Radio,
	ScrollBar,
	Select,
	Skeleton,
	toast,
	Upload
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { useAppSelector } from '@/store'
import { formatDate, numToWordUz } from '@/utils/format'
import useDebounce from '@/utils/hooks/useDebounce'
import ContractDocument from './ContractDocument'
import ContractPreview from './ContractPreview'

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

const REGION_ID = 4
const STIR_SIZE = 9

const NewContractsAdd = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { direction } = useAppSelector((state) => state.theme)
	const { user } = useAppSelector((state) => state.auth.session)

	const [isCancelDialogOpen, setCancelDialogIsOpen] = useState(false)
	const [stir, setStir] = useState('')
	const debouncedStir = useDebounce(stir, 500)
	const [selectedTech, setSelectedTech] = useState<Tech | null>(null)
	const [selectedBranchRegion, setSelectedBranchRegion] = useState<number | null>(null)

	const [tableData, setTableData] = useState<PaymentRow[] | null>(null)
	const [totals, setTotals] = useState<{
		totalPrincipal: number
		totalInterest: number
		totalAmount: number
	} | null>(null)

	const { data: newContract, isLoading: isLoadingNewContract } = useQuery({
		queryKey: ['get new contract'],
		queryFn: () =>
			ContractService.getNewContract<DefaultContract>({
				region: user.region ? user.region.id : REGION_ID
			}),
		select: ({ data }) => data
	})
	const { data: pkms, isLoading: isLoadingPkms } = useQuery({
		queryKey: ['get pkms'],
		queryFn: () => DatasetService.getAllPkm<Pkm[]>(),
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
		queryKey: ['get techs', selectedBranchRegion],
		queryFn: () =>
			TechService.getAllTechs<Tech[]>({
				region: selectedBranchRegion ?? (user.region ? user.region.id : REGION_ID)
			}),
		select: ({ data }) => data,
		enabled: !!selectedBranchRegion // Faqat filial tanlanganda ishlaydi
	})

	const { data: metric, isLoading: isLoadingMetric } = useQuery({
		queryKey: ['get const metric by id'],
		queryFn: () => DatasetService.getConstMetricById<ConstMetric>(1),
		select: ({ data }) => data
	})
	const { data: branches, isLoading: isLoadingBranches } = useQuery({
		queryKey: ['get branches'],
		queryFn: () =>
			DatasetService.getAllBranches<Branch[]>({ region: user.region ? user.region.id : REGION_ID }),
		select: (res) => res.data
	})

	const { mutateAsync: mutateAsyncCreate, isPending: isPendingCreate } = useMutation({
		mutationKey: ['create contract'],
		mutationFn: (data: FormData) => ContractService.create<Contract, FormData>(data),
		onSuccess() {
			toast.push(<Notification type='success' title={t('Договор создан')} duration={2000} />, {
				placement: 'top-center'
			})
			navigate('/clients/new-contracts')
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const isLoading =
		isLoadingNewContract ||
		isLoadingPkms ||
		isLoadingCustomer ||
		isLoadingTechs ||
		isLoadingMetric ||
		isLoadingBranches

	const { control, setValue, handleSubmit, reset, watch } = useForm<FormModel>({
		mode: 'onChange'
	})

	const files = watch('files') || []
	const new_files = watch('new_files') || []

	const deposit_percentage = watch('deposit_percentage')
	const rent_percent = watch('rent_percent')
	const rent_period = watch('rent_period')
	const contract_date = watch('contract_date')
	const loan_type = watch('loan_type')
	const payment_period = watch('payment_period')
	// const selectedBranchRegion = watch('branch_region')

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

		if (!newContract || !customer || !metric || !selectedTech) {
			toast.push(
				<Notification type='danger' title={t('Ошибка при заполнении формы')} duration={3000} />,
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

		// --- branchSelected va nomni aniq olish ---
		const branchSelected: Branch | undefined = branches?.find(
			(b) =>
				// agar data.branch_region raqam sifatida kelishi mumkin bo'lsa Number qilib solishtiramiz
				b.id === (Number(data.branch_region))
		)

		// fallback: agar topilmasa va data.branch_region aslida nom bo'lsa, shuni ishlatamiz
		const branchRegionName: string = branchSelected
			? branchSelected.region.name_latin
			: data.branch_region
				? String(data.branch_region)
				: ''

		formData.append('pdf_document', pdfDocument)
		formData.append('code', data.code)
		formData.append('contract_date', formatDate(data.contract_date, 'YYYY-MM-DD'))
		formData.append('region', String(data.branch_region))
		formData.append('branch_region', branchRegionName)
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

		await mutateAsyncCreate(formData)
	}

	const onCancelConfirm = () => {
		navigate('/clients/new-contracts')
	}

	const beforeUpload = (file: FileList | null) => {
		let valid: boolean | string = true
		const allowedFileType = ['application/pdf']
		const maxFileSize = 10 * 1024 * 1024 // 10 MB

		if (file) {
			for (const f of file) {
				if (!allowedFileType.includes(f.type)) {
					valid = t('Пожалуйста, загрузите .pdf файл!')
				}

				if (f.size >= maxFileSize) {
					valid = t('Размер файла не должен превышать 10 МБ!')
				}
			}
		}

		return valid
	}

	const handleUpload = async (fileList: File[]) => {
		const latestUpload = fileList.length - 1
		const file: FileType = {
			id: fileList.length,
			file: URL.createObjectURL(fileList[latestUpload]),
			file_name: fileList[latestUpload].name,
			file_type: fileList[latestUpload].type,
			file_size: fileList[latestUpload].size
		}
		setValue('files', [...files, ...[file]])
		setValue('new_files', [...(new_files || []), ...[file]])
	}

	const handleDelete = (deletedFileList: File[]) => {
		console.log('deletedFileList', deletedFileList)
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
		if (newContract && metric) {
			reset({
				contract_date: new Date(),
				fond: false,
				dummy_contract: false,
				code: newContract.contract_number,
				region: user.region ? user.region.id : REGION_ID,
				branch_director: `${newContract.branch.director_first_name} ${newContract.branch.director_last_name} ${newContract.branch.director_middle_name}`,
				procuration_date: newContract.branch.procuration_date,
				procuration_number: newContract.branch.procuration_number,
				deposit_percentage: String(Number(metric.min_deposit_percentage).toFixed(0)),
				files: []
			})
		}
	}, [newContract, metric, reset])

	useEffect(() => {
		if (
			!selectedTech ||
			!deposit_percentage ||
			!rent_percent ||
			!rent_period ||
			!contract_date ||
			!loan_type ||
			!payment_period
		)
			return

		const creditAmount = Number(selectedTech.tech_price_with_vat) * (1 - Number(deposit_percentage) / 100)
		const annualRate = Number(rent_percent)
		const months = Number(rent_period)
		const paymentPeriod = payment_period
		const isQuarter = paymentPeriod === ContractPaymentPeriodEnum.QUARTER

		const periodRate = annualRate / (isQuarter ? 4 : 12) / 100
		const totalPayments = months / (isQuarter ? 3 : 1)
		const startDate = dayjs(contract_date)

		const payments: PaymentRow[] = []
		let balance = creditAmount
		let prevDate = startDate

		const passedDays = startDate.date() - 1
		const daysIn0 = startDate.daysInMonth()
		const daysIn1 = startDate.add(1, 'month').daysInMonth()
		const daysIn2 = startDate.add(2, 'month').daysInMonth()

		const daysFirst = isQuarter
			? daysIn0 + daysIn1 + daysIn2 - passedDays // квартал
			: daysIn0 - passedDays // месяц

		const firstPaymentDate = startDate.add(daysFirst, 'day')

		if (loan_type === ContractLoanTypeEnum.ANNUITY) {
			const annuityPayment =
				(creditAmount * periodRate * Math.pow(1 + periodRate, totalPayments)) /
				(Math.pow(1 + periodRate, totalPayments) - 1)

			for (let i = 1; i <= totalPayments; i++) {
				const currentDate = i === 1 ? firstPaymentDate : prevDate.add(isQuarter ? 3 : 1, 'month')

				const days = currentDate.diff(prevDate, 'day')
				const displayDate = currentDate.subtract(1, 'day')

				const interest = +(balance * periodRate).toFixed(2)
				const principal = +(annuityPayment - interest).toFixed(2)
				balance = +(balance - principal).toFixed(2)

				payments.push({
					number: i,
					balance: Math.max(balance, 0),
					date: displayDate,
					days,
					principal,
					interest,
					total: +(principal + interest).toFixed(2)
				})

				prevDate = currentDate
			}
		} else if (loan_type === ContractLoanTypeEnum.DIFFERENTIATED) {
			const principalPart = +(creditAmount / totalPayments).toFixed(2)

			for (let i = 1; i <= totalPayments; i++) {
				const currentDate = i === 1 ? firstPaymentDate : prevDate.add(isQuarter ? 3 : 1, 'month')

				const days = currentDate.diff(prevDate, 'day')
				const displayDate = currentDate.subtract(1, 'day')

				const interest = +(balance * periodRate).toFixed(2)
				const total = +(principalPart + interest).toFixed(2)
				balance = +(balance - principalPart).toFixed(2)

				payments.push({
					number: i,
					balance: Math.max(balance, 0),
					date: displayDate,
					days,
					principal: principalPart,
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
	}, [
		selectedTech,
		deposit_percentage,
		rent_percent,
		rent_period,
		contract_date,
		loan_type,
		payment_period
	])

	return (
		<>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='relative -mx-8 -my-6 flex flex-col px-2 lg:flex-row'
			>
				{/*<AdaptableCard className='h-full grow px-4 py-4 2xl:px-8 2xl:py-6' bodyClass='h-full'>*/}
				<AdaptableCard

					className='h-full w-full grow overflow-hidden px-4 py-4 lg:px-6 lg:py-6'
					bodyClass='h-full overflow-hidden'
				>
					<ScrollBar autoHide direction={direction} className='h-full'>
						<div className='mx-auto w-full max-w-[794px]'>
							<h3 className='mb-6 flex flex-wrap items-center'>{t('Новый договор')}</h3>

							{/*{isLoading ? (*/}
							{/*	<Skeleton className='h-full w-full' />*/}
							{/*) : (*/}
							{/*	<PDFViewer style={{ width: '100%', height: '100%', marginBottom: 24 }}>*/}
							{/*		<ContractDocument*/}
							{/*			values={{*/}
							{/*				code: watch('code'),*/}
							{/*				contract_date: watch('contract_date'),*/}
							{/*				region: watch('region'),*/}
							{/*				branch_region: watch('branch_region'),*/}
							{/*				branch_city: watch('branch_city'),*/}
							{/*				branch_street: watch('branch_street'),*/}
							{/*				branch_house: watch('branch_house'),*/}
							{/*				branch_director: watch('branch_director'),*/}
							{/*				procuration_date: watch('procuration_date'),*/}
							{/*				procuration_number: watch('procuration_number'),*/}
							{/*				tech: watch('tech'),*/}
							{/*				tech_model: watch('tech_model'),*/}
							{/*				tech_type: watch('tech_type'),*/}
							{/*				tech_manufacturer: watch('tech_manufacturer'),*/}
							{/*				tech_obj: watch('tech_obj'),*/}
							{/*				deposit_percentage: watch('deposit_percentage'),*/}
							{/*				price_with_vat: watch('price_with_vat'),*/}
							{/*				price_with_vat_in_words: watch('price_with_vat_in_words'),*/}
							{/*				price_with_gps: watch('price_with_gps'),*/}
							{/*				price_with_gps_in_words: watch('price_with_gps_in_words'),*/}
							{/*				rent_percent: watch('rent_percent'),*/}
							{/*				rent_percent_in_words: watch('rent_percent_in_words'),*/}
							{/*				rent_period: watch('rent_period'),*/}
							{/*				rent_period_in_words: watch('rent_period_in_words'),*/}
							{/*				loan_type: watch('loan_type'),*/}
							{/*				payment_period: watch('payment_period'),*/}
							{/*				client_company_name: watch('client_company_name'),*/}
							{/*				client_director: watch('client_director'),*/}
							{/*				client_district: watch('client_district'),*/}
							{/*				client_village: watch('client_village'),*/}
							{/*				client_bank: watch('client_bank'),*/}
							{/*				hr: watch('hr'),*/}
							{/*				mfo: watch('mfo'),*/}
							{/*				stir: watch('stir'),*/}
							{/*				oked: watch('oked'),*/}
							{/*				fond: watch('fond'),*/}
							{/*				dummy_contract: watch('dummy_contract'),*/}
							{/*				pdf_document: watch('pdf_document'),*/}
							{/*				contract_application: watch('contract_application'),*/}
							{/*				pkm: watch('pkm'),*/}
							{/*				pkm_top_content: watch('pkm_top_content'),*/}
							{/*				pkm_bottom_content: watch('pkm_bottom_content'),*/}
							{/*				files: watch('files'),*/}
							{/*				new_files: watch('new_files'),*/}
							{/*				deleted_files: watch('deleted_files')*/}
							{/*			}}*/}
							{/*			contract={newContract}*/}
							{/*			customer={customer}*/}
							{/*			metric={metric}*/}
							{/*			tech={selectedTech}*/}
							{/*			tableData={tableData}*/}
							{/*			totals={totals}*/}
							{/*		/>*/}
							{/*	</PDFViewer>*/}
							{/*)}*/}

							<ContractPreview
								isLoading={isLoading}
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
						</div>
					</ScrollBar>
				</AdaptableCard>

				<AdaptableCard
					className='h-[calc(100vh-65px)] w-full flex-shrink-0 rounded-none bg-gray-100 lg:sticky lg:top-[65px] lg:w-[420px] xl:w-[420px] 2xl:w-[520px] dark:bg-gray-900'
					bodyClass='h-full overflow-hidden'
				>
					<div className='flex h-full flex-col'>
						<div className='flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-6'>
							<ScrollBar autoHide direction={direction} className='h-full grow'>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<Controller
										control={control}
										name={'code'}
										render={({ field, fieldState: { invalid, error } }) => (
											<FormItem
												label={t('Номер договора')}
												invalid={invalid}
												errorMessage={error && error.message}
											>
												{isLoadingNewContract ? (
													<Skeleton height={44} />
												) : (
													<Input
														disabled={true}
														type='text'
														placeholder={t('Введите номер')}
														value={field.value}
														onChange={field.onChange}
													/>
												)}
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
									name={'pkm'}
									render={({ field, fieldState: { invalid, error } }) => {
										const options: Option[] = pkms
											? pkms.map((pkm) => ({
													label: pkm.name,
													value: pkm.id
												}))
											: []

										return (
											<FormItem
												label={t('Источник финансирования')}
												invalid={invalid}
												errorMessage={error && error.message}
											>
												<Select
													field={field}
													isClearable
													isLoading={isLoadingPkms}
													noOptionsMessage={() => t('Нет ПКМ')}
													placeholder={t('Выберите ПКМ')}
													options={options}
													value={options.filter((option) => option.value === field.value)}
													onChange={(option) => {
														if (option) {
															field.onChange(option.value)
															const pkm = pkms?.find((p) => p.id === option.value)
															if (pkm) {
																setValue('pkm_top_content', pkm.top_content)
																setValue('pkm_bottom_content', pkm.bottom_content)
															}
														} else {
															field.onChange(null)
															setValue('pkm_top_content', '')
															setValue('pkm_bottom_content', '')
														}
													}}
												/>
											</FormItem>
										)
									}}
								/>
								<Controller
									control={control}
									name={'stir'}
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
									name={'client_company_name'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Наименование организации')}
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
													placeholder={t('Введите наименование')}
													value={field.value}
													onChange={field.onChange}
												/>
											)}
										</FormItem>
									)}
									rules={{
										required: t('Наименование организации обязателен')
									}}
								/>
								<Controller
									control={control}
									name={'hr'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Расчетный счет')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											{isLoadingCustomer ? (
												<Skeleton height={44} />
											) : (
												<FormPatternInput
													disabled={true}
													field={field}
													invalid={invalid}
													format='####################'
													mask='_'
													placeholder={t('Укажите расчетный счет')}
													value={field.value}
													onValueChange={(e) => field.onChange(e.value)}
												/>
											)}
										</FormItem>
									)}
									rules={{
										required: t('Расчетный счет обязателен'),
										minLength: {
											value: 20,
											message: t('Минимум 20 символа')
										}
									}}
								/>
								<Controller
									control={control}
									name={'client_director'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Директор организации')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
											<Input
												field={field}
												invalid={invalid}
												type='text'
												placeholder={t('Введите ФИО')}
												value={field.value}
												onChange={field.onChange}
											/>
										</FormItem>
									)}
									rules={{
										required: t('Директор организации обязателен')
									}}
								/>
								<Controller
									control={control}
									name={'client_district'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Адрес организации')}
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
													placeholder={t('Введите адрес')}
													value={field.value}
													onChange={field.onChange}
												/>
											)}
										</FormItem>
									)}
									rules={{
										required: t('Адрес организации обязателен')
									}}
								/>

								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
									<Controller
										control={control}
										name={'mfo'}
										render={({ field, fieldState: { invalid, error } }) => (
											<FormItem
												label={t('МФО')}
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
														placeholder={t('Введите МФО')}
														value={field.value}
														onChange={field.onChange}
													/>
												)}
											</FormItem>
										)}
										rules={{
											required: t('МФО обязателен')
										}}
									/>

									<Controller
										control={control}
										name={'oked'}
										render={({ field, fieldState: { invalid, error } }) => (
											<FormItem
												label={t('ОКЕД')}
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
														placeholder={t('Введите ОКЕД')}
														value={field.value}
														onChange={field.onChange}
													/>
												)}
											</FormItem>
										)}
										rules={{
											required: t('ОКЕД обязателен')
										}}
									/>
								</div>
								<Controller
									control={control}
									name={'client_bank'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem
											label={t('Наименование банка')}
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
													placeholder={t('Введите наименование банка')}
													value={field.value}
													onChange={field.onChange}
												/>
											)}
										</FormItem>
									)}
									rules={{
										required: t('Наименование банка обязателен')
									}}
								/>

								<Controller
									control={control}
									name={'branch_region'} // endi formda filial ID saqlanadi
									render={({ field, fieldState: { invalid, error } }) => {
										const options: Option[] = branches
											? branches.map((branch) => ({
													label: branch.region.name_latin, // ko'rsatiladigan nom
													value: branch.region.id // VALUE = branch.id (raqam)
												}))
											: []

										return (
											<FormItem
												label={t('Адрес филиала')}
												invalid={invalid}
												errorMessage={error && error.message}
											>
												<Select
													field={field}
													invalid={invalid}
													isClearable
													isLoading={isLoadingBranches}
													noOptionsMessage={() => t('Нет адресов')}
													placeholder={t('Выберите адрес')}
													options={options}
													value={options.filter((option) => option.value === field.value)}
													onChange={(option) => {
														if (option) {
															field.onChange(option.value) // formda branch_region = branch.id

															const branch = branches?.find((b) => b.id === option.value)
															if (branch) {
																setSelectedBranchRegion(branch.region.id)
																setValue('branch_city', branch.city.name_uz)
																setValue('branch_street', branch.street)
																setValue('branch_house', branch.house_number)
															} else {
																setSelectedBranchRegion(null)
															}

															// Texnikani reset qilish
															setValue('tech', null as any)
															setSelectedTech(null)
															setValue('tech_model', '')
															setValue('tech_type', '')
															setValue('tech_manufacturer', '')
															setValue('price_with_vat', '')
															setValue('price_with_vat_in_words', '')
															setValue('price_with_gps', '')
															setValue('price_with_gps_in_words', '')
														} else {
															// clear tanlanganida
															field.onChange(null)
															setSelectedBranchRegion(null)

															// Texnikani reset qilish
															setValue('tech', null as any)
															setSelectedTech(null)
															setValue('tech_model', '')
															setValue('tech_type', '')
															setValue('tech_manufacturer', '')
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
										required: t('Адрес филиала обязателен')
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

										const isTechDisabled = !selectedBranchRegion

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
													isDisabled={isTechDisabled}
													isLoading={isLoadingTechs || isLoadingMetric}
													noOptionsMessage={() =>
														!selectedBranchRegion ? t('Сначала выберите филиал') : t('Нет техники')
													}
													placeholder={
														!selectedBranchRegion
															? t('Сначала выберите филиал')
															: t('Выберите технику')
													}
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
																		price_with_vat +
																		Number(metric.gps) * (1 + Number(metric.vat) / 100)

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
															setSelectedTech(null)
															setValue('tech_model', '')
															setValue('tech_type', '')
															setValue('tech_manufacturer', '')
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
										<FormItem
											label={t('Аванс')}
											invalid={invalid}
											errorMessage={error && error.message}
										>
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
								{/*<div className='grid grid-cols-2 gap-4'>*/}
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
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
													field={field}
													invalid={invalid}
													suffix='%'
													placeholder={t('Укажите %')}
													value={field.value}
													onValueChange={(e) => {
														field.onChange(e.value)
														if (e.floatValue)
															setValue('rent_percent_in_words', numToWordUz(e.floatValue))
													}}
												/>
											</FormItem>
										)}
										rules={{
											required: t('Поле обязателен'),
											min: {
												value: 20,
												message: t('Минимум 20%')
											},
											max: {
												value: 100,
												message: t('Максимум 100%')
											}
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
													field={field}
													invalid={invalid}
													placeholder={t('Укажите кол-во')}
													value={field.value}
													onValueChange={(e) => {
														field.onChange(e.floatValue??'')
														if (e.floatValue)
															setValue('rent_period_in_words', numToWordUz(e.floatValue))
													}}
												/>
											</FormItem>
										)}
										rules={{
											required: t('Поле обязателен')
										}}
									/>
								</div>
								<Controller
									control={control}
									name={'loan_type'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem invalid={invalid} errorMessage={error && error.message}>
											<Radio.Group className='grid grid-cols-2 gap-2'>
												<Radio
													value={ContractLoanTypeEnum.ANNUITY}
													checked={!!field.value}
													onChange={(e: ContractLoanTypeEnum) => field.onChange(e)}
													className='mr-[0] rounded-[6px] border border-gray-300 px-2 py-3 dark:border-gray-600'
												>
													{t('Аннунитет')}
												</Radio>
												<Radio
													value={ContractLoanTypeEnum.DIFFERENTIATED}
													checked={!!field.value}
													onChange={(e: ContractLoanTypeEnum) => field.onChange(e)}
													className='mr-[0] rounded-[6px] border border-gray-300 px-2 py-3 dark:border-gray-600'
												>
													{t('Дифференциал')}
												</Radio>
											</Radio.Group>
										</FormItem>
									)}
								/>
								<Controller
									control={control}
									name={'fond'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem invalid={invalid} errorMessage={error && error.message}>
											<Checkbox checked={field.value} onChange={(e) => field.onChange(e)}>
												{t('Фонд')}
											</Checkbox>
										</FormItem>
									)}
								/>
								<Controller
									control={control}
									name={'payment_period'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem invalid={invalid} errorMessage={error && error.message}>
											<Radio.Group className='grid grid-cols-2 gap-2'>
												<Radio
													value={ContractPaymentPeriodEnum.MONTH}
													checked={!!field.value}
													onChange={(e: ContractPaymentPeriodEnum) => field.onChange(e)}
													className='mr-[0] rounded-[6px] border border-gray-300 px-2 py-3 dark:border-gray-600'
												>
													{t('Месяц')}
												</Radio>
												<Radio
													value={ContractPaymentPeriodEnum.QUARTER}
													checked={!!field.value}
													onChange={(e: ContractPaymentPeriodEnum) => field.onChange(e)}
													className='mr-[0] rounded-[6px] border border-gray-300 px-2 py-3 dark:border-gray-600'
												>
													{t('Квартал')}
												</Radio>
											</Radio.Group>
										</FormItem>
									)}
								/>
								<Controller
									control={control}
									name={'dummy_contract'}
									render={({ field, fieldState: { invalid, error } }) => (
										<FormItem invalid={invalid} errorMessage={error && error.message}>
											<Checkbox checked={field.value} onChange={(e) => field.onChange(e)}>
												{t('Пустышка договор')}
											</Checkbox>
										</FormItem>
									)}
								/>
								{user.role === UserRoleTextEnum.SALES && (
									<Controller
										control={control}
										name={'files'}
										render={({ fieldState: { invalid, error } }) => (
											<FormItem invalid={invalid} errorMessage={error && error.message}>
												<Upload
													beforeUpload={beforeUpload}
													onChange={(fileList) => handleUpload(fileList)}
													onFileRemove={handleDelete}
												>
													<Button variant='solid' icon={<HiOutlineUpload />}>
														{t('Прикрепить файл')}
													</Button>
												</Upload>
											</FormItem>
										)}
									/>
								)}
							</ScrollBar>
						</div>

						<div className='mx-4 mb-4 flex flex-nowrap items-center gap-2 text-right'>
							{/*<div className='flex w-full flex-col gap-2 sm:flex-row sm:justify-end'>*/}
							{/*<div className='flex-shrink-0 border-t border-gray-200 bg-white p-4 lg:p-6 dark:border-gray-700 dark:bg-gray-800'>*/}
							{/*	<div className='flex flex-col gap-2 sm:flex-row sm:justify-end'>*/}
							<Button
								size='md'
								className='grow'
								// className='w-full sm:w-auto'
								// className='w-full sm:w-auto sm:min-w-[100px]'
								disabled={isPendingCreate}
								onClick={() => setCancelDialogIsOpen(true)}
							>
								{t('Отмена')}
							</Button>
							<Button
								type='submit'
								size='md'
								variant='solid'
								loading={isPendingCreate}
								className='grow'
							>
								{t('Сохранить')}
							</Button>
						</div>
					</div>
					{/*</div>*/}
				</AdaptableCard>
			</form>

			<ConfirmDialog
				isOpen={isCancelDialogOpen}
				type='danger'
				title={t('Вы точно хотите отменить?')}
				cancelText={t('Отмена')}
				confirmText={t('Да')}
				confirmButtonColor='red-600'
				onClose={() => setCancelDialogIsOpen(false)}
				onRequestClose={() => setCancelDialogIsOpen(false)}
				onCancel={() => setCancelDialogIsOpen(false)}
				onConfirm={onCancelConfirm}
			/>
		</>
	)
}

export default NewContractsAdd
