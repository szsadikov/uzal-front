// src/pages/.../PaperTrackersList.tsx
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { BegunokListItem } from '@/@types/begunok.types'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import type { User } from '@/@types/user.types'
import { AdaptableCard } from '@/components/shared'
import { Modal } from '@/components/ui'
import { BegunokService } from '@/services/begunok.service'
import { ProfileService } from '@/services/profile.service'
import Table from './components/Table'
import TableTools from './components/TableTools'
import TableSearch from '@/views/paper-trackers/list/components/TableSearch'

export type FilterQueries = {
	branch?: string
	tech?: string
	overall_contract_amount_start?: number
	overall_contract_amount_end?: number
	contract_date_start?: Date | string
	contract_date_end?: Date | string
}

enum BegunokStatusEnum {
	NEW = 2 // siz aytgandek: modalda statusi 1 bo'lganlar ko'rinsin
}

const PaperTrackersList = () => {
	const navigate = useNavigate()

	const [queries, setQueries] = useState<TableQueries>({ page: 1, size: 10 })
	const [filters, setFilters] = useState({} as FilterQueries)

	// Asosiy ro'yxat (xohlasangiz statusga ham cheklang)
	const apiParams = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const { data: contractsRaw, isLoading } = useQuery({
		queryKey: ['get current contracts', apiParams],
		queryFn: () => BegunokService.getAllBegunok<PaginatedResponse<BegunokListItem[]>>(apiParams),
		select: ({ data }) => data
	})

	// Modal uchun faqat statusi 1 bo'lganlar
	const onlyNew = (contractsRaw?.results || []).filter(
		(r) => (r as any).status === BegunokStatusEnum.NEW
	)

	// Agar asosiy jadval ham faqat "new" bo'lsin desangiz, shu contracts’ni
	// ishlating (istak bo'lsa almashtirib qo'ying):
	const contracts = contractsRaw ? { ...contractsRaw, results: contractsRaw.results } : undefined

	// Modal holati
	const [isAddOpen, setIsAddOpen] = useState(false)
	const openAddModal = () => setIsAddOpen(true)
	const closeAddModal = () => setIsAddOpen(false)

	const goToAddPage = (id: number | string) => navigate(`/paper-trackers-add/${id}`)

	// Profil (role uchun)
	const { data: me } = useQuery({
		queryKey: ['me'],
		queryFn: () => ProfileService.getProfile<User>(),
		select: ({ data }) => data
	})

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>Бегунки</h3>
				<TableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					papertrackers={contracts}
					isLoading={isLoading}
					currentUserRole={me?.role}
					onAdd={openAddModal} // <-- MODAL ochiladi
				/>
			</div>

			{/* Asosiy jadval (hammasi yoki o'zingiz xohlagan filtr) */}
			<Table
				params={{ ...queries, ...filters }}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort) => setQueries((prev) => ({ ...prev, sort }))}
				papertrackers={contracts}
				isLoading={isLoading}
			/>

			{/* MODAL: faqat status=1 bo'lganlar, footer tugmalar yo'q */}
			<Modal isOpen={isAddOpen} onClose={closeAddModal} title='Добавить бегунок'>
				<div className='flex items-center justify-between pb-4'>
					<h3 className='text-lg font-semibold text-slate-900'>Бегунки</h3>

					{/* ixcham search (260px) */}
					<div className='w-[260px]'>
						<TableSearch
							value={queries.search}
							onChange={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
							// agar TableSearch proplarini qabul qilmasa, uni quyidagidek sozlang (quyida qarang)
						/>
					</div>
				</div>
				<div className='max-h-[65vh] overflow-auto'>
					<Table
						// Modal ichida ham shu jadvaldan foydalanamiz
						params={{ page: 1, size: Math.max(10, onlyNew.length) }}
						onPageChange={() => {}}
						onSizeChange={() => {}}
						onSortingChange={() => {}}
						papertrackers={{
							count: onlyNew.length,
							next: null,
							previous: null,
							results: onlyNew
						}}
						isLoading={false}
						// Muhim: qator-click yo‘q, faqat “+”
						showAddColumn
						onRowAddClick={(row) => {
							closeAddModal()
							goToAddPage(row.id)     // 🔸 shu yerda id bilan o'tdik
						}}
					/>
				</div>
				{/* pastda hech qanday tugmalar YO'Q */}
			</Modal>
		</AdaptableCard>
	)
}

export default PaperTrackersList
