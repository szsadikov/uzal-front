import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation,useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import type { PaymentOverdueNotice } from '@/@types/payment-notice.types'
import { AdaptableCard, type OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import Table from './components/Table'
import TableTools from './components/TableTools'

/** API errorlarni matnga ajratish (sizdagi helperga mos) */
// eslint-disable-next-line react-refresh/only-export-components
export const parseApiErrors = (error: unknown): string[] => {
	if (!error || typeof error !== 'object') return ['Unknown error']
	if ('response' in error && (error as any).response?.data) {
		const data = (error as any).response.data
		if (typeof data === 'string') return [data]
		if (typeof data.detail === 'string') return [data.detail]
		const messages: string[] = []
		const walk = (obj: any) => {
			if (Array.isArray(obj)) obj.forEach(walk)
			else if (obj && typeof obj === 'object') Object.values(obj).forEach(walk)
			else if (typeof obj === 'string') messages.push(obj)
		}
		walk(data)

		return messages.length ? messages : ['Unknown error']
	}

	return ['Unknown error']
}

/** 🔧 Swagger paramlariga mos filterlar */
export type FilterQueries = {
	branch?: string | number
	search?: string
	status?: string
	sms_status?: string
	month_overdue?: number | ''                // 1..12
	date_of_payment_start?: string             // YYYY-MM-DD
	date_of_payment_end?: string               // YYYY-MM-DD
	total_amount_start?: number | ''           // number
	total_amount_end?: number | ''             // number
	delayed_time_start?: string                // YYYY-MM-DDTHH:mm
	delayed_time_end?: string                  // YYYY-MM-DDTHH:mm
}

/** 🔎 jadval uchun state */
const DeferredList = () => {
	const { t } = useTranslation()

	const [queries, setQueries] = useState<TableQueries & { search?: string; ordering?: string }>({
		page: 1,
		size: 10,
		search: '',
		ordering: '',
	})
	const [filters, setFilters] = useState<FilterQueries>({status: 'delayed'})
	const [selectedIds, setSelectedIds] = useState<number[]>([])

	/** backendga ketadigan yakuniy params */
	const params = useMemo(() => ({ ...queries, ...filters }), [queries, filters])

	const {
		data: payment_overdue_notices,
		isLoading,
		refetch,
	} = useQuery({
		queryKey: ['get payment_overdue_notice', params],
		queryFn: () =>
			PaymentNoticeService.getAllPaymentNoticeList<
				PaginatedResponse<PaymentOverdueNotice[]>
			>(params),
		select: ({ data }) => data,
	})

	/** Bulk send */
	const { mutateAsync: mutateSendNotices, isPending: isSending } = useMutation({
		mutationKey: ['bulk send payment notices'],
		mutationFn: (ids: number[]) => PaymentNoticeService.bulkSendPaymentNotices({ ids }),
		async onSuccess() {
			toast.push(
				<Notification type="success" title={t("Muvaffaqiyatli yuborildi!")} duration={2000} />,
				{ placement: 'top-center' },
			)
			await refetch()
		},
		onError(error) {
			parseApiErrors(error).forEach((msg) =>
				toast.push(<Notification type="danger" title={msg} duration={2000} />, {
					placement: 'top-center',
				}),
			)
		},
	})

	const handleSend = async () => {
		if (selectedIds.length === 0) {
			toast.push(
				<Notification type="warning" title={t("Hech qanday qator tanlanmagan!")} duration={2000} />,
				{ placement: 'top-center' },
			)

			return
		}
		await mutateSendNotices(selectedIds)
	}

	/** Bulk delay */
	const { mutateAsync: mutateDelayNotices, isPending: isDelaying } = useMutation({
		mutationKey: ['bulk delay payment notices'],
		mutationFn: (payload: { ids: number[]; delayed_time: string }) =>
			PaymentNoticeService.bulkDelayPaymentNotices(payload),
		async onSuccess() {
			toast.push(<Notification type="success" title={t("Успешно отложено!")} duration={2000} />, {
				placement: 'top-center',
			})
			await refetch()
		},
		onError(error) {
			parseApiErrors(error).forEach((msg) =>
				toast.push(<Notification type="danger" title={msg} duration={2000} />, {
					placement: 'top-center',
				}),
			)
		},
	})

	const handleDelay = async (delayed_time: string | Date) => {
		if (selectedIds.length === 0) {
			toast.push(
				<Notification type="warning" title={t("Hech qanday qator tanlanmagan!")} duration={2000} />,
				{ placement: 'top-center' },
			)

			return
		}
		const iso = dayjs(delayed_time).format('YYYY-MM-DDTHH:mm:ssZ')
		await mutateDelayNotices({ ids: selectedIds, delayed_time: iso })
	}

	return (
		<AdaptableCard className="h-full" bodyClass="h-full">
			<div className="mb-4 items-center justify-between lg:flex">
				<h3 className="mb-4 lg:mb-0">{t('Отложенные заявления')}</h3>

				<TableTools
					search={queries.search}
					onSearch={(search) => setQueries((prev) => ({ ...prev, search, page: 1 }))}
					filters={filters}
					onFilterSubmit={(next) => {
						setFilters(next)
						setQueries((prev) => ({ ...prev, page: 1 }))
					}}
					payment_overdue_notice={payment_overdue_notices}
					isLoading={isLoading}
					onSend={handleSend}
					isSending={isSending}
					onDelay={handleDelay}
					isDelaying={isDelaying}
				/>
			</div>

			<Table
				params={queries}
				onPageChange={(page) => setQueries((prev) => ({ ...prev, page }))}
				onSizeChange={(size) => setQueries((prev) => ({ ...prev, size }))}
				onSortingChange={(sort: OnSortParam) => {
					// sort: { key?: string; order: 'asc' | 'desc' | '' }
					const key = sort?.key
					const order = sort?.order ?? ''

					// key yo'q yoki order bo'sh bo'lsa — tartiblashni o'chiramiz
					if (!key || order === '') {
						setQueries(prev => ({ ...prev, ordering: '', page: 1 }))
						return
					}

					const ordering = order === 'desc' ? `-${key}` : `${key}`
					setQueries(prev => ({ ...prev, ordering, page: 1 }))
				}}
				payment_overdue_notice={payment_overdue_notices}
				isLoading={isLoading}
				onSelectRow={(id, checked) =>
					setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)))
				}
			/>
		</AdaptableCard>
	)
}

export default DeferredList
