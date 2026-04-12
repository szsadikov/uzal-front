// src/pages/prefix/PrefixList.tsx
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { TableQueries } from '@/@types/common'
import { ContractMeta, ContractMetric } from '@/@types/dataset.types'
import { UserRoleEnum } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import PrefixTable from './components/PrefixTable'
import PrefixTableTools from './components/PrefixTableTools'

export type FilterQueries = {
	branch?: string
	status?: boolean
	role?: UserRoleEnum
}

const PrefixList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: meta, isLoading } = useQuery({
		queryKey: ['get meta contracts', params],
		queryFn: () =>
			DatasetService.getMetaContracts<{ contract_meta: ContractMeta[]; metrics: ContractMetric }>(
				params
			),
		select: ({ data }) => data
	})

	// Fetched ro'yxatni local state'ga olib qo'yamiz (bitta satrni joyida yangilash uchun)
	const [rows, setRows] = useState<ContractMeta[]>([])
	useEffect(() => {
		setRows(meta?.contract_meta ?? [])
	}, [meta])

	const total = rows.length

	// Client-side pagination
	const pagedRows = useMemo(() => {
		const start = (queries.page - 1) * queries.size

		return rows.slice(start, start + queries.size)
	}, [rows, queries.page, queries.size])

	// Edit saqlangandan keyin GET bilan kelgan updated row shu yerda replace qilinadi
	const handleRowUpdated = (updated: ContractMeta) => {
		setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
	}

	// Page clamp (ixtiyoriy, lekin foydali)
	useEffect(() => {
		const lastPage = Math.max(1, Math.ceil((total || 1) / queries.size))
		if (queries.page > lastPage) {
			setQueries((p) => ({ ...p, page: lastPage }))
		}
	}, [total, queries.size, queries.page])

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Префикс')}</h3>
				<PrefixTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					contracts={rows}
					isLoading={isLoading}
				/>
			</div>

			<PrefixTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size, page: 1 }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort, page: 1 }))}
				contracts={pagedRows}
				total={total}
				isLoading={isLoading}
				onRowUpdated={handleRowUpdated}
			/>
		</AdaptableCard>
	)
}

export default PrefixList
