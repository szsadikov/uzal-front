import { SMSService } from '@/@types/dataset.types'
import { FilterQueries } from '../SmsServiceList'
import SmsServiceAdd from './SmsServiceAdd'
import SmsServiceTableSearch from './SmsServiceTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	smsList?: SMSService[]
	isLoading: boolean
}

const SmsServiceTableTools = ({ search, onSearch }: Props) => {
	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<SmsServiceTableSearch value={search} onChange={onSearch} />

			<SmsServiceAdd />
		</div>
	)
}

export default SmsServiceTableTools
