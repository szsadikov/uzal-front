import { forwardRef } from 'react'
import classNames from 'classnames'
import type { CommonProps, TypeAttributes } from '../@types/common'
import { useConfig } from '../ConfigProvider'
import { MenuContextProvider } from './context/menuContext'

export interface MenuProps extends CommonProps {
	defaultActiveKeys?: Array<string>
	defaultExpandedKeys?: Array<string>
	menuItemHeight?: number
	onSelect?: (eventKey: string, e: MouseEvent) => void
	sideCollapsed?: boolean
	variant?: TypeAttributes.MenuVariant
}

const Menu = forwardRef<HTMLElement, MenuProps>((props, ref) => {
	const {
		children,
		className,
		defaultActiveKeys = [],
		defaultExpandedKeys = [],
		menuItemHeight = 40,
		onSelect,
		sideCollapsed = false,
		variant = 'light',
		...rest
	} = props

	const menuDefaultClass = 'menu'

	const { themeColor, primaryColorLevel } = useConfig()

	const menuColor = () => {
		if (variant === 'themed') {
			return `bg-${themeColor}-${primaryColorLevel} ${menuDefaultClass}-${variant}`
		}

		return `${menuDefaultClass}-${variant}`
	}

	const menuClass = classNames(menuDefaultClass, menuColor(), className)

	return (
		<nav ref={ref} className={menuClass} {...rest}>
			<MenuContextProvider
				value={{
					onSelect,
					menuItemHeight,
					variant,
					sideCollapsed,
					defaultExpandedKeys,
					defaultActiveKeys
				}}
			>
				{children}
			</MenuContextProvider>
		</nav>
	)
})

Menu.displayName = 'Menu'

export default Menu
