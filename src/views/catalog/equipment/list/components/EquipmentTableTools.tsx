import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { FilterQueries } from '../EquipmentList'
import EquipmentFilter from './EquipmentFilter'
import EquipmentTableSearch from './EquipmentTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
}

const EquipmentTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
}: Props) => {
	const { t } = useTranslation()

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<EquipmentTableSearch value={search} onChange={onSearch} />
			<EquipmentFilter values={filters} onSubmit={onFilterSubmit} />

			<Link className='mb-4 block md:mb-0 lg:inline-block md:ltr:ml-2' to='/catalog/equipment/new'>
				<Button block variant='solid' size='sm' icon={<HiPlusCircle />}>
					{t('Добавить')}
				</Button>
			</Link>
		</div>
	)
}

export default EquipmentTableTools
