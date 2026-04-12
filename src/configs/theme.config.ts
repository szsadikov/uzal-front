import { ColorLevel, ControlSize, Direction, LayoutType, Mode, NavMode } from '@/@types/theme'
import { THEME_ENUM } from '@/constants/theme.constant'

const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches

export type ThemeConfig = {
	themeColor: string
	direction: Direction
	mode: Mode
	primaryColorLevel: ColorLevel
	panelExpand: boolean
	navMode: NavMode
	controlSize: ControlSize
	cardBordered: boolean
	layout: {
		type: LayoutType
		sideNavCollapse: boolean
	}
}

/**
 * Since some configurations need to be match with specific themes,
 * we recommend to use the configuration that generated from demo.
 */
export const themeConfig: ThemeConfig = {
	themeColor: 'indigo',
	direction: THEME_ENUM.DIR_LTR,
	mode: isDark ? THEME_ENUM.MODE_DARK : THEME_ENUM.MODE_LIGHT,
	primaryColorLevel: 600,
	cardBordered: true,
	panelExpand: false,
	controlSize: 'md',
	navMode: THEME_ENUM.NAV_MODE_LIGHT,
	layout: {
		type: THEME_ENUM.LAYOUT_TYPE_MODERN,
		sideNavCollapse: false
	}
}
