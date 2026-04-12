import type { PropsWithChildren } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

export type HorizontalMenuNavLinkProps = PropsWithChildren<{
	path: string
	isExternalLink?: boolean
	className?: string
}>

const HorizontalMenuNavLink = ({
	path,
	children,
	isExternalLink,
	className
}: HorizontalMenuNavLinkProps) => {
	return (
		<Link
			className={classNames('flex h-full w-full items-center', className)}
			to={path}
			target={isExternalLink ? '_blank' : ''}
		>
			<span>{children}</span>
		</Link>
	)
}

export default HorizontalMenuNavLink
