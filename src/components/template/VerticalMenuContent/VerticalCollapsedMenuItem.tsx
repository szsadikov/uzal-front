import { Trans } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { CommonProps } from '@/@types/common'
import type { NavigationTree } from '@/@types/navigation'
import type { Direction } from '@/@types/theme'
import AuthorityCheck from '@/components/shared/AuthorityCheck'
import Dropdown from '@/components/ui/Dropdown'
import Menu from '@/components/ui/Menu'
import VerticalMenuIcon from './VerticalMenuIcon'

interface DefaultItemProps extends CommonProps {
	nav: NavigationTree
	onLinkClick?: (link: { key: string; title: string; path: string }) => void
	userAuthority: string[]
}

interface CollapsedItemProps extends DefaultItemProps {
	direction: Direction
}

interface VerticalCollapsedMenuItemProps extends CollapsedItemProps {
	sideCollapsed?: boolean
}

const { MenuItem, MenuCollapse } = Menu

const DefaultItem = ({ nav, onLinkClick, userAuthority }: DefaultItemProps) => {
	return (
		<AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
			<MenuCollapse
				key={nav.key}
				label={
					<div className='flex items-center gap-2'>
						<VerticalMenuIcon icon={nav.icon} />
						<span>
							<Trans i18nKey={nav.translateKey} defaults={nav.title} />
						</span>
					</div>
				}
				eventKey={nav.key}
				expanded={false}
				className='mb-2'
			>
				{nav.subMenu.map((subNav) => (
					<AuthorityCheck
						key={subNav.key}
						userAuthority={userAuthority}
						authority={subNav.authority}
					>
						<MenuItem eventKey={subNav.key}>
							{subNav.path ? (
								<Link
									className='flex h-full w-full items-center'
									to={subNav.path}
									target={subNav.isExternalLink ? '_blank' : ''}
									onClick={() =>
										onLinkClick?.({
											key: subNav.key,
											title: subNav.title,
											path: subNav.path
										})
									}
								>
									<span>
										<Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
									</span>
								</Link>
							) : (
								<span>
									<Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
								</span>
							)}
						</MenuItem>
					</AuthorityCheck>
				))}
			</MenuCollapse>
		</AuthorityCheck>
	)
}

const CollapsedItem = ({ nav, onLinkClick, userAuthority, direction }: CollapsedItemProps) => {
	const menuItem = (
		<MenuItem key={nav.key} eventKey={nav.key} className='mb-2'>
			<VerticalMenuIcon icon={nav.icon} />
		</MenuItem>
	)

	return (
		<AuthorityCheck userAuthority={userAuthority} authority={nav.authority}>
			<Dropdown
				trigger='hover'
				renderTitle={menuItem}
				placement={direction === 'rtl' ? 'middle-end-top' : 'middle-start-top'}
			>
				{nav.subMenu.map((subNav) => (
					<AuthorityCheck
						key={subNav.key}
						userAuthority={userAuthority}
						authority={subNav.authority}
					>
						<Dropdown.Item eventKey={subNav.key}>
							{subNav.path ? (
								<Link
									className='flex h-full w-full items-center'
									to={subNav.path}
									target={subNav.isExternalLink ? '_blank' : ''}
									onClick={() =>
										onLinkClick?.({
											key: subNav.key,
											title: subNav.title,
											path: subNav.path
										})
									}
								>
									<span>
										<Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
									</span>
								</Link>
							) : (
								<span>
									<Trans i18nKey={subNav.translateKey} defaults={subNav.title} />
								</span>
							)}
						</Dropdown.Item>
					</AuthorityCheck>
				))}
			</Dropdown>
		</AuthorityCheck>
	)
}

const VerticalCollapsedMenuItem = ({ sideCollapsed, ...rest }: VerticalCollapsedMenuItemProps) => {
	return sideCollapsed ? <CollapsedItem {...rest} /> : <DefaultItem {...rest} />
}

export default VerticalCollapsedMenuItem
