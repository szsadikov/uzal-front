import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { TechType } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import EquipmentTypeTable from './components/EquipmentTypeTable'

const EquipmentTypeList = () => {
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<TechType>({ page: 1, size: 10 })

	const params = useMemo(() => ({ ...queries }), [queries])

	const {
		data: types,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get types', params],
		queryFn: () => TechService.getAllTypes<PaginatedResponse<TechType[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Тип техники')}</h3>
			</div>

			<EquipmentTypeTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				types={types}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default EquipmentTypeList
