import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { TechStockOperation } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import HistoryTable from './components/HistoryTable'
import HistoryTableTools from './components/HistoryTableTools'

export type FilterQueries = {
	delivery?: string
	tech?: number
	count_start?: number
	count_end?: number
	price_start?: number
	price_end?: number
}

const HistoryList = () => {
	const { queries, setQueries } = useTableQueries<TechStockOperation>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: stocks, isLoading } = useQuery({
		queryKey: ['get stock operations', params],
		queryFn: () => TechService.getAllStockOperations<PaginatedResponse<TechStockOperation[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('История')}</h3>
				<HistoryTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					stocks={stocks}
					isLoading={isLoading}
				/>
			</div>
			<HistoryTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				stocks={stocks}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default HistoryList
