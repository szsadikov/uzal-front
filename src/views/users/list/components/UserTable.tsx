import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { User, UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { UserService } from '@/services/user.service'
import { formatDate, formatPhone, userRoleTextToName } from '@/utils/format'
import useAuth from '@/utils/hooks/useAuth'
import useThemeClass from '@/utils/hooks/useThemeClass'
import UserEdit from './UserEdit'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	users?: PaginatedResponse<User[]>
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

const UserTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	users,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()
	const { user } = useAuth()

	const [isEditDialogOpen, setEditDialogIsOpen] = useState(false)
	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [editId, setEditId] = useState<number | null>(null)
	const [editRole, setEditRole] = useState<UserRoleTextEnum | null>(null)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete user'],
		mutationFn: (id: number) => UserService.delete(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification type='success' title='Пользователь удален' duration={2000} />, {
				placement: 'top-center'
			})
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

	const onEdit = (id: number, role: UserRoleTextEnum) => {
		setEditId(id)
		setEditRole(role)
		setEditDialogIsOpen(true) // oxirida
	}

	const onDelete = (id: number) => {
		setDeleteDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<User>[] = useMemo(() => {
		const isZAMPREDMONITORING = user.role === UserRoleTextEnum.ZAMPREDMONITORING

		return [
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
				header: t('Имя'),
				accessorKey: 'first_name',
				size: 290,
				sortable: true,
				cell: (props) => {
					const { first_name, last_name, middle_name } = props.row.original

					return (
						<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
							{first_name} {last_name} {middle_name}
						</div>
					)
				}
			},
			{
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				sortable: true,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'region',
				size: 240,
				sortable: true,
				authority: [`!${UserRoleTextEnum.ADMIN}`],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.region ? props.row.original.region.name_ru : '-'}
					</div>
				)
			},
			{
				header: t('ПИНФЛ'),
				accessorKey: 'pinfl',
				size: 170,
				enableSorting: !isZAMPREDMONITORING,
				authority: [UserRoleTextEnum.ADMIN],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.pinfl ? props.row.original.pinfl : '-'}
					</div>
				)
			},
			{
				header: t('Логин'),
				accessorKey: 'username',
				size: 190,
				sortable: true,
				authority: [UserRoleTextEnum.ADMIN],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.username}</div>
				)
			},
			{
				header: t('Должность'),
				accessorKey: 'role__name',
				size: 220,
				sortable: true,
				enableSorting: !isZAMPREDMONITORING,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{userRoleTextToName(props.row.original.role)}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'is_active',
				size: 150,
				enableSorting: false,
				cell: (props) => {
					const { is_active } = props.row.original

					return (
						<div
							className='flex items-center gap-2'
							style={{ minWidth: props.column.getSize() - 48 }}
						>
							<Badge className={is_active ? 'bg-emerald-500' : 'bg-red-500'} />
							<span className={`capitalize ${is_active ? 'text-emerald-500' : 'text-red-500'}`}>
								{is_active ? t('Активный') : t('Удален')}
							</span>
						</div>
					)
				}
			},
			{
				header: t('Активность'),
				accessorKey: 'last_login',
				size: 180,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.last_login
							? formatDate(props.row.original.last_login, 'HH:mm DD.MM.YYYY')
							: '-'}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<ActionColumn
						onEdit={() => onEdit(props.row.original.parent_role_id, props.row.original.role)}
						onDelete={() => onDelete(props.row.original.id)}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		]
	}, [users, t])

	return (
		<>
			<DataTable
				columns={columns}
				userRole={user.role}
				data={users?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: users?.count || 0,
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
				title={t('Удалить пользователя')}
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
						'Вы уверены, что хотите удалить этого пользователя? Все записи, связанные с этим продуктом, также будут удалены. Это действие не может быть отменено.'
					)}
				</p>
			</ConfirmDialog>

			{/*{editId && editRole && (*/}
			{/*	<UserEdit*/}
			{/*		id={editId}*/}
			{/*		role={editRole}*/}
			{/*		isOpen={isEditDialogOpen}*/}
			{/*		setIsOpen={setEditDialogIsOpen}*/}
			{/*		refetch={refetch}*/}
			{/*	/>*/}
			{/*)}*/}
			{isEditDialogOpen && editId != null && editRole != null && (
				<UserEdit
					id={editId}
					role={editRole}
					isOpen={isEditDialogOpen}
					setIsOpen={setEditDialogIsOpen}
					refetch={refetch}
				/>
			)}
		</>
	)
}

export default UserTable
