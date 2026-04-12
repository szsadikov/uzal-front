import type { ElementType, ReactNode } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'

export interface IconTextProps extends CommonProps {
	icon?: ReactNode | string
	asElement?: ElementType
}

const IconText = ({ className, asElement: Component = 'span', icon, children }: IconTextProps) => {
	return (
		<Component className={classNames('flex items-center gap-2', className)}>
			{icon}
			{children}
		</Component>
	)
}

export default IconText
