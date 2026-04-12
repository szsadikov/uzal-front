import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { ContractStatusEnum, NewContract } from '@/@types/contract.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { ContractService } from '@/services/contract.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import NewContractsTable from './components/NewContractsTable'
import NewContractsTableTools from './components/NewContractsTableTools'

export type FilterQueries = {
	branch?: number
	tech?: number
	status?: ContractStatusEnum
	from_price?: number
	to_price?: number
	from_queue_position?: number
	to_queue_position?: number
	from_created_at?: Date | string | null
	to_created_at?: Date | string | null
}

const NewContractsList = () => {
	const { queries, setQueries } = useTableQueries<NewContract>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: contracts,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get new contracts', params],
		queryFn: () => ContractService.getAllNewContracts<PaginatedResponse<NewContract[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Новые договора')}</h3>
				<NewContractsTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					contracts={contracts}
					isLoading={isLoading}
				/>
			</div>
			<NewContractsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				contracts={contracts}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default NewContractsList
