import type { ReactNode } from 'react'
import { forwardRef } from 'react'
import { HiArrowDown, HiArrowUp } from 'react-icons/hi'
import classNames from 'classnames'
import Tag from '@/components/ui/Tag'
import growShrinkColor from '@/utils/growShrinkColor'

type GrowShrinkTagProps = {
	value?: number
	showIcon?: boolean
	prefix?: ReactNode | string
	suffix?: ReactNode | string
	className?: string
}

const GrowShrinkTag = forwardRef<HTMLDivElement, GrowShrinkTagProps>((props, ref) => {
	const { value = 0, className, prefix, suffix, showIcon = true } = props

	return (
		<Tag
			ref={ref}
			className={classNames(
				'gap-1 border-0 font-bold',
				growShrinkColor(value, 'text'),
				growShrinkColor(value, 'bg'),
				className
			)}
		>
			{value !== 0 && <span>{showIcon && (value > 0 ? <HiArrowUp /> : <HiArrowDown />)}</span>}
			<span>
				{prefix}
				{value}
				{suffix}
			</span>
		</Tag>
	)
})

GrowShrinkTag.displayName = 'GrowShrinkTag'

export default GrowShrinkTag
