import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { TechDistributeOperation } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import HistoryTable from './components/HistoryTable'
import HistoryTableTools from './components/HistoryTableTools'
import { useTranslation } from 'react-i18next'

export type FilterQueries = {
	delivery?: number[]
	tech?: number
	count_start?: number
	count_end?: number
	price_start?: number
	price_end?: number
}

const HistoryList = () => {
	const { queries, setQueries } = useTableQueries<TechDistributeOperation>({ page: 1, size: 10, ordering: '-count' })
	const [filters, setFilters] = useState({} as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: distributes, isLoading } = useQuery({
		queryKey: ['get distribute operations', params],
		queryFn: () =>
			TechService.getAllDistributeOperations<PaginatedResponse<TechDistributeOperation[]>>(params),
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
					distributes={distributes}
					isLoading={isLoading}
				/>
			</div>
			<HistoryTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				distributes={distributes}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default HistoryList
