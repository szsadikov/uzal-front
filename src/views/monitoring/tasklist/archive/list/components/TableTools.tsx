// components/TableTools.tsx
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import TableFilter from './TableFilter'
import TableSearch from './TableSearch'
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

	branchOptions: Option[]
	employeeOptions?: Option[]

	// ESKI: clientOptions va loadClients endi kerak emas — o'chirildi
	loadEmployees?: (branchId: number | null) => Promise<Option[]> | Option[]

	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
}


const TableTools = ({
	search,
	onSearch,
	branchOptions,
	filters,
	onFilterSubmit
}: Props) => {
	const { t } = useTranslation()

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
					to='/tasks'
				>
					<Button block size='sm'>
						{t('Задачи')}
					</Button>
				</Link>

			</div>


		</>
	)
}

export default TableTools
