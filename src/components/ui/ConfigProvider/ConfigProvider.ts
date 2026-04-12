import { createContext, useContext } from 'react'
import type { ColorLevel, TypeAttributes } from '../@types/common'
import { SIZES } from '../utils/constants'

export type Config = {
	themeColor: string
	mode: 'light' | 'dark'
	locale: string
	primaryColorLevel: ColorLevel
	cardBordered: boolean
	controlSize: TypeAttributes.ControlSize
	navMode: TypeAttributes.MenuVariant
	direction: TypeAttributes.Direction
}

export const defaultConfig = {
	themeColor: 'indigo',
	direction: 'ltr',
	mode: 'light',
	locale: 'en',
	primaryColorLevel: 600,
	cardBordered: false,
	controlSize: SIZES.MD,
	navMode: 'light'
} as const

export const ConfigContext = createContext<Config>(defaultConfig)

const ConfigProvider = ConfigContext.Provider

export const ConfigConsumer = ConfigContext.Consumer

export function useConfig() {
	return useContext(ConfigContext)
}

export default ConfigProvider
