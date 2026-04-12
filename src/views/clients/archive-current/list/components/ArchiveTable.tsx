import { CSSProperties, useMemo } from 'react'
import { HiOutlineDocumentText } from 'react-icons/hi'
import classNames from 'classnames'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { ContractStatusEnum, NewContract } from '@/@types/contract.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Tooltip } from '@/components/ui'
import { formatDate, formatMonths, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { useTranslation } from 'react-i18next'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	contracts?: PaginatedResponse<NewContract[]>
	isLoading?: boolean
}

const DocsColumn = ({ row, style }: { row: NewContract; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	const onDocsClick = () => {
		window.open(row.contract.pdf_document, '_blank')
	}

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={row.contract.pdf_document ? t('Посмотреть') : t('Нет документа')}>
				<span
					className={classNames(`cursor-pointer p-2 hover:${textTheme}`, {
						'pointer-events-none opacity-40': !row.contract.pdf_document
					})}
					onClick={onDocsClick}
				>
					<HiOutlineDocumentText size={18} />
				</span>
			</Tooltip>
		</div>
	)
}

const ArchiveContractsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	contracts,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const columns: ColumnDef<NewContract>[] = useMemo(
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
						{props.row.original.contract.id}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch_region',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.branch_region}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'status',
				size: 190,
				sortable: true,
				cell: (props) => {
					switch (props.row.original.contract.status) {
						case ContractStatusEnum.PENDING_TRANSFER:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-indigo-500' />
									<span className='text-indigo-500'>{t('Ожидание оплаты')}</span>
								</div>
							)
						case ContractStatusEnum.DEPOSIT_PAID:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-orange-500' />
									<span className='text-orange-500'>{t('Ожидание выдачи техники')}</span>
								</div>
							)
						case ContractStatusEnum.TECH_GIVEN:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-green-500' />
									<span className='text-green-500'>{t('Выдача техники')}</span>
								</div>
							)
						case ContractStatusEnum.CANCELED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Отменен')}</span>
								</div>
							)
						case ContractStatusEnum.CLIENT_CHANGED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-yellow-500' />
									<span className='text-yellow-500'>{t('Переуступка')}</span>
								</div>
							)
						case ContractStatusEnum.TECH_RETURNED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Возврат средств')}</span>
								</div>
							)
					}
				}
			},
			{
				header: t('Наименование'),
				accessorKey: 'client_company_name',
				size: 260,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.contract.client_company_name}>
							<span className='truncate-2'>{props.row.original.contract.client_company_name}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.stir}
					</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'tech_model',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.tech_model}
					</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'code',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.code}
					</div>
				)
			},
			{
				header: t('Дата'),
				accessorKey: 'contract_date',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.contract.contract_date)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Сумма с GPS')}</div>,
				accessorKey: 'price_with_gps',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.price_with_gps)}
					</div>
				)
			},
			{
				header: t('%Аванса'),
				accessorKey: 'deposit_percentage',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.deposit_percentage)}%
					</div>
				)
			},
			{
				header: t('Срок договора'),
				accessorKey: 'rent_period',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatMonths(props.row.original.contract.rent_period)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Аванс сумма')}</div>,
				accessorKey: 'deposit',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.deposit)}
					</div>
				)
			},
			{
				header: t('Аванс факт'),
				accessorKey: '',
				size: 140,
				sortable: true,
				cell: (props) => <div style={{ minWidth: props.column.getSize() - 48 }}>-</div>
			},
			{
				header: t('Очередь'),
				accessorKey: 'position',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.position}</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Документы')}</div>,
				id: 'docs',
				size: 140,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => (
					<DocsColumn row={props.row.original} style={{ minWidth: props.column.getSize() - 48 }} />
				)
			}
		],
		[contracts, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={contracts?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: contracts?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>
		</>
	)
}

export default ArchiveContractsTable
