// src/pages/contracts/components/ContractsTable.tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next' // ⬅️ i18n
import { TableQueries } from '@/@types/common'
import { ContractMeta } from '@/@types/dataset.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { formatPrice } from '@/utils/format'

type ContractMetrics = {
	deposit?: number
	vat?: number
	gps?: number
	gps_with_vat?: number
}

type Props = {
	params: TableQueries
	onSortingChange: (sort: OnSortParam) => void
	contracts?: ContractMeta[]
	isLoading: boolean
	metrics?: ContractMetrics
}

const fmt = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
const toPercent = (n?: number) => (typeof n === 'number' ? `${n}%` : '—')
const fmtMoney = (n?: number) => (typeof n === 'number' ? formatPrice(n) : '—')

export default function ContractsTable({ onSortingChange, contracts, isLoading, metrics }: Props) {
	const { t } = useTranslation()

	const columns: ColumnDef<ContractMeta>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Область'),
				accessorKey: 'region.name_ru',
				size: 220,
				sortable: true,
				enableSorting: false,
				cell: (props) => (
					<div
						className='font-semibold capitalize'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{fmt(props.row.original.region?.name_ru)}
					</div>
				)
			},
			{
				header: t('Префикс'),
				accessorKey: 'region.region_code',
				size: 180,
				enableSorting: false,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{fmt(props.row.original.region?.region_code)}
					</div>
				)
			},
			{
				header: t('Аванс'),
				accessorKey: 'deposit',
				size: 120,
				sortable: false,
				enableSorting: false,
				cell: () => <div style={{ minWidth: 72 }}>{toPercent(metrics?.deposit)}</div>
			},
			{
				header: t('НДС'),
				accessorKey: 'vat',
				size: 120,
				sortable: false,
				enableSorting: false,
				cell: () => <div style={{ minWidth: 72 }}>{toPercent(metrics?.vat)}</div>
			},
			{
				header: t('GPS'),
				accessorKey: 'gps',
				size: 150,
				sortable: false,
				enableSorting: false,
				cell: () => <div style={{ minWidth: 102 }}>{fmtMoney(metrics?.gps)}</div>
			},
			{
				header: t('Цена с НДС (GPS)'),
				accessorKey: 'gps_with_vat',
				size: 190,
				sortable: false,
				enableSorting: false,
				cell: () => {
					const withVat =
						metrics?.gps_with_vat ??
						(metrics?.gps !== undefined && metrics?.vat !== undefined
							? metrics.gps * (1 + metrics.vat / 100)
							: undefined)

					return <div style={{ minWidth: 132 }}>{fmtMoney(withVat)}</div>
				}
			}
		],
		[metrics, t] // ⬅️ til o‘zgarganda qayta quriladi
	)

	return (
		<DataTable
			columns={columns}
			data={contracts || []}
			loading={isLoading}
			isPagination={false}
			onSort={onSortingChange}
		/>
	)
}
