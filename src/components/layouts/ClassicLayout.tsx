import Header from '@/components/template/Header'
import MobileNav from '@/components/template/MobileNav'
import Notification from '@/components/template/Notification'
import SideNav from '@/components/template/SideNav'
import SideNavToggle from '@/components/template/SideNavToggle'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
import View from '@/views'
// import { useAppSelector } from '@/store'

const HeaderActionsStart = () => {
	return (
		<>
			<MobileNav />
			<SideNavToggle />
		</>
	)
}

const HeaderActionsEnd = () => {

	// const { user } = useAppSelector((state) => state.auth.session)
	// const role = user?.role
	return (
		<>
			<SidePanel />
			 <Notification />
			{/*{role !== 'admin' && <Notification />}*/}
			<UserDropdown hoverable={false} />
		</>
	)
}

const ClassicLayout = () => {
	return (
		<div className='app-layout-classic flex flex-auto flex-col'>
			<div className='flex min-w-0 flex-auto'>
				<SideNav />
				<div className='relative flex min-h-screen w-full min-w-0 flex-auto flex-col'>
					<Header
						className='shadow-sm dark:shadow-2xl'
						headerStart={<HeaderActionsStart />}
						headerEnd={<HeaderActionsEnd />}
					/>
					<div className='flex h-full flex-auto flex-col'>
						<View />
					</div>
				</div>
			</div>
		</div>
	)
}

export default ClassicLayout
