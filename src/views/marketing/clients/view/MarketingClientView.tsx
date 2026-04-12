import { CSSProperties, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import {
	HiOutlineDocumentDuplicate,
	HiOutlineDocumentText,
	HiOutlineClock,
	HiOutlineMail,
	HiOutlineCube,
	HiOutlinePencil,
	HiOutlineEye,
	HiArrowLeft
} from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import {
	PaymentOverdueNotice,
	PaymentOverdueNoticeStatusEnum
} from '@/@types/payment-notice.types'
import { CurrentContract } from '@/@types/contract.types'
import { type ColumnDef, DataTable } from '@/components/shared'
import { AdaptableCard } from '@/components/shared'
import { Button, Input, Notification, Tabs, Tooltip, toast } from '@/components/ui'
import { CustomerService } from '@/services/customer.service'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { MarketingClient, MarketingClientsService } from '../marketing-clients.service'
import { formatDate, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { errorCatch } from '@/services/api.helpers'

const TabList = Tabs.TabList
const TabNav = Tabs.TabNav
const TabContent = Tabs.TabContent

// ─── Process status helpers ───────────────────────────────────────────────────

const statusPalette: Record<string, { dot: string; text: string }> = {
	filed_in_court:          { dot: 'bg-orange-500', text: 'text-orange-600' },
	court_decision_accepted: { dot: 'bg-yellow-500', text: 'text-yellow-600' },
	transferred_to_mib:      { dot: 'bg-purple-500', text: 'text-purple-600' },
	executed:                { dot: 'bg-green-500',  text: 'text-green-600' },
	executed_early:          { dot: 'bg-green-500',  text: 'text-green-600' },
	court_rejected:          { dot: 'bg-red-500',    text: 'text-red-600' }
}

function pickProcessStatus(ps: unknown, lang: string) {
	const isObj = typeof ps === 'object' && ps !== null
	const code  = (isObj ? (ps as any).process_name : ps) as string | undefined
	const palette = code ? statusPalette[code] : undefined
	const label =
		(isObj && ((lang === 'ru' ? (ps as any).process_name_ru : (ps as any).process_name_uz) as string | undefined)) ||
		undefined
	if (code || label) {
		return { label: label ?? String(code), dot: palette?.dot ?? 'bg-gray-300', text: palette?.text ?? 'text-gray-500' }
	}
	return null
}

const smsStatusMap: Record<string, { label: string; dot: string; text: string }> = {
	confirmed: { label: 'Доставлено',   dot: 'bg-orange-500', text: 'text-orange-600' },
	read:      { label: 'Прочитано',    dot: 'bg-green-500',  text: 'text-green-600' },
	not_send:  { label: 'Не доставлено',dot: 'bg-red-500',    text: 'text-red-600' },
	send:      { label: 'Отправлено',   dot: 'bg-blue-500',   text: 'text-blue-600' },
	pending:   { label: 'В ожидании',   dot: 'bg-gray-400',   text: 'text-gray-500' },
	failed:    { label: 'Ошибка',       dot: 'bg-red-500',    text: 'text-red-600' }
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

type StatCardCfg = { key: string; label: string; icon: React.ReactNode; iconBg: string; cardBg: string }

const STAT_CARDS: StatCardCfg[] = [
	{ key: 'applications',      label: 'Заявки',               icon: <HiOutlineDocumentDuplicate className='text-white text-xl' />, iconBg: 'bg-orange-500', cardBg: 'bg-orange-50 dark:bg-orange-900/40' },
	{ key: 'new_contracts',     label: 'Новые договора',        icon: <HiOutlineDocumentText       className='text-white text-xl' />, iconBg: 'bg-emerald-500',cardBg: 'bg-emerald-50 dark:bg-emerald-900/40' },
	{ key: 'current_contracts', label: 'Текущие договора',      icon: <HiOutlineClock              className='text-white text-xl' />, iconBg: 'bg-violet-500', cardBg: 'bg-violet-50 dark:bg-violet-900/40' },
	{ key: 'requests',          label: 'Заявления',             icon: <HiOutlineMail               className='text-white text-xl' />, iconBg: 'bg-blue-500',   cardBg: 'bg-blue-50 dark:bg-blue-900/40' },
	{ key: 'leasing',           label: 'Лизинговые объекты',    icon: <HiOutlineCube               className='text-white text-xl' />, iconBg: 'bg-purple-500', cardBg: 'bg-purple-50 dark:bg-purple-900/40' }
]

const StatCard = ({ cfg, count, amount }: { cfg: StatCardCfg; count: number; amount?: string }) => {
	const { t } = useTranslation()
	return (
		<div className={`flex flex-1 min-w-[150px] items-start gap-3 rounded-xl p-4 ${cfg.cardBg}`}>
			<div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${cfg.iconBg}`}>
				{cfg.icon}
			</div>
			<div>
				<p className='text-xs text-gray-500 dark:text-gray-400 mb-0.5'>{t(cfg.label)}</p>
				<p className='text-3xl font-bold leading-none'>{count}</p>
				{amount != null && (
					<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{formatPrice(amount)} UZS</p>
				)}
			</div>
		</div>
	)
}

// ─── Shared table sub-components ──────────────────────────────────────────────

const DocsColumn = ({ onDocsClick, style }: { onDocsClick: () => void; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()
	return (
		<div className='text-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onDocsClick}>
					<HiOutlineDocumentText size={18} />
				</span>
			</Tooltip>
		</div>
	)
}

const ActionColumn = ({ onViewClick, style }: { onViewClick: () => void; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()
	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onViewClick}>
					<HiOutlineEye />
				</span>
			</Tooltip>
		</div>
	)
}

// ─── Tab: Заявки ─────────────────────────────────────────────────────────────

const ApplicationsTab = ({ stir }: { stir: string }) => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const moneyMeta = { meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' } }

	const { data, isLoading } = useQuery({
		queryKey: ['client-view-applications', stir, queries],
		queryFn: () =>
			PaymentNoticeService.getAllPaymentNoticeList<PaginatedResponse<PaymentOverdueNotice[]>>(
				{ ...queries, stir, status: PaymentOverdueNoticeStatusEnum.NEW }
			),
		select: (res) => res.data
	})

	const columns: ColumnDef<PaymentOverdueNotice>[] = useMemo(() => [
		{ header: '№', accessorKey: 'id', size: 60, enableSorting: false,
			cell: (p) => <div className='font-semibold'>{(queries.page-1)*queries.size + p.row.index + 1}</div> },
		{ header: t('НАИМЕНОВАНИЕ'), accessorKey: 'company_name', size: 200, enableSorting: false,
			cell: (p) => p.row.original.company_name },
		{ header: t('ИНН'), accessorKey: 'stir', size: 130, enableSorting: false,
			cell: (p) => p.row.original.stir },
		{ header: t('№Договора'), accessorKey: 'contract_code', size: 160, enableSorting: false,
			cell: (p) => p.row.original.contract_code },
		{ header: t('МЕСЯЦ'), accessorKey: 'month_overdue', size: 100, enableSorting: false,
			cell: (p) => p.row.original.month_overdue },
		{ header: t('Дата оплаты'), accessorKey: 'date_of_payment', size: 160, enableSorting: false,
			cell: (p) => formatDate(p.row.original.date_of_payment) },
		{ header: t('Дни в месяце'), accessorKey: 'days_in_the_month', size: 150, enableSorting: false,
			cell: (p) => p.row.original.days_in_the_month },
		{ header: () => <span className='ml-auto'>{t('Основной долг')}</span>, accessorKey: 'main_amount_of_payment', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.main_amount_of_payment)}</div> },
		{ header: () => <span className='ml-auto'>{t('Общая сумма')}</span>, accessorKey: 'total_amount', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.total_amount)}</div> },
		{ header: () => <span className='ml-auto'>{t('Просрочка')}</span>, accessorKey: 'overdue_amount', size: 160, ...moneyMeta,
			cell: (p) => <div className='text-right text-red-500'>{formatPrice(p.row.original.overdue_amount)}</div> },
		{ header: t('Номер телефона'), accessorKey: 'phone_number', size: 180, enableSorting: false,
			cell: (p) => p.row.original.phone_number }
	], [t, queries.page, queries.size])

	return (
		<DataTable columns={columns} data={data?.results ?? []} loading={isLoading}
							 pagingData={{ total: data?.count ?? 0, pageIndex: queries.page, pageSize: queries.size }}
							 onPaginationChange={(page) => setQueries(p => ({ ...p, page }))}
							 onSelectChange={(size) => setQueries(p => ({ ...p, size }))} />
	)
}

// ─── Tab: Текущие договора ────────────────────────────────────────────────────

const CurrentContractsTab = ({ stir }: { stir: string }) => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const moneyMeta = { meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' } }

	const { data, isLoading } = useQuery({
		queryKey: ['client-view-current-contracts', stir, queries],
		queryFn: () =>
			CustomerService.getAllCurrentContracts<PaginatedResponse<CurrentContract[]>>(
				{ ...queries, stir }
			),
		select: (res) => res.data
	})

	const columns: ColumnDef<CurrentContract>[] = useMemo(() => [
		{ header: '№', accessorKey: 'id', size: 60, enableSorting: false,
			cell: (p) => <div className='font-semibold'>{(queries.page-1)*queries.size + p.row.index + 1}</div> },
		{ header: t('Наименование'), accessorKey: 'client_company_name', size: 220, enableSorting: false,
			cell: (p) => p.row.original.client_company_name },
		{ header: t('ИНН'), accessorKey: 'stir', size: 130, enableSorting: false,
			cell: (p) => p.row.original.stir },
		{ header: t('№Договора'), accessorKey: 'contract_id', size: 180, enableSorting: false,
			cell: (p) => p.row.original.contract_id },
		{ header: t('Дата'), accessorKey: 'contract_date', size: 140, enableSorting: false,
			cell: (p) => formatDate(p.row.original.contract_date) },
		{ header: () => <span className='ml-auto'>{t('Сумма')}</span>, accessorKey: 'overall_contract_amount', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.overall_contract_amount)}</div> },
		{ header: () => <span className='ml-auto'>{t('Остаток')}</span>, accessorKey: 'contract_amount_left', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.contract_amount_left)}</div> },
		{ header: () => <span className='ml-auto'>{t('Просрочка')}</span>, accessorKey: 'overdue_amount', size: 160, ...moneyMeta,
			cell: (p) => <div className='text-right text-red-500'>{formatPrice(p.row.original.overdue_amount)}</div> }
	], [t, queries.page, queries.size])

	return (
		<DataTable columns={columns} data={data?.results ?? []} loading={isLoading}
							 pagingData={{ total: data?.count ?? 0, pageIndex: queries.page, pageSize: queries.size }}
							 onPaginationChange={(page) => setQueries(p => ({ ...p, page }))}
							 onSelectChange={(size) => setQueries(p => ({ ...p, size }))} />
	)
}

// ─── Tab: Заявления ───────────────────────────────────────────────────────────

const RequestsTab = ({ stir }: { stir: string }) => {
	const { t, i18n } = useTranslation()
	const lang = (i18n.language as 'ru' | 'uz' | 'oz') || 'ru'
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const moneyMeta = { meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' } }

	const { data, isLoading } = useQuery({
		queryKey: ['client-view-requests', stir, queries],
		queryFn: () =>
			PaymentNoticeService.getAllPaymentNoticeList<PaginatedResponse<PaymentOverdueNotice[]>>(
				{ ...queries, stir, status: PaymentOverdueNoticeStatusEnum.PROCESSING }
			),
		select: (res) => res.data
	})

	const { mutateAsync: mutateAsyncNotice } = useMutation({
		mutationKey: ['client-view-notice-pdf'],
		mutationFn: (id: number) => PaymentNoticeService.getById<{ pdf_document?: string; pdf_url?: string }>(id),
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, { placement: 'top-center' })
		}
	})

	const columns: ColumnDef<PaymentOverdueNotice>[] = useMemo(() => [
		{ header: '№', accessorKey: 'id', size: 60, enableSorting: false,
			cell: (p) => <div className='font-semibold'>{(queries.page-1)*queries.size + p.row.index + 1}</div> },
		{ header: t('НАИМЕНОВАНИЕ'), accessorKey: 'company_name', size: 200, enableSorting: false,
			cell: (p) => p.row.original.company_name },
		{ header: t('ИНН'), accessorKey: 'stir', size: 130, enableSorting: false,
			cell: (p) => p.row.original.stir },
		{ header: t('№Договора'), accessorKey: 'contract_code', size: 160, enableSorting: false,
			cell: (p) => p.row.original.contract_code },
		{ header: t('№Талабнома'), accessorKey: 'code', size: 150, enableSorting: false,
			cell: (p) => p.row.original.code ?? '-' },
		{ header: t('Дата оплаты'), accessorKey: 'date_of_payment', size: 160, enableSorting: false,
			cell: (p) => formatDate(p.row.original.date_of_payment) },
		{ header: t('Статус'), accessorKey: 'process_status', size: 200, enableSorting: false,
			cell: (p) => {
				const ps = pickProcessStatus(p.row.original.process_status, lang)
				return ps ? (
					<div className='flex items-center gap-2'>
						<span className={`inline-block h-2.5 w-2.5 rounded-full ${ps.dot}`} />
						<span className={`font-medium ${ps.text}`}>{ps.label}</span>
					</div>
				) : <span className='text-gray-500'>—</span>
			}
		},
		{ header: t('МЕСЯЦ'), accessorKey: 'month_overdue', size: 100, enableSorting: false,
			cell: (p) => p.row.original.month_overdue },
		{ header: t('Дни в месяце'), accessorKey: 'days_in_the_month', size: 150, enableSorting: false,
			cell: (p) => <div className='text-center'>{p.row.original.days_in_the_month}</div> },
		{ header: () => <span className='ml-auto'>{t('Основной долг')}</span>, accessorKey: 'main_amount_of_payment', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.main_amount_of_payment)}</div> },
		{ header: () => <span className='ml-auto'>{t('Проценты')}</span>, accessorKey: 'rent_percent', size: 130, ...moneyMeta,
			cell: (p) => <div className='text-right'>{p.row.original.rent_percent ?? '-'}</div> },
		{ header: () => <span className='ml-auto'>{t('Общая сумма')}</span>, accessorKey: 'total_amount', size: 180, ...moneyMeta,
			cell: (p) => <div className='text-right'>{formatPrice(p.row.original.total_amount)}</div> },
		{ header: () => <span className='ml-auto'>{t('Просрочка')}</span>, accessorKey: 'overdue_amount', size: 160, ...moneyMeta,
			cell: (p) => <div className='text-right text-red-500'>{formatPrice(p.row.original.overdue_amount)}</div> },
		{ header: t('Талабнома'), accessorKey: 'notice', size: 130, enableSorting: false,
			cell: (p) => {
				const onDocs = async () => {
					const { data } = await mutateAsyncNotice(p.row.original.id)
					const url = data?.pdf_document ?? data?.pdf_url
					if (!url) { toast.push(<Notification type='danger' title='Pdf не найден' duration={2000} />, { placement: 'top-center' }); return }
					window.open(url, '_blank', 'noopener,noreferrer')
				}
				return <DocsColumn onDocsClick={onDocs} style={{ minWidth: p.column.getSize() - 48 }} />
			}
		},
		{ header: t('СМС Статус'), accessorKey: 'sms_status', size: 150, enableSorting: false,
			cell: (p) => {
				const s = smsStatusMap[p.row.original.sms_status]
				return s ? (
					<div className='flex items-center gap-2'>
						<span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
						<span className={`font-medium ${s.text}`}>{s.label}</span>
					</div>
				) : <span className='text-gray-500'>—</span>
			}
		},
		{ header: t('Дата отправления'), accessorKey: 'notice_date', size: 170, enableSorting: false,
			cell: (p) => formatDate(p.row.original.notice_date) },
		{ header: t('Действие'), id: 'actions', size: 100, enableSorting: false,
			meta: { thClassName: 'sticky right-0 z-[5]', tdClassName: 'sticky right-0 bg-white dark:bg-gray-800' },
			cell: (p) => <ActionColumn onViewClick={() => {}} style={{ minWidth: p.column.getSize() - 48 }} />
		}
	], [t, lang, queries.page, queries.size])

	return (
		<DataTable columns={columns} data={data?.results ?? []} loading={isLoading}
							 pagingData={{ total: data?.count ?? 0, pageIndex: queries.page, pageSize: queries.size }}
							 onPaginationChange={(page) => setQueries(p => ({ ...p, page }))}
							 onSelectChange={(size) => setQueries(p => ({ ...p, size }))} />
	)
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const MarketingClientView = () => {
	const { t } = useTranslation()
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()

	const [activeTab, setActiveTab] = useState('applications')
	const [directorName, setDirectorName] = useState('Директор')
	const [phone, setPhone] = useState('')
	const [editingDirector, setEditingDirector] = useState(false)
	const [editingPhone, setEditingPhone] = useState(false)

	// Load client data — explicit type annotation to avoid "any"
	const { data: client, isLoading: clientLoading } = useQuery<MarketingClient>({
		queryKey: ['marketing-client', id],
		queryFn: () =>
			MarketingClientsService.getById(Number(id)).then((res) => res.data),
		enabled: !!id
	})

	// onSuccess is deprecated in tanstack-query v5 — use useEffect
	useEffect(() => {
		if (client?.phone_number) {
			setPhone(client.phone_number)
		}
	}, [client?.phone_number])

	const { mutateAsync: saveClient, isPending: isSaving } = useMutation({
		mutationFn: () =>
			MarketingClientsService.update(Number(id), { phone_number: phone }),
		onSuccess() {
			toast.push(
				<Notification type='success' title={t('Сохранено')} duration={2000} />,
				{ placement: 'top-center' }
			)
			setEditingDirector(false)
			setEditingPhone(false)
		},
		onError(error) {
			toast.push(
				<Notification type='danger' title={errorCatch(error)} duration={2000} />,
				{ placement: 'top-center' }
			)
		}
	})

	const regionName = (client as MarketingClient | undefined)?.branch?.region?.name_ru ?? '-'
	const stir       = (client as MarketingClient | undefined)?.stir ?? ''

	const statCounts: Record<string, number> = {
		applications:       (client as MarketingClient | undefined)?.applications_count      ?? 0,
		new_contracts:      (client as MarketingClient | undefined)?.new_contracts_count     ?? 0,
		current_contracts:  (client as MarketingClient | undefined)?.current_contracts_count ?? 0,
		requests:           (client as MarketingClient | undefined)?.requests_count          ?? 0,
		leasing:            (client as MarketingClient | undefined)?.leasing_count           ?? 0
	}

	const overallAmount = (client as MarketingClient | undefined)?.overall_contract_amount

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			{/* ── HEADER ─────────────────────────────────────────────── */}
			<div className='mb-6'>
				{/* Back + Title */}
				<div className='flex items-center gap-3 mb-4'>
					<button
						className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
						onClick={() => navigate(-1)}
					>
						<HiArrowLeft className='text-xl' />
					</button>
					<h3 className='mb-0'>
						{clientLoading ? '...' : (client as MarketingClient | undefined)?.client_company_name ?? '—'}
					</h3>
				</div>

				{/* region + director + phone + save — 2-rasmdek */}
				<div className='flex flex-wrap items-center gap-3'>
					{/* Viloyat — readonly */}
					<div className='rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 text-sm font-medium min-w-[150px]'>
						{regionName}
					</div>

					{/* Директор — editable */}
					<div className='flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 min-w-[170px]'>
						{editingDirector ? (
							<Input
								size='sm'
								className='border-0 bg-transparent p-0 text-sm h-auto'
								value={directorName}
								onChange={(e) => setDirectorName(e.target.value)}
								autoFocus
								onBlur={() => setEditingDirector(false)}
							/>
						) : (
							<span className='text-sm font-medium flex-1'>{directorName}</span>
						)}
						<button
							className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1'
							onClick={() => setEditingDirector(true)}
						>
							<HiOutlinePencil className='text-sm' />
						</button>
					</div>

					{/* Telefon — editable */}
					<div className='flex items-center gap-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2 min-w-[170px]'>
						{editingPhone ? (
							<Input
								size='sm'
								className='border-0 bg-transparent p-0 text-sm h-auto'
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								autoFocus
								onBlur={() => setEditingPhone(false)}
							/>
						) : (
							<span className='text-sm font-medium flex-1'>{phone || '—'}</span>
						)}
						<button
							className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-1'
							onClick={() => setEditingPhone(true)}
						>
							<HiOutlinePencil className='text-sm' />
						</button>
					</div>

					{/* Сохранить */}
					<Button variant='solid' size='sm' loading={isSaving} onClick={() => saveClient()}>
						{t('Сохранить')}
					</Button>
				</div>
			</div>

			{/* ── STAT CARDS ─────────────────────────────────────────── */}
			<div className='mb-6 flex gap-3 overflow-x-auto pb-1'>
				{STAT_CARDS.map((cfg) => (
					<StatCard
						key={cfg.key}
						cfg={cfg}
						count={statCounts[cfg.key]}
						amount={overallAmount}
					/>
				))}
			</div>

			{/* ── TABS + TABLES ──────────────────────────────────────── */}
			<Tabs value={activeTab} onChange={setActiveTab}>
				<TabList>
					{STAT_CARDS.map((cfg) => (
						<TabNav key={cfg.key} value={cfg.key}>
							{t(cfg.label)}
						</TabNav>
					))}
				</TabList>

				<div className='mt-4'>
					<TabContent value='applications'>
						{stir ? <ApplicationsTab stir={stir} /> : null}
					</TabContent>
					<TabContent value='new_contracts'>
						<div className='py-8 text-center text-gray-400'>{t('Нет данных')}</div>
					</TabContent>
					<TabContent value='current_contracts'>
						{stir ? <CurrentContractsTab stir={stir} /> : null}
					</TabContent>
					<TabContent value='requests'>
						{stir ? <RequestsTab stir={stir} /> : null}
					</TabContent>
					<TabContent value='leasing'>
						<div className='py-8 text-center text-gray-400'>{t('Нет данных')}</div>
					</TabContent>
				</div>
			</Tabs>
		</AdaptableCard>
	)
}

export default MarketingClientView
