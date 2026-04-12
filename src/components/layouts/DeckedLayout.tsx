import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import MobileNav from '@/components/template/MobileNav'
import Notification from '@/components/template/Notification'
import SecondaryHeader from '@/components/template/SecondaryHeader'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
// import { useAppSelector } from '@/store'
import View from '@/views'

const HeaderActionsStart = () => {
	return (
		<>
			<HeaderLogo />
			<MobileNav />
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

const DeckedLayout = () => {
	return (
		<div className='app-layout-simple flex min-h-screen flex-auto flex-col'>
			<div className='flex min-w-0 flex-auto'>
				<div className='relative flex min-h-screen w-full min-w-0 flex-auto flex-col'>
					<Header
						container
						className='shadow-sm dark:shadow-2xl'
						headerStart={<HeaderActionsStart />}
						headerEnd={<HeaderActionsEnd />}
					/>
					<SecondaryHeader contained />
					<View pageContainerType='contained' />
				</div>
			</div>
		</div>
	)
}

export default DeckedLayout
