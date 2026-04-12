// src/pages/.../BegunokTable.tsx
import { HiPlus } from 'react-icons/hi'
import { BegunokListItem } from '@/@types/begunok.types'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Button } from '@/components/ui'
import { formatDate, formatPrice } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	papertrackers?: PaginatedResponse<BegunokListItem[]>
	isLoading: boolean

	/* YANGI: qayta ishlatish uchun */
	dataOverride?: BegunokListItem[]
	paginate?: boolean
	onRowClick?: (row: BegunokListItem) => void
	showAddColumn?: boolean
	onRowAddClick?: (row: BegunokListItem) => void
}

/** Dizaynga mos status ranglari + matn */
const STATUS_MAP: Record<
	string | number,
	{
		text: 'Новый' | 'В процессе' | 'Завершен' | 'Ожидает мою подпись'
		dot: string
		textColor: string
	}
> = {
	2: { text: 'Новый', dot: 'bg-blue-500', textColor: 'text-blue-600' },
	1: { text: 'В процессе', dot: 'bg-orange-400', textColor: 'text-orange-600' },
	3: { text: 'Завершен', dot: 'bg-green-500', textColor: 'text-green-600' },
	4: { text: 'Ожидает мою подпись', dot: 'bg-yellow-500', textColor: 'text-green-600' },
	new: { text: 'Новый', dot: 'bg-blue-500', textColor: 'text-blue-600' },
	in_progress: { text: 'В процессе', dot: 'bg-orange-400', textColor: 'text-orange-600' },
	done: { text: 'Завершен', dot: 'bg-green-500', textColor: 'text-green-600' },
	panding: { text: 'Ожидает мою подпись', dot: 'bg-yelloww-500', textColor: 'text-green-600' }
}

const StatusBadge = ({ value }: { value?: string | number | null }) => {
	const s = value !== undefined && value !== null ? STATUS_MAP[value] : undefined

	return (
		<div className='inline-flex items-center gap-2'>
			<span className={`h-2.5 w-2.5 rounded-full ${s?.dot ?? 'bg-gray-300'}`} />
			<span className={`${s?.textColor ?? 'text-gray-600'} text-sm font-medium`}>
				{s?.text ?? '—'}
			</span>
		</div>
	)
}

const CommissionCell = ({ done, total }: { done?: number | null; total?: number | null }) => {
	if (done == null || total == null) return <span>—</span>

	return (
		<span className='font-medium'>
			{done} / {total}
		</span>
	)
}

export default function BegunokTable({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	papertrackers,
	isLoading,
	dataOverride,
	paginate = true,
	onRowClick,
	showAddColumn = false,
	onRowAddClick
}: Props) {
	const baseData = dataOverride ?? papertrackers?.results ?? []

	const mkCell = (p: any, children: React.ReactNode) => {
		const handle = onRowClick ? () => onRowClick(p.row.original as BegunokListItem) : undefined

		return (
			<div
				onClick={handle}
				className={onRowClick ? '-mx-1 cursor-pointer rounded px-1 hover:bg-gray-50' : undefined}
				style={{ minWidth: p.column.getSize() - 48 }}
			>
				{children}
			</div>
		)
	}

	const baseColumns: ColumnDef<BegunokListItem>[] = [
		{
			header: '№',
			accessorKey: 'id',
			size: 72,
			cell: (p) =>
				mkCell(
					p,
					<div className='text-center font-semibold' style={{ minWidth: p.column.getSize() - 16 }}>
						{p.row.original.id}
					</div>
				)
		},
		{
			header: 'Наименование',
			accessorKey: 'client_company_name',
			size: 180,
			cell: (p) =>
				mkCell(
					p,
					<div className='font-semibold' style={{ minWidth: p.column.getSize() - 16 }}>
						{p.row.original.client_company_name ?? '—'}
					</div>
				)
		},
		{
			header: 'Статус',
			id: 'status',
			size: 160,
			cell: (p) => mkCell(p, <StatusBadge value={(p.row.original as any).status} />)
		},
		{
			header: 'ИНН',
			accessorKey: 'stir',
			size: 140,
			cell: (p) => mkCell(p, <div>{p.row.original.stir ?? '—'}</div>)
		},
		{
			header: '№Договора',
			id: 'contract_number',
			size: 160,
			cell: (p) =>
				mkCell(p, <div>{(p.row.original as any).contract_number ?? p.row.original.id ?? '—'}</div>)
		},
		{
			header: '№Бегунка',
			id: 'runner_code',
			size: 160,
			cell: (p) =>
				mkCell(
					p,
					<div>{(p.row.original as any).code ?? (p.row.original as any).begunok ?? '—'}</div>
				)
		},
		{
			header: 'Дата',
			id: 'date',
			size: 140,
			cell: (p) => {
				const raw =
					(p.row.original as any).contract_date ??
					(p.row.original as any).date ??
					(p.row.original as any).created_at

				return mkCell(p, <div>{raw ? formatDate(raw) : '—'}</div>)
			}
		},
		{
			header: 'Техника',
			accessorKey: 'tech_model',
			size: 230,
			cell: (p) => mkCell(p, <div style={{ minWidth: p.column.getSize() - 16 }}>{p.row.original.tech_model ?? '—'}</div>)
		},
		{
			header: 'Сумма',
			id: 'amount',
			size: 120,
			cell: (p) => {
				const amt = (p.row.original as any).amount ?? (p.row.original as any).total_sum

				return mkCell(p, <div style={{ minWidth: p.column.getSize() - 16 }}>{amt != null ? formatPrice(amt) : '—'}</div>)
			}
		},
		{
			header: 'Члены комиссии',
			id: 'commission',
			size: 160,
			cell: (p) =>
				mkCell(
					p,
					<div className='text-center' style={{ minWidth: p.column.getSize() - 16 }}>
						<CommissionCell
							done={(p.row.original as any).commission_done}
							total={(p.row.original as any).commission_total}
						/>
					</div>
				)
		}
	]

	// BegunokTable.tsx ichida:

	// BegunokTable.tsx ichida
	const STICKY_TH = 'sticky ltr:right-0 rtl:left-0 z-10 bg-white dark:bg-gray-900'
	const STICKY_TD = 'sticky ltr:right-0 rtl:left-0 z-10 bg-white dark:bg-gray-900'

	const columns: ColumnDef<BegunokListItem>[] = showAddColumn
		? [
				...baseColumns,
				{
					header: 'Действие',
					id: 'actions',
					size: 88, // aniq kenglik bering
					meta: {
						thClassName: `${STICKY_TH} text-right`, // ⬅️ TH sticky
						tdClassName: `${STICKY_TD}`, // ⬅️ TD sticky
						thStyle: { width: 88, minWidth: 88 }, // ⬅️ majburiy width
						tdStyle: { width: 88, minWidth: 88 }
					},
					cell: (p) => (
						<div className='flex justify-end pr-2'>
							<Button
								size='sm'
								shape='circle'
								variant='twoTone'
								icon={<HiPlus />}
								onClick={(e) => {
									e.stopPropagation()
									onRowAddClick?.(p.row.original)
								}}
								title='Добавить'
							/>
						</div>
					)
				}
			]
		: [
				...baseColumns,
				{
					header: 'Действие',
					id: 'actions',
					size: 1,
					meta: {
						thClassName: `${STICKY_TH} text-right`,
						tdClassName: `${STICKY_TD}`,
						thStyle: { width: 88, minWidth: 88 },
						tdStyle: { width: 88, minWidth: 88 }
					},
					cell: () => null
				}
			]

	return (
		<DataTable
			columns={columns}
			data={baseData}
			skeletonAvatarColumns={[0]}
			skeletonAvatarProps={{ className: 'rounded-md' }}
			loading={isLoading}
			{...(paginate
				? {
						pagingData: {
							total: papertrackers?.count || baseData.length,
							pageIndex: params.page,
							pageSize: params.size
						},
						onPaginationChange: onPageChange,
						onSelectChange: onSizeChange
					}
				: {
						// modal rejim: pagination o‘chiq
						pagingData: undefined,
						onPaginationChange: undefined,
						onSelectChange: undefined
					})}
			onSort={onSortingChange}
		/>
	)
}
