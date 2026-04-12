import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tabs from '@/components/ui/Tabs'
import TabContent from '@/components/ui/Tabs/TabContent'
import TabList from '@/components/ui/Tabs/TabList'
import TabNav from '@/components/ui/Tabs/TabNav'
import EimzoForm from './EimzoForm'
// import OneIdForm from './OneId'
import SignInForm from './SignInForm'

const SignIn = () => {
	const { t } = useTranslation()
	const [selectedTab, setSelectedTab] = useState('login')

	const handleTabChange = (value: string) => {
		setSelectedTab(value)
	}

	return (
		<>
			<div className='mb-8'>
				<h3 className='mb-1'>{t('Авторизация')}</h3>
				<p>{t('Как вы хотите войти в систему?')}</p>
			</div>

			<div className='relative min-h-[300px]'>
				<Tabs
					defaultValue='login'
					value={selectedTab}
					onChange={handleTabChange}
					variant='pill'
					className='w-full'
				>
					<TabList className='grid grid-cols-3 gap-2 md:gap-4 xl:gap-8 rounded-lg mb-8'>
						<TabNav value='login' className='text-xs md:text-sm p-2 m-0'>
							{t('Логин и пароль')}
						</TabNav>
						<TabNav value='eimzo' className='text-xs md:text-sm p-2 m-0'>
							{t('Ключ ЭЦП')}
						</TabNav>
						{/*<TabNav value='oneid' className='text-xs md:text-sm p-2 m-0'>*/}
						{/*	{t('One ID')}*/}
						{/*</TabNav>*/}
					</TabList>

					<TabContent
						value='login'
						className='top-[/* TabList height + */] absolute right-0 left-0 mb-8'
					>
						<SignInForm />
					</TabContent>

					<TabContent
						value='eimzo'
						className='top-[/* TabList height + */] absolute right-0 left-0 mb-8'
					>
						<EimzoForm />
					</TabContent>

					{/*<TabContent value='oneid'>*/}
					{/*	<OneIdForm />*/}
					{/*</TabContent>*/}
				</Tabs>
			</div>
		</>
	)
}

export default SignIn
