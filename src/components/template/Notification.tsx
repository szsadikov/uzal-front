import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
	// HiOutlineBan,
	HiOutlineBell,
	// HiOutlineCalendar,
	// HiOutlineClipboardCheck,
	HiOutlineMailOpen
} from 'react-icons/hi'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
// import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Dropdown from '@/components/ui/Dropdown'
import UiNotification from '@/components/ui/Notification'
import ScrollBar from '@/components/ui/ScrollBar'
import Spinner from '@/components/ui/Spinner'
import toast from '@/components/ui/toast'
import Tooltip from '@/components/ui/Tooltip'
import { NotificationsService, type WsNotification } from '@/services/notifications.service'
import { useAppSelector } from '@/store'
// import acronym from '@/utils/acronym'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useResponsive from '@/utils/hooks/useResponsive'
import useThemeClass from '@/utils/hooks/useThemeClass'
// import useTwColorByName from '@/utils/hooks/useTwColorByName'
import isLastChild from '@/utils/isLastChild'

type NotificationList = {
	id: string
	target: string
	description: string
	date: string
	image: string
	type: number
	location: string
	locationLabel: string
	status: string
	readed: boolean
}

const notificationHeight = 'h-72'

const NotificationToggle = ({ className, dot }: { className?: string; dot: boolean }) => {
	return (
		<div className={classNames('text-2xl', className)}>
			{dot ? (
				<Badge badgeStyle={{ top: '3px', right: '6px' }}>
					<HiOutlineBell />
				</Badge>
			) : (
				<HiOutlineBell />
			)}
		</div>
	)
}

const Notification = withHeaderItem(({ className }: { className?: string }) => {
	const { t } = useTranslation()

	const [notificationList, setNotificationList] = useState<NotificationList[]>([])
	const [unreadNotification, setUnreadNotification] = useState(false)
	const [noResult, setNoResult] = useState(false)
	const [loading, setLoading] = useState(false)

	const { bgTheme } = useThemeClass()
	const { larger } = useResponsive()
	const direction = useAppSelector((state) => state.theme.direction)

	// API -> UI mapping
	const mapToItem = (n: WsNotification): NotificationList => ({
		id: String(n.id),
		target: '',
		description: n.text,
		date: new Date(n.created_at).toLocaleString(),
		image: '',
		type: 0,
		location: '',
		locationLabel: '',
		status: 'succeed',
		readed: Boolean(n.read_at)
	})

	// BADGE (qizil nuqta)
	const getNotificationCount = async () => {
		try {
			const res = await NotificationsService.list({ page: 1, size: 10 })
			const hasUnread = res.data.results.some((x) => !x.read_at) // <-- results
			setUnreadNotification(hasUnread)
		} catch {
			/* ignore */
		}
	}

	useEffect(() => {
		getNotificationCount()
	}, [])

	useEffect(() => {
		function onNew(ev: any) {
			const p = ev.detail as WsNotification

			// 🔴 red dot
			setUnreadNotification(true)

			// dropdown listni boyitamiz (tepaga qo‘shamiz)
			const item = {
				id: String(p.id),
				target: '',
				description: p.text,
				date: p.created_at,
				image: '',
				type: 0,
				location: '',
				locationLabel: '',
				status: 'succeed',
				readed: Boolean(p.read_at)
			}
			setNotificationList((prev) => [item, ...prev])

			// toast notification
			toast.push(
				<UiNotification title='Новое уведомление' closable>
					<div className='text-[14px] leading-5'>{p.text}</div>
					<div className='mt-2 text-xs text-gray-500'>
						{new Date(p.created_at).toLocaleString()}
					</div>
				</UiNotification>
			)
		}

		window.addEventListener('app:new-notification', onNew)

		return () => window.removeEventListener('app:new-notification', onNew)
	}, [])

	// Dropdown ochilganda ro'yxatni olish
	const onNotificationOpen = async () => {
		setLoading(true)
		setNoResult(false)
		try {
			const res = await NotificationsService.list({ page: 1, size: 20 })
			const items = res.data.results.map(mapToItem) // <-- results
			setNotificationList(items)
			setUnreadNotification(items.some((x) => !x.readed))
			setNoResult(items.length === 0)
		} catch {
			setNoResult(true)
		} finally {
			setLoading(false)
		}
	}

	// BARCHASINI READ
	const onMarkAllAsRead = useCallback(async () => {
		const ids = notificationList.filter((i) => !i.readed).map((i) => Number(i.id))
		if (!ids.length) return

		// optimistik
		setNotificationList((prev) => prev.map((i) => ({ ...i, readed: true })))
		setUnreadNotification(false)

		try {
			await NotificationsService.markRead(ids)
		} catch {
			// rollback
			setNotificationList((prev) =>
				prev.map((i) => (ids.includes(Number(i.id)) ? { ...i, readed: false } : i))
			)
			setUnreadNotification(true)
		}
	}, [notificationList])

	// BITTASINI READ
	const onMarkAsRead = useCallback(
		async (id: string) => {
			// optimistik
			setNotificationList((prev) => prev.map((i) => (i.id === id ? { ...i, readed: true } : i)))
			const stillUnread = notificationList.some((i) => i.id !== id && !i.readed)
			if (!stillUnread) setUnreadNotification(false)

			try {
				await NotificationsService.markRead([Number(id)])
			} catch {
				// rollback
				setNotificationList((prev) => prev.map((i) => (i.id === id ? { ...i, readed: false } : i)))
				setUnreadNotification(true)
			}
		},
		[notificationList]
	)

	return (
		<Dropdown
			renderTitle={<NotificationToggle dot={unreadNotification} className={className} />}
			menuClass='p-0 min-w-[280px] md:min-w-[340px]'
			placement={larger.md ? 'bottom-end' : 'bottom-center'}
			onOpen={onNotificationOpen}
		>
			<Dropdown.Item variant='header'>
				<div className='flex items-center justify-between border-b border-gray-200 px-4 py-2 dark:border-gray-600'>
					<h6>{t('Уведомления')}</h6>
					<Tooltip title='Mark all as read'>
						<Button
							variant='plain'
							shape='circle'
							size='sm'
							icon={<HiOutlineMailOpen className='text-xl' />}
							onClick={onMarkAllAsRead}
						/>
					</Tooltip>
				</div>
			</Dropdown.Item>

			<div className={classNames('overflow-y-auto', notificationHeight)}>
				<ScrollBar direction={direction}>
					{notificationList.length > 0 &&
						notificationList.map((item, index) => (
							<div
								key={item.id}
								className={`relative flex cursor-pointer px-4 py-4 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-black/20 ${
									!isLastChild(notificationList, index)
										? 'border-b border-gray-200 dark:border-gray-600'
										: ''
								}`}
								onClick={() => onMarkAsRead(item.id)}
							>
								{/*<div>{notificationTypeAvatar(item)}</div>*/}
								<div className='ltr:ml-3 rtl:mr-3'>
									<div>
										{item.target && (
											<span className='heading-text font-semibold'>{item.target} </span>
										)}
										<span>{item.description}</span>
									</div>
									<span className='text-xs'>{item.date}</span>
								</div>
								<Badge
									className='absolute top-4 mt-1.5 ltr:right-4 rtl:left-4'
									innerClass={`${item.readed ? 'bg-gray-300' : bgTheme} `}
								/>
							</div>
						))}

					{loading && (
						<div className={classNames('flex items-center justify-center', notificationHeight)}>
							<Spinner size={40} />
						</div>
					)}

					{noResult && (
						<div className={classNames('flex items-center justify-center', notificationHeight)}>
							<div className='text-center'>
								<img
									className='mx-auto mb-2 max-w-[150px]'
									src='/img/others/no-notification.png'
									alt='no-notification'
								/>
								<h6 className='font-semibold'>{t('No notifications!')}</h6>
								<p className='mt-1'>{t('Please Try again later')}</p>
							</div>
						</div>
					)}
				</ScrollBar>
			</div>

			<Dropdown.Item variant='header'>
				<div className='flex justify-center border-t border-gray-200 px-4 py-2 dark:border-gray-600'>
					<Link
						to='/notification'
						className='cursor-pointer p-2 px-3 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-200 dark:hover:text-white'
					>
						{t('Смотреть все уведомления')}
					</Link>
				</div>
			</Dropdown.Item>
		</Dropdown>
	)
})

export default Notification
