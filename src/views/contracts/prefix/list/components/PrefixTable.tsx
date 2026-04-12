// src/pages/prefix/components/PrefixTable.tsx
import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next' // ⬅️ i18n
import { HiOutlinePencil } from 'react-icons/hi'
import { TableQueries } from '@/@types/common'
import { ContractMeta } from '@/@types/dataset.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import useThemeClass from '@/utils/hooks/useThemeClass'
import PrefixEditDrawer from './PrefixEditDrawer'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	contracts?: ContractMeta[]
	total?: number
	isLoading: boolean
	onRowUpdated?: (row: ContractMeta) => void
}

const ActionColumn = ({
	row,
	style,
	onEdit
}: {
	row: ContractMeta
	style?: CSSProperties
	onEdit?: (row: ContractMeta) => void
}) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='justify-left flex text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={() => onEdit?.(row)}>
				<HiOutlinePencil />
			</span>
		</div>
	)
}

const fmt = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))

export default function PrefixTable({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	contracts = [],
	total = 0,
	isLoading,
	onRowUpdated
}: Props) {
	const { t } = useTranslation() // ⬅️ i18n

	const [isEditOpen, setIsEditOpen] = useState(false)
	const [current, setCurrent] = useState<ContractMeta | null>(null)

	const openEdit = (row: ContractMeta) => {
		setCurrent(row)
		setIsEditOpen(true)
	}
	const closeEdit = () => {
		setIsEditOpen(false)
		setCurrent(null)
	}

	const columns: ColumnDef<ContractMeta>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (p) => (
					<div className='font-semibold' style={{ minWidth: p.column.getSize() - 48 }}>
						{p.row.original.id}
					</div>
				)
			},
			{
				header: t('Область'),
				accessorKey: 'region',
				size: 220,
				sortable: true,
				enableSorting: false,
				cell: (p) => (
					<div className='font-semibold capitalize' style={{ minWidth: p.column.getSize() - 48 }}>
						{fmt(p.row.original.region?.name_ru)}
					</div>
				)
			},
			{
				header: t('Код области'),
				accessorKey: 'region_code',
				size: 180,
				sortable: true,
				enableSorting: false,
				cell: (p) => (
					<div style={{ minWidth: p.column.getSize() - 48 }}>
						{fmt(p.row.original.region?.region_code)}
					</div>
				)
			},
			{
				header: t('Год'),
				accessorKey: 'year',
				size: 120,
				sortable: true,
				enableSorting: false,
				cell: (p) => (
					<div style={{ minWidth: p.column.getSize() - 48 }}>{fmt(p.row.original.year)}</div>
				)
			},
			{
				header: t('Начальный номер'),
				accessorKey: 'number',
				size: 160,
				sortable: true,
				enableSorting: false,
				cell: (p) => (
					<div style={{ minWidth: p.column.getSize() - 48 }}>{fmt(p.row.original.number)}</div>
				)
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 120,
				enableSorting: false,
				meta: {
					// sticky faqat sm+ ekranlarda bo‘lsin; mobilda oddiy keltiriladi
					thClassName: 'sm:sticky sm:right-0 sm:z-[5]',
					tdClassName: 'sm:sticky sm:right-0',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (p) => (
					<ActionColumn
						row={p.row.original}
						onEdit={openEdit}
						style={{ minWidth: p.column.getSize() - 48 }}
					/>
				)
			}
		],
		[t] // ⬅️ til o‘zgarganda qayta hisoblanadi
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={contracts}
				loading={isLoading}
				pagingData={{ total, pageIndex: params.page, pageSize: params.size }}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			<PrefixEditDrawer
				open={isEditOpen}
				item={current}
				onClose={closeEdit}
				onSaved={async (updated) => {
					if (updated) onRowUpdated?.(updated)
				}}
			/>
		</>
	)
}
