// components/TableTools.tsx
import { useCallback, useRef, useState } from 'react'
import { HiPlus } from 'react-icons/hi'
import type { PaginatedResponse } from '@/@types/common'
import { Button, Drawer } from '@/components/ui'
import { CustomerService } from '@/services/customer.service'
import TaskForm, { TaskFormValues } from '../../form/Form'
import TableFilter from './TableFilter'
import TableSearch from './TableSearch'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

type Option = { label: string; value: number }

type FilterQueries = {
	branch?: string | null
	status?: number | null
	deadline_start?: string | null // YYYY-MM-DD
	deadline_end?: string | null // YYYY-MM-DD
}

type Props = {
	// Qidiruv (ixtiyoriy)
	search?: string
	onSearch?: (v?: string) => void
	isLoading?: boolean

	// Create oqimi
	onCreate: (payload: TaskFormValues) => Promise<void> | void
	branchOptions: Option[]
	employeeOptions?: Option[]

	// ESKI: clientOptions va loadClients endi kerak emas — o'chirildi
	loadEmployees?: (branchId: number | null) => Promise<Option[]> | Option[]

	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
}

const initialValues: TaskFormValues = {
	branch: null,
	employee: null,
	client: null,
	phone_number: '',
	deadline: null
}

const PAGE_SIZE = 50

type CurrentContract = {
	id: number
	client_company_name?: string
	contract_id?: string
}

const TableTools = ({
	search,
	onSearch,
	onCreate,
	branchOptions,
	employeeOptions = [],
	loadEmployees,
	filters,
	onFilterSubmit
}: Props) => {
	const { t } = useTranslation()

	const [open, setOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const formRef = useRef<any>(null)

	// Add (create) rejimi uchun klientlar: paginated + search
	const [draftBranch, setDraftBranch] = useState<number | null>(null)
	const [clientOpts, setClientOpts] = useState<Option[]>([])
	const [clientPage, setClientPage] = useState(1)
	const [clientHasMore, setClientHasMore] = useState(false)
	const [clientLoading, setClientLoading] = useState(false)
	const [clientQuery, setClientQuery] = useState('')

	const resetClients = useCallback(() => {
		setClientOpts([])
		setClientPage(1)
		setClientHasMore(false)
	}, [])

	const fetchClients = useCallback(
		async (page = 1, query = '', append = false): Promise<Option[]> => {
			setClientLoading(true)
			try {
				const res = await CustomerService.getAllCurrentContracts<
					PaginatedResponse<CurrentContract[]>
				>({
					branch: draftBranch || undefined, // <-- qayta qo‘shing
					page,
					size: PAGE_SIZE,
					search: query?.trim() || undefined
				})
				const data = res.data
				const list = data?.results ?? []
				const newOpts: Option[] = list.map((c) => ({
					label: c.client_company_name || `#${c.contract_id}`,
					value: c.id
				}))
				console.log(newOpts)
				setClientOpts((prev) => (append ? [...prev, ...newOpts] : newOpts))
				setClientHasMore(!!data?.next)

				return newOpts // <<< MUHIM: Option[] qaytaryapmiz
			} finally {
				setClientLoading(false)
			}
		},
		[draftBranch]
	)

	// Debounce qidiruv
	const searchTimer = useRef<number | undefined>(undefined)
	const handleClientSearch = useCallback(
		(q: string) => {
			window.clearTimeout(searchTimer.current)
			setClientQuery(q)
			searchTimer.current = window.setTimeout(() => {
				setClientPage(1)
				fetchClients(1, q, false) // reset
			}, 400)
		},
		[fetchClients]
	)

	// Pastga scroll — keyingi sahifa
	const handleClientLoadMore = useCallback(() => {
		if (clientLoading || !clientHasMore) return
		const next = clientPage + 1
		setClientPage(next)
		fetchClients(next, clientQuery, true) // append
	}, [clientLoading, clientHasMore, clientPage, clientQuery, fetchClients])

	const handleSubmit = async (values: TaskFormValues) => {
		setSubmitting(true)
		try {
			await onCreate(values)
			setOpen(false)
			// reset
			setDraftBranch(null)
			resetClients()
			setClientQuery('')
		} finally {
			setSubmitting(false)
		}
	}

	const handleCloseDrawer = () => {
		setOpen(false)
		setDraftBranch(null)
		resetClients()
		setClientQuery('')
	}

	const handleSave = () => formRef.current?.submitForm()

	return (
		<>
			<div className='flex flex-col gap-2 lg:flex-row lg:items-center'>
				<TableSearch value={search} onChange={(v) => onSearch?.(v)} />
				<TableFilter
					values={filters}
					onSubmit={onFilterSubmit}
					branchOptions={branchOptions}
				/>

				<Link
					className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
					to='/tasks/archive'
				>
					<Button block size='sm'>
						{t('Архив')}
					</Button>
				</Link>

				<Button
					className='ml-2'
					variant='solid'
					size='sm'
					icon={<HiPlus />}
					onClick={() => setOpen(true)}
					disabled={submitting}
				>
					{t('Добавить')}
				</Button>
			</div>

			<Drawer
				title={t('Добавить задачу')}
				isOpen={open}
				onClose={handleCloseDrawer}
				footer={
					<div className='w-full text-right'>
						<Button className='mr-2' onClick={() => setOpen(false)} disabled={submitting}>
							{t('Отмена')}
						</Button>
						<Button variant='solid' onClick={handleSave} disabled={submitting}>
							{t('Сохранить')}
						</Button>
					</div>
				}
			>
				<div className='p-4'>
					<TaskForm
						ref={formRef}
						values={initialValues}
						onSubmitComplete={handleSubmit}
						isSubmitting={submitting}
						branchOptions={branchOptions}
						employeeOptions={employeeOptions}
						clientOptions={clientOpts}
						onLoadEmployees={loadEmployees}
						// Employee tanlanganda 1-sahifa
						onLoadClients={async (_employeeId) => {
							// param bor, ishlatmasak ham
							setClientPage(1)

							return fetchClients(1, clientQuery, false) // <<< MUHIM: return qiling
						}}
						// Branch tanlanganda reset
						onBranchChange={(branchId) => {
							setDraftBranch(branchId)
							resetClients()
							setClientQuery('')
						}}
						// Klient select: qidiruv + infinite scroll
						clientLoading={clientLoading}
						clientHasMore={clientHasMore}
						onClientSearch={handleClientSearch}
						onClientLoadMore={handleClientLoadMore}
					/>
				</div>
			</Drawer>
		</>
	)
}

export default TableTools
