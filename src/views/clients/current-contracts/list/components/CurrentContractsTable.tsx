import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentText, HiOutlineEye } from 'react-icons/hi'
import classNames from 'classnames'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import type { CurrentContract } from '@/@types/contract.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Tooltip } from '@/components/ui'
import { formatDate, formatMonths, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import CurrentContractsView from './CurrentContractsView'
import { UserRoleTextEnum } from '@/@types/user.types'
import { useAppSelector } from '@/store'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	contracts?: PaginatedResponse<CurrentContract[]>
	isLoading: boolean
}

const ActionColumn = ({
	onViewClick,
	style
}: {
	onViewClick: () => void
	style: CSSProperties
}) => {
	const { t } = useTranslation()
	const { textTheme } = useThemeClass()

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onViewClick}>
					<HiOutlineEye />
				</span>
			</Tooltip>
		</div>
	)
}

const DocsColumn = ({ row, style }: { row: CurrentContract; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	const onDocsClick = () => {
		window.open(row.document_url, '_blank')
	}

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={row.document_url ? t('Посмотреть') : t('Нет документа')}>
				<span
					className={classNames(`cursor-pointer p-2 hover:${textTheme}`, {
						'pointer-events-none opacity-40': !row.document_url
					})}
					onClick={onDocsClick}
				>
					<HiOutlineDocumentText />
				</span>
			</Tooltip>
		</div>
	)
}

const CurrentContractsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	contracts,
	isLoading
}: Props) => {
	const { t } = useTranslation()
	const { user } = useAppSelector((state) => state.auth.session)

	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [selectedContract, setSelectedContract] = useState<CurrentContract | null>(null)

	const columns: ColumnDef<CurrentContract>[] = useMemo(() => {
		const isLessee = user.role === UserRoleTextEnum.LESSEE

		return [
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
				accessorKey: 'branch__name',
				size: 190,
				sortable: true,
				enableSorting: !isLessee,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.branch ? props.row.original.branch.name : '-'}
					</div>
				)
			},
			{
				header: t('Наименование'),
				accessorKey: 'client_company_name',
				size: 260,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.client_company_name}>
							<span className='truncate-2'>{props.row.original.client_company_name}</span>
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
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'contract_id',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract_id}
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
						{formatDate(props.row.original.contract_date)}
					</div>
				)
			},
			{
				header: () => <div className='w-full text-right whitespace-nowrap'>{t('Сумма')}</div>,
				id: 'overall_contract_amount',
				accessorKey: 'overall_contract_amount',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.overall_contract_amount)}
					</div>
				)
			},
			{
				header: () => <div className='w-full text-right whitespace-nowrap'>{t('Остаток')}</div>,
				accessorKey: 'contract_amount_left',
				id: 'contract_amount_left',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract_amount_left)}
					</div>
				)
			},
			{
				header: () => <div className='w-full text-right whitespace-nowrap'>{t('Просрочка')}</div>,
				accessorKey: 'overdue_amount',
				size: 150,
				sortable: true,
				cell: (props) => (
					<div
						className={classNames('text-right', {
							'text-red-500': Number(props.row.original.overdue_amount) > 0
						})}
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			},
			{
				header: t('Срок общий'),
				accessorKey: 'overall_contract_months',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatMonths(props.row.original.overall_contract_months)}
					</div>
				)
			},
			{
				header: t('Срок текущий'),
				accessorKey: 'current_contract_month',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatMonths(props.row.original.current_contract_month)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Документы')}</div>,
				id: 'docs',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<DocsColumn row={props.row.original} style={{ minWidth: props.column.getSize() - 48 }} />
				)
			},
			{
				header: () => <div className='text-center'>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => {
					const onView = () => {
						const selected =
							contracts && contracts.results.find((c) => c.id === props.row.original.id)

						if (!selected) return

						setSelectedContract(selected)
						setIsDrawerOpen(true)
					}

					return (
						<ActionColumn onViewClick={onView} style={{ minWidth: props.column.getSize() - 48 }} />
					)
				}
			}
		]
	}, [contracts, t])

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

			{selectedContract && (
				<CurrentContractsView
					contract={selectedContract}
					isOpen={isDrawerOpen}
					onClose={() => setIsDrawerOpen(false)}
					onRequestClose={() => setIsDrawerOpen(false)}
				/>
			)}
		</>
	)
}

export default CurrentContractsTable
