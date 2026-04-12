import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, DataTable } from '@/components/shared'
import { Badge, Tooltip } from '@/components/ui'
import { useAppSelector } from '@/store'
import { formatDate, formatPhone, formatPrice } from '@/utils/format'

type Props = {
	data: ContractApplication[]
	isLoading?: boolean
}

const NewApplicationsViewTable = ({ data, isLoading = false }: Props) => {
	const { t } = useTranslation()

	const { user } = useAppSelector((state) => state.auth.session)

	const columns: ColumnDef<ContractApplication>[] = useMemo(
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
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING],
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
		],
		[data, t]
	)

	return (
		<DataTable
			columns={columns}
			userRole={user.role}
			data={data}
			skeletonAvatarColumns={[0]}
			skeletonAvatarProps={{ className: 'rounded-md' }}
			loading={isLoading}
			isPagination={false}
		/>
	)
}

export default NewApplicationsViewTable
