import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineEye } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Tooltip } from '@/components/ui'
import { formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { MarketingClient } from '../../marketing-clients.service'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	data?: PaginatedResponse<MarketingClient[]>
	isLoading: boolean
}

const ActionColumn = ({
												onView,
												style
											}: {
	onView: () => void
	style?: CSSProperties
}) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()
	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onView}>
					<HiOutlineEye />
				</span>
			</Tooltip>
		</div>
	)
}

const MarketingClientsTable = ({
																 params,
																 onPageChange,
																 onSizeChange,
																 onSortingChange,
																 data,
																 isLoading
															 }: Props) => {
	const { t } = useTranslation()
	const navigate = useNavigate()

	const columns: ColumnDef<MarketingClient>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 60,
				enableSorting: false,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{(params.page - 1) * params.size + props.row.index + 1}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch',
				size: 160,
				enableSorting: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.branch?.region?.name_ru ?? '-'}
					</div>
				)
			},
			{
				header: t('Юр лицо'),
				accessorKey: 'client_company_name',
				size: 220,
				enableSorting: true,
				cell: (props) => (
					<div className='font-medium' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.client_company_name}
					</div>
				)
			},
			{
				header: t('Заявки'),
				accessorKey: 'applications_count',
				size: 100,
				enableSorting: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.applications_count ?? 0}
					</div>
				)
			},
			{
				header: t('Новые договора'),
				accessorKey: 'new_contracts_count',
				size: 160,
				enableSorting: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.new_contracts_count ?? 0}
					</div>
				)
			},
			{
				header: t('Текущие договора'),
				accessorKey: 'current_contracts_count',
				size: 170,
				enableSorting: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.current_contracts_count ?? 0}
					</div>
				)
			},
			{
				header: t('Заявление'),
				accessorKey: 'requests_count',
				size: 130,
				enableSorting: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.requests_count ?? 0}
					</div>
				)
			},
			{
				header: t('Лизинговые объекты'),
				accessorKey: 'leasing_count',
				size: 190,
				enableSorting: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.leasing_count ?? 0}
					</div>
				)
			},
			{
				header: t('Сумма'),
				accessorKey: 'overall_contract_amount',
				size: 160,
				enableSorting: true,
				meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' },
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.overall_contract_amount
							? formatPrice(props.row.original.overall_contract_amount)
							: '-'}
					</div>
				)
			},
			{
				header: t('Просрочка'),
				accessorKey: 'overdue_amount',
				size: 160,
				enableSorting: true,
				meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' },
				cell: (props) => (
					<div
						className={`text-right ${Number(props.row.original.overdue_amount) > 0 ? 'text-red-500' : ''}`}
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.overdue_amount
							? formatPrice(props.row.original.overdue_amount)
							: '-'}
					</div>
				)
			},
			{
				header: t('Остаток'),
				accessorKey: 'contract_amount_left',
				size: 160,
				enableSorting: true,
				meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' },
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract_amount_left
							? formatPrice(props.row.original.contract_amount_left)
							: '-'}
					</div>
				)
			},
			{
				header: t('ДЕЙСТВИЕ'),
				id: 'actions',
				size: 100,
				enableSorting: false,
				meta: {
					thClassName: 'sticky right-0 z-10 border-l border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700',
					tdClassName: 'sticky right-0 z-[5] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-600',
					thStyle: { textAlign: 'center', minWidth: '100px' },
					tdStyle: { textAlign: 'center', minWidth: '100px' }
				},
				cell: (props) => (
					<ActionColumn
						onView={() => navigate(`/marketing/clients/${props.row.original.id}`)}
						style={{ minWidth: 52 }}
					/>
				)
			}
		],
		[t, params.page, params.size, navigate]
	)

	return (
		<DataTable
			columns={columns}
			data={data?.results ?? []}
			loading={isLoading}
			pagingData={{
				total: data?.count ?? 0,
				pageIndex: params.page,
				pageSize: params.size
			}}
			onPaginationChange={onPageChange}
			onSelectChange={onSizeChange}
			onSort={onSortingChange}
		/>
	)
}

export default MarketingClientsTable
