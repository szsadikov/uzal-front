import { useEffect } from 'react'
import type { Mode } from '@/@types/theme'
import { THEME_ENUM } from '@/constants/theme.constant'
import { setMode, useAppDispatch, useAppSelector } from '@/store'

function useDarkMode(): [isEnabled: boolean, onModeChange: (mode: Mode) => void] {
	const mode = useAppSelector((state) => state.theme.mode)
	const { MODE_DARK, MODE_LIGHT } = THEME_ENUM

	const isEnabled = mode === MODE_DARK

	const dispatch = useAppDispatch()
	const onModeChange = (mode: Mode) => {
		dispatch(setMode(mode))
	}

	useEffect(() => {
		if (window === undefined) {
			return
		}
		const root = window.document.documentElement
		root.classList.remove(isEnabled ? MODE_LIGHT : MODE_DARK)
		root.classList.add(isEnabled ? MODE_DARK : MODE_LIGHT)
	}, [isEnabled])

	return [isEnabled, onModeChange]
}

export default useDarkMode
