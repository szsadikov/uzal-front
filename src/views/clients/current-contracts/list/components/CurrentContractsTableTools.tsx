import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import type { CurrentContract } from '@/@types/contract.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../CurrentContractsList'
import CurrentContractsFilter from './CurrentContractsFilter'
import CurrentContractsTableSearch from './CurrentContractsTableSearch'
import { useTranslation } from 'react-i18next'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	contracts?: PaginatedResponse<CurrentContract[]>
	isLoading?: boolean
}

const CurrentContractsTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	contracts,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const onExportToExel = async () => {
		if (!contracts || !contracts.results.length) return

		const clearedData = contracts.results.map(item => ({
			'№': item.id,
			'Филиал': item.branch?.name ?? item.branch_full ?? '-',
			'Наименование': item.client_company_name,
			'ИНН': item.stir,
			'№Договора': item.contract_id,
			'Дата': item.contract_date,
			'Сумма': item.overall_contract_amount,
			'Остаток': item.contract_amount_left,
			'Просрочка': item.overdue_amount,
			'Срок общий': item.overall_contract_months,
			'Срок текущий': item.current_contract_month,
			'Документы': item.document_url
		}))

		await exportToExcel(clearedData, `${t('Текущие договора')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<CurrentContractsTableSearch value={search} onChange={onSearch} />
			<CurrentContractsFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/clients/archive_current'
			>
				<Button block size='sm'>
					{t('Архив')}
				</Button>
			</Link>
			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!contracts || !contracts.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default CurrentContractsTableTools
