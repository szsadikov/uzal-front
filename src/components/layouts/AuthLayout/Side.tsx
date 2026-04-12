import { cloneElement, type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { pub } from '@/utils/publicUrl'
import type { CommonProps } from '@/@types/common'
import Logo from '@/components/template/Logo'
import LanguageSelector from '@/components/template/LanguageSelector'

interface SideProps extends CommonProps {
	content?: ReactNode
	themeMode?: 'light' | 'dark'
}

const Side = ({ children, content, themeMode, ...rest }: SideProps) => {
	const [isDark, setIsDark] = useState(false)

	useEffect(() => {
		if (themeMode) {
			setIsDark(themeMode === 'dark')
			return
		}

		// Oddiy va yetarli: Tailwind `dark` sinfini yoki OS prefers-color-scheme tekshiramiz
		const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)')
		const check = () => {
			const hasDarkClass = document.documentElement.classList.contains('dark')
			const prefers = media ? media.matches : false
			setIsDark(hasDarkClass || prefers)
		}

		check()
		const handler = () => check()
		if (media?.addEventListener) media.addEventListener('change', handler)
		else if (media?.addListener) media.addListener(handler)

		return () => {
			if (media?.removeEventListener) media.removeEventListener('change', handler)
			else if (media?.removeListener) media.removeListener(handler)
		}
	}, [themeMode])

	const logoMode = isDark ? 'light' : 'dark'

	return (
		<div className='grid h-full lg:grid-cols-3'>
			<div
				className='hidden flex-col justify-between bg-cover bg-no-repeat px-16 py-6 lg:flex'
				style={{ backgroundImage: `url(\${pub('/img/others/auth-side-bg.jpg')})` }}
			>
				<Logo mode='dark' />
			</div>

			<div className='relative col-span-2 flex flex-col items-center justify-center bg-white pb-10 md:pb-0 dark:bg-gray-800'>
				<div className='absolute top-12 left-4 z-50 lg:hidden'>
					<Logo mode={logoMode} imgClass='h-10' logoWidth='auto' />
				</div>
				<div className='absolute top-4 right-4 z-50'>
					<LanguageSelector />
				</div>

				<div className='w-full max-w-[550px] px-4 pt-12 md:px-8'>
					<div className='mb-8'>{content}</div>

					{children ? cloneElement(children as ReactElement, { ...rest }) : null}
				</div>
			</div>
		</div>
	)
}

export default Side
