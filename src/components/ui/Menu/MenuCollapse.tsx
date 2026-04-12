import type { MouseEvent, ReactNode } from 'react'
import { useContext, useEffect, useState } from 'react'
import { HiChevronDown } from 'react-icons/hi'
import classNames from 'classnames'
import { motion } from 'framer-motion'
import type { CommonProps } from '../@types/common'
import { useConfig } from '../ConfigProvider'
import { CollapseContextProvider } from './context/collapseContext'
import MenuContext from './context/menuContext'

export interface MenuCollapseProps extends CommonProps {
	eventKey?: string
	expanded?: boolean
	label?: string | ReactNode
	onToggle?: (expanded: boolean, e: MouseEvent<HTMLDivElement>) => void
}

const MenuCollapse = (props: MenuCollapseProps) => {
	const { children, className, eventKey, expanded = false, label = null, onToggle } = props

	const [isExpanded, setIsExpanded] = useState(expanded)

	const { variant, sideCollapsed, defaultExpandedKeys } = useContext(MenuContext)

	const { direction } = useConfig()

	useEffect(() => {
		if ((defaultExpandedKeys as string[]).includes(eventKey as string)) {
			setIsExpanded(true)
		}
		if (expanded !== isExpanded) {
			setIsExpanded(true)
		}
	}, [expanded, onToggle, eventKey, defaultExpandedKeys])

	const toggleCollapse = (e: MouseEvent<HTMLDivElement>) => {
		if (typeof onToggle === 'function') {
			onToggle(!isExpanded, e)
		}
		setIsExpanded(!isExpanded)
	}

	const menuCollapseItemClass = classNames(
		'menu-collapse-item',
		`menu-collapse-item-${variant}`,
		className
	)

	return (
		<div className='menu-collapse'>
			<div className={menuCollapseItemClass} role='presentation' onClick={toggleCollapse}>
				<span className='flex items-center'>{label}</span>
				<motion.span
					className='mt-1 text-lg'
					initial={{ transform: 'rotate(0deg)' }}
					animate={{
						transform: isExpanded ? 'rotate(-180deg)' : 'rotate(0deg)'
					}}
					transition={{ duration: 0.15 }}
				>
					{sideCollapsed ? null : <HiChevronDown />}
				</motion.span>
			</div>
			<CollapseContextProvider value={isExpanded}>
				<motion.ul
					className={direction === 'rtl' ? 'mr-5' : 'ml-5'}
					initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
					animate={{
						opacity: isExpanded ? 1 : 0,
						height: isExpanded ? 'auto' : 0
					}}
					transition={{ duration: 0.15 }}
				>
					{children}
				</motion.ul>
			</CollapseContextProvider>
		</div>
	)
}

MenuCollapse.displayName = 'MenuCollapse'

export default MenuCollapse
