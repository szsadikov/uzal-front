import type { JSX, LazyExoticComponent, ReactNode } from 'react'
import { LayoutType } from './theme'

export interface Meta {
	pageContainerType?: 'default' | 'gutterless' | 'contained'
	header?: string | ReactNode
	headerContainer?: boolean
	extraHeader?: LazyExoticComponent<() => JSX.Element>
	footer?: boolean
	layout?: LayoutType
}

export type RouteComponent =
	// eslint-disable-next-line no-undef
	| React.ComponentType<Record<string, unknown>>
	// eslint-disable-next-line no-undef
	| React.LazyExoticComponent<React.ComponentType<Record<string, unknown>>>

export type Route = {
	key: string
	path: string
	component: RouteComponent
	authority: string[]
	meta?: Meta
}

// export type Route = {
// 	key: string
// 	path: string
// 	component: LazyExoticComponent<<T extends Meta>(props: T) => (undefined | JSX.Element)>
// 	authority: string[]
// 	meta?: Meta
// }

export type Routes = Route[]
