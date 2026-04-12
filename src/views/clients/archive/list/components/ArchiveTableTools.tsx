import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { ContractStatusEnum, NewContract } from '@/@types/contract.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate, formatMonths } from '@/utils/format'
import { FilterQueries } from '../ArchiveList'
import ArchiveFilter from './ArchiveFilter'
import ArchiveTableSearch from './ArchiveTableSearch'
import { useTranslation } from 'react-i18next'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	contracts?: PaginatedResponse<NewContract[]>
	isLoading?: boolean
}

const ArchiveTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	contracts,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const getStatus = (status: ContractStatusEnum) => {
		switch (status) {
			case ContractStatusEnum.PENDING_TRANSFER:
				return t('Ожидание оплаты')
			case ContractStatusEnum.DEPOSIT_PAID:
				return t('Ожидание выдачи техники')
			case ContractStatusEnum.TECH_GIVEN:
				return t('Выдача техники')
			case ContractStatusEnum.CANCELED:
				return t('Отменен')
			case ContractStatusEnum.CLIENT_CHANGED:
				return t('Переуступка')
			case ContractStatusEnum.TECH_RETURNED:
				return t('Возврат средств')
		}
	}

	const onExportToExel = async () => {
		if (!contracts || !contracts.results.length) return

		const clearedData = contracts.results.map(item => ({
			'№': item.contract.id,
			'Филиал': item.contract.branch_region,
			'Статус': getStatus(item.contract.status),
			'Наименование': item.contract.client_company_name,
			'ИНН': item.contract.stir,
			'Техника': item.contract.tech_model,
			'№Договора': item.contract.code,
			'Дата': formatDate(item.contract.contract_date),
			'Сумма с GPS': item.contract.price_with_gps,
			'%Аванса': item.contract.deposit_percentage,
			'Срок договора': formatMonths(item.contract.rent_period),
			'Аванс сумма': item.contract.deposit,
			'Аванс факт': '-',
			'Очередь': item.position,
			'Документы': item.contract.pdf_document
		}))

		await exportToExcel(clearedData, `Архив - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<ArchiveTableSearch value={search} onChange={onSearch} />
			<ArchiveFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/clients/new-contracts'
			>
				<Button block size='sm'>
					{t('Новые')}
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

export default ArchiveTableTools
