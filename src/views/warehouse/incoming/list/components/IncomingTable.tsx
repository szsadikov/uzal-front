import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineEye, HiOutlinePencil } from 'react-icons/hi'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { formatPrice, unitName } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import IncomingEdit from './IncomingEdit'
import IncomingView from './IncomingView'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	warehouses?: PaginatedResponse<Tech[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const ActionColumn = ({
	onEdit,
	onView,
	style
}: {
	onEdit: () => void
	onView: () => void
	style?: CSSProperties
}) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='flex items-center justify-center text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
				<HiOutlinePencil />
			</span>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onView}>
				<HiOutlineEye />
			</span>
		</div>
	)
}

const IncomingTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	warehouses,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const [isOpenEdit, setIsOpenEdit] = useState(false)
	const [isOpenView, setIsOpenView] = useState(false)
	const [techId, setTechId] = useState<number | null>(null)

	const onEdit = (id: number) => {
		setTechId(id)
		setIsOpenEdit(true)
	}

	const onView = (id: number) => {
		setTechId(id)
		setIsOpenView(true)
	}

	const columns: ColumnDef<Tech>[] = useMemo(
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
				header: t('Техника'),
				accessorKey: 'model_name_ru',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.model_name_ru}
					</div>
				)
			},
			{
				header: t('Ед. изм.'),
				accessorKey: 'measure_unit',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{unitName(props.row.original.measure_unit)}
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
				header: () => <div className='text-right'>{t('Цена')}</div>,
				accessorKey: 'price',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.price)}
					</div>
				)
			},
			{
				header: t('Ндс'),
				accessorKey: 'vat',
				size: 100,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.vat}%</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Цена с НДС')}</div>,
				accessorKey: 'annotated_tech_price_with_vat',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.tech_price_with_vat)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Общ. цена с ндс')}</div>,
				accessorKey: 'annotated_overall_price',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.overall_price)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => (
					<ActionColumn
						onEdit={() => onEdit(props.row.original.id)}
						onView={() => onView(props.row.original.id)}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[warehouses, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={warehouses?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: warehouses?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{techId && (
				<IncomingEdit
					id={techId}
					isOpen={isOpenEdit}
					setIsOpen={setIsOpenEdit}
					refetch={refetch}
				/>
			)}

			{techId && (
				<IncomingView id={techId} isOpen={isOpenView} setIsOpen={setIsOpenView} />
			)}
		</>
	)
}

export default IncomingTable
