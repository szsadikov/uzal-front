import { HiOutlineCog } from 'react-icons/hi'
import classNames from 'classnames'
import SidePanel from '@/components/template/SidePanel'
import { setPanelExpand, useAppDispatch, useAppSelector } from '@/store'
import View from '@/views'

const ConfiguratorToggle = () => {
	const dispatch = useAppDispatch()
	const themeColor = useAppSelector((state) => state.theme.themeColor)
	const primaryColorLevel = useAppSelector((state) => state.theme.primaryColorLevel)

	return (
		<div
			className={classNames(
				'fixed top-96 cursor-pointer p-3 text-xl text-white select-none ltr:right-0 ltr:rounded-tl-md ltr:rounded-bl-md rtl:left-0 rtl:rounded-tr-md rtl:rounded-br-md',
				`bg-${themeColor}-${primaryColorLevel}`
			)}
			onClick={() => {
				dispatch(setPanelExpand(true))
			}}
		>
			<HiOutlineCog />
		</div>
	)
}

const BlankLayout = () => {
	return (
		<div className='app-layout-blank flex h-[100vh] flex-auto flex-col'>
			<View />
			<ConfiguratorToggle />
			<SidePanel className='hidden' />
		</div>
	)
}

export default BlankLayout
