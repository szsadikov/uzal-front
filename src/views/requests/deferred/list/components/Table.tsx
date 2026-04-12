import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import {
	Branch,
	PaymentOverdueNotice,
	PaymentOverdueNoticeStatusEnum
} from '@/@types/payment-notice.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
// import { PaymentNoticeService } from '@/services/payment-notice.service'
import { formatDate, formatPrice } from '@/utils/format'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	payment_overdue_notice?: PaginatedResponse<PaymentOverdueNotice[]>
	isLoading: boolean
	onSelectRow?: (id: number, checked: boolean) => void
}

const Table = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	payment_overdue_notice,
	isLoading
}: Props) => {
	const { t, i18n } = useTranslation()

	const lang = (i18n.language as 'ru' | 'uz' | 'oz') || 'ru'

	const regionLocaleMap = {
		ru: 'name_ru',
		uz: 'name_uzl', // latin
		oz: 'name_uz' // cyrill
	} as const

	const getRegionName = (branch: Branch | null) => {
		if (!branch?.region) return '-'

		const key = regionLocaleMap[lang] || 'name_ru'

		return branch.region[key] || '-'
	}

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
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.company_name}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch',
				size: 250,
				cell: (props) => {
					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{getRegionName(props.row.original.branch)}
						</div>
					)
				}
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
				header: t('№ договора'),
				accessorKey: 'contract_code',
				size: 180,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract_code}
					</div>
				)
			},
			{
				header: t('Дата оплаты'),
				accessorKey: 'date_of_payment',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.date_of_payment)}
					</div>
				)
			},
			{
				header: t('МЕСЯЦ'),
				accessorKey: 'month_overdue',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.month_overdue}
					</div>
				)
			},
			{
				header: t('Просрочка'),
				accessorKey: 'overdue_amount',
				size: 180,
				sortable: true,
				cell: (props) => (
					<div className='text-red-500' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			},
			{
				header: t('ДАТА ОТЛОЖЕННОСТИ'),
				accessorKey: 'delayed_time',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.delayed_time)}
					</div>
				)
			},
			{
				header: t('Дни в месяце'),
				accessorKey: 'days_in_the_month',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
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
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.main_amount_of_payment)}
					</div>
				)
			},
			{
				header: t('Общая сумма'),
				accessorKey: 'total_amount',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			}
			// {
			// 	header: 'Номер телефона',
			// 	accessorKey: 'phone_number',
			// 	size: 250,
			// 	sortable: true,
			// 	cell: (props) => (
			// 		<div style={{ minWidth: props.column.getSize() - 48 }}>
			// 			{formatPhone(props.row.original.phone_number)}
			// 		</div>
			// 	)
			// }
		],
		[payment_overdue_notice, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={
					payment_overdue_notice?.results.filter(
						(item) => item.status === PaymentOverdueNoticeStatusEnum.DELAYED
					) || []
				}
				skeletonAvatarColumns={[0, 1]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				selectable={false} // Enable checkbox column
				pagingData={{
					total: payment_overdue_notice?.count || 0,
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

export default Table
