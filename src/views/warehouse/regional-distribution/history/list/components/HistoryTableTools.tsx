import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { TechDistributeOperation, TechDistributeOperationActionEnum, } from '@/@types/tech.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../HistoryList'
import HistoryFilter from './HistoryFilter'
import HistoryTableSearch from './HistoryTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	distributes?: PaginatedResponse<TechDistributeOperation[]>
	isLoading?: boolean
}

const HistoryTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	distributes,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const getEvent = (event: TechDistributeOperationActionEnum) => {
		switch (event) {
			case TechDistributeOperationActionEnum.DISTRIBUTE: return t('Распределение')
			case TechDistributeOperationActionEnum.REDISTRIBUTE: return t('Перераспределение')
		}
	}

	const onExportToExel = async () => {
		if (!distributes || !distributes.results.length) return

		const clearedData = distributes.results.map((item) => ({
			'№': item.id,
			'Событие': getEvent(item.action),
			'Дата': formatDate(item.created_at),
			'Техника': item.tech.name_ru,
			'Количество': item.count,
			'Область': item.from_region.name_ru,
			'На область': item.to_region.name_ru,
			'Изменил': item.executed_by.name
		}))

		await exportToExcel(
			clearedData,
			`${t('История')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<HistoryTableSearch value={search} onChange={onSearch} />
			<HistoryFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/warehouse/regional-distribution'
			>
				<Button block size='sm'>
					{t('Распределение')}
				</Button>
			</Link>

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!distributes || !distributes.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default HistoryTableTools
