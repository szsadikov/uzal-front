import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
// import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
// import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { TechType } from '@/@types/tech.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { getLocalizedValueSuffixFirst } from '@/utils/localize'
// import { Notification, toast } from '@/components/ui'
// import { errorCatch } from '@/services/api.helpers'
// import { TechService } from '@/services/tech.service'
// import useThemeClass from '@/utils/hooks/useThemeClass'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	types?: PaginatedResponse<TechType[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

// const ActionColumn = ({
// 	onEdit,
// 	onDelete,
// 	style
// }: {
// 	onEdit: () => void
// 	onDelete: () => void
// 	style?: CSSProperties
// }) => {
// 	const { textTheme } = useThemeClass()
//
// 	return (
// 		<div className='flex justify-center text-lg' style={style}>
// 			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
// 				<HiOutlinePencil />
// 			</span>
// 			<span className='cursor-pointer p-2 hover:text-red-500' onClick={onDelete}>
// 				<HiOutlineTrash />
// 			</span>
// 		</div>
// 	)
// }

const EquipmentTypeTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	types,
	isLoading
}: Props) => {
	const { t, i18n } = useTranslation()


	const columns: ColumnDef<TechType>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.id}</div>
				)
			},
			{
				header: t('Тип'),
				accessorKey: 'name_ru',
				size: 260,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{/*{props.row.original.name_ru}*/}
						{getLocalizedValueSuffixFirst(props.row.original, i18n.language, ['name']) ??
							'-'}
					</div>
				)
			},

		],
		[types, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={types?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: types?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{/*<ConfirmDialog*/}
			{/*	isOpen={isDialogOpen}*/}
			{/*	type='danger'*/}
			{/*	title='Удалить тип техники'*/}
			{/*	cancelText='Отменить'*/}
			{/*	confirmText='Удалить'*/}
			{/*	confirmButtonColor='red-600'*/}
			{/*	onClose={() => setDialogIsOpen(false)}*/}
			{/*	onRequestClose={() => setDialogIsOpen(false)}*/}
			{/*	onCancel={() => setDialogIsOpen(false)}*/}
			{/*	onConfirm={onDeleteConfirm}*/}
			{/*>*/}
			{/*	<p>*/}
			{/*		Вы уверены, что хотите удалить этого тип техники? Все записи, связанные с этим продуктом,*/}
			{/*		также будут удалены. Это действие не может быть отменено.*/}
			{/*	</p>*/}
			{/*</ConfirmDialog>*/}
		</>
	)
}

export default EquipmentTypeTable
