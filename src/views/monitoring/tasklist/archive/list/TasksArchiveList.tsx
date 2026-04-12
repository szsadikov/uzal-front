import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { PaginatedResponse } from '@/@types/common'
import type { Branch } from '@/@types/dataset.types'
import type { TechMonitorTaskDetail } from '@/@types/tech.types'
import type { BranchEmployee } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { UserService } from '@/services/user.service'
import Table from './components/Table'
import TableTools from './components/TableTools'

type Option = { label: string; value: number }

export type FilterQueries = {
	branch?: string | null
	status?: number | null
	deadline_start?: string | null // YYYY-MM-DD
	deadline_end?: string | null // YYYY-MM-DD
}

type QueryState = {
	page: number
	size: number
	search?: string
	ordering?: string
}

/** ===== Helpers ===== */
const labelOrId = (maybe: unknown, id: number) =>
	typeof maybe === 'string' && maybe.trim() ? maybe : `#${id}`

const branchLabel = (b: Branch): string => {
	const anyRec = b as unknown as Record<string, unknown>

	return (
		labelOrId(anyRec['name'], b.id) ||
		labelOrId(anyRec['name_ru'], b.id) ||
		labelOrId(anyRec['name_uz'], b.id)
	)
}

const TasksArchiveList = () => {
	const { t } = useTranslation()

	const [queries, setQueries] = useState<QueryState>({ page: 1, size: 10 })

	const [filters, setFilters] = useState<FilterQueries>({}) // NEW

	const params = useMemo(() => {
		const base = { ...queries, ...filters }

		return { ...base, is_archived: true } // faqat arxivlangan tasklar
	}, [queries, filters])
	/* ===== Branches ===== */
	const branchesQ = useQuery<Branch[]>({
		queryKey: ['get branches'],

		queryFn: async (): Promise<Branch[]> => {
			const res: AxiosResponse<any> = await DatasetService.getAllBranches<any>()
			const payload = res.data

			return Array.isArray(payload) ? payload : (payload?.results ?? [])
		}
	})

	const branchOptions: Option[] = useMemo(() => {
		const list = Array.isArray(branchesQ.data) ? branchesQ.data : []

		return list.map((b) => ({ label: branchLabel(b), value: b.id }))
	}, [branchesQ.data])

	/* ===== Dependent options (Edit uchun) ===== */
	const [employeeOptions, setEmployeeOptions] = useState<Option[]>([])

	// branch -> employees
	const loadEmployees = useCallback(async (branchId: number | null): Promise<Option[]> => {
		if (!branchId) {
			setEmployeeOptions([])

			return []
		}
		const res = await UserService.getAllBranchEmployees<PaginatedResponse<BranchEmployee[]>>({
			branch: branchId,
			page: 1,
			size: 500
		})
		const list = res.data?.results ?? []
		const opts = list.map((u) => ({
			label:
				[u.profile?.last_name, u.profile?.first_name, u.profile?.middle_name]
					.filter(Boolean)
					.join(' ') ||
				u.profile?.username ||
				`ID ${u.id}`,
			value: u.id
		}))
		setEmployeeOptions(opts)

		return opts
	}, [])

	/* ===== List ===== */
	const listQ = useQuery<PaginatedResponse<TechMonitorTaskDetail[]>>({
		queryKey: ['get tech-monitor-tasks', params],
		queryFn: async () => {
			const res =
				await TechService.getAllMonitorTasks<PaginatedResponse<TechMonitorTaskDetail[]>>(params)

			return res.data
		}
	})

	return (
		<>
			<AdaptableCard className='h-full' bodyClass='h-full'>
				<div className='mb-4 items-center justify-between lg:flex'>
					<h3 className='mb-4 lg:mb-0'>{t('Архив')}</h3>

					<TableTools
						search={queries.search}
						onSearch={(search) => setQueries((p) => ({ ...p, search, page: 1 }))}
						isLoading={listQ.isLoading}
						branchOptions={branchOptions}
						employeeOptions={employeeOptions}
						loadEmployees={loadEmployees}
						filters={filters}
						onFilterSubmit={(next) => {
							setFilters(next)
							setQueries((p) => ({ ...p, page: 1 }))
						}}
					/>
				</div>

				<Table
					params={params}
					onPageChange={(page: number) => setQueries((p) => ({ ...p, page }))}
					onSizeChange={(size: number) => setQueries((p) => ({ ...p, size, page: 1 }))}
					onSortingChange={(sort) =>
						setQueries((p) => ({
							...p,
							ordering: sort?.order === 'desc' ? `-${String(sort.key)}` : String(sort.key),
							page: 1
						}))
					}
					data={listQ.data}
					isLoading={listQ.isLoading}
					onDeleted={listQ.refetch}
				/>
			</AdaptableCard>
		</>
	)
}

export default TasksArchiveList
