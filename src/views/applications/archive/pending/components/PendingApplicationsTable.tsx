import { CSSProperties, useMemo, useState } from 'react'
import { HiOutlineEye, HiOutlinePlus } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import {
	ContractApplication,
	ContractApplicationStatusEnum,
	ContractApplicationVotingStatusEnum
} from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Tooltip } from '@/components/ui'
import { useAppSelector } from '@/store'
import { formatDate, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import PendingApplicationsView from './PendingApplicationsView'
import { useTranslation } from 'react-i18next'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	applications?: PaginatedResponse<ContractApplication[]>
	isLoading?: boolean
}

const ActionColumn = ({
	row,
	style,
	onView,
	onAdd
}: {
	row: ContractApplication
	style: CSSProperties
	onView: () => void
	onAdd: () => void
}) => {
	const { user } = useAppSelector((state) => state.auth.session)
	const { textTheme } = useThemeClass()

	return (
		<div className='flex items-center justify-center text-lg' style={style}>
			{user.role === UserRoleTextEnum.SALES &&
			row.voting_status === ContractApplicationVotingStatusEnum.APPROVED &&
			row.status !== ContractApplicationStatusEnum.CONTRACT_CREATED ? (
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onAdd}>
					<HiOutlinePlus />
				</span>
			) : (
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onView}>
					<HiOutlineEye />
				</span>
			)}
		</div>
	)
}

const PendingApplicationsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	applications,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const navigate = useNavigate()
	const { user } = useAppSelector((state) => state.auth.session)

	const [isViewDialogOpen, setViewDialogIsOpen] = useState(false)
	const [viewId, setViewId] = useState<number | null>(null)

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
				header: t('Статус'),
				accessorKey: 'voting_status',
				size: 190,
				sortable: true,
				cell: (props) => {
					switch (props.row.original.voting_status) {
						case ContractApplicationVotingStatusEnum.NEW:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-indigo-500' />
									<span className='text-indigo-500'>{t('Новое')}</span>
								</div>
							)
						case ContractApplicationVotingStatusEnum.IN_PROGRESS:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-orange-500' />
									<span className='text-orange-500'>{t('В процессе')}</span>
								</div>
							)
						case ContractApplicationVotingStatusEnum.APPROVED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-green-500' />
									<span className='text-green-500'>{t('Согласовано')}</span>
								</div>
							)
						case ContractApplicationVotingStatusEnum.REJECTED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Отказано')}</span>
								</div>
							)
					}
				}
			},
			{
				header: t('Голосование'),
				accessorKey: 'votes',
				size: 160,
				enableSorting: false,
				cell: (props) => {
					const { votes } = props.row.original

					const { approvedVotingStatusCount, rejectedVotingStatusCount } = votes.reduce(
						(acc, vote) => {
							if (vote.voting_status === ContractApplicationVotingStatusEnum.APPROVED) {
								acc.approvedVotingStatusCount++
							}

							if (vote.voting_status === ContractApplicationVotingStatusEnum.REJECTED) {
								acc.rejectedVotingStatusCount++
							}

							return acc
						},
						{
							approvedVotingStatusCount: 0,
							rejectedVotingStatusCount: 0
						}
					) ?? {
						approvedVotingStatusCount: 0,
						rejectedVotingStatusCount: 0
					}

					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{votes.length
								? `${approvedVotingStatusCount + rejectedVotingStatusCount} / ${votes.length}`
								: '-'}
						</div>
					)
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
				header: t('Действие'),
				id: 'actions',
				size: 140,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => {
					const onView = (id: number) => {
						switch (user.role) {
							case UserRoleTextEnum.MARKETING:
								setViewDialogIsOpen(true)
								setViewId(id)

								return
							default:
								navigate(`/applications/pending/${id}`)

								return
						}
					}

					const onAdd = (id: number) => {
						navigate(`/clients/new-contracts/new/${id}`)
					}

					return (
						<ActionColumn
							style={{ minWidth: props.column.getSize() - 48 }}
							row={props.row.original}
							onView={() => onView(props.row.original.id)}
							onAdd={() => onAdd(props.row.original.id)}
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
				loading={isLoading}
				pagingData={{
					total: applications?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{viewId && (
				<PendingApplicationsView
					id={viewId}
					isOpen={isViewDialogOpen}
					setIsOpen={setViewDialogIsOpen}
				/>
			)}
		</>
	)
}

export default PendingApplicationsTable
