import { HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import classNames from 'classnames'
import type { CommonProps } from '../../@types/common'
import { Button } from '../../Button'

export interface HeaderProps extends CommonProps {
	hasNext: boolean
	hasPrevious: boolean
	onNext?: () => void
	onPrevious?: () => void
	onNextLevel?: () => void
	label?: string
	nextLevelDisabled?: boolean
	nextLabel?: string
	previousLabel?: string
	preventLevelFocus?: boolean
	renderCenter?: boolean
	preventFocus?: boolean
}

const Header = (props: HeaderProps) => {
	const {
		hasNext,
		hasPrevious,
		onNext,
		onPrevious,
		onNextLevel,
		label,
		nextLevelDisabled,
		nextLabel,
		previousLabel,
		preventLevelFocus = false,
		renderCenter = false,
		preventFocus,
		children,
		className,
		...rest
	} = props

	const headerLabel = (
		<button
			className='picker-header-label'
			disabled={nextLevelDisabled}
			tabIndex={preventLevelFocus ? -1 : 0}
			type='button'
			onClick={onNextLevel}
			onMouseDown={(event) => preventFocus && event.preventDefault()}
		>
			{label}
		</button>
	)

	const renderChildren = children ? children : headerLabel

	return (
		<div
			className={classNames('picker-header mb-2 flex items-center justify-between', className)}
			{...rest}
		>
			{!renderCenter && renderChildren}
			<div
				className={classNames(
					renderCenter && 'w-full justify-between',
					'flex items-center rtl:flex-row-reverse'
				)}
			>
				<Button
					type='button'
					variant='plain'
					className={classNames(!hasPrevious && renderCenter && 'cursor-default opacity-0')}
					size='sm'
					icon={<HiChevronLeft />}
					disabled={!hasPrevious}
					aria-label={previousLabel}
					onClick={onPrevious}
					onMouseDown={(event) => preventFocus && event.preventDefault()}
				/>
				{renderCenter && renderChildren}
				<Button
					type='button'
					variant='plain'
					className={classNames(!hasNext && renderCenter && 'cursor-default opacity-0')}
					size='sm'
					icon={<HiChevronRight />}
					disabled={!hasNext}
					aria-label={nextLabel}
					onClick={onNext}
					onMouseDown={(event) => preventFocus && event.preventDefault()}
				/>
			</div>
		</div>
	)
}

export default Header
