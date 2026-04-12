import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosResponse } from 'axios'
import type { PaginatedResponse } from '@/@types/common'
import type { Branch } from '@/@types/dataset.types'
import type { TechMonitorTaskCU, TechMonitorTaskDetail } from '@/@types/tech.types'
import type { BranchEmployee } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { CustomerService } from '@/services/customer.service'
import { DatasetService } from '@/services/dataset.service'
import { TechService } from '@/services/tech.service'
import { UserService } from '@/services/user.service'
import { formatDate } from '@/utils/format'
import TaskEdit from '../edit/TaskEdit'
import type { TaskFormValues } from '../form/Form'
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

type EditLabels = { region?: string | null; monitoring?: string | null; client?: string | null }

type ProfileName = {
	first_name?: string | null
	last_name?: string | null
	middle_name?: string | null
} | null




// const branchLabel = (b: Branch): string => {
// 	const anyRec = b as unknown as Record<string, unknown>
//
// 	return (
// 		labelOrId(anyRec['name'], b.id) ||
// 		labelOrId(anyRec['name_ru'], b.id) ||
// 		labelOrId(anyRec['name_uz'], b.id)
// 	)
// }

/** CurrentContracts minimal type  */
type CurrentContract = {
	id: number
	name?: string
	client_company_name?: string
	client_name?: string
	contract_id?: string
}

/** YYYY-MM-DD -> YYYY-MM-DDT00:00:00+05:00 */
const toTashkentISO = (yyyyMmDd: string): string => (yyyyMmDd ? `${yyyyMmDd}T00:00:00+05:00` : '')

const emptyForm: TaskFormValues = {
	branch: null,
	employee: null,
	client: null,
	phone_number: '',
	deadline: null // ← Date | null
}

const TasksList = () => {
	const { t, i18n  } = useTranslation()

	// /** ===== Helpers ===== */
	// const labelOrId = (maybe: unknown, id: number) =>
	// 	typeof maybe === 'string' && maybe.trim() ? maybe : `#${id}`

	const branchLabel = (b: Branch): string => {
		const anyRec = b as unknown as Record<string, unknown>
		const region = anyRec['region'] as Record<string, unknown> | null | undefined

		const lang = i18n.language // 'ru', 'uz', 'oz'

		// Til → field mapping
		const langFieldMap: Record<string, string> = {
			uz: 'name_uzl',  // lotin
			oz: 'name_uz',   // kirill
			ru: 'name_ru',
			en: 'name_latin',
		}

		const langField = langFieldMap[lang] ?? 'name_ru'

		const fromRegion =
			(region?.[langField] as string) ||
			(region?.['name_ru'] as string) ||  // fallback
			(region?.['name_uz'] as string) ||
			(region?.['name_lt'] as string)

		const fromBranch =
			(anyRec[langField] as string) ||
			(anyRec['name'] as string) ||
			(anyRec['name_ru'] as string)

		const result = fromRegion || fromBranch

		return result?.trim() ? result : `#${b.id}`
	}

	const [queries, setQueries] = useState<QueryState>({ page: 1, size: 10 })
	// const params = useMemo(() => ({ ...queries }), [queries])

	const [filters, setFilters] = useState<FilterQueries>({}) // NEW
	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters]) // CHANGED
	const qc = useQueryClient()

	const [isEditOpen, setIsEditOpen] = useState(false)
	const [editingId, setEditingId] = useState<number | null>(null)
	const [editValues, setEditValues] = useState<TaskFormValues | null>(null)
	const [editLabels, setEditLabels] = useState<EditLabels | null>(null)

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
	const [clientOptions, setClientOptions] = useState<Option[]>([])

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

	const loadClientsByBranch = useCallback(async (branchId: number | null): Promise<Option[]> => {
		if (!branchId) {
			setClientOptions([])

			return []
		}
		const res = await CustomerService.getAllCurrentContracts<PaginatedResponse<CurrentContract[]>>({
			page: 1,
			size: 500
		})
		const list = res.data?.results ?? []
		const opts = list.map((c) => ({
			label: c.client_company_name || `#${c.contract_id}`,
			value: c.id
		}))
		setClientOptions(opts)

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

	/* ===== Edit open ===== */
	const openEdit = async (row: TechMonitorTaskDetail) => {
		const res: AxiosResponse<any> = await TechService.getMonitorTaskDetail<any>(row.id)
		const d = res.data

		// --- monitoring endi obyekt: { id, profile }
		const prof = (d?.monitoring?.profile ?? null) as ProfileName
		// const prof = d?.monitoring?.profile
		const employeeId: number | null = d?.monitoring?.id ?? null
		const employeeLabel: string = [prof?.last_name, prof?.first_name, prof?.middle_name]
			.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
			.join(' ')

		const branchId: number | null = d?.branch ?? null

		const formVals: TaskFormValues = {
			branch: branchId,
			employee: employeeId,
			client: null,
			phone_number: d.phone_number
				? String(d.phone_number).replace(/\D/g, '').replace(/^998/, '')
				: '',
			deadline: d.deadline ? new Date(d.deadline) : null // ← ISO → Date
		}

		setEditValues(formVals)
		setEditLabels({
			region: d.region,
			monitoring: employeeLabel || null, // bu yerda faqat label emas, real id ishlating
			// client: d.client
			client:
				d.client == null
					? null
					: typeof d.client === 'string'
						? d.client
						: d.client.client_company_name ||
							d.client.client_name ||
							d.client.name ||
							d.client.tech_name ||
							null
		})

		setEditingId(d.id)
		setIsEditOpen(true)

		const opts = await loadEmployees(branchId)
		if (Array.isArray(opts)) setEmployeeOptions(opts)
	}

	/* ===== Clients for Form (employee tanlanganda) ===== */
	const loadClientsForForm = useCallback(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async (_employeeId: number | null): Promise<Option[]> => {
			const branchId = editValues?.branch ?? null

return await loadClientsByBranch(branchId)
		},
		[editValues?.branch, loadClientsByBranch]
	)

	/* ===== Mapping: Form -> API ===== */
	const toCreatePayload = (v: TaskFormValues): TechMonitorTaskCU => ({
		monitoring: v.employee!, // validate qilingan
		contract: v.client!, // validate qilingan
		phone_number: `998${String(v.phone_number).replace(/\D/g, '').slice(-9)}`,
		deadline: toTashkentISO(formatDate(v.deadline!, 'YYYY-MM-DD')) // Date -> ISO
	})

	/* ===== Create ===== */
	const createM = useMutation<void, unknown, TaskFormValues>({
		mutationFn: async (formValues) => {
			const payload = toCreatePayload(formValues)
			await TechService.createMonitorTask<TechMonitorTaskDetail, TechMonitorTaskCU>(payload)
		},
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ['get tech-monitor-tasks'] })
		}
	})

	/* ===== Update (faqat ruxsat etilgan maydonlar) ===== */
	const updateM = useMutation({
		mutationFn: async (vals: TaskFormValues) => {
			if (!editingId) throw new Error('No editingId')
			const payload: Partial<TechMonitorTaskCU> = {
				monitoring: vals.employee ?? undefined,
				phone_number: vals.phone_number
					? `998${String(vals.phone_number).replace(/\D/g, '').slice(-9)}`
					: undefined,
				deadline: vals.deadline ? toTashkentISO(formatDate(vals.deadline, 'YYYY-MM-DD')) : undefined
				// branch/contract editda o'zgarmaydi — yubormaymiz
			}
			await TechService.updateMonitorTask<TechMonitorTaskDetail, Partial<TechMonitorTaskCU>>(
				editingId,
				payload
			)
		},
		onSuccess: () => {
			setIsEditOpen(false)
			setEditingId(null)
			setEditValues(null)
			setEditLabels(null)
			qc.invalidateQueries({ queryKey: ['get tech-monitor-tasks'] })
		}
	})

	return (
		<>
			{/* Edit Drawer */}
			<TaskEdit
				isOpen={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				data={editValues || emptyForm}
				editLabels={editLabels || undefined}
				onUpdate={(v) => updateM.mutateAsync(v)}
				branchOptions={branchOptions}
				employeeOptions={employeeOptions}
				clientOptions={clientOptions}
				loadEmployees={loadEmployees}
				loadClients={loadClientsForForm}
			/>

			<AdaptableCard className='h-full' bodyClass='h-full'>
				<div className='mb-4 items-center justify-between lg:flex'>
					<h3 className='mb-4 lg:mb-0'>{t('Задачи')}</h3>

					<TableTools
						search={queries.search}
						onSearch={(search) => setQueries((p) => ({ ...p, search, page: 1 }))}
						isLoading={listQ.isLoading}
						onCreate={(values) => createM.mutateAsync(values)}
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
					onEditRow={openEdit}
					onDeleted={listQ.refetch}
				/>
			</AdaptableCard>
		</>
	)
}

export default TasksList
