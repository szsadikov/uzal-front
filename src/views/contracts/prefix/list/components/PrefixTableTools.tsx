// import { HiDownload } from 'react-icons/hi'
// import dayjs from 'dayjs'
import { ContractMeta } from '@/@types/dataset.types'
import { FilterQueries } from '../PrefixList'
import PrefixTableSearch from './PrefixTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	contracts?: ContractMeta[]
	isLoading: boolean
}

const PrefixTableTools = ({ search, onSearch }: Props) => {
	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<PrefixTableSearch value={search} onChange={onSearch} />
		</div>
	)
}

export default PrefixTableTools
