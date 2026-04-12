import { FilterQueries } from '../RequestsList'
import RequestsFilter from './RequestsFilter'
import RequestsTableSearch from './RequestsTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
}

const RequestsTableTools = ({ search, onSearch, filters, onFilterSubmit }: Props) => {
	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<RequestsTableSearch value={search} onChange={onSearch} />
			<RequestsFilter values={filters} onSubmit={onFilterSubmit} />
		</div>
	)
}

export default RequestsTableTools
