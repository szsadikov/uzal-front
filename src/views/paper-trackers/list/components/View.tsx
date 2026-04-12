// import { CSSProperties, useMemo, useState } from 'react'
// import { HiDownload, HiOutlineDocumentText } from 'react-icons/hi'
// import { useQuery } from '@tanstack/react-query'
// import dayjs from 'dayjs'
// import { PaginatedResponse, TableQueries } from '@/@types/common'
// // import { CurrentContract, CurrentContractPayment } from '@/@types/contract.types'
// import { type ColumnDef, DataTable } from '@/components/shared'
// import {  BegunokListItem } from '@/@types/begunok.types'
// import { Button, Drawer, DrawerProps, Skeleton, Tooltip } from '@/components/ui'
// import { CustomerService } from '@/services/customer.service'
// import { exportToExcel } from '@/utils/files'
// import { formatDate, formatMonths, formatPrice } from '@/utils/format'
// import useResponsive from '@/utils/hooks/useResponsive'
// import useThemeClass from '@/utils/hooks/useThemeClass'
//
// type Props = DrawerProps & {
// 	begunok: BegunokListItem
// }
//
// const DocsContractColumn = ({
// 	onDocsClick,
// 	style
// }: {
// 	onDocsClick: () => void
// 	style: CSSProperties
// }) => {
// 	const { textTheme } = useThemeClass()
//
// 	return (
// 		<div className='flex justify-center text-lg' style={style}>
// 			<Tooltip title='Посмотреть'>
// 				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onDocsClick}>
// 					<HiOutlineDocumentText />
// 				</span>
// 			</Tooltip>
// 		</div>
// 	)
// }
//
// const DocsPaymentColumn = ({
// 	onDocsClick,
// 	style
// }: {
// 	onDocsClick: () => void
// 	style: CSSProperties
// }) => {
// 	const { textTheme } = useThemeClass()
//
// 	return (
// 		<div className='flex justify-center text-lg' style={style}>
// 			<Tooltip title='Посмотреть'>
// 				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onDocsClick}>
// 					<HiOutlineDocumentText />
// 				</span>
// 			</Tooltip>
// 		</div>
// 	)
// }
//
// const View = ({ begunok, onClose, ...rest }: Props) => {
// 	const { windowWidth, larger } = useResponsive()
//
// 	const [queries, setQueries] = useState<TableQueries>({
// 		page: 1,
// 		size: 10
// 		// search: '',
// 		// sort: { key: '', order: '' }
// 	})
//
// 	const params = useMemo(
// 		() => ({ ...queries, current_client: contract.id }),
// 		[queries, contract.id]
// 	)
//
// 	const { data: payments, isLoading } = useQuery({
// 		queryKey: ['get current contract payments', params],
// 		queryFn: () =>
// 			CustomerService.getAllCurrentContractPayments<PaginatedResponse<CurrentContractPayment[]>>(
// 				params
// 			),
// 		select: ({ data }) => data
// 	})
//
// 	const contractColumns: ColumnDef<CurrentContract>[] = useMemo(
// 		() => [
// 			{
// 				header: '№',
// 				accessorKey: 'id',
// 				size: 80,
// 				cell: (props) => (
// 					<div
// 						className='text-center font-semibold'
// 						style={{ minWidth: props.column.getSize() - 48 }}
// 					>
// 						{props.row.original.id}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Филиал',
// 				accessorKey: 'branch',
// 				size: 260,
// 				sortable: true,
// 				cell: (props) => (
// 					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
// 						{props.row.original.branch}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Наименование',
// 				accessorKey: 'client_company_name',
// 				size: 260,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{props.row.original.client_company_name}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'ИНН',
// 				accessorKey: 'stir',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
// 				)
// 			},
// 			{
// 				header: '№Договора',
// 				accessorKey: 'contract_id',
// 				size: 160,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{props.row.original.contract_id}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Дата',
// 				accessorKey: 'contract_date',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatDate(props.row.original.contract_date)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Сумма',
// 				accessorKey: 'overall_contract_amount',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.overall_contract_amount)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Остаток',
// 				accessorKey: 'contract_amount_left',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.contract_amount_left)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Просрочка',
// 				accessorKey: 'overdue_amount',
// 				size: 150,
// 				sortable: true,
// 				cell: (props) => (
// 					<div className='text-red-500' style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.overdue_amount)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Срок общий',
// 				accessorKey: 'current_contract_month',
// 				size: 170,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatMonths(props.row.original.current_contract_month)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Срок текущий',
// 				accessorKey: 'overall_contract_months',
// 				size: 170,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatMonths(props.row.original.overall_contract_months)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Документы',
// 				id: 'docs',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => {
// 					const onDocs = () => {
// 						console.log('onDocs', props.row.original.contract_id)
// 					}
//
// 					return (
// 						<DocsContractColumn
// 							onDocsClick={onDocs}
// 							style={{ minWidth: props.column.getSize() - 48 }}
// 						/>
// 					)
// 				}
// 			}
// 		],
// 		[]
// 	)
//
// 	const paymentColumns: ColumnDef<CurrentContractPayment>[] = useMemo(
// 		() => [
// 			{
// 				header: '№',
// 				accessorKey: 'id',
// 				size: 80,
// 				cell: (props) => (
// 					<div
// 						className='text-center font-semibold'
// 						style={{ minWidth: props.column.getSize() - 48 }}
// 					>
// 						{props.row.original.id}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Месяц',
// 				accessorKey: 'month',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatMonths(props.row.original.month)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Дата оплаты',
// 				accessorKey: 'payment_date',
// 				size: 160,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatDate(props.row.original.payment_date)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Дни в месяце',
// 				accessorKey: 'days_in_month',
// 				size: 170,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.month}</div>
// 				)
// 			},
// 			{
// 				header: 'Основной долг',
// 				accessorKey: 'main_payment',
// 				size: 190,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.main_payment)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Маржа',
// 				accessorKey: 'margin_payment',
// 				size: 130,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.margin_payment)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Просрочка',
// 				accessorKey: 'overdue_amount',
// 				size: 150,
// 				sortable: true,
// 				cell: (props) => (
// 					<div className='text-red-500' style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.overdue_amount)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Общая сумма',
// 				accessorKey: 'total_payment',
// 				size: 170,
// 				sortable: true,
// 				cell: (props) => (
// 					<div style={{ minWidth: props.column.getSize() - 48 }}>
// 						{formatPrice(props.row.original.total_payment)}
// 					</div>
// 				)
// 			},
// 			{
// 				header: 'Документы',
// 				id: 'docs',
// 				size: 140,
// 				sortable: true,
// 				cell: (props) => {
// 					const onDocs = () => {
// 						console.log('onDocs', props.row.original.id)
// 					}
//
// 					return (
// 						<DocsPaymentColumn
// 							onDocsClick={onDocs}
// 							style={{ minWidth: props.column.getSize() - 48 }}
// 						/>
// 					)
// 				}
// 			}
// 		],
// 		[]
// 	)
//
// 	return (
// 		<Drawer
// 			title={`График платежей по Договору ${contract.contract_id}`}
// 			placement='right'
// 			width={larger.lg ? windowWidth - 188 : windowWidth}
// 			onClose={onClose}
// 			footer={
// 				<div className='w-full text-right'>
// 					<Button variant='solid' className='mr-2' onClick={onClose}>
// 						Закрыть
// 					</Button>
// 				</div>
// 			}
// 			{...rest}
// 		>
// 			<div className='flex flex-col lg:flex-row lg:items-center lg:justify-end'>
// 				{isLoading ? (
// 					<Skeleton height={36} />
// 				) : (
// 					payments && (
// 						<Button
// 							className='mb-4 block md:ml-2 md:inline-block'
// 							size='sm'
// 							icon={<HiDownload />}
// 							onClick={() =>
// 								exportToExcel(
// 									payments.results,
// 									`График платежей по Договору ${contract.contract_id} - ${dayjs(new Date()).format('DD.MM.YYYY_HH-mm-ss')}`
// 								)
// 							}
// 						>
// 							Экспорт
// 						</Button>
// 					)
// 				)}
// 			</div>
//
// 			<div className='shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
// 				<DataTable
// 					columns={contractColumns}
// 					data={[{ ...contract }]}
// 					skeletonAvatarColumns={[0]}
// 					skeletonAvatarProps={{ className: 'rounded-md' }}
// 					isPagination={false}
// 				/>
// 			</div>
//
// 			<div className='mt-12'>
// 				<DataTable
// 					columns={paymentColumns}
// 					data={payments?.results || []}
// 					skeletonAvatarColumns={[0]}
// 					skeletonAvatarProps={{ className: 'rounded-md' }}
// 					loading={isLoading}
// 					pagingData={{
// 						total: payments?.count || 0,
// 						pageIndex: params.page,
// 						pageSize: params.size
// 					}}
// 					onPaginationChange={(page) => setQueries((prev) => ({ ...prev, page }))}
// 					onSelectChange={(size) => setQueries((prev) => ({ ...prev, size }))}
// 					onSort={(sort) => setQueries((prev) => ({ ...prev, sort }))}
// 				/>
// 			</div>
// 		</Drawer>
// 	)
// }
//
// export default View
