import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { TechStockOperation, TechStockOperationActionEnum } from '@/@types/tech.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Tooltip } from '@/components/ui'
import { formatDate, formatPrice } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	stocks?: PaginatedResponse<TechStockOperation[]>
	isLoading?: boolean
}

const ActionColumn = ({ row, style }: { row: TechStockOperation; style?: CSSProperties }) => {
	const { t } = useTranslation()

	switch (row.action) {
		case TechStockOperationActionEnum.INCOME:
			return (
				<div className='flex items-center gap-2' style={style}>
					<Badge className='bg-emerald-500' />
					<span className='font-semibold text-emerald-500 capitalize'>{t('Приход')}</span>
				</div>
			)
		case TechStockOperationActionEnum.COUNT_CHANGE:
			return (
				<div className='flex items-center gap-2' style={style}>
					<Badge className='bg-amber-500' />
					<span className='font-semibold text-amber-500 capitalize'>{t('Количество')}</span>
				</div>
			)
		case TechStockOperationActionEnum.PRICE_CHANGE:
			return (
				<div className='flex items-center gap-2' style={style}>
					<Badge className='bg-cyan-500' />
					<span className='font-semibold text-cyan-500 capitalize'>{t('Цена')}</span>
				</div>
			)
	}
}

const HistoryTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	stocks,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const EventColumn = ({ row, style }: { row: TechStockOperation; style?: CSSProperties }) => {
		switch (row.action) {
			case TechStockOperationActionEnum.INCOME:
				return <div style={style}>{t('Новое')}</div>
			case TechStockOperationActionEnum.COUNT_CHANGE:
				return <div style={style}>{t('Корректировка')}</div>
			case TechStockOperationActionEnum.PRICE_CHANGE:
				return <div style={style}>{t('Корректировка')}</div>
		}
	}

	const columns: ColumnDef<TechStockOperation>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 left-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 left-0 z-1'
				},
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Событие'),
				accessorKey: 'action',
				size: 140,
				sortable: true,
				cell: (props) => (
					<EventColumn row={props.row.original} style={{ minWidth: props.column.getSize() - 48 }} />
				)
			},
			{
				header: t('Действие'),
				accessorKey: 'action',
				size: 140,
				sortable: true,
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			},
			{
				header: t('Поставщик'),
				accessorKey: 'delivery',
				size: 240,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.delivery ? props.row.original.delivery : '-'}>
							<span className='truncate-2'>{props.row.original.delivery ? props.row.original.delivery : '-'}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir ? props.row.original.stir : '-'}</div>
				)
			},
			{
				header: t('Дата'),
				accessorKey: 'created_at',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.created_at)}
					</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'tech',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.tech.name_ru}
					</div>
				)
			},
			{
				header: t('Было'),
				accessorKey: 'unit_before',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.unit_before)}
					</div>
				)
			},
			{
				header: t('Стало'),
				accessorKey: 'unit_after',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.unit_after)}
					</div>
				)
			},
			{
				header: t('Договор'),
				accessorKey: 'invoice',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.invoice ? props.row.original.invoice : '-'}</div>
				)
			},
			{
				header: t('Изменил'),
				accessorKey: 'executed_by',
				size: 220,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.executed_by.name}
					</div>
				)
			}
		],
		[stocks, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={stocks?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: stocks?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>
		</>
	)
}

export default HistoryTable
