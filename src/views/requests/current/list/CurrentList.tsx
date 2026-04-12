import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import type { OnSortParam } from '@/components/shared'
import { AdaptableCard } from '@/components/shared'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import CurrentRequestsTable from './components/CurrentRequestsTable'
import CurrentRequestsTableTools from './components/CurrentRequestsTableTools'

/** 🔧 APIga mos filter tiplari (Swagger bo‘yicha) */
export type FilterQueries = {
	branch?: string | number
	status?: string
	process_status?: string
	sms_status?: string
	month_overdue?: number | ''
	date_of_payment_start?: string
	date_of_payment_end?: string
	total_amount_start?: number | ''
	total_amount_end?: number | ''
	delayed_time_start?: string
	delayed_time_end?: string
}

/** ✅ Search va ordering’ni ham shu yerda saqlaymiz */
type QueryState = TableQueries & {
	search?: string
	ordering?: string
	status?: 'processing' | 'done' | 'rejected'
}

const CurrentRequests = () => {
	const { t } = useTranslation()

	const [queries, setQueries] = useState<QueryState>({
		page: 1,
		size: 10,
		search: '',
		ordering: '',
		status: 'processing'
	})

	const [filters, setFilters] = useState<FilterQueries>({})

	/** 🔗 Backendga ketadigan yakuniy params */
	// const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])
	const params = useMemo(() => {
			return { ...filters, ...queries, status: 'processing' }
		}, [queries, filters])

	/** ✅ React Query v5: keepPreviousData o‘rniga placeholderData:(prev)=>prev */
	const { data: payment_notices, isLoading } = useQuery<PaginatedResponse<PaymentOverdueNotice[]>>({
		queryKey: ['get payment_notices', params],
		// queryFn bevosita data qaytarsin — select kerak emas
		queryFn: async () => {
			const res =
				await PaymentNoticeService.getAllPaymentNoticeList<
					PaginatedResponse<PaymentOverdueNotice[]>
				>(params)

			return res.data
		},
		placeholderData: (prev) => prev // v5 ekvivalenti
		// ixtiyoriy: UX yaxshilash uchun
		// staleTime: 30_000,
		// gcTime: 5 * 60_000,
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Текущие заявления')}</h3>

				{/* 🔎 Search + 🎛️ Filter + 📤 Export */}
				<CurrentRequestsTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					payment_notice={payment_notices}
					isLoading={isLoading}
				/>
			</div>

			{/* 📋 Jadval */}
			<CurrentRequestsTable
				params={params}
				onPageChange={(page: number) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size: number) => setQueries((prev) => ({ ...prev, size, page: 1 }))}
				// ↕️ DataTable dan kelgan sort → backend ordering
				onSortingChange={(sort: OnSortParam) => {
					// sort: { key?: string; order: 'asc' | 'desc' | '' }
					const key = sort?.key
					const order = sort?.order ?? ''

					// key yo'q yoki order bo'sh bo'lsa — tartiblashni o'chiramiz
					if (!key || order === '') {
						setQueries((prev) => ({ ...prev, ordering: '', page: 1 }))

						return
					}

					const ordering = order === 'desc' ? `-${key}` : `${key}`
					setQueries((prev) => ({ ...prev, ordering, page: 1 }))
				}}
				payment_notice={payment_notices}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default CurrentRequests
