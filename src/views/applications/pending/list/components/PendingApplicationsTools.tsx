import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { ContractApplication, ContractApplicationVotingStatusEnum } from '@/@types/contract.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'
import { FilterQueries } from '../PendingApplicationsList'
import PendingApplicationsFilter from './PendingApplicationsFilter'
import PendingApplicationsTableSearch from './PendingApplicationsTableSearch'
import { useTranslation } from 'react-i18next'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	applications?: PaginatedResponse<ContractApplication[]>
	isLoading?: boolean
}

const PendingApplicationsTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	applications,
	isLoading
}: Props) => {
	const { t } = useTranslation()

	const getStatus = (status: ContractApplicationVotingStatusEnum) => {
		switch (status) {
			case ContractApplicationVotingStatusEnum.NEW:
				return t('Новое')
			case ContractApplicationVotingStatusEnum.IN_PROGRESS:
				return t('В процессе')
			case ContractApplicationVotingStatusEnum.APPROVED:
				return t('Согласовано')
			case ContractApplicationVotingStatusEnum.REJECTED:
				return t('Отказано')
		}
	}

	const onExportToExel = async () => {
		if (!applications || !applications.results.length) return

		const clearedData = applications.results.map((item) => {
			const {
				approvedVotingStatusCount,
				rejectedVotingStatusCount
			} = item.votes.reduce(
				(acc, vote) => {
					if (vote.voting_status === ContractApplicationVotingStatusEnum.APPROVED) {
						acc.approvedVotingStatusCount++
					}

					if (vote.voting_status === ContractApplicationVotingStatusEnum.REJECTED) {
						acc.rejectedVotingStatusCount++
					}

					return acc
				},
				{
					approvedVotingStatusCount: 0,
					rejectedVotingStatusCount: 0,
				}
			) ?? {
				approvedVotingStatusCount: 0,
				rejectedVotingStatusCount: 0,
			}

			return {
				'№': item.id,
				'Область': item.branch.name,
				'Организация': item.company_name,
				'ИНН': item.stir,
				'Техника': item.tech.model_name_ru,
				'Сумма': item.total_amount,
				'Статус': getStatus(item.voting_status),
				'Голосование': `${approvedVotingStatusCount + rejectedVotingStatusCount} / ${item.votes.length}`,
				'Исполнитель': item.sales ? `${item.sales.profile.first_name} ${item.sales.profile.last_name} ${item.sales.profile.middle_name}` : '',
				'Дата': formatDate(item.application_date, 'DD.MM.YYYY')
			}
		})

		await exportToExcel(
			clearedData,
			`${t('На проверке')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<PendingApplicationsTableSearch value={search} onChange={onSearch} />
			<PendingApplicationsFilter values={filters} onSubmit={onFilterSubmit} />
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/applications/pending/archive'
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
					disabled={!applications || !applications.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default PendingApplicationsTools
