import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { ManufacturerType } from '@/@types/tech.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import ManufacturerAdd from './components/ManufacturerAdd'
import ManufacturerTable from './components/ManufacturerTable'

const ManufacturerList = () => {
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<ManufacturerType>({ page: 1, size: 10 })

	const params = useMemo(() => ({ ...queries }), [queries])

	const {
		data: manufacturers,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get manufacturers', params],
		queryFn: () => TechService.getAllManufacturers<PaginatedResponse<ManufacturerType[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Производитель')}</h3>

				<div className='flex flex-col lg:flex-row lg:items-center'>
					<ManufacturerAdd refetch={refetch} />
				</div>
			</div>

			<ManufacturerTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				manufacturers={manufacturers}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default ManufacturerList
