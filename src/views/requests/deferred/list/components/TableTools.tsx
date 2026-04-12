import { HiDownload } from 'react-icons/hi'
import dayjs from 'dayjs'
import type { PaginatedResponse } from '@/@types/common'
import type { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import type { FilterQueries } from '../DeferredList'
import TableFilter from './TableFilter'
import TableSearch from './TableSearch'
import { useTranslation } from 'react-i18next'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	payment_overdue_notice?: PaginatedResponse<PaymentOverdueNotice[]>
	isLoading: boolean
	onSend: () => void
	isSending?: boolean
	onDelay: (delayed_time: string) => void
	isDelaying?: boolean
}

const TableTools = ({
											search,
											onSearch,
											filters,
											onFilterSubmit,
											isLoading,
											payment_overdue_notice,
										}: Props) => {
	const { t } = useTranslation()

	const handleExport = () => {
		if (!payment_overdue_notice?.results) return
		const formatted = payment_overdue_notice.results.map((item) => ({
			ID: item.id,
			Компания: item.company_name,
			ИНН: item.stir,
			Договор: item.contract_code,
			Телефон: item.phone_number,
			Дата_оплаты: dayjs(item.date_of_payment).format('YYYY-MM-DD HH:mm:ss'),
			Дней_в_месяце: item.days_in_the_month,
			Месяцев_просрочки: item.month_overdue,
			Сумма_основного_платежа: Number(item.main_amount_of_payment),
			Просроченная_сумма: Number(item.overdue_amount),
			Итоговая_сумма: Number(item.total_amount),
			Статус: item.status,
		}))
		exportToExcel(
			formatted,
			`PaymentOverdueNotice_${dayjs(new Date()).format('DD.MM.YYYY_HH-mm-ss')}`,
		)
	}

	return (
		<div className="flex flex-col lg:flex-row lg:items-center">
			<TableSearch value={search} onChange={onSearch} />
			<TableFilter values={filters} onSubmit={onFilterSubmit} />
			<div className="flex flex-col space-y-2 lg:ml-2 lg:flex-row lg:space-y-0 lg:space-x-2">
				{isLoading ? (
					<Skeleton className="md:ml-2" width={106} height={36} />
				) : (
					(payment_overdue_notice?.results?.length ?? 0) > 0 && (
						<Button className="mb-4 block md:mb-0 md:inline-block" size="sm" icon={<HiDownload />} onClick={handleExport}>
							{t('Экспорт')}
						</Button>
					)
				)}
			</div>
		</div>
	)
}

export default TableTools
