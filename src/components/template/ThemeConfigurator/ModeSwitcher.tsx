import { useCallback } from 'react'
import { HiMoon, HiSun } from 'react-icons/hi'
import { useConfig } from '@/components/ui/ConfigProvider'
import useDarkMode from '@/utils/hooks/useDarkmode'

const ModeSwitcher = () => {
	const [isDark, setIsDark] = useDarkMode()
	const { themeColor, primaryColorLevel } = useConfig()

	const onSwitchChange = useCallback(
		(checked: boolean) => {
			setIsDark(checked ? 'dark' : 'light')
		},
		[setIsDark]
	)

	return (
		<div className='rounded-full mx-1 p-2 hover:bg-black/40 transition-colors'>
			{isDark ? (
				<HiSun className={`cursor-pointer`} size={24} onClick={() => onSwitchChange(false)} />
			) : (
				<HiMoon
					className={`cursor-pointer text-${themeColor}-${primaryColorLevel}`}
					size={24}
					onClick={() => onSwitchChange(true)}
				/>
			)}
		</div>
	)
}

export default ModeSwitcher
