import { Fragment, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { AdaptableCard } from '@/components/shared'
import { Skeleton } from '@/components/ui'
import { TechService } from '@/services/tech.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import CatalogCard from './components/CatalogCard'
import CatalogTools from './components/CatalogTools'

export type FilterQueries = {
	type?: number
	price_start?: number
	price_end?: number
}

const CardLoader = ({ count = 10 }) => {
	return Array.from({ length: count }).map((n, i) => (
		<Skeleton key={`${n}_${i}`} height={349} className='rounded-[8px]' />
	))
}

const CatalogList = () => {
	const { inView } = useInView()
	const { t } = useTranslation()

	const { queries, setQueries } = useTableQueries<Tech>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({ price_start: 1 } as FilterQueries)

	const {
		data: techs,
		isLoading,
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage
	} = useInfiniteQuery({
		queryKey: ['get all techs', queries, filters],
		queryFn: async ({ pageParam = 1 }) => {
			const params = { ...queries, page: pageParam, ...filters }
			const { data } = await TechService.getAllTechs<PaginatedResponse<Tech[]>>(params)

			return data
		},
		getNextPageParam: (lastPage, allPages) => {
			const loadedCount = allPages.reduce((sum, page) => sum + page.results.length, 0)
			if (loadedCount >= lastPage.count) return

			return lastPage.next_page_number
		},
		initialPageParam: 1
	})

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage()
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-6 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Каталог')}</h3>
				<CatalogTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
				/>
			</div>

			{isLoading && (
				<div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 2xl:gap-4'>
					<CardLoader count={15} />
				</div>
			)}

			{techs && techs.pages[0].results.length ? (
				<div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 2xl:gap-4'>
					{techs.pages.map((page, idx) => (
						<Fragment key={`${page.next_page_number}_${idx}`}>
							{page.results.map((tech, index) => (
								<CatalogCard key={`${tech.id}_${index}`} tech={tech} />
							))}
						</Fragment>
					))}
				</div>
			) : (
				<div className='p-4 text-center text-red-500'>{t('Техники не найдены')}</div>
			)}
		</AdaptableCard>
	)
}

export default CatalogList
