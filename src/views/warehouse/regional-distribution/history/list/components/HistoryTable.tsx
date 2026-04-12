import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { TechDistributeOperation, TechDistributeOperationActionEnum } from '@/@types/tech.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { formatDate, formatPrice } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	distributes?: PaginatedResponse<TechDistributeOperation[]>
	isLoading?: boolean
}

const EventColumn = ({ row, style }: { row: TechDistributeOperation; style?: CSSProperties }) => {
	switch (row.action) {
		case TechDistributeOperationActionEnum.DISTRIBUTE:
			return <div style={style}>Распределение</div>
		case TechDistributeOperationActionEnum.REDISTRIBUTE:
			return <div style={style}>Перераспределение</div>
	}
}

const HistoryTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	distributes,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const columns: ColumnDef<TechDistributeOperation>[] = useMemo(
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
				header: t('Количество'),
				accessorKey: 'count',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.count)}
					</div>
				)
			},
			{
				header: t('Область'),
				accessorKey: 'from_region',
				size: 190,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.from_region.name_ru}
					</div>
				)
			},
			{
				header: t('На область'),
				accessorKey: 'to_region',
				size: 190,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.to_region.name_ru}
					</div>
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
		[distributes, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={distributes?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: distributes?.count || 0,
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
