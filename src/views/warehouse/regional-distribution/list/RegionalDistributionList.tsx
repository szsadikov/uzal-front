import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import type { Region } from '@/@types/dataset.types'
import { TechDistribution } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import RegionalDistributionTable from './components/RegionalDistributionTable'
import RegionalDistributionTableTools from './components/RegionalDistributionTableTools'

export type FilterQueries = {
	delivery?: number[]
	tech?: number
	count_start?: number
	count_end?: number
	price_start?: number
	price_end?: number
}

const RegionalDistributionList = () => {
	const { queries, setQueries } = useTableQueries<TechDistribution>({ page: 1, size: 10, ordering: '-count' })
	const [filters, setFilters] = useState({} as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: distributions,
		isLoading: isLoadingDistributions,
		refetch: refetchDistributions
	} = useQuery({
		queryKey: ['get tech distributions', params],
		queryFn: () => TechService.getAllDistributions<PaginatedResponse<TechDistribution[]>>(params),
		select: ({ data }) => data
	})

	const {
		data: regions,
		isLoading: isLoadingRegions,
		refetch: refetchRegions
	} = useQuery({
		queryKey: ['get regions'],
		queryFn: () => DatasetService.getAllRegions<Region[]>(),
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
				<h3 className='mb-4 lg:mb-0'>{t('Распределение по областям')}</h3>
				<RegionalDistributionTableTools
					// search={queries.search}
					// onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					distributions={distributions}
					isLoading={isLoadingDistributions || isLoadingRegions}
					refetchDistributions={refetchDistributions}
					refetchRegions={refetchRegions}
				/>
			</div>
			<RegionalDistributionTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				distributions={distributions}
				regions={regions}
				isLoading={isLoadingDistributions || isLoadingRegions}
			/>
		</AdaptableCard>
	)
}

export default RegionalDistributionList
