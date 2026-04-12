// src/pages/branches/Index.tsx
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Region } from '@/@types/dataset.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import RegionsTable from './components/RegionsTable'

export type FilterQueries = {
	region?: number | string
	city?: number | string
	status?: boolean
	search?: string
}

const RegionsList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({
		page: 1,
		size: 10

	})

	const params = useMemo(() => ({ ...queries }), [queries])

	const { data: regions, isLoading } = useQuery({
		queryKey: ['get regions', params],
		queryFn: () => DatasetService.getAllRegions<PaginatedResponse<Region[]>>(params),
		select: (res) => res.data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Область')}</h3>
			</div>

			<RegionsTable
				params={params}
				onPageChange={(page: number) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size: number) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
				regions={regions}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default RegionsList
