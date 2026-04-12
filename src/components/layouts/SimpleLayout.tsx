import Header from '@/components/template/Header'
import HeaderLogo from '@/components/template/HeaderLogo'
import HorizontalNav from '@/components/template/HorizontalNav'
import MobileNav from '@/components/template/MobileNav'
import SidePanel from '@/components/template/SidePanel'
import UserDropdown from '@/components/template/UserDropdown'
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
	return (
		<>
			<SidePanel />
			<UserDropdown hoverable={false} />
		</>
	)
}

const SimpleLayout = () => {
	return (
		<div className='app-layout-simple flex min-h-screen flex-auto flex-col'>
			<div className='flex min-w-0 flex-auto'>
				<div className='relative flex min-h-screen w-full min-w-0 flex-auto flex-col'>
					<Header
						container
						className='shadow-sm dark:shadow-2xl'
						headerStart={<HeaderActionsStart />}
						headerMiddle={<HorizontalNav />}
						headerEnd={<HeaderActionsEnd />}
					/>
					<View pageContainerType='contained' />
				</div>
			</div>
		</div>
	)
}

export default SimpleLayout
