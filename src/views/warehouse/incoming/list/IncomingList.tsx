import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import IncomingTable from './components/IncomingTable'
import IncomingTableTools from './components/IncomingTableTools'

export type FilterQueries = {
	delivery?: number[]
	tech?: number
	count_start?: number
	count_end?: number
	price_start?: number
	price_end?: number
}

const IncomingList = () => {
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<Tech>({ page: 1, size: 10, ordering: '-count' })
	const [filters, setFilters] = useState({} as FilterQueries)

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: warehouses, isLoading, refetch } = useQuery({
		queryKey: ['get warehouses', params],
		queryFn: () => TechService.getAllWarehouses<PaginatedResponse<Tech[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Склад')}</h3>
				<IncomingTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					warehouses={warehouses}
					isLoading={isLoading}
					refetch={refetch}
				/>
			</div>
			<IncomingTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				warehouses={warehouses}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default IncomingList
