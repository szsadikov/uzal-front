import 'swiper/css'
import 'swiper/css/thumbs'
import './swiper_images.css'

import { CSSProperties, useState } from 'react'
import classNames from 'classnames'
import { Thumbs } from 'swiper/modules'
import { Swiper, SwiperProps, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperType } from 'swiper/types'
import { FileType } from '@/@types/common'
import { API_SERVER_URL } from '@/constants/api.constant'
import useDarkMode from '@/utils/hooks/useDarkmode'

export type Props = SwiperProps & {
	files: FileType[]
}

const CatalogImages = ({ files, className }: Props) => {
	const [isDark] = useDarkMode()

	const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)

	return (
		<div className={classNames(className)}>
			<Swiper spaceBetween={10} thumbs={{ swiper: thumbsSwiper }} modules={[Thumbs]}>
				{files.length ? (
					files.map((img, index) => (
						<SwiperSlide
							key={`${img.id}_${index}`}
							className='max-h-[394px] min-h-[394px]'
							style={{ '--img-url': `url(${API_SERVER_URL + img.file})` } as CSSProperties}
						>
							<img
								src={API_SERVER_URL + img.file}
								alt={img.id.toString()}
								className='max-h-[364px] object-contain'
							/>
						</SwiperSlide>
					))
				) : (
					<SwiperSlide className='max-h-[394px] min-h-[394px]'>
						<img
							src={isDark ? '/img/others/upload-dark.png' : '/img/others/upload.png'}
							alt='no-photo'
							className='max-h-[364px] object-contain'
						/>
					</SwiperSlide>
				)}
			</Swiper>

			<Swiper
				onSwiper={setThumbsSwiper}
				spaceBetween={13}
				slidesPerView={4}
				watchSlidesProgress={true}
				modules={[Thumbs]}
			>
				{files.length ? (
					files.map((img, index) => (
						<SwiperSlide key={`${img.id}_${index}`} className='max-h-[71px] min-h-[71px]'>
							<img
								src={API_SERVER_URL + img.file}
								alt={img.id.toString()}
								className='max-h-[71px] object-contain'
							/>
						</SwiperSlide>
					))
				) : (
					<SwiperSlide className='max-h-[71px] min-h-[71px]'>
						<img
							src={isDark ? '/img/others/upload-dark.png' : '/img/others/upload.png'}
							alt='no-photo'
							className='max-h-[71px] object-contain'
						/>
					</SwiperSlide>
				)}
			</Swiper>
		</div>
	)
}

export default CatalogImages
