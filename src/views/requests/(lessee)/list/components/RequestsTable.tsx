import { CSSProperties, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentText } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast, Tooltip } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { formatDate, formatMonths, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	payment_notices?: PaginatedResponse<PaymentOverdueNotice[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const DocsColumn = ({ onDocsClick, style }: { onDocsClick: () => void; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onDocsClick}>
					<HiOutlineDocumentText size={18} />
				</span>
			</Tooltip>
		</div>
	)
}

const RequestsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	payment_notices,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const { mutateAsync: mutateAsyncPaymentNotice } = useMutation({
		mutationKey: ['get payment notice'],
		mutationFn: (id: number) =>
			PaymentNoticeService.getById<PaymentOverdueNotice>(id),
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const columns: ColumnDef<PaymentOverdueNotice>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div
						className='text-center font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Наименование'),
				accessorKey: 'company_name',
				size: 260,
				sortable: true,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.company_name}
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
				accessorKey: 'code',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.code ? props.row.original.code : '-'}</div>
				)
			},
			{
				header: t('Дата оплаты'),
				accessorKey: 'date_of_payment',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.date_of_payment)}
					</div>
				)
			},
			{
				header: t('Месяц'),
				accessorKey: 'month_overdue',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatMonths(props.row.original.month_overdue)}
					</div>
				)
			},
			{
				header: t('Дни в месяце'),
				accessorKey: 'days_in_the_month',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.days_in_the_month}
					</div>
				)
			},
			{
				header: t('Основной долг'),
				accessorKey: 'main_amount_of_payment',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.main_amount_of_payment)}
					</div>
				)
			},
			{
				header: t('Проценты'),
				accessorKey: 'rent_percent',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
						{formatPrice(props.row.original.rent_percent)}
					</div>
				)
			},
			{
				header: t('Общая сумма'),
				accessorKey: 'total_amount',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right'>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: t('Просрочка'),
				accessorKey: 'overdue_amount',
				size: 150,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }} className='text-right text-red-500'>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			},
			{
				header: t('Талабнома'),
				id: 'docs',
				size: 140,
				sortable: true,
				cell: (props) => {
					const onDocs = async () => {
						await mutateAsyncPaymentNotice(props.row.original.id).then(({ data }) => {
							if (!data.pdf_document) {
								toast.push(<Notification type='danger' title='Pdf не найден' duration={2000} />, {
									placement: 'top-center'
								})
							} else {
								window.open(data.pdf_document, '_blank')
							}
						})
					}

					return (
						<DocsColumn onDocsClick={onDocs} style={{ minWidth: props.column.getSize() - 48 }} />
					)
				}
			}
		],
		[payment_notices, t]
	)

	return (
		<DataTable
			columns={columns}
			data={payment_notices?.results || []}
			skeletonAvatarColumns={[0]}
			skeletonAvatarProps={{ className: 'rounded-md' }}
			loading={isLoading}
			pagingData={{
				total: payment_notices?.count || 0,
				pageIndex: params.page,
				pageSize: params.size
			}}
			onPaginationChange={onPageChange}
			onSelectChange={onSizeChange}
			onSort={onSortingChange}
		/>
	)
}

export default RequestsTable
