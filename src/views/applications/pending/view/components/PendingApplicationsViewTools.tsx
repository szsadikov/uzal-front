import { HiDownload } from 'react-icons/hi'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'
import { useTranslation } from 'react-i18next'

type Props = {
	isLoading?: boolean
	application?: ContractApplication
}

const PendingApplicationsViewTools = ({ application, isLoading }: Props) => {
	const { t } = useTranslation()

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
		if (!application) return

		const clearedData = [{...application}].map((item) => ({
			'№': item.id,
			'Филиал': item.branch.name,
			'Организация': item.company_name,
			'ИНН': item.stir,
			'Техника': item.tech.model_name_ru,
			'Сумма': item.total_amount,
			'Статус': getStatus(item.status),
			'Исполнитель': item.sales ? `${item.sales.profile.first_name} ${item.sales.profile.last_name} ${item.sales.profile.middle_name}` : '',
			'Дата': formatDate(item.application_date, 'DD.MM.YYYY')
		}))

		await exportToExcel(
			clearedData,
			`${t('На проверке')} - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!application}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default PendingApplicationsViewTools
