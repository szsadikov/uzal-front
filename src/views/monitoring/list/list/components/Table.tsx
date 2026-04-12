// ./components/Table.tsx
import '../css/monitoring-table.css'

import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePhotograph } from 'react-icons/hi'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Tooltip } from '@/components/ui'
import useThemeClass from '@/utils/hooks/useThemeClass'
import MonitoringView from '../../view/MonitoringView'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	payment_notice?: PaginatedResponse<MonitoringRow[]>
	isLoading: boolean
}

type MonitoringRow = PaymentOverdueNotice & {
	clients?: { name?: string | null; stir?: string | null; tech_name?: string | null } | null
	client?: { name?: string | null; stir?: string | null; tech_name?: string | null } | null
	// monitoring?: string

	monitoring?: {
		id?: number
		profile?: {
			id?: number
			phone_number?: string | null
			email?: string | null
			first_name?: string | null
			middle_name?: string | null
			last_name?: string | null
			last_login?: string | null
		} | null
	} | null
	// tech?: string
	// tech_code?: string | null
	date?: string
	updated_at?: string
	license_plate_number?: string
	condition?: 1 | 2 | 3 | 'excellent' | 'good' | 'bad' | 'Отличное' | 'Хорошее' | 'Плохое'
	branch?: {
		id?: number
		name?: string | null
		region?: {
			id?: number
			name_ru?: string | null
			name_uz?: string | null
			name_latin?: string | null
			region_code?: string | null
		} | null
	} | null
	chassis?: string | null
	chassis_no?: string | null
	engine?: string | null
	engine_no?: string | null
	engine_number?: string | null
	comment?: string | null
	comment_text?: string | null
	total_amount?: string | null
	vin?: string | null
	status?: any
	penalty?: any
	images?: string[] | null
	photo_url?: string | null
}

const DocsColumn = ({ onViewClick, style }: { onViewClick: () => void; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	return (
		<div className='justify-left flex text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onViewClick}>
					<HiOutlinePhotograph />
				</span>
			</Tooltip>
		</div>
	)
}

const formatDMY = (val?: string) => {
	if (!val) return '-'
	const d = new Date(val)
	if (isNaN(d.getTime())) return val
	const dd = String(d.getDate()).padStart(2, '0')
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const yyyy = d.getFullYear()

	return `${dd}.${mm}.${yyyy}`
}

const W = {
	idx: 72,
	client: 300, // 330 -> 300 (biroz qisqartirdik)
	stir: 140,
	staff: 150, // 160 -> 150
	branch: 220,
	tech: 220, // 240 -> 220
	date: 120,
	plate: 160, // 150 -> 190  ✅ ГОСНОМЕР kengaydi
	state: 160,
	vin: 160, // 170 -> 210  ✅ № ШАССИ kengaydi
	engine: 180, // 170 -> 180
	comment: 220, // 280 -> 220  (joy ajratdik)
	photo: 86
}

const Table = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	payment_notice,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState({} as MonitoringRow)

	const data = payment_notice?.results ?? []
	const startIndex = (params.page - 1) * params.size

	const conditionMeta = (row: MonitoringRow) => {
		const raw = row.condition ?? row.status ?? row.penalty
		const normalize = (v: any): 1 | 2 | 3 | null => {
			if (typeof v === 'number') return v === 1 || v === 2 || v === 3 ? v : null
			if (typeof v === 'string') {
				const s = v.toLowerCase()
				if (s.includes('1') || s.includes('excellent') || s.includes('отлич')) return 1
				if (s.includes('2') || s.includes('good') || s.includes('хорош')) return 2
				if (s.includes('3') || s.includes('bad') || s.includes('плох')) return 3
			}

			return null
		}
		const code = normalize(raw)

		// namespaced keys — barqarorlik uchun
		const KEYS: Record<number, string> = {
			1: 'Отличное',
			2: 'Хорошее',
			3: 'Плохое'
		}

		if (code === 1) return { label: t(KEYS[1]), dot: 'bg-green-500' }
		if (code === 2) return { label: t(KEYS[2]), dot: 'bg-amber-500' }
		if (code === 3) return { label: t(KEYS[3]), dot: 'bg-rose-500' }

		return { label: '-', dot: 'bg-gray-300' }
	}

	const columns: ColumnDef<MonitoringRow>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: W.idx,
				enableSorting: false,
				enableResizing: false,
				cell: ({ row }) => <div className='col-idx font-semibold'>{startIndex + row.index + 1}</div>
			},
			{
				header: t('Филиалы'),
				accessorKey: 'contract__branch__name',
				sortable: true,
				size: W.branch,
				cell: ({ row }) => {
					const r = row.original.branch?.region
					const val =
						r?.name_ru ??
						r?.name_uz ??
						row.original.branch?.name ?? // fallback agar region bo'lmasa
						''

					return <div className='td-clip'>{val || '-'}</div>
				}
			},
			{
				header: t('Клиенты'),
				accessorKey: 'contract__client_company_name', // <-- shu yerda dot-notatsiya
				sortable: true,
				size: W.client,
				cell: ({ row }) => {
					const val = row.original.clients?.name ?? row.original.client?.name ?? ''

					return <div className='col-client td-clip pr-2'>{val || '-'}</div>
				}
			},
			{
				header: t('ИНН'),
				accessorKey: 'contract__stir',
				size: W.stir,
				sortable: true,
				// enableResizing: false,
				cell: ({ row }) => {
					const val =
						row.original.clients?.stir ?? row.original.client?.stir ?? row.original.stir ?? ''

					return <div className='td-clip font-mono'>{val || '-'}</div>
				}
			},

			{
				header: t('Сотрудники'),
				accessorKey: 'monitoring__profile__last_name',
				sortable: true,
				size: W.staff,
				cell: ({ row }) => {
					const p = row.original.monitoring?.profile
					if (!p) return <div className='td-clip'>-</div>

					// familiya, ism, sharifni birlashtiramiz
					const fullName = [p.last_name, p.first_name, p.middle_name].filter(Boolean).join(' ')

					return <div className='td-clip'>{fullName || '-'}</div>
				}
			},

			{
				header: t('Техника'),
				accessorKey: 'contract__tech_name',
				sortable: true,
				size: W.tech,
				cell: ({ row }) => {
					const name = row.original.clients?.tech_name ?? row.original.client?.tech_name ?? ''
					// const code = row.original.tech_code

					return (
						<div className='leading-tight'>
							<div className='td-clip'>{name}</div>
							{/*{code ? <div className='td-clip text-xs text-gray-500'>{code}</div> : null}*/}
						</div>
					)
				}
			},
			{
				header: t('Дата'),
				accessorKey: 'updated_at',
				sortable: true,
				size: W.date,
				enableResizing: false,
				cell: ({ row }) => (
					<div>{formatDMY(row.original.date ?? row.original.updated_at ?? '')}</div>
				)
			},
			{
				header: t('ГОСНОМЕР'),
				accessorKey: 'license_plate_number',
				sortable: true,
				size: W.plate,
				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.license_plate_number}
					</div>
				)
			},
			{
				header: t('СОСТОЯНИЕ'),
				accessorKey: 'condition',
				sortable: true,
				size: W.state,
				enableResizing: false,
				cell: ({ row }) => {
					const meta = conditionMeta(row.original)

					return (
						<div className='flex items-center gap-2'>
							<span className={`h-2 w-2 rounded-full ${meta.dot}`} />
							<span className='td-clip'>{meta.label}</span>
						</div>
					)
				}
			},
			{
				header: t('№ ШАССИ'),
				accessorKey: 'vin',
				sortable: true,
				size: W.vin,

				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.vin}
					</div>
				)
			},
			{
				header: t('№ ДВИГАТЕЛЯ'),
				accessorKey: 'engine_number',
				sortable: true,
				size: W.engine,
				cell: ({ row }) => {
					const v =
						row.original.engine ??
						row.original.engine_no ??
						row.original.engine_number ??
						row.original.vin ??
						''

					return <span className='td-clip'>{v || '-'}</span>
				}
			},
			{
				header: t('КОММЕНТАРИИ'),
				id: 'comment',
				size: W.comment,
				enableSorting: false,
				cell: ({ row }) => {
					const v = row.original.comment ?? row.original.comment_text ?? ''

					return (
						<Tooltip title={v || 'Текст комментария'}>
							<span className='td-clip block max-w-[260px]'>{v || 'Текст комментария'}</span>
						</Tooltip>
					)
				}
			},
			{
				header: t('ФОТО'),
				id: 'photo',
				size: W.photo,
				enableSorting: false,
				enableResizing: false,
				cell: (props) => {
					const onView = () => {
						const selected = data.find((c) => c.id === props.row.original.id)
						if (!selected) return
						setSelectedRequest(selected)
						setIsDrawerOpen(true)
					}

					return (
						<div className='col-photo'>
							<DocsColumn onViewClick={onView} style={{ minWidth: W.photo - 24 }} />
						</div>
					)
				}
			}
		],
		[data, startIndex, t]
	)

	return (
		<>
			<div className='monitoring-table'>
				<DataTable
					columns={columns}
					data={data}
					loading={isLoading}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					pagingData={{
						total: payment_notice?.count || 0,
						pageIndex: params.page,
						pageSize: params.size
					}}
					onPaginationChange={onPageChange}
					onSelectChange={onSizeChange}
					onSort={onSortingChange}
				/>
			</div>

			<MonitoringView
				request={selectedRequest}
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				onRequestClose={() => setIsDrawerOpen(false)}
			/>
		</>
	)
}

export default Table
