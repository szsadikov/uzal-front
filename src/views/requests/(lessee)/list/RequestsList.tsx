import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import RequestsTable from './components/RequestsTable'
import RequestsTableTools from './components/RequestsTableTools'

export type FilterQueries = {
	model?: string
}

const RequestsList = () => {
	const { queries, setQueries } = useTableQueries<PaymentOverdueNotice>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: payment_notices, isLoading } = useQuery({
		queryKey: ['get payment notices', params],
		queryFn: () =>
			PaymentNoticeService.getAllPaymentNoticeList<PaginatedResponse<PaymentOverdueNotice[]>>(
				params
			),
		select: ({ data }) => data
	})

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

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Талабнома')}</h3>
				<RequestsTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
				/>
			</div>
			<RequestsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				payment_notices={payment_notices}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default RequestsList
