// src/pages/branches/Index.tsx
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Branch } from '@/@types/dataset.types' // avval yaratilgan BranchDetail interface
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import BranchTable from './components/BranchTable'
import BranchTableTools from './components/BranchTableTools'

export type FilterQueries = {
	region?: number | string
	city?: number | string
	status?: boolean
	search?: string
}

const BranchesList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({
		page: 1,
		size: 10
		// sort, search va boshqalarni ham qoʻshish mumkin
	})

	const [filters, setFilters] = useState<FilterQueries>({})

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: branches, isLoading } = useQuery({
		queryKey: ['get branches', params],
		queryFn: () => DatasetService.getAllBranches<PaginatedResponse<Branch[]>>(params),
		select: ({ data }) => data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='items-baseline justify-between lg:flex'>
				<h3 className='mb-0 flex align-baseline'>{t('Филиалы')}</h3>
				<BranchTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					branches={branches}
					isLoading={isLoading}
					// refetch={refetch}
				/>
			</div>

			<BranchTable
				params={params}
				onPageChange={(page: number) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size: number) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
				branches={branches}
				isLoading={isLoading}
				// refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default BranchesList
