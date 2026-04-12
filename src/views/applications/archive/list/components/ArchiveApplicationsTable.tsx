import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineTrash } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import classNames from 'classnames'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Notification, toast, Tooltip } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { useAppSelector } from '@/store'
import { formatDate, formatPhone, formatPrice } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	applications?: PaginatedResponse<ContractApplication[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const ActionColumn = ({
	row,
	onDelete,
	style
}: {
	row: ContractApplication
	onDelete: () => void
	style: CSSProperties
}) => {
	return (
		<div className='flex items-center justify-center text-lg' style={style}>
			<span
				className={classNames('cursor-pointer p-2 hover:text-red-500', {
					'pointer-events-none opacity-50': [
						ContractApplicationStatusEnum.DOCUMENT_GATHERING,
						ContractApplicationStatusEnum.IN_COMMISSION,
						ContractApplicationStatusEnum.REJECTED,
						ContractApplicationStatusEnum.CONTRACT_CREATED
					].includes(row.status)
				})}
				onClick={onDelete}
			>
				<HiOutlineTrash />
			</span>
		</div>
	)
}

const NewApplicationsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	applications,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const { user } = useAppSelector((state) => state.auth.session)

	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete applications'],
		mutationFn: (id: number) => ContractService.deleteApplications(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification type='success' title={t('Заявка удалена')} duration={2000} />, {
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

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	const columns: ColumnDef<ContractApplication>[] = useMemo(
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
				header: t('Филиал'),
				accessorKey: 'branch',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.branch ? props.row.original.branch.name : '-'}
					</div>
				)
			},
			{
				header: t('Организация'),
				accessorKey: 'company_name',
				size: 290,
				sortable: true,
				authority: [`!${UserRoleTextEnum.LESSEE}`],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.company_name}>
							<span className='truncate-2'>{props.row.original.company_name}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 170,
				enableSorting: false,
				authority: [`!${UserRoleTextEnum.LESSEE}`],
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'tech',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.tech?.model_name_ru ?? '-'}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Сумма')}</div>,
				accessorKey: 'total_amount',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING, UserRoleTextEnum.SALES],
				cell: (props) => (
					<div className='capitalize' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'status',
				size: 200,
				sortable: true,
				cell: (props) => {
					switch (props.row.original.status) {
						case ContractApplicationStatusEnum.NEW:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-indigo-500' />
									<span className='text-indigo-500'>{t('Новое')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.ASSIGNED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-orange-500' />
									<span className='text-orange-500'>{t('Назначен')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.DOCUMENT_GATHERING:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-yellow-500' />
									<span className='text-yellow-500'>{t('Сбор документов')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.IN_COMMISSION:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-purple-500' />
									<span className='text-purple-500'>{t('Комиссия')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.REJECTED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Отказано')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.CONTRACT_CREATED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-green-500' />
									<span className='text-green-500'>{t('Составлен договор')}</span>
								</div>
							)
					}
				}
			},
			{
				header: t('Исполнитель'),
				accessorKey: 'sales',
				size: 240,
				sortable: true,
				cell: (props) => {
					const { sales } = props.row.original

					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{sales
								? `${sales.profile.first_name} ${sales.profile.last_name} ${sales.profile.middle_name}`
								: '-'}
						</div>
					)
				}
			},
			{
				header: t('Дата'),
				accessorKey: 'application_date',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.application_date)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING, UserRoleTextEnum.SALES],
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-2',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-2'
				},
				cell: (props) => {
					const onDelete = (id: number) => {
						setDeleteDialogIsOpen(true)
						setDeleteId(id)
					}

					return (
						<ActionColumn
							style={{ minWidth: props.column.getSize() - 48 }}
							row={props.row.original}
							onDelete={() => onDelete(props.row.original.id)}
						/>
					)
				}
			}
		],
		[applications, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				userRole={user.role}
				data={applications?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: applications?.count || 0,
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
				title={t('Удалить заявку')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteDialogIsOpen(false)}
				onRequestClose={() => setDeleteDialogIsOpen(false)}
				onCancel={() => setDeleteDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>
					{t('Вы уверены, что хотите удалить эту заявку? Все записи, связанные с этим продуктом, также\n' +
						'\t\t\t\t\tбудут удалены. Это действие не может быть отменено.')}
				</p>
			</ConfirmDialog>
		</>
	)
}

export default NewApplicationsTable
