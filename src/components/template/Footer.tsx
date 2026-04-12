import classNames from 'classnames'
import Container from '@/components/shared/Container'
import { APP_NAME } from '@/constants/app.constant'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
	pageContainerType: FooterPageContainerType
}

const FooterContent = () => {
	return (
		<div className='flex w-full flex-auto items-center justify-between'>
			<span>
				Copyright &copy; {`${new Date().getFullYear()}`}{' '}
				<span className='font-semibold'>{`${APP_NAME}`}</span> All rights reserved.
			</span>
			<div className=''>
				<a className='text-gray' href='/#' onClick={(e) => e.preventDefault()}>
					Term & Conditions
				</a>
				<span className='text-muted mx-2'> | </span>
				<a className='text-gray' href='/#' onClick={(e) => e.preventDefault()}>
					Privacy & Policy
				</a>
			</div>
		</div>
	)
}

export default function Footer({ pageContainerType = 'contained' }: FooterProps) {
	return (
		<footer
			className={classNames(`footer flex h-16 flex-auto items-center ${PAGE_CONTAINER_GUTTER_X}`)}
		>
			{pageContainerType === 'contained' ? (
				<Container>
					<FooterContent />
				</Container>
			) : (
				<FooterContent />
			)}
		</footer>
	)
}
