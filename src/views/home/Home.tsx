import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
	HiOutlineDocumentText,
	HiOutlineClipboardList,
	HiOutlineExclamationCircle,
	HiOutlinePlusCircle,
	HiOutlineEye
} from 'react-icons/hi'
import { Card, Progress, Skeleton, Button } from '@/components/ui'
import { Chart } from '@/components/shared'
import { DashboardService } from '@/services/dashboard.service'
import { PaginatedResponse } from '@/@types/common'
import { ContractApplication, ContractStatusEnum } from '@/@types/contract.types'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import dayjs from 'dayjs'

// ---------- Types ----------

type MonthlyStatItem = {
	month: string
	new: number
	current: number
	completed: number
}

type ContractListItem = {
	id: number
	code: string
	contract_date: string
	branch_region: string
	client_company_name: string
	tech_model: string
	price_with_gps: string
	status: ContractStatusEnum
	created_at: string
}

// ---------- Helpers ----------

function formatSum(value: string | number): string {
	const num = Number(value)
	if (isNaN(num)) return String(value)
	if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)} млрд`
	if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} млн`
	return num.toLocaleString('ru-RU')
}

const STATUS_COLORS: Record<number, string> = {
	[ContractStatusEnum.PENDING_TRANSFER]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
	[ContractStatusEnum.DEPOSIT_PAID]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
	[ContractStatusEnum.TECH_GIVEN]: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
	[ContractStatusEnum.CANCELED]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
	[ContractStatusEnum.CLIENT_CHANGED]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
	[ContractStatusEnum.TECH_RETURNED]: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
	[ContractStatusEnum.CURRENT_CLIENT]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
}

const STATUS_TRANSLATION: Record<number, string> = {
	[ContractStatusEnum.PENDING_TRANSFER]: 'Ожидание оплаты',
	[ContractStatusEnum.DEPOSIT_PAID]: 'Ожидание выдачи техники',
	[ContractStatusEnum.TECH_GIVEN]: 'Выдача техники',
	[ContractStatusEnum.CANCELED]: 'Отменён',
	[ContractStatusEnum.CLIENT_CHANGED]: 'Переуступка',
	[ContractStatusEnum.TECH_RETURNED]: 'Возврат средств',
	[ContractStatusEnum.CURRENT_CLIENT]: 'Текущий договор',
}

const DONUT_COLORS: Record<number, string> = {
	[ContractStatusEnum.PENDING_TRANSFER]: '#f59e0b',
	[ContractStatusEnum.DEPOSIT_PAID]: '#3b82f6',
	[ContractStatusEnum.TECH_GIVEN]: '#10b981',
	[ContractStatusEnum.CANCELED]: '#ef4444',
	[ContractStatusEnum.CLIENT_CHANGED]: '#8b5cf6',
	[ContractStatusEnum.TECH_RETURNED]: '#f97316',
	[ContractStatusEnum.CURRENT_CLIENT]: '#06b6d4',
}

const STATUS_ORDER = [
	ContractStatusEnum.PENDING_TRANSFER,
	ContractStatusEnum.DEPOSIT_PAID,
	ContractStatusEnum.TECH_GIVEN,
	ContractStatusEnum.CANCELED,
	ContractStatusEnum.CLIENT_CHANGED,
	ContractStatusEnum.TECH_RETURNED,
	ContractStatusEnum.CURRENT_CLIENT,
] as const

const MONTHLY_FALLBACK: MonthlyStatItem[] = Array.from({ length: 12 }, (_, i) => ({
	month: ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][i],
	new: 0, current: 0, completed: 0
}))
const OVERDUE_TREND = [3, 5, 4, 7, 6, 9, 8, 11, 10, 14, 13, 19]

const REGION_CONTRACTS = [
	{ name_ru: 'Ташкентская обл.', count: 28, max: 50 },
	{ name_ru: 'Самаркандская обл.', count: 18, max: 50 },
	{ name_ru: 'Ферганская обл.', count: 15, max: 50 },
	{ name_ru: 'Андижанская обл.', count: 14, max: 50 },
	{ name_ru: 'Наманганская обл.', count: 12, max: 50 },
	{ name_ru: 'Бухарская обл.', count: 11, max: 50 },
	{ name_ru: 'Навоийская обл.', count: 8, max: 50 }
]

// ---------- MetricCard ----------

type MetricCardProps = {
	icon: React.ReactNode
	label: string
	value: number
	loading: boolean
	color: string
}

function MetricCard({ icon, label, value, loading, color }: MetricCardProps) {
	return (
		<Card className='dark:bg-gray-800'>
			<div className='flex items-center gap-4'>
				<div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${color}`}>
					{icon}
				</div>
				<div className='min-w-0'>
					<p className='truncate text-sm text-gray-500 dark:text-gray-400'>{label}</p>
					{loading ? (
						<Skeleton className='mt-1 h-7 w-16' />
					) : (
						<p className='text-2xl font-bold text-gray-900 dark:text-gray-100'>{value}</p>
					)}
				</div>
			</div>
		</Card>
	)
}

// ---------- Main component ----------

const Home = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	// Counts for metric cards
	const [contractsCount, setContractsCount] = useState(0)
	const [newContractsCount, setNewContractsCount] = useState(0)
	const [applicationsCount, setApplicationsCount] = useState(0)
	const [overdueCount, setOverdueCount] = useState(0)

	// Table data
	const [contractsList, setContractsList] = useState<ContractListItem[]>([])
	const [overdueList, setOverdueList] = useState<PaymentOverdueNotice[]>([])

	// Monthly stats for stacked bar chart
	const [monthlyStats, setMonthlyStats] = useState<MonthlyStatItem[]>(MONTHLY_FALLBACK)

	// Per-metric loading flags
	const [loadingContracts, setLoadingContracts] = useState(true)
	const [loadingNewContracts, setLoadingNewContracts] = useState(true)
	const [loadingApplications, setLoadingApplications] = useState(true)
	const [loadingOverdue, setLoadingOverdue] = useState(true)

	useEffect(() => {
		// 1. All contracts — feeds metric + table + donut
		DashboardService.getContracts<PaginatedResponse<ContractListItem[]>>()
			.then(({ data }) => {
				setContractsCount(data.count)
				setContractsList(data.results.slice(0, 5))
			})
			.finally(() => setLoadingContracts(false))

		// 2. New contracts — feeds metric only
		DashboardService.getNewContracts<PaginatedResponse<unknown>>()
			.then(({ data }) => setNewContractsCount(data.count))
			.catch(() => setNewContractsCount(0))
			.finally(() => setLoadingNewContracts(false))

		// 3. Applications — feeds metric only
		DashboardService.getApplications<PaginatedResponse<ContractApplication[]>>()
			.then(({ data }) => setApplicationsCount(data.count))
			.catch(() => setApplicationsCount(0))
			.finally(() => setLoadingApplications(false))

		// 5. Monthly stats — feeds stacked bar chart
		DashboardService.getMonthlyStats<MonthlyStatItem[]>()
			.then(({ data }) => { if (data?.length) setMonthlyStats(data) })
			.catch(() => {})

		// 4. Overdue notices — feeds metric + table
		DashboardService.getOverdueNotices<PaginatedResponse<PaymentOverdueNotice[]>>()
			.then(({ data }) => {
				setOverdueCount(data.count)
				setOverdueList(data.results.slice(0, 5))
			})
			.catch(() => setOverdueCount(0))
			.finally(() => setLoadingOverdue(false))
	}, [])

	// Donut series derived from loaded contractsList
	const statusCounts = contractsList.reduce<Record<number, number>>((acc, c) => {
		acc[c.status] = (acc[c.status] ?? 0) + 1
		return acc
	}, {})

	const donutSeries = STATUS_ORDER.map(s => statusCounts[s] ?? 0)
	const donutLabels = STATUS_ORDER.map(s => STATUS_TRANSLATION[s])
	const donutColors = STATUS_ORDER.map(s => DONUT_COLORS[s])
	const donutTotal = donutSeries.reduce((a, b) => a + b, 0)

	const months = [
		t('dashboard.month.jan'), t('dashboard.month.feb'), t('dashboard.month.mar'),
		t('dashboard.month.apr'), t('dashboard.month.may'), t('dashboard.month.jun'),
		t('dashboard.month.jul'), t('dashboard.month.aug'), t('dashboard.month.sep'),
		t('dashboard.month.oct'), t('dashboard.month.nov'), t('dashboard.month.dec')
	]

	return (
		<div className='space-y-6 p-1'>
			{/* ── Title ── */}
			<h3 className='mb-0 text-gray-900 dark:text-gray-100'>{t('dashboard.title')}</h3>

			{/* ── 4 Metric Cards ── */}
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				<MetricCard
					icon={<HiOutlineDocumentText />}
					label={t('dashboard.total_contracts')}
					value={contractsCount}
					loading={loadingContracts}
					color='bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
				/>
				<MetricCard
					icon={<HiOutlinePlusCircle />}
					label={t('dashboard.new_contracts')}
					value={newContractsCount}
					loading={loadingNewContracts}
					color='bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
				/>
				<MetricCard
					icon={<HiOutlineClipboardList />}
					label={t('dashboard.applications')}
					value={applicationsCount}
					loading={loadingApplications}
					color='bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
				/>
				<MetricCard
					icon={<HiOutlineExclamationCircle />}
					label={t('dashboard.overdue_notices')}
					value={overdueCount}
					loading={loadingOverdue}
					color='bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
				/>
			</div>

			{/* ── Row 2: Contracts Table + Donut ── */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
				{/* Contracts table */}
				<Card className='xl:col-span-2 dark:bg-gray-800'>
					<div className='mb-4 flex items-center justify-between'>
						<h5 className='mb-0 font-semibold text-gray-800 dark:text-gray-100'>
							{t('dashboard.contracts_table')}
						</h5>
						<Button
							size='sm'
							variant='plain'
							onClick={() => navigate('/clients/new-contracts')}
							icon={<HiOutlineEye />}
						>
							{t('Посмотреть')}
						</Button>
					</div>

					{loadingContracts ? (
						<div className='space-y-3'>
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className='h-10 w-full' />
							))}
						</div>
					) : contractsList.length === 0 ? (
						<p className='py-8 text-center text-gray-400'>{t('dashboard.no_data')}</p>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400'>
										<th className='pb-2 pr-4'>{t('dashboard.col.contract_no')}</th>
										<th className='pb-2 pr-4'>{t('dashboard.col.company')}</th>
										<th className='hidden pb-2 pr-4 md:table-cell'>{t('dashboard.col.equipment')}</th>
										<th className='hidden pb-2 pr-4 lg:table-cell'>{t('dashboard.col.amount')}</th>
										<th className='pb-2'>{t('dashboard.col.status')}</th>
									</tr>
								</thead>
								<tbody>
									{contractsList.map((c) => (
										<tr
											key={c.id}
											className='border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30'
										>
											<td className='py-2 pr-4 font-medium text-gray-900 dark:text-gray-100'>
												{c.code}
											</td>
											<td className='max-w-[180px] truncate py-2 pr-4 text-gray-600 dark:text-gray-300'>
												{c.client_company_name}
											</td>
											<td className='hidden py-2 pr-4 text-gray-500 dark:text-gray-400 md:table-cell'>
												{c.tech_model}
											</td>
											<td className='hidden py-2 pr-4 text-gray-700 dark:text-gray-200 lg:table-cell'>
												{formatSum(c.price_with_gps)}
											</td>
											<td className='py-2'>
												<span
													className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status] ?? 'bg-gray-100 text-gray-700'}`}
												>
													{STATUS_TRANSLATION[c.status] ?? '—'}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>

				{/* Donut chart */}
				<Card className='dark:bg-gray-800'>
					<h5 className='mb-3 font-semibold text-gray-800 dark:text-gray-100'>
						{t('dashboard.contract_status_distribution')}
					</h5>
					{loadingContracts ? (
						<div className='flex h-52 items-center justify-center'>
							<Skeleton className='h-40 w-40 rounded-full' />
						</div>
					) : (
						<div className='flex items-center gap-4'>
							{/* Chart */}
							<div className='shrink-0'>
								<Chart
									key={contractsCount}
									type='donut'
									series={donutSeries}
									width={160}
									height={160}
									customOptions={{
										labels: donutLabels,
										colors: donutColors,
										legend: { show: false },
										plotOptions: {
											pie: {
												donut: {
													size: '72%',
													labels: {
														show: true,
														value: {
															show: true,
															fontSize: '24px',
															fontWeight: 700,
															offsetY: 6,
															formatter: () => String(contractsCount)
														},
														total: {
															show: true,
															showAlways: true,
															label: '',
															fontSize: '0px',
															color: 'transparent',
															formatter: () => String(contractsCount)
														}
													}
												}
											}
										},
										dataLabels: { enabled: false },
										stroke: { width: 0 }
									}}
								/>
							</div>

							{/* Custom legend */}
							<div className='flex min-w-0 flex-1 flex-col gap-2'>
								{STATUS_ORDER.map(s => {
									const count = statusCounts[s] ?? 0
									const pct = donutTotal > 0 ? Math.round((count / donutTotal) * 100) : 0
									return (
										<div key={s} className='flex items-center gap-1.5 text-[11px]'>
											<span
												className='h-2 w-2 shrink-0 rounded-full'
												style={{ background: DONUT_COLORS[s] }}
											/>
											<span className='min-w-0 truncate text-gray-600 dark:text-gray-300'>
												{STATUS_TRANSLATION[s]}
											</span>
											<span className='ml-auto shrink-0 font-semibold text-gray-800 dark:text-gray-200'>
												{count}
											</span>
											<span className='w-7 shrink-0 text-right text-gray-400'>
												{pct}%
											</span>
										</div>
									)
								})}
							</div>
						</div>
					)}
				</Card>
			</div>

			{/* ── Row 3: Bar Chart + Area Chart ── */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
				<Card className='dark:bg-gray-800'>
					<h5 className='mb-2 font-semibold text-gray-800 dark:text-gray-100'>
						{t('dashboard.monthly_contracts')}
					</h5>
					<Chart
						type='bar'
						series={[
							{ name: 'Новые',       data: monthlyStats.map(m => m.new) },
							{ name: 'Текущие',     data: monthlyStats.map(m => m.current) },
							{ name: 'Завершённые', data: monthlyStats.map(m => m.completed) }
						]}
						customOptions={{
							colors: ['#3b82f6', '#10b981', '#ef4444'],
							chart: {
								stacked: true,
								toolbar: { show: false },
								zoom: { enabled: false }
							},
							plotOptions: { bar: { borderRadius: 0, columnWidth: '55%' } },
							dataLabels: {
								enabled: true,
								formatter: (val: number) => (val > 0 ? String(val) : ''),
								style: { fontSize: '10px', colors: ['#ffffff'], fontWeight: 600 }
							},
							stroke: { show: false },
							states: { hover: { filter: { type: 'none' } } },
							grid: { borderColor: '#f3f4f6' },
							legend: {
								show: true,
								position: 'bottom',
								fontSize: '12px',
								markers: { size: 8 },
								itemMargin: { horizontal: 12 }
							},
							tooltip: {
								shared: true,
								intersect: false,
								y: { formatter: (val: number) => `${val}` }
							},
							yaxis: { labels: { style: { fontSize: '11px' } } },
							xaxis: {
								categories: monthlyStats.map(m => m.month),
								labels: { style: { fontSize: '11px' } }
							}
						}}
						height={260}
					/>
				</Card>

				<Card className='dark:bg-gray-800'>
					<h5 className='mb-2 font-semibold text-gray-800 dark:text-gray-100'>
						{t('dashboard.overdue_trend')}
					</h5>
					<Chart
						type='area'
						series={[{ name: t('dashboard.overdue_notices'), data: OVERDUE_TREND }]}
						customOptions={{
							colors: ['#ef4444'],
							fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.05 } },
							dataLabels: { enabled: false },
							stroke: { width: 2, curve: 'smooth' },
							grid: { borderColor: '#f3f4f6' },
							yaxis: { labels: { style: { fontSize: '11px' } } },
							xaxis: {
								categories: months,
								labels: { style: { fontSize: '11px' } }
							}
						}}
						height={230}
					/>
				</Card>
			</div>

			{/* ── Row 4: Overdue Table + Regions ── */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
				{/* Overdue notices table */}
				<Card className='xl:col-span-2 dark:bg-gray-800'>
					<div className='mb-4 flex items-center justify-between'>
						<h5 className='mb-0 font-semibold text-gray-800 dark:text-gray-100'>
							{t('dashboard.overdue_table')}
						</h5>
						<Button
							size='sm'
							variant='plain'
							onClick={() => navigate('/paper-trackers')}
							icon={<HiOutlineEye />}
						>
							{t('Посмотреть')}
						</Button>
					</div>

					{loadingOverdue ? (
						<div className='space-y-3'>
							{[...Array(3)].map((_, i) => (
								<Skeleton key={i} className='h-10 w-full' />
							))}
						</div>
					) : overdueList.length === 0 ? (
						<p className='py-8 text-center text-gray-400'>{t('dashboard.no_data')}</p>
					) : (
						<div className='overflow-x-auto'>
							<table className='w-full text-sm'>
								<thead>
									<tr className='border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400'>
										<th className='pb-2 pr-4'>{t('dashboard.col.contract_no')}</th>
										<th className='pb-2 pr-4'>{t('dashboard.col.company')}</th>
										<th className='hidden pb-2 pr-4 md:table-cell'>{t('dashboard.col.overdue_months')}</th>
										<th className='hidden pb-2 pr-4 lg:table-cell'>{t('dashboard.col.overdue_amount')}</th>
										<th className='pb-2'>{t('dashboard.col.notice_date')}</th>
									</tr>
								</thead>
								<tbody>
									{overdueList.map((n) => (
										<tr
											key={n.id}
											className='border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30'
										>
											<td className='py-2 pr-4 font-medium text-gray-900 dark:text-gray-100'>
												{n.contract_code}
											</td>
											<td className='max-w-[180px] truncate py-2 pr-4 text-gray-600 dark:text-gray-300'>
												{n.company_name}
											</td>
											<td className='hidden py-2 pr-4 md:table-cell'>
												<span className='rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400'>
													{n.month_overdue} мес.
												</span>
											</td>
											<td className='hidden py-2 pr-4 font-medium text-red-600 dark:text-red-400 lg:table-cell'>
												{formatSum(n.overdue_amount)} сум
											</td>
											<td className='py-2 text-gray-500 dark:text-gray-400'>
												{dayjs(n.notice_date).format('DD.MM.YYYY')}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</Card>

				{/* Regions progress bars */}
				<Card className='dark:bg-gray-800'>
					<h5 className='mb-4 font-semibold text-gray-800 dark:text-gray-100'>
						{t('dashboard.regions_distribution')}
					</h5>
					<div className='space-y-4'>
						{REGION_CONTRACTS.map((r) => (
							<div key={r.name_ru}>
								<div className='mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-300'>
									<span className='truncate pr-2'>{r.name_ru}</span>
									<span className='shrink-0 font-semibold'>{r.count}</span>
								</div>
								<Progress
									percent={Math.round((r.count / r.max) * 100)}
									size='sm'
									color='emerald-500'
								/>
							</div>
						))}
					</div>
				</Card>
			</div>
		</div>
	)
}

export default Home
