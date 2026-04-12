import type { SyntheticEvent } from 'react'
import { createContext } from 'react'

export type MenuContextProps = {
	activeKey?: string
	onSelect?: (eventKey: string, event: SyntheticEvent) => void
}

const MenuContext = createContext<MenuContextProps | null>(null)

export const MenuContextProvider = MenuContext.Provider

export default MenuContext
