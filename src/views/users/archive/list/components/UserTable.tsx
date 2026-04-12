import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { User } from '@/@types/user.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Badge } from '@/components/ui'
import { formatDate, formatPhone, userRoleTextToName } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	users?: PaginatedResponse<User[]>
	isLoading?: boolean
}

const UserTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	users,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const columns: ColumnDef<User>[] = useMemo(
		() => [
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
				accessorKey: 'name',
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
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			},
			{
				header: t('Область'),
				accessorKey: 'region',
				size: 240,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.region ? props.row.original.region.name_ru : '-'}
					</div>
				)
			},
			// {
			// 	header: 'ПИНФЛ',
			// 	accessorKey: 'pinfl',
			// 	size: 240,
			// 	sortable: true,
			// 	cell: (props) => (
			// 		<div style={{ minWidth: props.column.getSize() - 48 }}>
			// 			{props.row.original.pinfl ? props.row.original.pinfl : '-'}
			// 		</div>
			// 	)
			// },
			// {
			// 	header: 'Логин',
			// 	accessorKey: 'username',
			// 	size: 160,
			// 	sortable: true,
			// 	cell: (props) => (
			// 		<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.username}</div>
			// 	)
			// },
			{
				header: t('Должность'),
				accessorKey: 'role',
				size: 220,
				sortable: true,
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
								{is_active ? t('Активный') : t('Удалено')}
							</span>
						</div>
					)
				}
			},
			{
				header: t('Активность'),
				accessorKey: 'last_login',
				size: 180,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.last_login
							? formatDate(props.row.original.last_login, 'HH:mm DD.MM.YYYY')
							: '-'}
					</div>
				)
			}
		],
		[users, t]
	)

	return (
		<DataTable
			columns={columns}
			data={users?.results || []}
			skeletonAvatarColumns={[0]}
			skeletonAvatarProps={{ className: 'rounded-md' }}
			loading={isLoading}
			pagingData={{
				total: users?.count || 0,
				pageIndex: params.page,
				pageSize: params.size
			}}
			onPaginationChange={onPageChange}
			onSelectChange={onSizeChange}
			onSort={onSortingChange}
		/>
	)
}

export default UserTable
