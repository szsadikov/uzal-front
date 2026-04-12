import { useTranslation } from 'react-i18next'
import { AiOutlineSave } from 'react-icons/ai'
import { HiDownload } from 'react-icons/hi'
import { ContractApplication, ContractApplicationStatusEnum } from '@/@types/contract.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate } from '@/utils/format'

type Props = {
	isLoading?: boolean
	application?: ContractApplication
	onSaveClick?: () => void
	touched?: boolean
}

const PendingApplicationsViewTools = ({ application, isLoading, onSaveClick, touched }: Props) => {
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
			'Область': item.branch.name,
			'Организация': item.company_name,
			'ИНН': item.stir,
			'Техника': item.tech.model_name_ru,
			'Сумма': item.total_amount,
			'Номер телефона': item.phone_number,
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

			<Button
				size='sm'
				variant='solid'
				icon={<AiOutlineSave />}
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				onClick={onSaveClick}
				disabled={!touched}
			>
				{t('Сохранить')}
			</Button>
		</div>
	)
}

export default PendingApplicationsViewTools
