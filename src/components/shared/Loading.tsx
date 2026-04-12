import type { ElementType, ReactNode } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import Spinner from '@/components/ui/Spinner'

interface BaseLoadingProps extends CommonProps {
	asElement?: ElementType
	customLoader?: ReactNode
	loading: boolean
	spinnerClass?: string
}

interface LoadingProps extends BaseLoadingProps {
	type?: 'default' | 'cover'
}

const DefaultLoading = (props: BaseLoadingProps) => {
	const {
		loading,
		children,
		spinnerClass,
		className,
		asElement: Component = 'div',
		customLoader
	} = props

	return loading ? (
		<Component
			className={classNames(!customLoader && 'flex h-full items-center justify-center', className)}
		>
			{customLoader ? <>{customLoader}</> : <Spinner className={spinnerClass} size={40} />}
		</Component>
	) : (
		<>{children}</>
	)
}

const CoveredLoading = (props: BaseLoadingProps) => {
	const {
		loading,
		children,
		spinnerClass,
		className,
		asElement: Component = 'div',
		customLoader
	} = props

	return (
		<Component className={classNames(loading ? 'relative' : '', className)}>
			{children}
			{loading && (
				<div className='absolute inset-0 h-full w-full bg-white/50 dark:bg-gray-800/60' />
			)}
			{loading && (
				<div className='absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 transform'>
					{customLoader ? <>{customLoader}</> : <Spinner className={spinnerClass} size={40} />}
				</div>
			)}
		</Component>
	)
}

const Loading = ({ type, ...rest }: LoadingProps) => {
	switch (type) {
		case 'default':
			return <DefaultLoading {...rest} />
		case 'cover':
			return <CoveredLoading {...rest} />
		default:
			return <DefaultLoading {...rest} />
	}
}

Loading.defaultProps = {
	loading: false,
	type: 'default',
	asElement: 'div'
}

export default Loading
