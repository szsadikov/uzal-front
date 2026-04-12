import { useNavigate } from 'react-router-dom'
import Header from '@/components/template/Header'
import LanguageSelector from '@/components/template/LanguageSelector'
import MobileNav from '@/components/template/MobileNav'
import Notification from '@/components/template/Notification'
import SideNav from '@/components/template/SideNav'
import SideNavToggle from '@/components/template/SideNavToggle'
import ModeSwitcher from '@/components/template/ThemeConfigurator/ModeSwitcher'
import UserDropdown from '@/components/template/UserDropdown'
import { Button } from '@/components/ui'
import appConfig from '@/configs/app.config'
// import { useAppSelector } from '@/store'
import useAuth from '@/utils/hooks/useAuth'
import View from '@/views'
import { useTranslation } from 'react-i18next'

const ModernLayout = () => {
	const { authenticated } = useAuth()
	const { t } = useTranslation()
	const navigate = useNavigate()

	// const { user } = useAppSelector((state) => state.auth.session)
	// const role = user?.role

	return (
		<div className='app-layout-modern flex flex-auto flex-col'>
			<div className='flex min-w-0 flex-auto'>
				<SideNav />
				<div className='relative flex min-h-screen w-full min-w-0 flex-auto flex-col border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'>
					<Header
						className='border-b border-gray-200 dark:border-gray-700'
						headerStart={
							<>
								<MobileNav />
								<SideNavToggle />
							</>
						}
						headerEnd={
							<>
								<LanguageSelector />
								<Notification />
								<ModeSwitcher />

								{/*{role !== 'admin' && <Notification />}*/}
								{authenticated ? (
									<UserDropdown hoverable={false} />
								) : (
									<Button
										size='sm'
										variant='solid'
										className='ml-2 px-8'
										onClick={() =>
											navigate(appConfig.unAuthenticatedEntryPath + '?client')
										}
									>
										{t('Войти')}
									</Button>
								)}
							</>
						}
					/>
					<View />
				</div>
			</div>
		</div>
	)
}

export default ModernLayout
