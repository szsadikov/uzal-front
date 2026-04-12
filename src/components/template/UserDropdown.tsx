import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineLogout, HiOutlineUser } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import Avatar from '@/components/ui/Avatar'
import Dropdown from '@/components/ui/Dropdown'
import { API_SERVER_URL } from '@/constants/api.constant'
import { useAppSelector } from '@/store'
import withHeaderItem from '@/utils/hoc/withHeaderItem'
import useAuth from '@/utils/hooks/useAuth'

type DropdownList = {
	label: string
	path: string
	icon: JSX.Element
}

const UserDropdown = withHeaderItem(({ className }: CommonProps) => {
	const { t } = useTranslation()
	const { user } = useAppSelector((state) => state.auth.session)
	const { signOut } = useAuth()

	const logout = async () => {
		await signOut()
	}

	const dropdownItemList: DropdownList[] = [
		{
			label: t('Профиль'),
			path: '/account/settings/profile',
			icon: <HiOutlineUser />
		}
	]

	const UserAvatar = (
		<div className={classNames(className, 'flex items-center gap-2')}>
			{user.profile_picture ? (
				<Avatar src={API_SERVER_URL + user.profile_picture} size={32} shape='circle' />
			) : (
				<Avatar size={32} shape='circle' icon={<HiOutlineUser />} />
			)}
			<div className='hidden md:block'>
				<div className='text-xs capitalize'>{user?.role}</div>
				<div className='font-bold'>
					{user.first_name} {user.last_name}
				</div>
			</div>
		</div>
	)

	return (
		<div>
			<Dropdown menuStyle={{ minWidth: 240 }} renderTitle={UserAvatar} placement='bottom-end'>
				<Dropdown.Item variant='header'>
					<div className='flex items-center gap-2 px-3 py-2'>
						{user.profile_picture ? (
							<Avatar shape='circle' src={API_SERVER_URL + user.profile_picture} />
						) : (
							<Avatar shape='circle' icon={<HiOutlineUser />} />
						)}
						<div>
							<div className='font-bold text-gray-900 dark:text-gray-100'>{user.username}</div>
							<div className='text-xs'>{user.email}</div>
						</div>
					</div>
				</Dropdown.Item>
				<Dropdown.Item variant='divider' />
				{dropdownItemList.map((item) => (
					<Dropdown.Item key={item.label} eventKey={item.label} className='mb-1 px-0'>
						<Link className='flex h-full w-full px-2' to={item.path}>
							<span className='flex w-full items-center gap-2'>
								<span className='text-xl opacity-50'>{item.icon}</span>
								<span>{item.label}</span>
							</span>
						</Link>
					</Dropdown.Item>
				))}
				<Dropdown.Item variant='divider' />
				<Dropdown.Item eventKey='Sign Out' className='gap-2' onClick={logout}>
					<span className='text-xl opacity-50'>
						<HiOutlineLogout />
					</span>
					<span>{t('Выход')}</span>
				</Dropdown.Item>
			</Dropdown>
		</div>
	)
})

export default UserDropdown
