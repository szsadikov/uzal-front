import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { ContractService } from '@/services/contract.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import ArchiveApplicationsTable from './components/ArchiveApplicationsTable'
import ArchiveApplicationsTools from './components/ArchiveApplicationsTools'

export type FilterQueries = {
	status_group?: 'new' | 'in_comission'
	branch?: number | null
	tech?: number | null
	status?: ContractApplicationStatusEnum
	sales?: number | null
	total_amount_start?: number
	total_amount_end?: number
	application_date_start?: Date | string | null
	application_date_end?: Date | string | null
	is_archived?: boolean
}

const ArchiveApplicationsList = () => {
	const { queries, setQueries } = useTableQueries<ContractApplication>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries) // status: 'archive'
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters, is_archived: true }), [queries, filters])

	const {
		data: applications,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get archive applications', params],
		queryFn: () =>
			ContractService.getAllApplications<PaginatedResponse<ContractApplication[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Архив')}</h3>
				<ArchiveApplicationsTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					applications={applications}
					isLoading={isLoading}
				/>
			</div>
			<ArchiveApplicationsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				applications={applications}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default ArchiveApplicationsList
