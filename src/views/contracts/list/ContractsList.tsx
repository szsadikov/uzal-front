import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TableQueries } from '@/@types/common'
import { ContractMeta, ContractMetric } from '@/@types/dataset.types'
import { UserRoleEnum } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import ContractsTable from './components/ContractsTable'
import ContractsTableTools from './components/ContractsTableTools'
import { useTranslation } from 'react-i18next'

export type FilterQueries = {
	branch?: string
	status?: boolean
	role?: UserRoleEnum
}

const initialQueries: TableQueries = { page: 1, size: 10 }

export default function ContractsList() {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>(initialQueries)
	const [filters, setFilters] = useState<FilterQueries>({})

	const params = useMemo(
		() => ({
			...queries,
			...filters
		}),
		[queries, filters]
	)

	const { data: meta, isLoading } = useQuery({
		queryKey: ['get meta contracts', params],
		queryFn: () =>
			DatasetService.getMetaContracts<{
				contract_meta: ContractMeta[]
				metrics: ContractMetric
			}>(params),
		select: ({ data }) => data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Договор')}</h3>

				<ContractsTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search }))}
					filters={filters}
					onFilterSubmit={(next) => setFilters(next)}
					contracts={meta?.contract_meta}
					isLoading={isLoading}
				/>
			</div>

			<ContractsTable
				params={params}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
				contracts={meta?.contract_meta}
				metrics={meta?.metrics}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}
