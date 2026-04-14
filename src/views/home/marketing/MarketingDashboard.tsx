import { type ReactNode, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	HiChevronDown,
	HiChevronUp,
	HiOutlineCheckCircle,
	HiOutlineClipboardList,
	HiOutlineDocumentText,
	HiOutlinePlusCircle
} from 'react-icons/hi'
import dayjs from 'dayjs'
import {
	ContractApplicationStatusEnum,
	ContractStatusEnum
} from '@/@types/contract.types'
import { Chart } from '@/components/shared'
import { Card, Progress, Skeleton } from '@/components/ui'
import { DashboardService } from '@/services/dashboard.service'
import DateRangeFilter, { DateRange } from './components/DateRangeFilter'

// ---------- Types ----------

type MarketingStats = {
	applications_count: number
	applications_by_status: Record<number, number>
	new_contracts_count: number
	new_contracts_by_status: Record<number, number>
	current_contracts_count: number
	completed_contracts_count: number
}

type MonthlyStatItem = {
	month: string
	applications: number
	new: number
	current: number
	completed: number
}

type RegionalStatItem = {
	region_id: number
	name_ru: string
	applications_count: number
	new_contracts_count: number
	current_contracts_count: number
}

type EquipmentItem = {
	manufacturer: string
	model: string
	count: number
	total_amount: string
	avg_price: string
}

type EquipmentRegion = {
	region: { id: number; name_ru: string }
	equipment: EquipmentItem[]
}

// ---------- Constants ----------

const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']

// Application status colors
const APP_STATUS_COLORS: Record<number, string> = {
	[ContractApplicationStatusEnum.NEW]:                '#3b82f6',
	[ContractApplicationStatusEnum.ASSIGNED]:           '#8b5cf6',
	[ContractApplicationStatusEnum.DOCUMENT_GATHERING]: '#f59e0b',
	[ContractApplicationStatusEnum.IN_COMMISSION]:      '#f97316',
	[ContractApplicationStatusEnum.REJECTED]:           '#ef4444',
	[ContractApplicationStatusEnum.CONTRACT_CREATED]:   '#10b981',
}

const APP_STATUS_I18N_KEY: Record<number, string> = {
	[ContractApplicationStatusEnum.NEW]:                'marketing.app_status.new',
	[ContractApplicationStatusEnum.ASSIGNED]:           'marketing.app_status.assigned',
	[ContractApplicationStatusEnum.DOCUMENT_GATHERING]: 'marketing.app_status.document_gathering',
	[ContractApplicationStatusEnum.IN_COMMISSION]:      'marketing.app_status.in_commission',
	[ContractApplicationStatusEnum.REJECTED]:           'marketing.app_status.rejected',
	[ContractApplicationStatusEnum.CONTRACT_CREATED]:   'marketing.app_status.contract_created',
}

const APP_STATUS_ORDER = [
	ContractApplicationStatusEnum.NEW,
	ContractApplicationStatusEnum.ASSIGNED,
	ContractApplicationStatusEnum.DOCUMENT_GATHERING,
	ContractApplicationStatusEnum.IN_COMMISSION,
	ContractApplicationStatusEnum.REJECTED,
	ContractApplicationStatusEnum.CONTRACT_CREATED,
] as const

// New contract status colors
const CONTRACT_STATUS_COLORS: Record<number, string> = {
	[ContractStatusEnum.PENDING_TRANSFER]: '#f59e0b',
	[ContractStatusEnum.DEPOSIT_PAID]:     '#3b82f6',
	[ContractStatusEnum.TECH_GIVEN]:       '#10b981',
	[ContractStatusEnum.CANCELED]:         '#ef4444',
	[ContractStatusEnum.CLIENT_CHANGED]:   '#8b5cf6',
	[ContractStatusEnum.TECH_RETURNED]:    '#f97316',
	[ContractStatusEnum.CURRENT_CLIENT]:   '#06b6d4',
}

const CONTRACT_STATUS_I18N_KEY: Record<number, string> = {
	[ContractStatusEnum.PENDING_TRANSFER]: 'marketing.contract_status.pending_transfer',
	[ContractStatusEnum.DEPOSIT_PAID]:     'marketing.contract_status.deposit_paid',
	[ContractStatusEnum.TECH_GIVEN]:       'marketing.contract_status.tech_given',
	[ContractStatusEnum.CANCELED]:         'marketing.contract_status.canceled',
	[ContractStatusEnum.CLIENT_CHANGED]:   'marketing.contract_status.client_changed',
	[ContractStatusEnum.TECH_RETURNED]:    'marketing.contract_status.tech_returned',
	[ContractStatusEnum.CURRENT_CLIENT]:   'marketing.contract_status.current_client',
}

const CONTRACT_STATUS_ORDER = [
	ContractStatusEnum.PENDING_TRANSFER,
	ContractStatusEnum.DEPOSIT_PAID,
	ContractStatusEnum.TECH_GIVEN,
	ContractStatusEnum.CANCELED,
	ContractStatusEnum.CLIENT_CHANGED,
	ContractStatusEnum.TECH_RETURNED,
	ContractStatusEnum.CURRENT_CLIENT,
] as const

// ---------- Helpers ----------

function formatSum(value: string | number): string {
	const num = Number(value)
	if (isNaN(num)) {
		return String(value)
	}
	if (num >= 1_000_000_000) {
		return `${(num / 1_000_000_000).toFixed(1)} млрд`
	}
	if (num >= 1_000_000) {
		return `${(num / 1_000_000).toFixed(1)} млн`
	}

	return num.toLocaleString('ru-RU')
}

function getDefaultDateRange(): DateRange {
	return {
		from: dayjs().startOf('year').format('YYYY-MM-DD'),
		to: dayjs().format('YYYY-MM-DD'),
	}
}

// ---------- MetricCard ----------

type MetricCardProps = {
	icon: ReactNode
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

// ---------- DonutWithLegend ----------

type DonutProps = {
	title: string
	series: number[]
	labels: string[]
	colors: string[]
	total: number
	loading: boolean
}

function DonutWithLegend({ title, series, labels, colors, total, loading }: DonutProps) {
	return (
		<Card className='dark:bg-gray-800'>
			<h5 className='mb-3 font-semibold text-gray-800 dark:text-gray-100'>{title}</h5>
			{loading ? (
				<div className='flex h-52 items-center justify-center'>
					<Skeleton className='h-40 w-40 rounded-full' />
				</div>
			) : (
				<div className='flex items-center gap-4'>
					<div className='shrink-0'>
						<Chart
							key={total}
							type='donut'
							series={series}
							width={160}
							height={160}
							customOptions={{
								labels,
								colors,
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
													formatter: () => String(total)
												},
												total: {
													show: true,
													showAlways: true,
													label: '',
													fontSize: '0px',
													color: 'transparent',
													formatter: () => String(total)
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
					<div className='flex min-w-0 flex-1 flex-col gap-2'>
						{labels.map((label, i) => {
							const count = series[i] ?? 0
							const pct = total > 0 ? Math.round((count / total) * 100) : 0
							
return (
								<div key={label} className='flex items-center gap-1.5 text-[11px]'>
									<span
										className='h-2 w-2 shrink-0 rounded-full'
										style={{ background: colors[i] }}
									/>
									<span className='min-w-0 truncate text-gray-600 dark:text-gray-300'>
										{label}
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
	)
}

// ---------- RegionalBars ----------

type RegionalBarsProps = {
	title: string
	data: { name_ru: string; count: number }[]
	color: string
	loading: boolean
}

function RegionalBars({ title, data, color, loading }: RegionalBarsProps) {
	const total = data.reduce((s, r) => s + r.count, 0)
	
return (
		<Card className='dark:bg-gray-800'>
			<h5 className='mb-4 font-semibold text-gray-800 dark:text-gray-100'>{title}</h5>
			{loading ? (
				<div className='space-y-3'>
					{[...Array(5)].map((_, i) => <Skeleton key={i} className='h-6 w-full' />)}
				</div>
			) : (
				<div className='space-y-3'>
					{data.map((r) => {
						const pct = total > 0 ? Math.round((r.count / total) * 100) : 0
						
return (
							<div key={r.name_ru}>
								<div className='mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-300'>
									<span className='truncate pr-2'>{r.name_ru}</span>
									<span className='shrink-0 font-semibold'>
										{r.count} <span className='font-normal text-gray-400'>({pct}%)</span>
									</span>
								</div>
								<Progress percent={pct} size='sm' color={color} />
							</div>
						)
					})}
				</div>
			)}
		</Card>
	)
}

// ---------- Main Component ----------

const MarketingDashboard = () => {
	const { t } = useTranslation()
	const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange)

	const [stats, setStats] = useState<MarketingStats | null>(null)
	const [monthlyStats, setMonthlyStats] = useState<MonthlyStatItem[]>(() =>
		MONTH_KEYS.map(k => ({ month: k, applications: 0, new: 0, current: 0, completed: 0 }))
	)
	const [regionalStats, setRegionalStats] = useState<RegionalStatItem[]>([])
	const [equipmentByRegion, setEquipmentByRegion] = useState<EquipmentRegion[]>([])
	const [loadingStats, setLoadingStats] = useState(true)
	const [loadingMonthly, setLoadingMonthly] = useState(true)
	const [loadingRegional, setLoadingRegional] = useState(true)
	const [loadingEquipment, setLoadingEquipment] = useState(true)

	// Expand/collapse state per region for equipment table
	const [expandedRegions, setExpandedRegions] = useState<Set<number>>(new Set())

	useEffect(() => {
		const params = { date_from: dateRange.from, date_to: dateRange.to }

		setLoadingStats(true)
		setLoadingMonthly(true)
		setLoadingRegional(true)
		setLoadingEquipment(true)

		DashboardService.getMarketingStats<MarketingStats>(params)
			.then(({ data }) => setStats(data))
			.catch(() => setStats(null))
			.finally(() => setLoadingStats(false))

		DashboardService.getMonthlyStats<MonthlyStatItem[]>(params)
			.then(({ data }) => { if (data?.length) setMonthlyStats(data) })
			.catch(() => {})
			.finally(() => setLoadingMonthly(false))

		DashboardService.getRegionalStats<RegionalStatItem[]>(params)
			.then(({ data }) => setRegionalStats(data ?? []))
			.catch(() => setRegionalStats([]))
			.finally(() => setLoadingRegional(false))

		DashboardService.getEquipmentByRegion<EquipmentRegion[]>(params)
			.then(({ data }) => setEquipmentByRegion(data ?? []))
			.catch(() => setEquipmentByRegion([]))
			.finally(() => setLoadingEquipment(false))
	}, [dateRange])

	// Donut data — Applications
	const appSeries = APP_STATUS_ORDER.map(s => stats?.applications_by_status[s] ?? 0)
	const appLabels = APP_STATUS_ORDER.map(s => t(APP_STATUS_I18N_KEY[s]))
	const appColors = APP_STATUS_ORDER.map(s => APP_STATUS_COLORS[s])

	// Donut data — New Contracts
	const contractSeries = CONTRACT_STATUS_ORDER.map(s => stats?.new_contracts_by_status[s] ?? 0)
	const contractLabels = CONTRACT_STATUS_ORDER.map(s => t(CONTRACT_STATUS_I18N_KEY[s]))
	const contractColors = CONTRACT_STATUS_ORDER.map(s => CONTRACT_STATUS_COLORS[s])

	// Stacked bar xaxis — full month names via i18n
	const barCategories = MONTH_KEYS.map(k => t(`dashboard.month.${k}`))

	const toggleRegion = (id: number) => {
		setExpandedRegions(prev => {
			const next = new Set(prev)
			if (next.has(id)) next.delete(id)
			else next.add(id)
			
return next
		})
	}

	return (
		<div className='space-y-6 p-1'>
			{/* ── Title + DateFilter ── */}
			<div className='space-y-3'>
				<h3 className='mb-0 text-gray-900 dark:text-gray-100'>{t('marketing.title')}</h3>
				<DateRangeFilter value={dateRange} onChange={setDateRange} />
			</div>

			{/* ── Section 1: 4 Metric Cards ── */}
			<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
				<MetricCard
					icon={<HiOutlineClipboardList />}
					label={t('marketing.applications')}
					value={stats?.applications_count ?? 0}
					loading={loadingStats}
					color='bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
				/>
				<MetricCard
					icon={<HiOutlinePlusCircle />}
					label={t('marketing.new_contracts')}
					value={stats?.new_contracts_count ?? 0}
					loading={loadingStats}
					color='bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
				/>
				<MetricCard
					icon={<HiOutlineDocumentText />}
					label={t('marketing.current_contracts')}
					value={stats?.current_contracts_count ?? 0}
					loading={loadingStats}
					color='bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
				/>
				<MetricCard
					icon={<HiOutlineCheckCircle />}
					label={t('marketing.completed')}
					value={stats?.completed_contracts_count ?? 0}
					loading={loadingStats}
					color='bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
				/>
			</div>

			{/* ── Section 2: 2 Donut Charts ── */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
				<DonutWithLegend
					title={t('marketing.applications_by_status')}
					series={appSeries}
					labels={appLabels}
					colors={appColors}
					total={stats?.applications_count ?? 0}
					loading={loadingStats}
				/>
				<DonutWithLegend
					title={t('marketing.new_contracts_by_status')}
					series={contractSeries}
					labels={contractLabels}
					colors={contractColors}
					total={stats?.new_contracts_count ?? 0}
					loading={loadingStats}
				/>
			</div>

			{/* ── Section 3: Stacked Bar Chart ── */}
			<Card className='dark:bg-gray-800'>
				<h5 className='mb-2 font-semibold text-gray-800 dark:text-gray-100'>
					{t('marketing.monthly_dynamics')}
				</h5>
				{loadingMonthly ? (
					<Skeleton className='h-64 w-full' />
				) : (
					<Chart
						type='bar'
						series={[
							{ name: t('marketing.applications'),       data: monthlyStats.map(m => m.applications) },
							{ name: t('marketing.new_contracts'),      data: monthlyStats.map(m => m.new) },
							{ name: t('marketing.current_contracts'),  data: monthlyStats.map(m => m.current) },
							{ name: t('marketing.completed'),          data: monthlyStats.map(m => m.completed) },
						]}
						customOptions={{
							colors: ['#3b82f6', '#f97316', '#10b981', '#9ca3af'],
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
								categories: barCategories,
								labels: { style: { fontSize: '10px' }, rotate: -30 }
							}
						}}
						height={280}
					/>
				)}
			</Card>

			{/* ── Section 4: Regional Progress Bars — 3 blocks ── */}
			<div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
				<RegionalBars
					title={t('marketing.applications_by_region')}
					data={regionalStats.map(r => ({ name_ru: r.name_ru, count: r.applications_count }))}
					color='blue-500'
					loading={loadingRegional}
				/>
				<RegionalBars
					title={t('marketing.new_contracts_by_region')}
					data={regionalStats.map(r => ({ name_ru: r.name_ru, count: r.new_contracts_count }))}
					color='orange-500'
					loading={loadingRegional}
				/>
				<RegionalBars
					title={t('marketing.current_contracts_by_region')}
					data={regionalStats.map(r => ({ name_ru: r.name_ru, count: r.current_contracts_count }))}
					color='emerald-500'
					loading={loadingRegional}
				/>
			</div>

			{/* ── Section 5: Equipment by Region ── */}
			<Card className='dark:bg-gray-800'>
				<h5 className='mb-4 font-semibold text-gray-800 dark:text-gray-100'>
					{t('marketing.equipment_by_region')}
				</h5>
				{loadingEquipment ? (
					<div className='space-y-3'>
						{[...Array(4)].map((_, i) => <Skeleton key={i} className='h-12 w-full' />)}
					</div>
				) : (
					<div className='divide-y divide-gray-100 dark:divide-gray-700'>
						{equipmentByRegion.map(({ region, equipment }) => {
							const isOpen = expandedRegions.has(region.id)
							
return (
								<div key={region.id}>
									<button
										type='button'
										onClick={() => toggleRegion(region.id)}
										className='flex w-full items-center justify-between px-2 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/30'
									>
										<span className='font-medium text-gray-800 dark:text-gray-100'>
											{region.name_ru}
										</span>
										<div className='flex items-center gap-2'>
											<span className='text-sm text-gray-400'>
												{equipment.length > 0
													? `${equipment.length} ${t('marketing.positions')}`
													: t('marketing.no_data')}
											</span>
											{isOpen
												? <HiChevronUp className='text-gray-400' />
												: <HiChevronDown className='text-gray-400' />}
										</div>
									</button>

									{isOpen && equipment.length > 0 && (
										<div className='px-2 pb-3'>
											<table className='w-full text-sm'>
												<thead>
													<tr className='border-b border-gray-100 text-left text-xs font-semibold uppercase text-gray-500 dark:border-gray-700 dark:text-gray-400'>
														<th className='pb-2 pr-4'>{t('marketing.col.manufacturer')}</th>
														<th className='pb-2 pr-4'>{t('marketing.col.model')}</th>
														<th className='pb-2 pr-4 text-right'>{t('marketing.col.count')}</th>
														<th className='pb-2 pr-4 text-right'>{t('marketing.col.amount')}</th>
														<th className='pb-2 text-right'>{t('marketing.col.avg_price')}</th>
													</tr>
												</thead>
												<tbody>
													{equipment.map((e, i) => (
														<tr
															key={i}
															className='border-b border-gray-50 last:border-0 hover:bg-gray-50 dark:border-gray-700/50 dark:hover:bg-gray-700/30'
														>
															<td className='py-2 pr-4 font-medium text-gray-900 dark:text-gray-100'>
																{e.manufacturer}
															</td>
															<td className='py-2 pr-4 text-gray-600 dark:text-gray-300'>
																{e.model}
															</td>
															<td className='py-2 pr-4 text-right font-semibold text-gray-800 dark:text-gray-200'>
																{e.count}
															</td>
															<td className='py-2 pr-4 text-right text-gray-700 dark:text-gray-200'>
																{formatSum(e.total_amount)} сум
															</td>
															<td className='py-2 text-right text-gray-500 dark:text-gray-400'>
																{formatSum(e.avg_price)} сум
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									)}

									{isOpen && equipment.length === 0 && (
										<p className='px-2 pb-3 text-sm text-gray-400'>{t('dashboard.no_data')}</p>
									)}
								</div>
							)
						})}
					</div>
				)}
			</Card>
		</div>
	)
}

export default MarketingDashboard
