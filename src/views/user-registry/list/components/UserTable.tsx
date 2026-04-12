import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { UserRegistryRow,UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { UserService } from '@/services/user.service'
import { formatPhone } from '@/utils/format'
import useAuth from '@/utils/hooks/useAuth'
import useThemeClass from '@/utils/hooks/useThemeClass'
import UserEdit from './UserEdit'



type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	users?: PaginatedResponse<UserRegistryRow[]>
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
	const { t, i18n } = useTranslation()
	const { user } = useAuth()

	const [isEditDialogOpen, setEditDialogIsOpen] = useState(false)
	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [editId, setEditId] = useState<number | null>(null)
	const [editRole, setEditRole] = useState<UserRoleTextEnum | null>(null)

	function getRegionName(row: UserRegistryRow) {
		const r = row.region
		if (!r) return '-'
		const lang = (i18n.language || '').toLowerCase()
		if (lang.startsWith('ru')) return r.name_ru
		if (lang.startsWith('uz') || lang.startsWith('oz')) return r.name_latin || r.name_uzl || r.name_uz
		return r.name_ru
	}

	const [deleteId, setDeleteId] = useState<number | null>(null)

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete user'],
		mutationFn: (id: number) => UserService.deleteRegistry(id),
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
		setEditDialogIsOpen(true)
	}

	const onDelete = (id: number) => {
		setDeleteDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<UserRegistryRow>[] = useMemo(() => {
		const isZAMPREDMONITORING = user.role === UserRoleTextEnum.ZAMPREDMONITORING

		return [

			// №
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

			// Область
			{
				header: t('Область'),
				accessorKey: 'region',
				size: 240,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{getRegionName(props.row.original)}
					</div>
				)
			},

			// Наименование (компания)
			{
				header: t('Наименование'),
				accessorKey: 'company_name',
				size: 290,
				sortable: true,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.company_name || '-'}
					</div>
				)
			},

			// ИНН (STIR)
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 170,
				enableSorting: !isZAMPREDMONITORING,
				authority: [UserRoleTextEnum.ADMIN],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.stir || '-'}
					</div>
				)
			},

			// Расчетный счет
			{
				header: t('Расчетный счет'),
				accessorKey: 'account_number',
				size: 220,
				sortable: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.account_number || '-'}
					</div>
				)
			},

			// Адрес
			{
				header: t('Адрес'),
				accessorKey: 'address',
				size: 240,
				sortable: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.address || '-'}
					</div>
				)
			},

			// МФО
			{
				header: t('МФО'),
				accessorKey: 'mfo',
				size: 120,
				sortable: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.mfo || '-'}
					</div>
				)
			},

			// Банк
			{
				header: t('Банк'),
				accessorKey: 'bank_details',
				size: 220,
				sortable: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.bank_details || '-'}
					</div>
				)
			},

			// Директор
			{
				header: t('Директор'),
				accessorKey: 'director_name',
				size: 220,
				sortable: true,
				enableSorting: !isZAMPREDMONITORING,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.director_name || '-'}
					</div>
				)
			},

			// НОМЕР ТЕЛЕФОНА
			{
				header: t('НОМЕР ТЕЛЕФОНА'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.profile?.phone_number)}
					</div>
				)
			},

			// логин
			{
				header: t('Логин'),
				accessorKey: 'username',
				size: 190,
				sortable: true,
				authority: [UserRoleTextEnum.ADMIN],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.profile?.username || '-'}
					</div>
				)
			},

			// устройство
			{
				header: t('Устройство'),
				id: 'registered_device_type',
				size: 140,
				enableSorting: false,
				accessorFn: () => '-',
				cell: (props) => <div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.profile?.registered_device_type || '-'}</div>
			},

			// ДАТА РЕГИСТРАЦИИ
			{
				header: t('ДАТА РЕГИСТРАЦИИ'),
				id: 'registered_at',
				size: 190,
				enableSorting: false,
				accessorFn: () => '-',
				cell: (props) => {
					const val = props.row.original.registered_at
					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{val ? new Date(val).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
						</div>
					)
				}
			},

			// ВЕБ АКТИВНОСТЬ
			{
				header: t('ВЕБ АКТИВНОСТЬ'),
				id: 'web_activity',
				size: 180,
				enableSorting: false,
				accessorFn: () => '-',
				cell: (props) => {
					const val = props.row.original.profile?.last_web_request_at

					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{val ? new Date(val).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
						</div>
					)
				}
			},

			// МОБ АКТИВНОСТЬ
			{
				header: t('МОБ АКТИВНОСТЬ'),
				id: 'mob_activity',
				size: 180,
				enableSorting: false,
				accessorFn: () => '-',
				cell: (props) => {
					const profile = props.row.original.profile
					const dates = [profile?.last_ios_request_at, profile?.last_android_request_at].filter(Boolean) as string[]
					const latest = dates.length
						? new Date(Math.max(...dates.map((d) => new Date(d).getTime())))
						: null
					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{latest ? latest.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
						</div>
					)
				}
			},

			// ДЕЙСТВИЕ
			{
				header: () => <div className='text-center'>{t('ДЕЙСТВИЕ')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<ActionColumn
						onEdit={() => onEdit(props.row.original.id, props.row.original.profile?.role as any)}
						onDelete={() => onDelete(props.row.original.id)}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}


		]
	}, [t, i18n.language, user.role])

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
