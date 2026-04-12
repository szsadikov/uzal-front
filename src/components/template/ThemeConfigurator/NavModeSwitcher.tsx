import Radio from '@/components/ui/Radio'
import { NAV_MODE_THEMED } from '@/constants/theme.constant'
import { setNavMode, useAppDispatch, useAppSelector } from '@/store'

type NavModeParam = 'default' | 'themed'

const NavModeSwitcher = () => {
	const navMode = useAppSelector((state) => state.theme.navMode)
	const dispatch = useAppDispatch()

	const onSetNavMode = (val: NavModeParam) => {
		dispatch(setNavMode(val))
	}

	return (
		<Radio.Group
			value={navMode === NAV_MODE_THEMED ? NAV_MODE_THEMED : 'default'}
			onChange={onSetNavMode}
		>
			<Radio value='default'>Default</Radio>
			<Radio value={NAV_MODE_THEMED}>Themed</Radio>
		</Radio.Group>
	)
}

export default NavModeSwitcher
