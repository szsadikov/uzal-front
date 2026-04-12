import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { Button, Skeleton } from '@/components/ui'
import { useAppSelector } from '@/store'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../ArchiveApplicationsList'
import ArchiveApplicationsFilter from './ArchiveApplicationsFilter'
import ArchiveApplicationsTableSearch from './ArchiveApplicationsTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	applications?: PaginatedResponse<ContractApplication[]>
	isLoading?: boolean
}

const ArchiveApplicationsTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	applications,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const { user } = useAppSelector((state) => state.auth.session)

	const getStatus = (status: ContractApplicationStatusEnum) => {
		switch (status) {
			case ContractApplicationStatusEnum.NEW:
				return t('Новое')
			case ContractApplicationStatusEnum.ASSIGNED:
				return t('Назначен')
			case ContractApplicationStatusEnum.DOCUMENT_GATHERING:
				return t('Сбор документов')
			case ContractApplicationStatusEnum.IN_COMMISSION:
				return t('Комиссия')
			case ContractApplicationStatusEnum.REJECTED:
				return t('Отказано')
			case ContractApplicationStatusEnum.CONTRACT_CREATED:
				return t('Составлен договор')
		}
	}

	const onExportToExel = async () => {
		if (!applications || !applications.results.length) return

		const clearedData = applications.results.map((item) => ({
			'№': item.id,
			'Филиал': item.branch.name,
			'Организация': item.company_name,
			'ИНН': item.stir,
			'Техника': item.tech.model_name_ru,
			'Сумма': item.total_amount,
			'Номер телефона': item.phone_number,
			'Статус': getStatus(item.status),
			'Исполнитель': item.sales
				? `${item.sales.profile.first_name} ${item.sales.profile.last_name} ${item.sales.profile.middle_name}`
				: '',
			'Дата': formatDate(item.application_date, 'DD.MM.YYYY')
		}))

		await exportToExcel(
			clearedData,
			`${t('Новые заявки')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<ArchiveApplicationsTableSearch value={search} onChange={onSearch} />
			<ArchiveApplicationsFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/applications/new'
			>
				<Button block size='sm'>
					{t('Заявки')}
				</Button>
			</Link>

			{user.role !== UserRoleTextEnum.LESSEE && isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				user.role !== UserRoleTextEnum.LESSEE && (
					<Button
						className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
						size='sm'
						icon={<HiDownload />}
						disabled={!applications || !applications.results.length}
						onClick={onExportToExel}
					>
						{t('Экспорт')}
					</Button>
				)
			)}
		</div>
	)
}

export default ArchiveApplicationsTools
