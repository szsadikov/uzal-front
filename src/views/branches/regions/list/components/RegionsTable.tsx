// src/pages/regions/components/RegionsTable.tsx
import { type CSSProperties, useMemo, useState } from 'react'
import { HiOutlinePencil } from 'react-icons/hi'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Region } from '@/@types/dataset.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import useThemeClass from '@/utils/hooks/useThemeClass'
import RegionsEditDrawer from './RegionsEditDrawer'
import { useTranslation } from 'react-i18next'
import { getLocalizedValueSuffixFirst } from '@/utils/localize'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	regions?: PaginatedResponse<Region[]>
	isLoading: boolean
}

const ActionColumn = ({
	style,
	onEdit
}: {
	row: Region
	style?: CSSProperties
	onEdit: () => void
}) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='justify-center flex text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
				<HiOutlinePencil />
			</span>
		</div>
	)
}

const RegionsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	regions,
	isLoading
}: Props) => {
	const { t, i18n } = useTranslation()
	const [editData, setEditData] = useState<Region | null>(null)

	const columns: ColumnDef<Region>[] = useMemo(
		() => [
			{
				header: t('№'),
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => <div className='text-left font-semibold'>{props.row.original.id}</div>
			},
			{
				header: t('ОБЛАСТЬ'),
				accessorKey: 'name_ru',
				size: 250,
				enableSorting: false,
				// cell: (props) => props.row.original.name_ru
				cell: (props) =>
					getLocalizedValueSuffixFirst(props.row.original, i18n.language, ['name']) ?? '-'



			},
			{
				header: t('ID ОБЛАСТИ'),
				accessorKey: 'region_code',
				size: 250,
				enableSorting: false,
				cell: (props) => props.row.original.region_code
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 140,
				enableSorting: false,
				meta: {
					thClassName: 'sticky right-0 z-[5] ',
					tdClassName: 'sticky right-0 ',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						onEdit={() => setEditData(props.row.original)}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={regions?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: regions?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{editData && <RegionsEditDrawer data={editData} onClose={() => setEditData(null)} />}
		</>
	)
}

export default RegionsTable
