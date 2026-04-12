import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Branch } from '@/@types/dataset.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast, Tooltip } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'
import useThemeClass from '@/utils/hooks/useThemeClass'
import BranchForm from '../form/BranchForm'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	branches?: PaginatedResponse<Branch[]>
	isLoading: boolean
}

const ActionColumn = ({
	row,
	onEdit,
	onDelete,
	style
}: {
	row: Branch
	onEdit: () => void
	onDelete: () => void
	style?: CSSProperties
}) => {
	const { textTheme } = useThemeClass()
	const navigate = useNavigate()
	const { t } = useTranslation()

	const onView = (branch: Branch) => {
		navigate(`/branches/employee-view/${branch.id}`)
	}

	return (
		<div className='justify-right flex text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={() => onView(row)}>
					<HiOutlineEye />
				</span>
			</Tooltip>
			<Tooltip title={t('Редактировать')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
					<HiOutlinePencil />
				</span>
			</Tooltip>
			<Tooltip title={t('Удалить')}>
				<span className='cursor-pointer p-2 hover:text-red-500' onClick={onDelete}>
					<HiOutlineTrash />
				</span>
			</Tooltip>
		</div>
	)
}

const BranchTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	branches,
	isLoading
}: Props) => {
	const { t } = useTranslation()
	const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
	const [isDialogOpen, setDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const queryClient = useQueryClient()

	const handleEdit = (branch: Branch) => {
		setEditingBranch(branch)
	}
	const handleCloseForm = () => {
		setEditingBranch(null)
	}

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete branch'],
		mutationFn: (id: number) => DatasetService.deleteBranch(id),
		onSuccess() {
			toast.push(<Notification type='success' title={t('Филиал удален')} duration={2000} />, {
				placement: 'top-center'
			})
			queryClient.invalidateQueries({ queryKey: ['get branches'] })
		},
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setDialogIsOpen(false)
			setDeleteId(null)
		}
	})

	const onDelete = (id: number) => {
		setDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<Branch>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => <div className='text-left font-semibold'>{props.row.original.id}</div>
			},
			{
				header: t('Название филиала'),
				accessorKey: 'name',
				size: 250,
				enableSorting: false,
				cell: (props) => <div className='font-semibold'>{props.row.original.name}</div>
			},
			{
				header: t('Адрес филиала'),
				accessorKey: 'street',
				size: 320,
				enableSorting: false,
				cell: (props) => {
					const { city, street, house_number } = props.row.original

					return (
						<div>
							{city?.name_uz} {street} {house_number}
						</div>
					)
				}
			},
			{
				header: t('Область'),
				accessorKey: 'region',
				size: 220,
				enableSorting: false,
				cell: (props) => <div>{props.row.original.region?.name_uz}</div>
			},
			{
				header: t('Сотрудники'),
				accessorKey: 'branch_users_count',
				size: 150,
				enableSorting: false,
			},
			{
				header: () => <div>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				meta: {
					// sticky faqat sm+ ekranlarda bo‘lsin; mobilda oddiy keltiriladi
					thClassName: 'sm:sticky sm:right-0 sm:z-[5]',
					tdClassName: 'sm:sticky sm:right-0',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						onEdit={() => handleEdit(props.row.original)}
						onDelete={() => onDelete(props.row.original.id)}
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
				data={branches?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: branches?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{editingBranch && (
				<BranchForm
					initialValues={{
						name: editingBranch.name,
						region: editingBranch.region?.id ?? null,
						city: editingBranch.city?.id ?? null,
						street: editingBranch.street,
						house_number: editingBranch.house_number
					}}
					branchId={editingBranch.id}
					onClose={handleCloseForm}
					isOpen={true}
				/>
			)}

			<ConfirmDialog
				isOpen={isDialogOpen}
				type='danger'
				title={t('Удалить филиал')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDialogIsOpen(false)}
				onRequestClose={() => setDialogIsOpen(false)}
				onCancel={() => setDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>
					{t(
						'Вы уверены, что хотите удалить этот филиал? Все записи, связанные с этим филиалом, также будут удалены. Это действие не может быть отменено.'
					)}
				</p>
			</ConfirmDialog>
		</>
	)
}

export default BranchTable
