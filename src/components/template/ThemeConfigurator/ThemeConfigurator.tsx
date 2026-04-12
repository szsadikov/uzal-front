import CopyButton from './CopyButton'
import DirectionSwitcher from './DirectionSwitcher'
import LayoutSwitcher from './LayoutSwitcher'
import ModeSwitcher from './ModeSwitcher'
import NavModeSwitcher from './NavModeSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

export type ThemeConfiguratorProps = {
	callBackClose?: () => void
}

const ThemeConfigurator = ({ callBackClose }: ThemeConfiguratorProps) => {
	return (
		<div className='flex h-full flex-col justify-between'>
			<div className='mb-6 flex flex-col gap-y-10'>
				<div className='flex items-center justify-between'>
					<div>
						<h6>Dark Mode</h6>
						<span>Switch theme to dark mode</span>
					</div>
					<ModeSwitcher />
				</div>
				<div className='flex items-center justify-between'>
					<div>
						<h6>Direction</h6>
						<span>Select a direction</span>
					</div>
					<DirectionSwitcher callBackClose={callBackClose} />
				</div>
				<div>
					<h6 className='mb-3'>Nav Mode</h6>
					<NavModeSwitcher />
				</div>
				<div>
					<h6 className='mb-3'>Theme</h6>
					<ThemeSwitcher />
				</div>
				<div>
					<h6 className='mb-3'>Layout</h6>
					<LayoutSwitcher />
				</div>
			</div>
			<CopyButton />
		</div>
	)
}

export default ThemeConfigurator
