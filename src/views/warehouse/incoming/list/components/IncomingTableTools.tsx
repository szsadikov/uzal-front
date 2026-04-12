import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate, unitName } from '@/utils/format'
import { FilterQueries } from '../IncomingList'
import IncomingAdd from './IncomingAdd'
import IncomingFilter from './IncomingFilter'
import IncomingTableSearch from './IncomingTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	warehouses?: PaginatedResponse<Tech[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const IncomingTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	warehouses,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const onExportToExel = async () => {
		if (!warehouses || !warehouses.results.length) return

		const clearedData = warehouses.results.map((item) => ({
			'№': item.id,
			'Техника': item.model_name_ru,
			'Ед. изм.': unitName(item.measure_unit),
			'Количество': item.count,
			'Цена': Number(item.price).toFixed(0),
			'Ндс': `${item.vat}%`,
			'Цена с Ндс': item.tech_price_with_vat,
			'Общ. цена с ндс': Number(item.price) + item.tech_price_with_vat
		}))

		await exportToExcel(
			clearedData,
			`${t('Склад')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<IncomingTableSearch value={search} onChange={onSearch} />
			<IncomingFilter values={filters} onSubmit={onFilterSubmit} />

			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/warehouse/incoming/history'
			>
				<Button block size='sm'>
					{t('История')}
				</Button>
			</Link>

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!warehouses || !warehouses.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}

			<IncomingAdd refetch={refetch} />
		</div>
	)
}

export default IncomingTableTools
