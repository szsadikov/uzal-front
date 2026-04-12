import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import EquipmentTable from './components/EquipmentTable'
import EquipmentTableTools from './components/EquipmentTableTools'

export type FilterQueries = {
	country?: string
	manufacturer?: number
	type?: number
}

const EquipmentList = () => {
	const { t } = useTranslation()

	const [searchParams] = useSearchParams()
	const { queries, setQueries } = useTableQueries<Tech>({
		page: 1,
		size: 10,
		isAll: true,
		ordering: '-is_active,-id'
	})
	const [filters, setFilters] = useState<FilterQueries>({})
	const params = useMemo(() => {
		const ordering =
			queries.ordering && queries.ordering.trim() ? queries.ordering : '-is_active,-id'

		return { ...queries, ordering, ...filters }
	}, [queries, filters])

	const {
		data: techs,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get techs', params],
		queryFn: () => TechService.getAllTechs<PaginatedResponse<Tech[]>>(params),
		select: ({ data }) => data
	})

	useEffect(() => {
		const pageFromUrl = searchParams.get('page')
		if (pageFromUrl) {
			const pageNumber = Number(pageFromUrl)
			if (pageNumber !== queries.page) {
				setQueries((prev) => ({ ...prev, page: pageNumber }))
			}
		}
	}, [searchParams])

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
				<h3 className='mb-4 lg:mb-0'>{t('Каталог')}</h3>
				<EquipmentTableTools
					search={queries.search}
					onSearch={(search) =>
						setQueries((prev) => {

							if ((prev.search ?? '') === (search ?? '')) {

								return prev
							}

							return { ...prev, search, page: 1 }
						})
					}
					filters={filters}
					onFilterSubmit={(next) => {

						const same =
							Object.keys(next).length === Object.keys(filters).length &&
							Object.keys(next).every((k) => (next as any)[k] === (filters as any)[k])

						setFilters(next)
						if (!same) {
							setQueries((prev) => ({ ...prev, page: 1 }))
						}
					}}
				/>

			</div>
			<EquipmentTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				techs={techs}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default EquipmentList
