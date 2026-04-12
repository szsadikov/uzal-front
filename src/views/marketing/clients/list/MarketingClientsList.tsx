import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { AdaptableCard } from '@/components/shared'
import { MarketingClient, MarketingClientsService } from '../marketing-clients.service'
import MarketingClientsTable from './components/MarketingClientsTable'
import MarketingClientsTableTools from './components/MarketingClientsTableTools'

const MarketingClientsList = () => {
	const { t } = useTranslation()
	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })

	const params = useMemo(() => ({ ...queries }), [queries])

	const { data, isLoading } = useQuery({
		queryKey: ['marketing-clients', params],
		queryFn: () => MarketingClientsService.getAll(params),
		select: (res) => res.data as PaginatedResponse<MarketingClient[]>
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='items-baseline justify-between lg:flex mb-0'>
				<h3 className='mb-8 lg:mb-0'>{t('Клиент')}</h3>
			</div>

			<MarketingClientsTableTools
				search={queries.search as string | undefined}
				onSearch={(val) => setQueries((prev) => ({ ...prev, search: val, page: 1 }))}
			/>

			<MarketingClientsTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
				data={data}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default MarketingClientsList
