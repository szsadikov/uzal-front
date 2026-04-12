// src/pages/branches/Index.tsx
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { PaymentOverdueNotice } from '@/@types/payment-notice.types' // avval yaratilgan BranchDetail interface
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import Table from './components/Table'
import TableTools from './components/TableTools'

export type FilterQueries = {
	monitoring?: string
	condition?: string
	from_updated_at?: string | null
	to_updated_at?: string | null
	branch?: number | string | null // NEW
	tech?: number | string | null // NEW
}

const MonitoringList = () => {
	const { t } = useTranslation()

	const [queries, setQueries] = useState<TableQueries>({
		page: 1,
		size: 10
	})

	const [filters, setFilters] = useState<FilterQueries>({})

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: payment_notices, isLoading } = useQuery({
		queryKey: ['get payment_notices', params],
		queryFn: () => TechService.getAllMonitors<PaginatedResponse<PaymentOverdueNotice[]>>(params),
		select: (res) => res.data
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
				<h3 className='mb-4 lg:mb-0'>{t('Мониторинг')}</h3>
				<TableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					isLoading={isLoading}
					branchOptions={[]}
				/>
			</div>

			<Table
				params={params}
				onPageChange={(page: number) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size: number) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				payment_notice={payment_notices}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default MonitoringList
