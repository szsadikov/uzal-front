import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import TabContent from './TabContent'
import TabList from './TabList'
import TabNav from './TabNav'
import _Tabs, { TabsProps } from './Tabs'

export type { TabContentProps } from './TabContent'
export type { TabListProps } from './TabList'
export type { TabNavProps } from './TabNav'
export type { TabsProps } from './Tabs'

type CompoundedComponent = ForwardRefExoticComponent<TabsProps & RefAttributes<HTMLHtmlElement>> & {
	TabList: typeof TabList
	TabNav: typeof TabNav
	TabContent: typeof TabContent
}

const Tabs = _Tabs as CompoundedComponent

Tabs.TabList = TabList
Tabs.TabNav = TabNav
Tabs.TabContent = TabContent

export { Tabs }

export default Tabs
