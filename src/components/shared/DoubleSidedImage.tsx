import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react'
import { THEME_ENUM } from '@/constants/theme.constant'
import { useAppSelector } from '@/store'

interface DoubleSidedImageProps
	extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
	darkModeSrc: string
}

const { MODE_DARK } = THEME_ENUM

const DoubleSidedImage = ({ src, darkModeSrc, alt = '', ...rest }: DoubleSidedImageProps) => {
	const mode = useAppSelector((state) => state.theme.mode)

	return <img src={mode === MODE_DARK ? darkModeSrc : src} alt={alt} {...rest} />
}

export default DoubleSidedImage
