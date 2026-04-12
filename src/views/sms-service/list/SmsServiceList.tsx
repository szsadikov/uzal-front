import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { SMSService } from '@/@types/dataset.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import SmsServiceTable from './components/SmsServiceTable'
import SmsServiceTableTools from './components/SmsServiceTableTools'

export type FilterQueries = {
	day_count?: number
}

const SmsServiceList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({
		page: 1,
		size: 10
	})

	const [filters, setFilters] = useState<FilterQueries>({})

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: smsList,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['sms service list', params],
		queryFn: () => DatasetService.getSMSList<PaginatedResponse<SMSService[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('SMS сервис')}</h3>

				<SmsServiceTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					isLoading={isLoading}
				/>
			</div>

			<SmsServiceTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				smsList={smsList?.results}
				total={smsList?.count}
				isLoading={isLoading}
				refetch={refetch}
			/>
		</AdaptableCard>
	)
}

export default SmsServiceList
