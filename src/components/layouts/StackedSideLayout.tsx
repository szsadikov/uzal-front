import Header from '@/components/template/Header'
import MobileNav from '@/components/template/MobileNav'
import SidePanel from '@/components/template/SidePanel'
import StackedSideNav from '@/components/template/StackedSideNav'
import UserDropdown from '@/components/template/UserDropdown'
import View from '@/views'

const HeaderActionsStart = () => {
	return (
		<>
			<MobileNav />
		</>
	)
}

const HeaderActionsEnd = () => {
	return (
		<>
			<SidePanel />
			<UserDropdown hoverable={false} />
		</>
	)
}

const StackedSideLayout = () => {
	return (
		<div className='app-layout-stacked-side flex flex-auto flex-col'>
			<div className='flex min-w-0 flex-auto'>
				<StackedSideNav />
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

export default StackedSideLayout
