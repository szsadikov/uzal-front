import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdaptableCard, Container } from '@/components/shared'
import { Tabs } from '@/components/ui'

const Profile = lazy(() => import('./components/Profile'))
const Password = lazy(() => import('./components/Password'))
// const NotificationSetting = lazy(() => import('./components/NotificationSetting'))

const { TabNav, TabList } = Tabs

const Settings = () => {
	const { t } = useTranslation()
	const navigate = useNavigate()
	const location = useLocation()

	const [currentTab, setCurrentTab] = useState('profile')

	const path = location.pathname.substring(location.pathname.lastIndexOf('/') + 1)

	const settingsMenu: Record<
		string,
		{
			label: string
			path: string
		}
	> = {
		profile: { label: t('Профиль'), path: 'profile' },
		password: { label: t('Пароль'), path: 'password' }
		// notification: { label: 'Уведомления', path: 'notification' }
	}

	const onTabChange = (val: string) => {
		setCurrentTab(val)
		navigate(`/account/settings/${val}`)
	}

	useEffect(() => {
		setCurrentTab(path)
	}, [])

	return (
		<Container>
			<AdaptableCard>
				<Tabs value={currentTab} onChange={(val) => onTabChange(val)}>
					<TabList>
						{Object.keys(settingsMenu).map((key) => (
							<TabNav key={key} value={key}>
								{settingsMenu[key].label}
							</TabNav>
						))}
					</TabList>
				</Tabs>
				<div className='md:px-4 py-6'>
					<Suspense fallback={<></>}>
						{currentTab === 'profile' && <Profile />}
						{currentTab === 'password' && <Password />}
						{/*{currentTab === 'notification' && <NotificationSetting />}*/}
					</Suspense>
				</div>
			</AdaptableCard>
		</Container>
	)
}

export default Settings
