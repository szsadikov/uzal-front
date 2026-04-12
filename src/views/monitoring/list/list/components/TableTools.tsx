// src/pages/branches/components/TableTools.tsx
import { Option } from '@/components/ui'
import { FilterQueries } from '../MonitoringList'
import TableFilter from './TableFilter'
import TableSearch from './TableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	isLoading: boolean
	branchOptions?: Option[]
}

// ✅ filters va onFilterSubmit ni ham oling
const ActiveApplicationsTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	branchOptions
}: Props) => {
	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<TableSearch value={search} onChange={onSearch} />
			<TableFilter values={filters} onSubmit={onFilterSubmit} branchOptions={branchOptions ?? []} />
		</div>
	)
}
export default ActiveApplicationsTableTools
