import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Branch } from '@/@types/dataset.types'
import { User, UserRoleEnum } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import { UserService } from '@/services/user.service'
import TableTools from './components/TableTools'
import ViewingDataTable from './viewing-data/ViewingDataTable'
import ViewingDataEmployeeTable from './viewing-data-employee/ViewingDataEmployeeTable'

export type FilterQueries = {
	branch?: string
	status?: boolean
	role?: UserRoleEnum
}

const ViewBranchTable = () => {

	const { id } = useParams<{ id: string }>()
	const branchId = Number(id)

	const { data: branch, isLoading: isLoadingBranch } = useQuery({
		queryKey: ['get branch', branchId],
		queryFn: () => DatasetService.getBranchById<Branch>(branchId),
		select: ({ data }) => data,
		enabled: !!branchId
	})

	const [queries] = useState<TableQueries>({ page: 1, size: 10 })
	const params = useMemo(
		() => ({ ...queries, type: 'branch', branch: branchId }),
		[queries, branchId]
	)

	const {
		data: users,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get users', params],
		queryFn: () => UserService.getAllUsers<PaginatedResponse<User[]>>(params),
		select: ({ data }) => data,
		enabled: !!branchId
	})

	if (isLoadingBranch) return <div>Yuklanmoqda...</div>
	if (!branch) return <div>Filial topilmadi</div>

	console.log(branch)

	// ViewBranchTable.tsx
	return (
		// 1) Sahifa wrapper: full-height zanjir
		<div className='flex h-full min-h-0 flex-col gap-6 py-4'>
			{/* Yuqoridagi karta (auto height), h-full kerak emas */}
			<AdaptableCard>
				<div className='mb-4 items-center justify-between lg:flex'>
					<h3 className='mb-4 lg:mb-0'>{branch.name}</h3>
					<TableTools users={users} isLoading={isLoading} refetch={refetch} branchId={branch.id} />
				</div>
				<div className='my-8'>
					<ViewingDataTable branch={branch} />
				</div>
			</AdaptableCard>

			{/* 2) Xodimlar jadvali: qolgan joyni to‘liq egallasin */}
			<AdaptableCard className='min-h-0 flex-1' bodyClass='h-full min-h-0 flex flex-col'>
				<ViewingDataEmployeeTable branchId={branch.id} />
			</AdaptableCard>
		</div>
	)
}

export default ViewBranchTable
