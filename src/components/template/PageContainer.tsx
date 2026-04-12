import type { ComponentPropsWithRef, ElementType } from 'react'
import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { Meta } from '@/@types/routes'
import Container from '@/components/shared/Container'
// import type { FooterPageContainerType } from '@/components/template/Footer'
// import Footer from '@/components/template/Footer'
import { PAGE_CONTAINER_GUTTER_X, PAGE_CONTAINER_GUTTER_Y } from '@/constants/theme.constant'

export interface PageContainerProps extends CommonProps, Meta {
	contained?: boolean
}

const CustomHeader = <T extends ElementType>({
	header,
	...props
}: {
	header: T
} & ComponentPropsWithRef<T>) => {
	const Header = header

	return <Header {...props} />
}

const PageContainer = (props: PageContainerProps) => {
	const { t } = useTranslation()
	const {
		pageContainerType = 'default',
		children,
		header,
		contained = false,
		extraHeader,
		// footer = true
	} = props

	return (
		<div className='flex h-full flex-auto flex-col justify-between'>
			<main className='h-full'>
				<div
					className={classNames(
						'page-container relative flex h-full flex-auto flex-col',
						pageContainerType !== 'gutterless' &&
							`${PAGE_CONTAINER_GUTTER_X} ${PAGE_CONTAINER_GUTTER_Y}`,
						pageContainerType === 'contained' && 'container mx-auto'
					)}
				>
					{(header || extraHeader) && (
						<div
							className={classNames(
								contained && 'container mx-auto',
								'mb-4 flex items-center justify-between'
							)}
						>
							<div>
								{header && typeof header === 'string' && <h3>{t(header)}</h3>}
								<Suspense fallback={<div></div>}>
									{header && typeof header !== 'string' && <CustomHeader header={header} />}
								</Suspense>
							</div>
							<Suspense fallback={<div></div>}>
								{extraHeader && true && (
									<CustomHeader header={extraHeader} />
								)}
							</Suspense>
						</div>
					)}
					{pageContainerType === 'contained' ? (
						<Container className='h-full'>
							<>{children}</>
						</Container>
					) : (
						<>{children}</>
					)}
				</div>
			</main>
			{/*{footer && <Footer pageContainerType={pageContainerType as FooterPageContainerType} />}*/}
		</div>
	)
}

export default PageContainer
