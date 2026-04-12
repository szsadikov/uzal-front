import type { MenuItemProps as BaseMenuItemProps } from '../MenuItem'
import BaseMenuItem from '../MenuItem'
import { CollapseContextConsumer } from './context/collapseContext'
import { GroupContextConsumer } from './context/groupContext'
import { MenuContextConsumer } from './context/menuContext'

export type MenuItemProps = BaseMenuItemProps

const MenuItem = (props: MenuItemProps) => {
	const { eventKey, ...rest } = props

	return (
		<MenuContextConsumer>
			{(context) => (
				<GroupContextConsumer>
					{() => (
						<CollapseContextConsumer>
							{() => (
								<BaseMenuItem
									menuItemHeight={context.menuItemHeight}
									variant={context.variant}
									isActive={(context.defaultActiveKeys as string[]).includes(eventKey as string)}
									eventKey={eventKey}
									onSelect={context.onSelect}
									{...rest}
								/>
							)}
						</CollapseContextConsumer>
					)}
				</GroupContextConsumer>
			)}
		</MenuContextConsumer>
	)
}

MenuItem.displayName = 'MenuItem'

export default MenuItem
