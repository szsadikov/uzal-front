import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { BranchEmployee, User, UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, ConfirmDialog, DataTable } from '@/components/shared'
import { Badge, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { UserService } from '@/services/user.service'
import { userRoleTextToName } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import UserEdit from '../components/UserEdit'

type Props = {
	branchId: number
	refetch?: () => Promise<unknown>
}

const ActionColumn = ({
	onEdit,
	onDelete,
	style,
	status
}: {
	onEdit: () => void
	onDelete: () => void
	style?: CSSProperties
	status?: boolean
}) => {
	const { textTheme } = useThemeClass()
	const disabled = !status

	return (
		<div className="flex justify-center text-lg" style={style}>
			{/* EDIT */}
			<button
				type="button"
				onClick={onEdit}
				disabled={disabled}
				aria-disabled={disabled}
				className={[
					'p-2 rounded transition',
					disabled ? 'opacity-40 cursor-not-allowed' : `hover:${textTheme} cursor-pointer`,
				].join(' ')}
				title={disabled ? 'Аккаунт неактивен' : 'Редактировать'}
			>
				<HiOutlinePencil />
			</button>

			{/* DELETE */}
			<button
				type="button"
				onClick={onDelete}
				disabled={disabled}
				aria-disabled={disabled}
				className={[
					'p-2 rounded transition',
					disabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-500 cursor-pointer',
				].join(' ')}
				title={disabled ? 'Аккаунт неактивен' : 'Удалить'}
			>
				<HiOutlineTrash />
			</button>
		</div>
	)
}

export default function ViewingDataEmployeeTable({ branchId }: Props) {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })

	const params = useMemo(
		() => ({ ...queries, type: 'branch', branch: branchId }),
		[queries, branchId]
	)

	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [isUpdateDialogOpen, setUpdateDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [updateId, setUpdateId] = useState<number | null>(null)

	const [editRole, setEditRole] = useState<UserRoleTextEnum | null>(null)

	const {
		data: users,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get users', params],
		queryFn: () => UserService.getAllUsers<PaginatedResponse<BranchEmployee[]>>(params),
		select: ({ data }) => data
	})

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete user'],
		mutationFn: (id: number) =>
			UserService.deleteBranchUser(id, { type: 'branch', branch: branchId }), // ✅ shu yerda params
		async onSuccess() {
			await refetch?.()
			toast.push(<Notification type='success' title={t('Сотрудник удален')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={t(message)} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setDeleteDialogIsOpen(false)
			setDeleteId(null)
		}
	})

	const transformedData: User[] = useMemo(() => {
		return (
			users?.results?.map((user: any) => ({
				...user,
				first_name: user.first_name,
				last_name: user.last_name,
				middle_name: user.middle_name,
				phone_number: user.phone_number,
				role: user.role
			})) || []
		)
	}, [users])

	const onEdit = (id: number, role: UserRoleTextEnum) => {
		setUpdateDialogIsOpen(true)
		setUpdateId(id)
		setEditRole(role)
	}

	const onDelete = (id: number) => {
		setDeleteDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<User>[] = [
		{
			header: t('№'),
			accessorKey: 'id',
			size: 80,
			cell: (p) => <div className='text-left'>{p.row.original.id}</div>
		},
		{
			header: t('Имя'),
			accessorKey: 'first_name',
			size: 260,
			cell: (p) => {
				const { first_name, last_name, middle_name } = p.row.original

				return (
					<div className='font-semibold'>
						{first_name} {last_name} {middle_name}
					</div>
				)
			}
		},
		{
			header: t('Должность'),
			accessorKey: 'role',
			size: 220,
			cell: (p) => <div>{userRoleTextToName(p.row.original.role)}</div>
		},
		{
			header: t('ДОВЕРЕННОСТЬ'),
			accessorKey: 'procuration_number',
			size: 220,
			cell: (p) => <div>{p.row.original.procuration_number}</div>
		},

		{
			header: t('Статус'),
			accessorKey: 'is_active',
			size: 150,
			enableSorting: false,
			cell: (p) => {
				const { is_active } = p.row.original

				return (
					<div className='flex items-center gap-2'>
						<Badge className={is_active ? 'bg-emerald-500' : 'bg-red-500'} />
						<span className={is_active ? 'text-emerald-500' : 'text-red-500'}>
							{is_active ? t('Активный') : t('Неактивный')}
						</span>
					</div>
				)
			}
		},
		{
			header: t('Действие'),
			id: 'actions',
			size: 140,
			cell: (p) => {
			const { is_active } = p.row.original

				return(
					<ActionColumn
						onEdit={() => onEdit(p.row.original.parent_role_id, p.row.original.role)}
						onDelete={() => onDelete(p.row.original.id)}
						status={is_active}
						style={{ minWidth: p.column.getSize() - 48 }}
					/>
				)
			}
		}
	]

	return (
		<>
			<DataTable
				columns={columns}
				data={transformedData || []}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: users?.count || 0,
					pageIndex: queries.page,
					pageSize: queries.size
				}}
				onPaginationChange={(page) => setQueries((p) => ({ ...p, page }))}
				onSelectChange={(size) => setQueries((p) => ({ ...p, size, page: 1 }))}
				onSort={(sort) => setQueries((p) => ({ ...p, sort }))}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				type='danger'
				title={t('Удалить сотрудника')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteDialogIsOpen(false)}
				onRequestClose={() => setDeleteDialogIsOpen(false)}
				onCancel={() => setDeleteDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>{t('confirm_delete_employee_text')}</p>
			</ConfirmDialog>

			{isUpdateDialogOpen && updateId != null && editRole != null && (
				<UserEdit
					id={updateId}
					role={editRole}
					branchId={branchId}
					isOpen={isUpdateDialogOpen}
					setIsOpen={setUpdateDialogIsOpen}
					refetch={refetch}
				/>
			)}
		</>
	)
}
