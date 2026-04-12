import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import {
	NotificationsService,
	type Paginated,
	type WsNotification
} from '@/services/notifications.service'

function ymd(dateIso: string) {
	const d = new Date(dateIso)
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const dd = String(d.getDate()).padStart(2, '0')

	return `${d.getFullYear()}-${mm}-${dd}`
}

function hhmm(dateIso: string) {
	const d = new Date(dateIso)

	return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

type Row = {
	id: number
	text: string
	created_at: string
	read: boolean
}

type Group = {
	key: string
	header: string
	rows: Row[]
}

export default function Log() {
	const [rows, setRows] = useState<Row[]>([])
	const [loading, setLoading] = useState(false)
	const [page, setPage] = useState(1)
	const [size] = useState(10)
	const [total, setTotal] = useState(0)
	const { t } = useTranslation()

	const hasMore = rows.length < total

	// Hafta kunlari va oylarni tarjima qilish uchun funksiyalar
	const getWeekday = useCallback(
		(date: Date) => {
			const weekdays = [
				'ВОСКРЕСЕНЬЕ',
				'ПОНЕДЕЛЬНИК',
				'ВТОРНИК',
				'СРЕДА',
				'ЧЕТВЕРГ',
				'ПЯТНИЦА',
				'СУББОТА'
			]

			return t(`weekdays.${weekdays[date.getDay()]}`)
		},
		[t]
	)

	const getMonth = useCallback(
		(date: Date) => {
			const months = [
				'ЯНВАРЯ',
				'ФЕВРАЛЯ',
				'МАРТА',
				'АПРЕЛЯ',
				'МАЯ',
				'ИЮНЯ',
				'ИЮЛЯ',
				'АВГУСТА',
				'СЕНТЯБРЯ',
				'ОКТЯБРЯ',
				'НОЯБРЯ',
				'ДЕКАБРЯ'
			]

			return t(`months.${months[date.getMonth()]}`)
		},
		[t]
	)

	const mapToRow = (n: WsNotification): Row => ({
		id: n.id,
		text: n.text,
		created_at: n.created_at,
		read: Boolean(n.read_at)
	})

	const fetchPage = useCallback(
		async (p: number) => {
			setLoading(true)
			try {
				const res = await NotificationsService.list<Paginated<WsNotification>>({ page: p, size })
				const nextRows = res.data.results.map(mapToRow)
				setTotal(res.data.count)
				setRows((prev) => (p === 1 ? nextRows : [...prev, ...nextRows]))
				return res.data
			} finally {
				setLoading(false)
			}
		},
		[size]
	)

	useEffect(() => {
		void fetchPage(1)
	}, [fetchPage])

	const loadMore = async () => {
		if (!hasMore || loading) return
		const next = page + 1
		try {
			const data = await fetchPage(next)
			if (data) setPage(next)
		} catch (err) {
			console.error('Failed to load more notifications', err)
		}
	}

	const groups: Group[] = useMemo(() => {
		const map = new Map<string, Group>()
		for (const r of rows) {
			const k = ymd(r.created_at)
			let g = map.get(k)
			if (!g) {
				const d = new Date(r.created_at)
				g = {
					key: k,
					header: `${getWeekday(d)}, ${d.getDate()} ${getMonth(d)}`,
					rows: []
				}
				map.set(k, g)
			}
			g.rows.push(r)
		}
		const list = Array.from(map.values())
		list.sort((a, b) => (a.key < b.key ? 1 : -1))
		list.forEach((g) => g.rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)))
		return list
	}, [rows, getWeekday, getMonth])

	return (
		<div className='space-y-8'>
			{groups.map((group) => (
				<div key={group.key} className='space-y-6'>
					<div className='text-[12px] font-semibold tracking-wide text-gray-500 uppercase'>
						{group.header}
					</div>

					<div>
						{group.rows.map((r, idx) => {
							const isLast = idx === group.rows.length - 1
							return (
								<div
									key={r.id}
									className='grid grid-cols-[20px_1fr_auto] items-start gap-4 py-3 pb-5'
								>
									<div className='relative'>
										<span className='absolute top-1 left-1/2 h-[14px] w-px -translate-x-1/2 rounded bg-gray-300 dark:bg-white/20' />
										{!isLast && (
											<span className='absolute top-[14px] bottom-0 left-1/2 w-px -translate-x-1/2 bg-gray-200 dark:bg-white/10' />
										)}
									</div>

									<div
										className={classNames(
											'min-w-0 text-[15px] leading-6 text-gray-800 dark:text-gray-200',
											!r.read && 'font-medium'
										)}
									>
										{r.text}
									</div>

									<div className='shrink-0 text-sm text-gray-500 tabular-nums dark:text-gray-400'>
										{hhmm(r.created_at)}
									</div>
								</div>
							)
						})}
					</div>
				</div>
			))}

			{/*<div className='flex items-center justify-center bg-white py-4 dark:bg-gray-800'>*/}
			<div className='flex items-center justify-center bg-gray-50 py-4 dark:bg-gray-800'>
				{loading && <Spinner size={34} className='text-gray-600 dark:text-gray-300' />}

				{!loading && hasMore && (
					<Button
						variant='twoTone'
						onClick={loadMore}
						className={classNames(
							'rounded-md px-4 py-2 font-medium',
							// light mode
							'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50',
							// dark mode
							'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'
						)}
					>
						{t('Показать ещё')}
					</Button>
				)}
			</div>

			<div
				className={classNames(
					'flex items-center justify-center py-4',
					// konteyner fonini darkda o'zgartirish—xohlasangiz olib tashlang
					'bg-white dark:bg-gray-800'
				)}
			>
				{loading && (
					// Spinner className orqali rangni o'zgartiramiz (agar komponent qo'llab-quvvatlasa)
					<Spinner size={34} className='text-gray-600 dark:text-gray-300' />
				)}

				{/*{!loading && hasMore && (*/}
				{/*	<Button*/}
				{/*		variant='twoTone'*/}
				{/*		onClick={loadMore}*/}
				{/*		// Button komponent className qo'llab-quvvatlasa:*/}
				{/*		className={classNames(*/}
				{/*			'rounded-md px-4 py-2 font-medium',*/}
				{/*			// light mode*/}
				{/*			'border border-gray-200 bg-white text-gray-800 hover:bg-gray-50',*/}
				{/*			// dark mode*/}
				{/*			'dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600'*/}
				{/*		)}*/}
				{/*	>*/}
				{/*		Показать ещё*/}
				{/*	</Button>*/}
				{/*)}*/}
			</div>
		</div>
	)
}
