import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { User, UserRoleEnum } from '@/@types/user.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { UserService } from '@/services/user.service'
import { useTableQueries } from '@/utils/hooks/useTableQueries'
import UserTable from './components/UserTable'
import UserTableTools from './components/UserTableTools'

export type FilterQueries = {
	region?: number
	role?: UserRoleEnum
	branch?: number
	is_active?: boolean
	last_login_start?: Date | string | null
	last_login_end?: Date | string | null
}

const UsersList = () => {
	const { queries, setQueries } = useTableQueries<User>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({ is_active: false } as FilterQueries)
	const { t } = useTranslation()

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: users,
		isLoading
	} = useQuery({
		queryKey: ['get users', params],
		queryFn: () => UserService.getAllUsers<PaginatedResponse<User[]>>(params),
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
				<h3 className='mb-4 lg:mb-0'>{t('Архив')}</h3>
				<UserTableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					users={users}
					isLoading={isLoading}
				/>
			</div>
			<UserTable
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				users={users}
				isLoading={isLoading}
			/>
		</AdaptableCard>
	)
}

export default UsersList
