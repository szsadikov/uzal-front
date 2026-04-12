import { useEffect, useMemo, useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import dayjs, { Dayjs } from 'dayjs'
import { Tech } from '@/@types/tech.types'
import { AdaptableCard, ColumnDef, FormNumericInput } from '@/components/shared'
import {
	Button,
	DatePicker,
	FormItem,
	Notification,
	Option,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import { TechService } from '@/services/tech.service'
import { formatDate, formatPrice } from '@/utils/format'
import { useQueryParams } from '@/utils/hooks/useQueryParams'

type PaymentRow = {
	number: number
	balance: number
	date: Date | Dayjs | string
	days: number
	principal: number
	interest: number
	total: number
}

enum LoanTypeEnum {
	ANNUITY = 1,
	DIFFERENTIATED
}

enum PaymentPeriodEnum {
	MONTH = 1,
	QUARTER
}

type FormModel = {
	tech_price: number
	year_percent: number
	rent_period: number
	deposit_percent: number
	deposit_price: number | string
	rent_period_date: Date | string
	loan_type: LoanTypeEnum
	payment_period: PaymentPeriodEnum
}

const CatalogCalculator = () => {
	const { t } = useTranslation()
	const searchParams = useQueryParams()
	const techId = searchParams.get('tech_id')

	const [tableData, setTableData] = useState<PaymentRow[] | null>(null)
	const [totals, setTotals] = useState<{
		totalPrincipal: number
		totalInterest: number
		totalAmount: number
	} | null>(null)

	const {
		data: tech,
		isLoading: isLoadingTech,
		isError: isErrorTech
	} = useQuery({
		queryKey: ['get tech', techId],
		queryFn: () => TechService.getById<Tech>(Number(techId)),
		select: ({ data }) => data,
		enabled: !!techId
	})

	const { control, getValues, setValue, handleSubmit, reset } = useForm<FormModel>({
		mode: 'onChange',
		defaultValues: {
			rent_period_date: new Date(),
			loan_type: LoanTypeEnum.ANNUITY,
			payment_period: PaymentPeriodEnum.QUARTER
		}
	})

	const columns = useMemo<ColumnDef<PaymentRow>[]>(
		() => [
			{
				header: '№',
				accessorKey: 'number',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.number}</div>
				)
			},
			{
				header: () => t('Остаток займа'),
				accessorKey: 'balance',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.balance, 2)}
					</div>
				)
			},
			{
				header: t('Дата платежа'),
				accessorKey: 'date',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.date, 'DD.MM.YYYY')}
					</div>
				)
			},
			{
				header: t('Дней'),
				accessorKey: 'days',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.days}</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Основной долг')}</div>,
				accessorKey: 'principal',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
						{formatPrice(props.row.original.principal, 2)}
					</div>
				),
				footer: (props) =>
					totals ? (
						<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
							{formatPrice(totals.totalPrincipal, 2)}
						</div>
					) : (
						''
					)
			},
			{
				header: () => <div className='text-right'>{t('Процент')}</div>,
				accessorKey: 'interest',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
						{formatPrice(props.row.original.interest, 2)}
					</div>
				),
				footer: (props) =>
					totals ? (
						<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
							{formatPrice(totals.totalInterest, 2)}
						</div>
					) : (
						''
					)
			},
			{
				header: () => <div className='text-right'>{t('Общая сумма')}</div>,
				accessorKey: 'total',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
						{formatPrice(props.row.original.total, 2)}
					</div>
				),
				footer: (props) =>
					totals ? (
						<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right font-bold'>
							{formatPrice(totals.totalAmount, 2)}
						</div>
					) : (
						''
					)
			}
		],
		[totals, t]
	)

	const table = useReactTable({
		data: tableData || [],
		columns,
		getCoreRowModel: getCoreRowModel()
	})

	const onSubmit: SubmitHandler<FormModel> = (data) => {
		const creditAmount = data.tech_price * (1 - data.deposit_percent / 100)
		const annualRate = data.year_percent
		const months = data.rent_period
		const paymentPeriod = data.payment_period
		const isQuarter = paymentPeriod === PaymentPeriodEnum.QUARTER
		const isDifferentiated = data.loan_type === LoanTypeEnum.DIFFERENTIATED

		const periodRate = annualRate / (isQuarter ? 4 : 12) / 100
		const totalPayments = months / (isQuarter ? 3 : 1)
		const startDate = dayjs(data.rent_period_date)

		const payments: PaymentRow[] = []
		let balance = creditAmount
		let prevDate = startDate

		const passedDays = startDate.date() - 1
		const daysIn0 = startDate.daysInMonth()
		const daysIn1 = startDate.add(1, 'month').daysInMonth()
		const daysIn2 = startDate.add(2, 'month').daysInMonth()

		// const daysFirst = isQuarter ? daysIn0 + daysIn1 + daysIn2 - passedDays : daysIn0 - passedDays

		// default (eski) logika — annuitet va boshqa holatlar uchun
		let daysFirst = isQuarter ? daysIn0 + daysIn1 + daysIn2 - passedDays : daysIn0 - passedDays

		// ✅ faqat DIFFERENSIAL + CHORAK uchun Excel’dagi kabi "kalendar chorak oxiri"
		if (isQuarter && isDifferentiated) {
			const m = startDate.month() // 0..11
			const qEndMonth = m <= 2 ? 2 : m <= 5 ? 5 : m <= 8 ? 8 : 11
			const quarterEnd = startDate.month(qEndMonth).endOf('month') // 31.12 / 31.03 / 30.06 / 30.09

			// +1: sizda currentDate = displayDate + 1 bo‘lgani uchun
			daysFirst = quarterEnd.diff(startDate, 'day') + 1
		}

		// const firstPaymentDate = startDate.add(daysFirst, 'day')

		const firstPaymentDate = startDate.add(daysFirst, 'day')
		const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

		// Differensial + chorak: foizni yil kesimida bo‘lib hisoblash (Excel kabi)
		const calcInterestByYearSplit = (balance: number, annualRate: number, start: any, end: any) => {
			let interest = 0
			let cursor = start

			while (cursor.isBefore(end)) {
				// keyingi yilning 1-yanvari (yil kesimi)
				const nextYearStart = cursor.startOf('year').add(1, 'year')
				const periodEnd = nextYearStart.isBefore(end) ? nextYearStart : end

				const days = periodEnd.diff(cursor, 'day')
				const yearDays = isLeapYear(cursor.year()) ? 366 : 365
				// const yearDays = cursor.isLeapYear() ? 366 : 365

				interest += balance * (annualRate / 100) * (days / yearDays)

				cursor = periodEnd
			}

			return interest
		}

		if (data.loan_type === LoanTypeEnum.ANNUITY) {
			const annuityPayment =
				(creditAmount * periodRate * Math.pow(1 + periodRate, totalPayments)) /
				(Math.pow(1 + periodRate, totalPayments) - 1)

			for (let i = 1; i <= totalPayments; i++) {
				const currentDate = i === 1 ? firstPaymentDate : prevDate.add(isQuarter ? 3 : 1, 'month')
				const days = currentDate.diff(prevDate, 'day')
				const displayDate = currentDate.subtract(1, 'day')

				const balanceBeforePayment = balance

				let interest: number
				let payment: number

				if (!isQuarter) {
					// OYLIK
					const daysInYear = isLeapYear(prevDate.year()) ? 366 : 365

					// Foiz kun asosida
					interest = +(balanceBeforePayment * (annualRate / 100) * (days / daysInYear)).toFixed(2)

					// To'lov (1-oy uchun proportsional)
					if (i === 1) {
						const daysInMonth = startDate.daysInMonth()
						payment = +(annuityPayment * (days / daysInMonth)).toFixed(2)
					} else {
						payment = +annuityPayment.toFixed(2)
					}
				} else {
					// CHORAKLIK - eski logika
					interest = +(balanceBeforePayment * periodRate).toFixed(2)
					payment = +annuityPayment.toFixed(2)
				}

				let principal = +(payment - interest).toFixed(2)
				balance = +(balanceBeforePayment - principal).toFixed(2)

				// Oxirgi to'lovda qoldiqni yopish
				// if (i === totalPayments) {
				// 	principal = +balanceBeforePayment.toFixed(2)
				// 	interest = +(payment - principal).toFixed(2)
				// 	balance = 0
				// }
				// Oxirgi to'lovda qoldiqni yopish (minus foiz chiqmasin)
				if (i === totalPayments) {
					principal = +balanceBeforePayment.toFixed(2)
					// oxirgi davr foizi har doim formuladan kelsin, payment-principal dan emas
					// interest oldinroq hisoblangan (oylikda days/daysInYear bo‘yicha)
					// payment = +(principal + interest).toFixed(2)
					balance = 0
				}

				payments.push({
					number: i,
					balance: Math.max(balanceBeforePayment, 0),
					date: displayDate,
					days,
					principal,
					interest,
					// total: +(principal + interest).toFixed(2)
					total: +payment.toFixed(2)
				})

				prevDate = currentDate
			}
		} else if (data.loan_type === LoanTypeEnum.DIFFERENTIATED) {
			const endDate = startDate.add(months, 'month') // Excel: 13.12.2029

			// 1) Schedule'ni to‘g‘ri yig'amiz (oxirida 73 kunlik final ham qo‘shiladi)
			const schedule: { currentDate: any; displayDate: any; days: number }[] = []
			let tmpPrevDate = prevDate

			// birinchi payment (sizda allaqachon firstPaymentDate hisoblangan)
			let nextDate = firstPaymentDate

			while (nextDate.isBefore(endDate)) {
				const days = nextDate.diff(tmpPrevDate, 'day')
				const displayDate = nextDate.subtract(1, 'day')

				schedule.push({ currentDate: nextDate, displayDate, days })

				tmpPrevDate = nextDate
				nextDate = tmpPrevDate.add(isQuarter ? 3 : 1, 'month')
			}

			// agar oxirgi chorak endDate'ga yetmagan bo‘lsa — final payment qo‘shamiz (Excel’dagi 73 kun)
			if (tmpPrevDate.isBefore(endDate)) {
				const days = endDate.diff(tmpPrevDate, 'day')
				const displayDate = endDate.subtract(1, 'day')
				schedule.push({ currentDate: endDate, displayDate, days })
			}

			const years = months / 12

			const totalDays = isQuarter
				? schedule.reduce((s, x) => s + x.days, 0)
				: Math.round(years * 364)

			for (let i = 1; i <= schedule.length; i++) {
				const { currentDate, displayDate, days } = schedule[i - 1]
				const balanceBeforePayment = balance

				let principal = +(creditAmount * (days / totalDays)).toFixed(3)

				const interest = +calcInterestByYearSplit(
					balanceBeforePayment,
					annualRate,
					prevDate,
					currentDate
				).toFixed(3)

				balance = +(balanceBeforePayment - principal).toFixed(3)
				// ✅ 1) Agar balans 0 (yoki manfiy) bo‘lib qolsa — shu yerning o‘zida yopamiz
				// Bu oxirida 0-0-0 qator chiqishini oldini oladi
				if (balance <= 0) {
					principal = +balanceBeforePayment.toFixed(3)
					balance = 0

					payments.push({
						number: i,
						balance: Math.max(balanceBeforePayment, 0),
						date: displayDate,
						days,
						principal,
						interest,
						total: +(principal + interest).toFixed(3)
					})

					prevDate = currentDate
					break
				}

				// ✅ 2) Oldingi “oxirgi schedule” logikang qoladi (xohlasang qoldir)
				// Lekin endi amalda yuqoridagi break ko‘p holatda ishni tugatib qo‘yadi
				if (i === schedule.length) {
					principal = +balanceBeforePayment.toFixed(3)
					balance = 0
				}

				// if (i === schedule.length) {
				// 	principal = +balanceBeforePayment.toFixed(3)
				// 	balance = 0
				// }

				payments.push({
					number: i,
					balance: Math.max(balanceBeforePayment, 0),
					date: displayDate,
					days,
					principal,
					interest,
					total: +(principal + interest).toFixed(3)
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
	}

	useEffect(() => {
		if (isErrorTech) {
			toast.push(<Notification type='danger' title={t('Техника не найдено')} duration={2000} />, {
				placement: 'top-center'
			})
		}
	}, [isErrorTech])

	useEffect(() => {
		if (tech) {
			reset({
				tech_price: Number(tech.price),
				// year_percent: null,
				// rent_period: null,
				// deposit_percent: null,
				// deposit_price: null,
				rent_period_date: new Date(),
				loan_type: LoanTypeEnum.ANNUITY,
				payment_period: PaymentPeriodEnum.QUARTER
			})
		}
	}, [tech, reset])

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-6 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Рассчитать лизинг')}</h3>
				<div className='flex flex-col lg:flex-row lg:items-center'>
					<Link className='mb-4 block md:mb-0 lg:inline-block md:ltr:ml-2' to='/lessee/catalog'>
						<Button block variant='solid' size='sm' className='px-12'>
							{t('Каталог')}
						</Button>
					</Link>
				</div>
			</div>

			<form
				onSubmit={handleSubmit(onSubmit)}
				className='grid items-end gap-8 md:grid-cols-2 xl:grid-cols-3'
			>
				<Controller
					control={control}
					name={'tech_price'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Стоимость техники')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							{isLoadingTech ? (
								<Skeleton height={44} />
							) : (
								<FormNumericInput
									field={field}
									invalid={invalid}
									placeholder={t('Введите сум')}
									value={field.value}
									onValueChange={(e) => field.onChange(e.floatValue ?? '')}
								/>
							)}
						</FormItem>
					)}
					rules={{
						required: t('Стоимость техники обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'year_percent'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Годовой процент ставки лизинга')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							<FormNumericInput
								field={field}
								invalid={invalid}
								suffix='%'
								placeholder={t('Введите %')}
								value={field.value}
								onValueChange={(e) => field.onChange(e.value ?? '')}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Годовой процент обязателен'),
						min: {
							value: 15,
							message: t('Минимум 15%')
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
							label={t('Срок лизинга (месяц)')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							<FormNumericInput
								field={field}
								invalid={invalid}
								placeholder={t('Укажите кол-во')}
								value={field.value}
								onValueChange={(e) => field.onChange(e.floatValue ?? '')}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Срок лизинга обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'deposit_percent'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Аванс сумма относительно (процента)')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							<FormNumericInput
								field={field}
								invalid={invalid}
								suffix='%'
								placeholder={t('Введите %')}
								value={field.value}
								onValueChange={(e) => {
									field.onChange(e.floatValue)
									const tech_price = getValues('tech_price')
									if (e.floatValue && tech_price) {
										setValue('deposit_price', (e.floatValue / 100) * tech_price)
									} else if (!e.floatValue) {
										setValue('deposit_price', '')
									}
								}}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Аванс сумма обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'deposit_price'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Аванс сумма относительно (cумма)')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							<FormNumericInput
								disabled={true}
								field={field}
								invalid={invalid}
								placeholder={t('Введите сумму')}
								value={field.value}
								onValueChange={(e) => field.onChange(e.floatValue)}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Аванс сумма обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'rent_period_date'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Дата передачи техники в лизинг')}
							invalid={invalid}
							errorMessage={error && error.message}
							className='mb-0'
						>
							<DatePicker
								field={field}
								invalid={invalid}
								clearable={false}
								placeholder={t('Выберите дату')}
								inputFormat='DD.MM.YYYY'
								value={field.value as Date}
								onChange={(date) => field.onChange(date)}
							/>
						</FormItem>
					)}
					rules={{
						required: t('Дата передачи обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'loan_type'}
					render={({ field, fieldState: { invalid, error } }) => {
						const types = [
							{ name: t('Аннуитетный'), id: LoanTypeEnum.ANNUITY },
							{ name: t('Дифференцированный'), id: LoanTypeEnum.DIFFERENTIATED }
						]

						const options: Option[] = types.map((type) => ({
							label: type.name,
							value: type.id
						}))

						return (
							<FormItem
								label={t('Тип кредита')}
								invalid={invalid}
								errorMessage={error && error.message}
								className='mb-0'
							>
								<Select
									field={field}
									invalid={invalid}
									noOptionsMessage={() => t('Нет типы кредита')}
									placeholder={t('Выберите тип кредита')}
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
						required: t('Тип кредита обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'payment_period'}
					render={({ field, fieldState: { invalid, error } }) => {
						const periods = [
							{ name: t('Месяц'), id: PaymentPeriodEnum.MONTH },
							{ name: t('Квартал'), id: PaymentPeriodEnum.QUARTER }
						]

						const options: Option[] = periods.map((period) => ({
							label: period.name,
							value: period.id
						}))

						return (
							<FormItem
								label={t('Период оплаты')}
								invalid={invalid}
								errorMessage={error && error.message}
								className='mb-0'
							>
								<Select
									field={field}
									invalid={invalid}
									noOptionsMessage={() => t('Нет периодов оплаты')}
									placeholder={t('Выберите период оплаты')}
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
						required: t('Период оплаты обязателен')
					}}
				/>

				<Button type='submit' variant='solid' loading={isLoadingTech}>
					{t('Рассчитать')}
				</Button>
			</form>

			{tableData && totals && (
				<div className='table-scroll mt-8'>
					<table className='table-default table-hover'>
						<thead>
							{table.getHeaderGroups().map((headerGroup) => (
								<tr key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<th key={header.id}>
											{flexRender(header.column.columnDef.header, header.getContext())}
										</th>
									))}
								</tr>
							))}
						</thead>

						<tbody>
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</td>
									))}
								</tr>
							))}
						</tbody>

						<tfoot>
							<tr>
								<td colSpan={4}>
									<div className='text-xs font-semibold'>{t('Общая сумма')}</div>
								</td>
								{table
									.getFooterGroups()[0]
									.headers.slice(4)
									.map((footer) => (
										<td key={footer.id}>
											{flexRender(footer.column.columnDef.footer, footer.getContext())}
										</td>
									))}
							</tr>
						</tfoot>
					</table>
				</div>
			)}
		</AdaptableCard>
	)
}

export default CatalogCalculator
