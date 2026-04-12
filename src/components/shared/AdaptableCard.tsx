import classNames from 'classnames'
import type { CardProps } from '@/components/ui/Card'
import Card from '@/components/ui/Card'
import { LAYOUT_TYPE_MODERN } from '@/constants/theme.constant'
import { useAppSelector } from '@/store'

interface AdaptableCardProps extends CardProps {
	leftSideBorder?: boolean
	rightSideBorder?: boolean
	divider?: boolean
	shadow?: boolean
	isLastChild?: boolean
}

const AdaptableCard = (props: AdaptableCardProps) => {
	const {
		className,
		children,
		bodyClass,
		leftSideBorder,
		rightSideBorder,
		divider,
		shadow,
		isLastChild,
		...rest
	} = props

	const type = useAppSelector((state) => state.theme.layout.type)

	return (
		<Card
			className={classNames(
				className,
				type === LAYOUT_TYPE_MODERN && 'border-0',
				type === LAYOUT_TYPE_MODERN &&
					rightSideBorder &&
					'rounded-tr-none rounded-br-none md:border-gray-200 ltr:border-r-0 md:ltr:border-r rtl:rounded-tr-none rtl:rounded-br-none rtl:border-l-0 md:rtl:border-l md:dark:border-gray-600',
				type === LAYOUT_TYPE_MODERN &&
					leftSideBorder &&
					'rounded-tl-none rounded-bl-none md:border-gray-200 ltr:border-l-0 md:ltr:border-l rtl:rounded-tl-none rtl:rounded-bl-none rtl:border-r-0 md:rtl:border-r md:dark:border-gray-600',
				type === LAYOUT_TYPE_MODERN &&
					divider &&
					`${
						!isLastChild ? 'border-b pb-6' : ''
					} rounded-br-none rounded-bl-none py-4 md:border-gray-200 md:dark:border-gray-600`,
				type !== LAYOUT_TYPE_MODERN && shadow && 'rounded-none border-0 shadow-none'
			)}
			{...rest}
			bodyClass={classNames(
				'flex flex-col',
				type === LAYOUT_TYPE_MODERN ? 'card-gutterless' : '',
				bodyClass
			)}
		>
			{children}
		</Card>
	)
}

export default AdaptableCard
