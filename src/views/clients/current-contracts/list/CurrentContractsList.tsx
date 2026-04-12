import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { CurrentContract } from '@/@types/contract.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { CustomerService } from '@/services/customer.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import CurrentContractsTable from './components/CurrentContractsTable'
import CurrentContractsTableTools from './components/CurrentContractsTableTools'

export type FilterQueries = {
	branch?: number
	overall_contract_amount_start?: number
	overall_contract_amount_end?: number
	contract_date_start?: Date | string | null
	contract_date_end?: Date | string | null
}

const CurrentContractsList = () => {
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<CurrentContract>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: contracts, isLoading } = useQuery({
		queryKey: ['get current contracts', params],
		queryFn: () =>
			CustomerService.getAllCurrentContracts<PaginatedResponse<CurrentContract[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Текущие договора')}</h3>
				<CurrentContractsTableTools
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
			<CurrentContractsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				contracts={contracts}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default CurrentContractsList
