import type { ReactElement, ReactNode } from 'react'
import { pub } from '@/utils/publicUrl'
import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import Logo from '@/components/template/Logo'
import { APP_NAME } from '@/constants/app.constant'

interface CoverProps extends CommonProps {
	content?: ReactNode
}

const Cover = ({ children, content, ...rest }: CoverProps) => {
	return (
		<div className='grid h-full lg:grid-cols-3'>
			<div
				className='col-span-2 hidden flex-col justify-between bg-white bg-cover bg-no-repeat px-16 py-6 lg:flex dark:bg-gray-800'
				style={{
					backgroundImage: `url(${pub('/img/others/auth-cover-bg.jpg')})`
				}}
			>
				<Logo mode='dark' />
				<div>
					<h3 className='mb-4 text-white'>Jump start your project with Elstar</h3>
					<p className='max-w-[700px] text-lg text-white opacity-80'>
						Elstar comes with a complete set of UI components crafted with Tailwind CSS, it
						fulfilled most of the use case to create modern and beautiful UI and application
					</p>
				</div>
				<span className='text-white'>
					Copyright &copy; {`${new Date().getFullYear()}`}{' '}
					<span className='font-semibold'>{`${APP_NAME}`}</span>{' '}
				</span>
			</div>
			<div className='flex flex-col items-center justify-center bg-white dark:bg-gray-800'>
				<div className='w-full max-w-[550px] px-4 md:px-8'>
					<div className='mb-8'>{content}</div>
					{children ? cloneElement(children as ReactElement, { ...rest }) : null}
				</div>
			</div>
		</div>
	)
}

export default Cover
