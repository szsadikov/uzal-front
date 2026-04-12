import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiDownload, HiOutlineDocumentText } from 'react-icons/hi'
import {
	PaginatedProcessResponse,
	PaymentOverdueNotice,
	PaymentOverdueNoticeProcessDetail
} from '@/@types/payment-notice.types'
import { type ColumnDef, DataTable } from '@/components/shared'
import { Button, Drawer, DrawerProps, Tooltip } from '@/components/ui'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { formatDate, formatPrice } from '@/utils/format'
import useResponsive from '@/utils/hooks/useResponsive'

type Props = DrawerProps & {
	request: PaymentOverdueNotice
}

const CurrentRequestsView = ({ request, onClose, ...rest }: Props) => {
	const { windowWidth, larger } = useResponsive()
	const { t } = useTranslation()

	const [processData, setProcessData] = useState<PaymentOverdueNoticeProcessDetail[]>([])
	const [loading, setLoading] = useState(false)

	const fetchProcess = useCallback(async () => {
		if (!request?.id) return
		try {
			setLoading(true)
			const { data } = await PaymentNoticeService.getProcessList<
				PaginatedProcessResponse | PaymentOverdueNoticeProcessDetail[]
			>(request.id)

			if (Array.isArray(data)) {
				setProcessData(data)
			} else {
				setProcessData(data.results || [])
			}
		} catch (error) {
			console.error('Process fetch error:', error)
		} finally {
			setLoading(false)
		}
	}, [request?.id])

	useEffect(() => {
		fetchProcess()
	}, [fetchProcess])

	// =========================
	// 1-table (asosiy talabnoma)
	// =========================
	const requestColumns: ColumnDef<PaymentOverdueNotice>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Наименование'),
				accessorKey: 'company_name',
				size: 250,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.company_name}
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 100,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.stir}
					</div>
				)
			},
			{
				header: t('Телефон'),
				accessorKey: 'phone_number',
				size: 160,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.phone_number}
					</div>
				)
			},
			{
				header: t('Дата'),
				accessorKey: 'contract_code',
				size: 160,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.contract_code}
					</div>
				)
			},
			{
				header: t('ПРОСРОЧЕННЫЙ МЕСЯЦ'),
				accessorKey: 'month_overdue',
				size: 250,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.month_overdue}
					</div>
				)
			},
			{
				header: t('Дата оплаты'),
				accessorKey: 'date_of_payment',
				size: 160,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatDate(props.row.original.date_of_payment)}
					</div>
				)
			},
			{
				header: t('Дни в месяце'),
				accessorKey: 'days_in_the_month',
				size: 180,
				cell: (props) => (
					<div
						className='text-left font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.days_in_the_month}
					</div>
				)
			},
			{
				header: t('Основной долг'),
				accessorKey: 'main_amount_of_payment',
				size: 200,
				cell: (props) => (
					<div
						className='text-center font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.main_amount_of_payment)}
					</div>
				)
			},
			{
				header: t('Общая сумма'),
				accessorKey: 'total_amount',
				size: 180,
				cell: (props) => (
					<div
						className='text-center font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: t('Просрочка'),
				accessorKey: 'overdue_amount',
				size: 180,
				cell: (props) => (
					<div
						className='text-center font-semibold text-red-500'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			}
		],
		[]
	)

	// ===========================================
	// 2-table (process steps) — biznes qoidalari bilan
	// ===========================================

	// Step nomini kalitga map qilamiz (nom bo‘yicha; agar backendda "code" bo‘lsa – shuni ishlat)
	const getStepKey = (name?: string) => {
		const s = (name || '').toLowerCase()
		if (s.includes('досрочно')) return 'early' // Исполнено досрочно (terminal)
		if (s.includes('подано в суд')) return 'filed' // 1
		if (s.includes('отклонил')) return 'rejected' // 2 (terminal branch)
		if (s.includes('принято судебное')) return 'accepted' // 3
		if (s.includes('миб')) return 'mib' // 4
		if (s.includes('исполнено') && !s.includes('досрочно')) return 'executed' // 5

		return 'other'
	}

	// Hozirgi bajarilgan holatlarni xotirada yig‘ib olamiz
	const stepsState = useMemo(() => {
		const state = {
			filed: false,
			rejected: false,
			accepted: false,
			mib: false,
			executed: false,
			early: false
		}
		for (const p of processData) {
			const k = getStepKey(p.process_name_ru)
			if (k in state) (state as any)[k] = p.status === 'done'
		}

		return state
	}, [processData])

	// Qaysi qatorda checkboxni bosish mumkin (disabled bo‘lish-yo‘qligi)
	const isDisabled = (row: PaymentOverdueNoticeProcessDetail) => {
		const key = getStepKey(row.process_name_ru)
		const s = stepsState

		// Early bajarilgan bo‘lsa — hamma boshqa step blok
		if (s.early && key !== 'early') return true

		// Filed bo‘lmaguncha — pastdagi hamma blok (early bundan mustasno)
		if (!s.filed && key !== 'filed' && key !== 'early') return true

		// Rejected tanlansa — zanjir shu yerda tugaydi
		if (s.rejected && !['filed', 'rejected', 'early'].includes(key)) return true

		// Accepted bo‘lmaguncha — MIB/Executed blok
		if (!s.accepted && (key === 'mib' || key === 'executed')) return true

		// MIB bo‘lmaguncha — Executed blok
		if (!s.mib && key === 'executed') return true

		return false
	}

	// Biror step togglega javoban konsistentlikni saqlash va serverga patch qilish
	const applyBusinessTransitions = async (
		toggled: PaymentOverdueNoticeProcessDetail,
		checked: boolean
	) => {
		const key = getStepKey(toggled.process_name_ru)

		const setLocal = (id: number, status: 'done' | 'not_done') =>
			setProcessData((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)))

		const patch = (id: number, status: 'done' | 'not_done') =>
			PaymentNoticeService.updateProcess(id, { status })

		const byKey = (k: string) => processData.find((p) => getStepKey(p.process_name_ru) === k)

		const ops: Promise<any>[] = []

		// Early (terminal): qolgan hammasini o‘chiradi/ bloklaydi
		if (key === 'early') {
			const others = processData.filter((p) => p.id !== toggled.id)
			setLocal(toggled.id, checked ? 'done' : 'not_done')
			for (const t of others) setLocal(t.id, 'not_done')
			ops.push(patch(toggled.id, checked ? 'done' : 'not_done'))
			for (const t of others) ops.push(patch(t.id, 'not_done'))
			await Promise.allSettled(ops)

			return
		}

		// Filed o‘chirilsa — hammasini reset
		if (key === 'filed' && !checked) {
			setLocal(toggled.id, 'not_done')
			for (const p of processData) if (p.id !== toggled.id) setLocal(p.id, 'not_done')
			ops.push(patch(toggled.id, 'not_done'))
			for (const p of processData) if (p.id !== toggled.id) ops.push(patch(p.id, 'not_done'))
			await Promise.allSettled(ops)

			return
		}

		// Rejected ↔ Accepted — o‘zaro zid
		if (key === 'rejected') {
			setLocal(toggled.id, checked ? 'done' : 'not_done')
			ops.push(patch(toggled.id, checked ? 'done' : 'not_done'))
			if (checked) {
				const accepted = byKey('accepted')
				const mib = byKey('mib')
				const executed = byKey('executed')
				for (const t of [accepted, mib, executed].filter(
					Boolean
				) as PaymentOverdueNoticeProcessDetail[]) {
					setLocal(t.id, 'not_done')
					ops.push(patch(t.id, 'not_done'))
				}
			}
			await Promise.allSettled(ops)

			return
		}

		if (key === 'accepted') {
			setLocal(toggled.id, checked ? 'done' : 'not_done')
			ops.push(patch(toggled.id, checked ? 'done' : 'not_done'))
			const rejected = byKey('rejected')
			const mib = byKey('mib')
			const executed = byKey('executed')

			if (checked && rejected) {
				setLocal(rejected.id, 'not_done')
				ops.push(patch(rejected.id, 'not_done'))
			}
			if (!checked) {
				for (const t of [mib, executed].filter(Boolean) as PaymentOverdueNoticeProcessDetail[]) {
					setLocal(t.id, 'not_done')
					ops.push(patch(t.id, 'not_done'))
				}
			}
			await Promise.allSettled(ops)

			return
		}

		// MIB o‘chirilsa — Executed ham o‘chadi
		if (key === 'mib' && !checked) {
			setLocal(toggled.id, 'not_done')
			ops.push(patch(toggled.id, 'not_done'))
			const executed = byKey('executed')
			if (executed) {
				setLocal(executed.id, 'not_done')
				ops.push(patch(executed.id, 'not_done'))
			}
			await Promise.allSettled(ops)

			return
		}

		// Executed yoqilsa — yuqoridagilarni majburiy yoqib qo‘yamiz (zanjir mustahkam bo‘lsin)
		if (key === 'executed' && checked) {
			const filed = byKey('filed')
			const accepted = byKey('accepted')
			const mib = byKey('mib')
			for (const t of [filed, accepted, mib].filter(
				Boolean
			) as PaymentOverdueNoticeProcessDetail[]) {
				setLocal(t.id, 'done')
				ops.push(patch(t.id, 'done'))
			}
		}

		// Default: faqat shu stepni yangilash
		setLocal(toggled.id, checked ? 'done' : 'not_done')
		ops.push(patch(toggled.id, checked ? 'done' : 'not_done'))
		await Promise.allSettled(ops)
	}

	// Jadval ustunlari (process) – disabled va fayl ikon logikasi bilan
	const processColumns: ColumnDef<PaymentOverdueNoticeProcessDetail>[] = useMemo(
		() => [
			{
				header: '',
				id: 'checkbox',
				size: 0,
				cell: (props) => {
					const row = props.row.original
					const checked = row.status === 'done'
					const disabled = isDisabled(row)

					const onToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
						const next = e.target.checked
						if (disabled) return
						try {
							await applyBusinessTransitions(row, next)
						} catch (err) {
							console.error('Status update error:', err)
						}
					}

					return (
						<div className='flex justify-center'>
							<input
								type='checkbox'
								checked={checked}
								onChange={onToggle}
								disabled={disabled}
								className={[
									'h-4 w-4 rounded-sm',
									// light: eski holat
									checked ? 'accent-indigo-600' : 'accent-gray-400',
									// dark: yangisi
									checked ? 'dark:accent-indigo-400' : 'dark:accent-gray-600',
									disabled ? 'cursor-not-allowed opacity-40' : '',
									'focus:ring focus:ring-indigo-500/40 focus:ring-offset-0 focus:outline-none'
								].join(' ')}
							/>
						</div>
					)
				}
			},
			{
				header: '№',
				id: 'order',
				size: 60,
				cell: ({ row }) => {
					const order = row.original?.order ?? row.index + 1
					const isCompleted = row.original.status === 'done'
					const disabled = isDisabled(row.original)

					const cls = isCompleted
						? // light
							'text-black font-semibold ' +
							// dark
							'dark:text-white'
						: disabled
							? // light
								'text-gray-300 ' +
								// dark
								'dark:text-gray-600'
							: // light
								'text-gray-500 ' +
								// dark
								'dark:text-gray-300'

					return <div className={`text-left tabular-nums ${cls}`}>{order}</div>
				}
			},
			{
				header: t('Действие'),
				accessorKey: 'process_name_lt',
				size: 400,
				cell: ({ row }) => {
					const isCompleted = row.original.status === 'done'
					const disabled = isDisabled(row.original)

					return (
						<div
							className={[
								'py-2',
								isCompleted
									? // light
										'font-semibold text-black ' +
										// dark
										'dark:text-white'
									: disabled
										? // light
											'text-gray-300 ' +
											// dark
											'dark:text-gray-600'
										: // light
											'text-gray-500 ' +
											// dark
											'dark:text-gray-300'
							].join(' ')}
						>
							{row.original.process_name_lt}
						</div>
					)
				}
			},
			{
				header: t('Заявления'),
				accessorKey: 'process_files',
				size: 240,
				cell: (props) => {
					const row = props.row.original
					const stepDone = row.status === 'done'
					const filesDisabled = !stepDone // fayl faqat step bajarilganda aktiv

					if (row.process_files?.length) {
						return (
							<div className='flex gap-2'>
								{row.process_files.map((file) => (
									<Tooltip title={file.file} key={file.id}>
										<a
											rel='noreferrer'
											className={`${filesDisabled ? 'pointer-events-none opacity-40' : ''}`}
										>
											<HiOutlineDocumentText
												className={`text-xl ${filesDisabled ? '' : ''} ${
													filesDisabled
														? 'dark:text-gray-600'
														: 'dark:text-gray-300 dark:hover:text-blue-400'
												}`}
											/>
										</a>
									</Tooltip>
								))}
							</div>
						)
					}

					return (
						<div className='justify-left flex'>
							<Tooltip title={t('Файл yuklash')}>
								<label
									className={`cursor-pointer p-2 hover:text-blue-500 ${
										filesDisabled ? 'pointer-events-none opacity-40' : ''
									}`}
								>
									<HiDownload
										className={`text-xl ${
											filesDisabled
												? 'dark:text-gray-600'
												: 'dark:text-gray-300 dark:hover:text-blue-400'
										}`}
									/>
									<input
										type='file'
										className='hidden'
										disabled={filesDisabled}
										onChange={async (e) => {
											if (e.target.files?.length) {
												try {
													await PaymentNoticeService.updateProcess(row.id, {
														new_files: [e.target.files[0]]
													})
													await fetchProcess() // data yangilash
												} catch (err) {
													console.error('File upload error:', err)
												}
											}
										}}
									/>
								</label>
							</Tooltip>
						</div>
					)
				}
			}
		],

		[processData]
	)

	return (
		<Drawer
			title={`${t('Талабнома')} № ${request.id} ${t('по договору')} №${request.contract}" ${t('от')} ${formatDate(
				request.date_of_payment
			)} `}
			placement='right'
			width={larger.lg ? windowWidth - 188 : windowWidth}
			onClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button variant='solid' className='mr-2' onClick={onClose}>
						{t('Закрыть')}
					</Button>
				</div>
			}
			{...rest}
		>
			<div className='shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
				<DataTable
					columns={requestColumns}
					data={[{ ...request }]}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					isPagination={false}
				/>
			</div>

			<div className='mt-12'>
				<DataTable
					columns={processColumns}
					data={processData}
					isPagination={false}
					loading={loading}
				/>
			</div>
		</Drawer>
	)
}

export default CurrentRequestsView
