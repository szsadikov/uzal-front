import { forwardRef, type MouseEvent, type ReactNode } from 'react'
import { HiCheckCircle } from 'react-icons/hi'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import useThemeClass from '@/utils/hooks/useThemeClass'

interface SegmentItemOptionProps extends CommonProps {
	active: boolean
	customCheck?: string | ReactNode
	defaultGutter?: boolean
	disabled?: boolean
	hoverable?: boolean
	onSegmentItemClick?: (event: MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const SegmentItemOption = forwardRef<HTMLDivElement, SegmentItemOptionProps>((props, ref) => {
	const {
		active,
		children,
		className,
		customCheck,
		defaultGutter = true,
		disabled,
		hoverable,
		onSegmentItemClick
	} = props

	const { textTheme, borderTheme, ringTheme } = useThemeClass()

	return (
		<div
			ref={ref}
			className={classNames(
				'flex',
				!customCheck && 'justify-between',
				'items-center',
				'border',
				'rounded-md',
				'border-gray-200 dark:border-gray-600',
				defaultGutter && 'px-4 py-5',
				'cursor-pointer',
				'select-none',
				'w-100',
				active && `ring-1 ${ringTheme} ${borderTheme}`,
				hoverable && `hover:ring-1 hover:${ringTheme} hover:${borderTheme}`,
				disabled && 'cursor-not-allowed opacity-50',
				className
			)}
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-expect-error
			onClick={onSegmentItemClick}
		>
			{children}
			{active && !customCheck && <HiCheckCircle className={classNames(textTheme, 'text-2xl')} />}
			{active && customCheck}
		</div>
	)
})

SegmentItemOption.displayName = 'SegmentItemOption'

export default SegmentItemOption
