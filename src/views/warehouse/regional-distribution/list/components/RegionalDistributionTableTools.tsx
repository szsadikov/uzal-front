import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { TechDistribution } from '@/@types/tech.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate, unitName } from '@/utils/format'
import { FilterQueries } from '../RegionalDistributionList'
import RegionalDistributionDistribute from './RegionalDistributionDistribute'
// import RegionalDistributionTableSearch from './RegionalDistributionTableSearch'
import RegionalDistributionFilter from './RegionalDistributionFilter'
import RegionalDistributionRedistribution from './RegionalDistributionRedistribution'

type Props = {
	// search?: string
	// onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	distributions?: PaginatedResponse<TechDistribution[]>
	isLoading?: boolean
	refetchDistributions?: () => Promise<unknown>
	refetchRegions?: () => Promise<unknown>
}

const RegionalDistributionTableTools = ({
	// search,
	// onSearch,
	filters,
	onFilterSubmit,
	distributions,
	isLoading,
	refetchDistributions,
	refetchRegions
}: Props) => {
	const { t } = useTranslation()

	const onExportToExel = async () => {
		if (!distributions || !distributions.results.length) return

		const clearedData = distributions.results.map((item) => ({
			'№': item.id,
			'Техника': item.model_name_ru,
			'Ед. изм.': unitName(item.measure_unit),
			'Количество': item.count,
			'Нераспредел': item.tech_undistributed_count,
			'Қорақалпоғистон Республикаси': item.region_1_count,
			'Хоразм вилояти': item.region_2_count,
			'Фарғона вилояти': item.region_3_count,
			'Тошкент вилояти': item.region_4_count,
			'Сурхондарё вилояти': item.region_5_count,
			'Сирдарё вилояти': item.region_6_count,
			'Самарқанд вилояти': item.region_7_count,
			'Наманган вилояти': item.region_8_count,
			'Навоий вилояти': item.region_9_count,
			'Қашқадарё вилояти': item.region_10_count,
			'Жиззах вилояти': item.region_11_count,
			'Бухоро вилояти': item.region_12_count,
			'Андижон вилояти': item.region_13_count,
			'Тошкент шахри': item.region_14_count
		}))

		await exportToExcel(
			clearedData,
			`${t('Распределение по областям')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			{/*<RegionalDistributionTableSearch value={search} onChange={onSearch} />*/}
			<RegionalDistributionFilter values={filters} onSubmit={onFilterSubmit} />

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!distributions || !distributions.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}

			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/warehouse/regional-distribution/history'
			>
				<Button block size='sm'>
					{t('История')}
				</Button>
			</Link>

			<RegionalDistributionRedistribution
				refetchDistributions={refetchDistributions}
				refetchRegions={refetchRegions}
			/>
			<RegionalDistributionDistribute
				refetchDistributions={refetchDistributions}
				refetchRegions={refetchRegions}
			/>
		</div>
	)
}

export default RegionalDistributionTableTools
