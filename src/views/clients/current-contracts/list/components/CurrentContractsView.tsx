import { CSSProperties, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HiDownload, HiOutlineDocumentText } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { PaginatedResponse } from '@/@types/common'
import { CurrentContract, CurrentContractPayment } from '@/@types/contract.types'
import { type ColumnDef, DataTable, OnSortParam } from '@/components/shared'
import { Button, Drawer, DrawerProps, Skeleton, Tooltip } from '@/components/ui'
import { CustomerService } from '@/services/customer.service'
import { exportToExcel } from '@/utils/files'
import { formatDate, formatMonths, formatPrice } from '@/utils/format'
import useResponsive from '@/utils/hooks/useResponsive'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import useThemeClass from '@/utils/hooks/useThemeClass'

type Props = DrawerProps & {
	contract: CurrentContract
}

const DocsColumn = ({
	row,
	onDocsClick,
	style
}: {
	row: CurrentContract
	onDocsClick: () => void
	style: CSSProperties
}) => {
	const { t } = useTranslation()

	const { textTheme } = useThemeClass()

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

const CurrentContractsView = ({ contract, onClose, ...rest }: Props) => {
	const { t } = useTranslation()

	const { windowWidth, larger } = useResponsive()

	const { queries, setQueries } = useTableQueries<CurrentContractPayment>({ page: 1, size: 10 })

	const { data: payments, isLoading } = useQuery({
		queryKey: ['get current contract payments', queries, contract.id],
		queryFn: () =>
			CustomerService.getAllCurrentContractPayments<PaginatedResponse<CurrentContractPayment[]>>(
				{ ...queries, current_client: contract.id }
			),
		select: ({ data }) => data
	})

	const contractColumns: ColumnDef<CurrentContract>[] = useMemo(
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
				sortable: false,
				enableSorting: false,
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
				enableSorting: false,
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
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'contract_id',
				size: 190,
				sortable: true,
				enableSorting: false,
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
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.contract_date)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Сумма')}</div>,
				accessorKey: 'overall_contract_amount',
				size: 200,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.overall_contract_amount)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Остаток')}</div>,
				accessorKey: 'contract_amount_left',
				size: 200,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract_amount_left)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Просрочка')}</div>,
				accessorKey: 'overdue_amount',
				size: 150,
				enableSorting: false,
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
				enableSorting: false,
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
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => {
					const onDocs = () => {
						console.log('onDocs', props.row.original.contract_id)
					}

					return (
						<DocsColumn
							row={props.row.original}
							onDocsClick={onDocs}
							style={{ minWidth: props.column.getSize() - 48 }}
						/>
					)
				}
			}
		],
		[t]
	)

	const paymentColumns: ColumnDef<CurrentContractPayment>[] = useMemo(
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
				header: () => <div className='text-center'>{t('Месяц/Квартал')}</div>,
				accessorKey: 'month',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.month}
					</div>
				)
			},
			{
				header: t('Дата оплаты'),
				accessorKey: 'payment_date',
				size: 160,
				sortable: true,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.payment_date)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Дни в месяце')}</div>,
				accessorKey: 'days_in_month',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.days_in_month}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Основной долг')}</div>,
				accessorKey: 'main_payment',
				size: 190,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.main_payment)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Маржа')}</div>,
				accessorKey: 'margin_payment',
				size: 190,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.margin_payment)}
					</div>
				)
			},
			// {
			// 	header: () => <div className='text-right'>{t('Просрочка')}</div>,
			// 	accessorKey: 'overdue_amount',
			// 	size: 190,
			// 	enableSorting: false,
			// 	cell: (props) => (
			// 		<div
			// 			className={classNames('text-right', {
			// 				'text-red-500': Number(props.row.original.overdue_amount) > 0
			// 			})}
			// 			style={{ minWidth: props.column.getSize() - 48 }}
			// 		>
			// 			{formatPrice(props.row.original.overdue_amount)}
			// 		</div>
			// 	)
			// },
			{
				header: () => <div className='text-right'>{t('Общая сумма')}</div>,
				accessorKey: 'total_payment',
				size: 190,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_payment)}
					</div>
				)
			}
		],
		[t]
	)

	const onSortingChange = (sort: OnSortParam) => {
		setQueries((prev) => {
			let nextOrdering: string | undefined

			if (sort.key && sort.order) {
				if (sort.order === 'asc') nextOrdering = `${sort.key}`
				else if (sort.order === 'desc') nextOrdering = `-${sort.key}`
			}

			if (prev.ordering === nextOrdering) return prev

			return { ...prev, ordering: nextOrdering }
		})
	}

	const onExportToExel = async () => {
		if (!payments || !payments.results.length) return

		const clearedData = payments.results.map((item) => ({
			'№': item.id,
			Месяц: formatMonths(item.month),
			'Дата оплаты': formatDate(item.payment_date),
			'Дни в месяце': item.days_in_month,
			'Основной долг': item.main_payment,
			Маржа: item.margin_payment,
			Просрочка: item.overdue_amount,
			'Общая сумма': item.total_payment
		}))

		await exportToExcel(
			clearedData,
			`${t('График платежей по Договору')} ${contract.contract_id} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	useEffect(() => {
		setQueries({ page: 1, size: 10 })
	}, [contract.id])

	return (
		<Drawer
			title={`${t('График платежей по Договору')} ${contract.contract_id}`}
			placement='right'
			width={larger.lg ? windowWidth - 188 : windowWidth}
			onClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button variant='solid' className='mr-2' onClick={onClose}>
						{t('Закрыть')}
					</Button>
				</div>
			}
			{...rest}
		>
			<div className='flex flex-col lg:flex-row lg:items-center lg:justify-end'>
				{isLoading ? (
					<Skeleton height={36} />
				) : (
					<Button
						className='mb-4 block md:ml-2 md:inline-block'
						size='sm'
						icon={<HiDownload />}
						disabled={!payments || !payments.results.length}
						onClick={onExportToExel}
					>
						{t('Экспорт')}
					</Button>
				)}
			</div>

			<div className='shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
				<DataTable
					columns={contractColumns}
					data={[{ ...contract }]}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					isPagination={false}
				/>
			</div>

			<div className='mt-12'>
				<DataTable
					columns={paymentColumns}
					data={payments?.results || []}
					skeletonAvatarColumns={[0]}
					skeletonAvatarProps={{ className: 'rounded-md' }}
					loading={isLoading}
					pagingData={{
						total: payments?.count || 0,
						pageIndex: queries.page,
						pageSize: queries.size
					}}
					onPaginationChange={(page) => setQueries((prev) => ({ ...prev, page }))}
					onSelectChange={(size) => setQueries((prev) => ({ ...prev, size }))}
					onSort={onSortingChange}
				/>
			</div>
		</Drawer>
	)
}

export default CurrentContractsView
