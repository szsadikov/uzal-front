import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation,useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import type { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { AdaptableCard, OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import Table from './components/Table'
import TableTools from './components/TableTools'

// 🔹 Error parserni tashqarida e’lon qilamiz
// eslint-disable-next-line react-refresh/only-export-components
export const parseApiErrors = (error: unknown): string[] => {
	if (!error || typeof error !== 'object') return ['Unknown error']

	if ('response' in error && error.response && (error as any).response.data) {
		const data = (error as any).response.data

		if (typeof data === 'string') return [data]
		if (typeof data.detail === 'string') return [data.detail]

		const messages: string[] = []
		const extract = (obj: any) => {
			if (Array.isArray(obj)) {
				obj.forEach(extract)
			} else if (typeof obj === 'object' && obj !== null) {
				Object.values(obj).forEach(extract)
			} else if (typeof obj === 'string') {
				messages.push(obj)
			}
		}

		extract(data)

		return messages.length ? messages : ['Unknown error']
	}

	return ['Unknown error']
}

export type FilterQueries = {
	// doimiy:
	branch?: string | number
	status?: 'new' | string

	// current’dagi qolganlari:
	sms_status?: string
	month_overdue?: number | ''                // 1..12
	date_of_payment_start?: string             // YYYY-MM-DD
	date_of_payment_end?: string               // YYYY-MM-DD
	total_amount_start?: number | ''           // number
	total_amount_end?: number | ''             // number
}

const PaymentOverdueNotice = () => {

	const { t } = useTranslation()

	const [queries, setQueries] = useState<TableQueries>({
		page: 1,
		size: 10
	})

	const [filters, setFilters] = useState<FilterQueries>({ status: 'new' })
	const [selectedIds, setSelectedIds] = useState<number[]>([])

	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: payment_overdue_notices,
		isLoading,
		refetch
	} = useQuery({
		queryKey: ['get payment_overdue_notice', params],
		queryFn: () =>
			PaymentNoticeService.getAllPaymentNoticeList<PaginatedResponse<PaymentOverdueNotice[]>>(
				params
			),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateSendNotices, isPending: isSending } = useMutation({
		mutationKey: ['bulk send payment notices'],
		mutationFn: (ids: number[]) => PaymentNoticeService.bulkSendPaymentNotices({ ids }),
		async onSuccess() {
			toast.push(
				<Notification type='success' title={t('Muvaffaqiyatli yuborildi!')} duration={2000} />,
				{ placement: 'top-center' }
			)
			await refetch()
		},
		onError(error) {
			const messages = parseApiErrors(error)
			messages.forEach((msg) =>
				toast.push(<Notification type='danger' title={msg} duration={2000} />, {
					placement: 'top-center'
				})
			)
		}
	})

	const handleSend = async () => {
		if (selectedIds.length === 0) {
			toast.push(
				<Notification type='warning' title={t('Hech qanday qator tanlanmagan!')} duration={2000} />,
				{ placement: 'top-center' }
			)

			return
		}
		await mutateSendNotices(selectedIds)
	}

	const { mutateAsync: mutateDelayNotices, isPending: isDelaying } = useMutation({
		mutationKey: ['bulk delay payment notices'],
		mutationFn: (payload: { ids: number[]; delayed_time: string }) =>
			PaymentNoticeService.bulkDelayPaymentNotices(payload),
		async onSuccess() {
			toast.push(<Notification type='success' title={t('Успешно отложено!')} duration={2000} />, {
				placement: 'top-center'
			})
			await refetch()
		},
		onError(error) {
			const messages = parseApiErrors(error)
			messages.forEach((msg) =>
				toast.push(<Notification type='danger' title={msg} duration={2000} />, {
					placement: 'top-center'
				})
			)
		}
	})

	const handleDelay = async (delayed_time: string | Date) => {
		if (selectedIds.length === 0) {
			toast.push(
				<Notification type='warning' title={t('Hech qanday qator tanlanmagan!')} duration={2000} />,
				{ placement: 'top-center' }
			)

			return
		}

		const iso = dayjs(delayed_time).format('YYYY-MM-DDTHH:mm:ssZ')

		await mutateDelayNotices({
			ids: selectedIds,
			delayed_time: iso
		})
	}

	const onSortingChange = (sort: OnSortParam) => {
		setQueries((prev) => {
			let nextOrdering: string | undefined

			if (sort.key && sort.order) {
				if (sort.order === 'asc') nextOrdering = `${sort.key}`
				else if (sort.order === 'desc') nextOrdering = `-${sort.key}`
			}

			if (prev.ordering === nextOrdering) return prev

			return { ...prev, ordering: nextOrdering }
		})
	}

	return (
		<AdaptableCard className='h-full' bodyClass='h-full'>
			<div className='mb-4 items-center justify-between lg:flex'>
				<h3 className='mb-4 lg:mb-0'>{t('Новые заявления')}</h3>
				<TableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						// 👇 status ni majburan 'new' qilib qo'yamiz
						setFilters({ ...next, status: 'new' })
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					payment_overdue_notice={payment_overdue_notices}
					isLoading={isLoading}
					onSend={handleSend}
					isSending={isSending}
					onDelay={handleDelay} // 🔹 Yangi prop
					isDelaying={isDelaying} // 🔹 Loading uchun
				/>
			</div>
			<Table
				params={params}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={onSortingChange}
				payment_overdue_notice={payment_overdue_notices}
				isLoading={isLoading}
				onSelectRow={(id, checked) => {
					setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
				}}
			/>
		</AdaptableCard>
	)
}

export default PaymentOverdueNotice
