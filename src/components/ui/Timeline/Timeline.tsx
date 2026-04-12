import type { DetailedReactHTMLElement } from 'react'
import { Children, forwardRef } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '../@types/common'
import mapCloneElement from '../utils/mapCloneElement'

export type TimelineProps = CommonProps

const Timeline = forwardRef<HTMLUListElement, TimelineProps>((props, ref) => {
	const { children, className } = props

	const count = Children.count(children)

	const items = mapCloneElement(
		children,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(item: DetailedReactHTMLElement<any, HTMLElement>, index: number) => ({
			isLast: index === count - 1,
			...item.props
		})
	)

	return (
		<ul ref={ref} className={classNames('timeline', className)}>
			{items}
		</ul>
	)
})

Timeline.displayName = 'Timeline'

export default Timeline
