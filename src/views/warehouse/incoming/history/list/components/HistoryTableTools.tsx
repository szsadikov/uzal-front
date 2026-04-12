import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { TechStockOperation, TechStockOperationActionEnum } from '@/@types/tech.types'
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
	stocks?: PaginatedResponse<TechStockOperation[]>
	isLoading?: boolean
}

const HistoryTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	stocks,
	isLoading
}: Props) => {
	const { t } = useTranslation()
	const getEvent = (event: TechStockOperationActionEnum) => {
		switch (event) {
			case TechStockOperationActionEnum.INCOME: return t('Новое')
			case TechStockOperationActionEnum.COUNT_CHANGE: return t('Корректировка')
			case TechStockOperationActionEnum.PRICE_CHANGE: return t('Корректировка')
		}
	}

	const getAction = (action: TechStockOperationActionEnum) => {
		switch (action) {
			case TechStockOperationActionEnum.INCOME: return t('Приход')
			case TechStockOperationActionEnum.COUNT_CHANGE: return t('Количество')
			case TechStockOperationActionEnum.PRICE_CHANGE: return t('Цена')
		}
	}

	const onExportToExel = async () => {
		if (!stocks || !stocks.results.length) return

		const clearedData = stocks.results.map((item) => ({
			'№': item.id,
			'Событие': getEvent(item.action),
			'Действие': getAction(item.action),
			'Поставщик': item.delivery ? item.delivery : '-',
			'ИНН': item.stir ? item.stir : '-',
			'Дата': formatDate(item.created_at),
			'Техника': item.tech.name_ru,
			'Было': item.unit_before,
			'Стало': item.unit_after,
			'Договор': item.invoice ? item.invoice : '-',
			'Изменил': item.executed_by.name
		}))

		await exportToExcel(
			clearedData,
			`История - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<HistoryTableSearch value={search} onChange={onSearch} />
			<HistoryFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/warehouse/incoming'
			>
				<Button block size='sm'>
					{t('Склад')}
				</Button>
			</Link>

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!stocks || !stocks.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default HistoryTableTools
