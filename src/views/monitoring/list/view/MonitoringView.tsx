// src/pages/.../MonitoringView.tsx
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Keyboard, Navigation, Pagination, Thumbs } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Button, Drawer, DrawerProps, Skeleton } from '@/components/ui'
import { apiInstance } from '@/services/api.instance'
import { TechService } from '@/services/tech.service'
import useResponsive from '@/utils/hooks/useResponsive'
import { useTranslation } from 'react-i18next'

type Props = DrawerProps & {
	request: { id: number; images?: string[] | null; name?: string | null }
}

const RAW_BASE = (apiInstance.defaults?.baseURL || import.meta.env.VITE_API_URL || '').toString()
const BASE = (() => {
	if (!RAW_BASE) return window.location.origin
	try {
		return new URL(RAW_BASE, window.location.origin).origin
	} catch {
		return RAW_BASE
	}
})()
const toAbsUrl = (src: string) =>
	!src
		? ''
		: /^(?:https?:)?\/\//i.test(src)
			? src
			: `${BASE}${src.startsWith('/') ? src : `/${src}`}`

const MonitoringView = ({ request, onClose, ...rest }: Props) => {
	const { windowWidth, larger } = useResponsive()
	const id = request?.id

	const { t } = useTranslation()

	const { data, isLoading, isError } = useQuery({
		queryKey: ['tech-monitoring-detail', id],
		enabled: !!id,
		queryFn: () => TechService.getMonitoringDetail<any>(id),
		select: (res) => res.data
	})

	const images: string[] = useMemo<string[]>(
		() => (data?.images ?? request?.images ?? []).map((s: string) => toAbsUrl(s)),
		[data, request]
	)

	const title = `${t('Фото техники')} "${data?.client?.name ?? request?.name ?? t('Наименование')}"`
	const [thumbs, setThumbs] = useState<any>(null)
	useEffect(() => {
		if (thumbs?.destroyed) setThumbs(null)
	}, [images, thumbs])

	// Thumbnail'lar uchun optimal kenglik hisoblash
	const thumbsWrapperWidth = useMemo(() => {
		const thumbWidth = 112 // w-28 = 7rem = 112px
		const gap = 12 // gap-3 = 0.75rem = 12px
		const count = Math.min(6, images.length)

		return count > 0 ? count * thumbWidth + (count - 1) * gap : 0
	}, [images.length])

	return (
		<Drawer
			title={title}
			placement='right'
			width={larger.xl ? windowWidth - 820 : windowWidth}
			onClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button variant='solid' className='mr-2' onClick={onClose}>
						{t('Закрыть')}
					</Button>
				</div>
			}
			{...rest}
		>
			{isLoading ? (
				<div className='space-y-4'>
					<Skeleton height={520} />
					<div className='flex gap-3'>
						<Skeleton height={80} className='w-28' />
						<Skeleton height={80} className='w-28' />
						<Skeleton height={80} className='w-28' />
					</div>
				</div>
			) : isError ? (
				<div className='text-red-600'>{t('Ошибка при загрузке данных')}.</div>
			) : (
				<div className='pb-2'>
					{images.length ? (
						<>
							{/* BIG SLIDE — to'liq ko'rsatish: object-contain + max height */}
							<Swiper
								modules={[Navigation, Pagination, Thumbs, Keyboard]}
								navigation
								pagination={{ clickable: true }}
								keyboard={{ enabled: true }}
								thumbs={{ swiper: thumbs && !thumbs.destroyed ? thumbs : null }}
								className='rounded-xl shadow'
							>
								{images.map((src, i) => (
									<SwiperSlide key={`${src}-${i}`}>
										<div className='flex h-[60vh] w-full items-center justify-center bg-black/5 md:h-[68vh]'>
											<img
												src={src}
												alt={`photo-${i + 1}`}
												className='max-h-full max-w-full object-contain'
												loading='lazy'
												draggable={false}
											/>
										</div>
									</SwiperSlide>
								))}
							</Swiper>

							{/* THUMBS - rasmlar soniga qarab kenglik moslangan */}
							{images.length > 1 && (
								<div className='mx-auto mt-3' style={{ maxWidth: `${thumbsWrapperWidth}px` }}>
									<Swiper
										modules={[Thumbs]}
										onSwiper={setThumbs}
										watchSlidesProgress
										slidesPerView={Math.min(6, images.length)}
										spaceBetween={12}
									>
										{images.map((src, i) => (
											<SwiperSlide key={`thumb-${src}-${i}`}>
												<div className='h-24 w-28 cursor-pointer overflow-hidden rounded-lg bg-black/5 transition-opacity hover:opacity-80'>
													<img
														src={src}
														alt={`thumb-${i + 1}`}
														className='h-full w-full object-cover'
														loading='lazy'
														draggable={false}
													/>
												</div>
											</SwiperSlide>
										))}
									</Swiper>
								</div>
							)}
						</>
					) : (
						<div className='flex h-[50vh] items-center justify-center rounded-xl bg-gray-100 text-gray-500'>
							{t('Фотографии не найдены')}
						</div>
					)}
				</div>
			)}
		</Drawer>
	)
}

export default MonitoringView
