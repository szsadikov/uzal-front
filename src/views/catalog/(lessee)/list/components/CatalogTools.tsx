import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import useAuth from '@/utils/hooks/useAuth'
import { FilterQueries } from '../CatalogList'
import CatalogFilter from './CatalogFilter'
import CatalogSearch from './CatalogSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
}

const CatalogTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit
}: Props) => {
	const { t } = useTranslation()
	const { authenticated } = useAuth()

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<CatalogSearch value={search} onChange={onSearch} />
			<CatalogFilter values={filters} onSubmit={onFilterSubmit} />

			<Link
				className='mb-4 block md:mb-0 lg:inline-block md:ltr:ml-2'
				to={authenticated ? '/lessee/catalog/calculator' : '/client/calculator'}
			>
				<Button block variant='solid' size='sm'>
					{t('Калькулятор')}
				</Button>
			</Link>
		</div>
	)
}

export default CatalogTools
