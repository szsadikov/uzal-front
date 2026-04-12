// CurrentRequestsTableTools.tsx
import { useTranslation } from 'react-i18next'
import { HiDownload, HiPlusCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import type { PaginatedResponse } from '@/@types/common'
import type { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { Button } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { formatDate, formatPrice } from '@/utils/format'
import type { FilterQueries } from '../CurrentList'
import CurrentRequestsFilter from './CurrentRequestsFilter'
import CurrentRequestsTableSearch from './CurrentRequestsTableSearch'

type Props = {
	search?: string
	onSearch: (v?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	isLoading: boolean
	payment_notice?: PaginatedResponse<PaymentOverdueNotice[]>
}

// Jadvaldagi kabi process_status uchun RU label olish
const statusPalette: Record<string, { ru: string }> = {
	court_submitted: { ru: 'Подано в суд' },
	early_executed: { ru: 'Исполнено досрочно' },
	court_rejected: { ru: 'Суд отклонил' },
	court_decision: { ru: 'Принято судебное решение' },
	transferred_to_mib: { ru: 'Передано в МИБ' },
	executed: { ru: 'Исполнено' }
}
const smsStatusMap: Record<string, string> = {
	// confirmed: 'Подтверждено',
	confirmed: 'Доставлено',
	read: 'Прочитано',
	not_send: 'Не доставлено',
	send: 'Отправлено',
	pending: 'В ожидании',
	failed: 'Ошибка'
}

function pickProcessStatusLabel(ps: unknown): string {
	const isObj = typeof ps === 'object' && ps !== null
	const code = (isObj ? (ps as any).process_name : ps) as string | undefined
	const ru =
		(isObj && ((ps as any).process_name_ru as string | undefined)) ||
		(code ? statusPalette[code]?.ru : undefined)

	return ru || code || '—'
}

const CurrentRequestsTableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	isLoading,
	payment_notice
}: Props) => {

	const { t } = useTranslation()

	const rows = payment_notice?.results ?? []
	const disabled = isLoading || rows.length === 0

	const onExport = async () => {
		if (!rows.length) return
		const data = rows.map((r) => ({
			'№': r.id,
			НАИМЕНОВАНИЕ: r.company_name ?? '—',
			ИНН: r.stir ?? '—',
			'№ДОГОВОРА': r.contract_code ?? '—',
			'№талабнома': r.code ?? '—',
			'ДАТА ОПЛАТЫ': r.date_of_payment ? formatDate(r.date_of_payment, 'DD.MM.YYYY') : '—',
			СТАТУС: pickProcessStatusLabel((r as any).process_status ?? r.status),
			МЕСЯЦ: r.month_overdue ?? '—',
			'ДАТА ОТЛОЖЕННОСТИ': r.delayed_time ? formatDate(r.delayed_time, 'DD.MM.YYYY HH:mm') : '—',
			'ДНИ В МЕСЯЦЕ': r.days_in_the_month ?? '—',
			'ОСНОВНОЙ ДОЛГ': formatPrice(r.main_amount_of_payment),
			'ОБЩАЯ СУММА': formatPrice(r.total_amount),
			ПРОСРОЧКА: formatPrice(r.overdue_amount),
			'СМС СТАТУС': smsStatusMap[(r as any).sms_status ?? (r as any).status] ?? '—'
		}))
		await exportToExcel(
			data,
			`Текущие требования - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<CurrentRequestsTableSearch value={search} onChange={onSearch} />
			<CurrentRequestsFilter values={filters} onSubmit={onFilterSubmit} />
			<Button
				className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
				size='sm'
				icon={<HiDownload />}
				disabled={disabled}
				onClick={onExport}
			>
				{t('Экспорт')}
			</Button>
			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/request-add'
			>
				<Button variant='solid' size='sm' block icon={<HiPlusCircle />}>
					{t('Добавить')}
				</Button>
			</Link>
		</div>
	)
}

export default CurrentRequestsTableTools
