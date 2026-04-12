import type { ReactElement, ReactNode } from 'react'
import { cloneElement } from 'react'
import type { CommonProps } from '@/@types/common'
import Container from '@/components/shared/Container'
import Logo from '@/components/template/Logo'
import Card from '@/components/ui/Card'

interface SimpleProps extends CommonProps {
	content?: ReactNode
}

const Simple = ({ children, content, ...rest }: SimpleProps) => {
	return (
		<div className='h-full'>
			<Container className='flex h-full min-w-0 flex-auto flex-col items-center justify-center'>
				<Card className='min-w-[320px] md:min-w-[450px]' bodyClass='md:p-10'>
					<div className='text-center'>
						<Logo type='streamline' imgClass='mx-auto' />
					</div>
					<div className='text-center'>
						{content}
						{children
							? cloneElement(children as ReactElement, {
									// eslint-disable-next-line @typescript-eslint/ban-ts-comment
									// @ts-expect-error
									contentClassName: 'text-center',
									...rest
								})
							: null}
					</div>
				</Card>
			</Container>
		</div>
	)
}

export default Simple
