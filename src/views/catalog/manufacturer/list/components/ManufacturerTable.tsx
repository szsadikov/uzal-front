import { type CSSProperties, useMemo, useState } from 'react'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { ManufacturerType } from '@/@types/tech.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import useThemeClass from '@/utils/hooks/useThemeClass'
import ManufacturerEdit from '@/views/catalog/manufacturer/list/components/ManufacturerEdit'
import { useTranslation } from 'react-i18next'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	manufacturers?: PaginatedResponse<ManufacturerType[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const ActionColumn = ({
	onEdit,
	onDelete,
	style
}: {
	onEdit: () => void
	onDelete: () => void
	style?: CSSProperties
}) => {
	const { textTheme } = useThemeClass()
	// const navigate = useNavigate()

	return (
		<div className='flex justify-center text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
				<HiOutlinePencil />
			</span>
			<span className='cursor-pointer p-2 hover:text-red-500' onClick={onDelete}>
				<HiOutlineTrash />
			</span>
		</div>
	)
}

const ManufacturerTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	manufacturers,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [isEditDialogOpen, setEditDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [editId, setEditId] = useState<number | null>(null)

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete manufacturer'],
		mutationFn: (id: number) => TechService.deleteManufacturer(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(
				<Notification type='success' title={t('Производитель удален')} duration={2000} />,
				{
					placement: 'top-center'
				}
			)
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setDeleteDialogIsOpen(false)
			setDeleteId(null)
		}
	})

	const onEdit = (id: number) => {
		setEditDialogIsOpen(true)
		setEditId(id)
	}

	const onDelete = (id: number) => {
		setDeleteDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<ManufacturerType>[] = useMemo(
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
				header: t('Производитель'),
				accessorKey: 'name_ru',
				size: 260,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.name_ru}</div>
				)
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 140,
				enableSorting: true,
				cell: (props) => (
					<ActionColumn
						onEdit={() => onEdit(props.row.original.id)}
						onDelete={() => onDelete(props.row.original.id)}
						style={{ minWidth: props.column.getSize() - 48, maxWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[manufacturers, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={manufacturers?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: manufacturers?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				type='danger'
				title={t('Удалить производителя')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteDialogIsOpen(false)}
				onRequestClose={() => setDeleteDialogIsOpen(false)}
				onCancel={() => setDeleteDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>
					{t(
						'Вы уверены, что хотите удалить этого тип техники? Все записи, связанные с этим продуктом,также будут удалены. Это действие не может быть отменено.'
					)}
				</p>
			</ConfirmDialog>

			{isEditDialogOpen && editId && (
				<ManufacturerEdit id={editId} isOpen={isEditDialogOpen} setIsOpen={setEditDialogIsOpen} />
			)}
		</>
	)
}

export default ManufacturerTable
