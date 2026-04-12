import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import {
	Branch,
	PaymentOverdueNotice,
	PaymentOverdueNoticeStatusEnum
} from '@/@types/payment-notice.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { formatDate, formatPrice } from '@/utils/format'
import NewRequestViewDrawer from './NewRequestViewDrawer'

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
								 isLoading,
								 onSelectRow
							 }: Props) => {
	const { t, i18n } = useTranslation()

	const lang = (i18n.language as 'ru' | 'uz' | 'oz') || 'ru'

	const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
	const [viewData, setViewData] = useState<PaymentOverdueNotice | null>(null)

	// ✅ Oldingi data IDs ni saqlash uchun ref
	const prevDataIdsRef = useRef<string>('')

	const data = useMemo(
		() =>
			payment_overdue_notice?.results.filter(
				(item) => item.status === PaymentOverdueNoticeStatusEnum.NEW
			) || [],
		[payment_overdue_notice]
	)

	// ✅ Data o'zgarganda faqat IDs o'zgarsa tekshiramiz
	useEffect(() => {
		const currentDataIds = data
			.map((d) => d.id)
			.sort()
			.join(',')

		// Agar IDs o'zgarmagan bo'lsa, hech narsa qilmaymiz
		if (prevDataIdsRef.current === currentDataIds) return

		prevDataIdsRef.current = currentDataIds

		// Faqat ko'rinmay qolgan IDlarni olib tashlaymiz
		if (selectedRows.size === 0) return

		const visibleIds = new Set<number>(data.map((d) => d.id))
		const hasInvisibleIds = Array.from(selectedRows).some((id) => !visibleIds.has(id))

		if (!hasInvisibleIds) return

		setSelectedRows((prev) => {
			const next = new Set<number>()
			prev.forEach((id) => {
				if (visibleIds.has(id)) next.add(id)
			})

			return next
		})
	}, [data]) // ⚠️ selectedRows ni dependency dan olib tashladik

	const handleCheckBoxChange = (checked: boolean, row: PaymentOverdueNotice) => {
		setSelectedRows((prev) => {
			const next = new Set(prev)
			if (checked) {
				next.add(row.id)
			} else {
				next.delete(row.id)
			}

			return next
		})
		onSelectRow?.(row.id, checked)
	}

	const handleIndeterminateCheckBoxChange = (
		checked: boolean,
		rows: { original: PaymentOverdueNotice }[]
	) => {
		const next = new Set<number>()
		if (checked) {
			rows.forEach((r) => next.add(r.original.id))
		}
		setSelectedRows(next)
		rows.forEach((r) => onSelectRow?.(r.original.id, checked))
	}

	const formatPhone = (phone: string) => {
		const cleaned = phone.replace(/\D/g, '')
		const match = cleaned.match(/^(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})$/)
		if (match) return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`

		return phone
	}

	const moneyMeta = { meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' } }

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
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
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
					<div
						className='font-semibold cursor-pointer text-blue-500 hover:text-blue-700 hover:underline'
						style={{ minWidth: props.column.getSize() - 48 }}
						onClick={() => setViewData(props.row.original)}
					>
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
				header: t('МЕСЯЦ'),
				accessorKey: 'month_overdue',
				size: 110,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.month_overdue}
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
				header: t('Дни в месяце'),
				accessorKey: 'days_in_the_month',
				size: 180,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.days_in_the_month}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Основной долг')}</span>,
				accessorKey: 'main_amount_of_payment',
				size: 200,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.main_amount_of_payment)}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Общая сумма')}</span>,
				accessorKey: 'total_amount',
				size: 200,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Просрочка')}</span>,
				accessorKey: 'overdue_amount',
				size: 180,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div
						className='text-right text-red-500'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			},
			{
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			}
		],
		[t] // ⚠️ payment_overdue_notice ni olib tashladik - kerak emas
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={data}
				skeletonAvatarColumns={[0, 1]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				selectable={true}
				onCheckBoxChange={handleCheckBoxChange}
				onIndeterminateCheckBoxChange={handleIndeterminateCheckBoxChange}
				pagingData={{
					total: payment_overdue_notice?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{viewData && (
				<NewRequestViewDrawer
					notice={viewData}
					onClose={() => setViewData(null)}
				/>
			)}
		</>
	)
}

export default Table
