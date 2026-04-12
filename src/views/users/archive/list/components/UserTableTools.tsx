import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { PaginatedResponse } from '@/@types/common'
import { User } from '@/@types/user.types'
import { Skeleton } from '@/components/ui'
import Button from '@/components/ui/Button'
import { exportToExcel } from '@/utils/files'
import { formatDate, userRoleTextToName } from '@/utils/format'
import { FilterQueries } from '../UsersList'
import UserFilter from './UserFilter'
import UserTableSearch from './UserTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	users?: PaginatedResponse<User[]>
	isLoading?: boolean
}

const UserTableTools = ({ search, onSearch, filters, onFilterSubmit, users, isLoading }: Props) => {
	const { t } = useTranslation()

	const onExportToExel = async () => {
		if (!users || !users.results.length) return

		const clearedData = users.results.map((item) => ({
			'№': item.id,
			Имя: `${item.first_name} ${item.last_name} ${item.middle_name}`,
			'Номер телефона': item.phone_number,
			Область: item.region.name_ru,
			// ПИНФЛ: item.pinfl,
			// Логин: item.username,
			Должность: userRoleTextToName(item.role),
			Статус: item.is_active ? t('Активный') : t('Удален'),
			Активность: formatDate(item.last_login, 'HH:mm DD.MM.YYYY')
		}))

		await exportToExcel(
			clearedData,
			`Пользователи - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
		)
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<UserTableSearch value={search} onChange={onSearch} />
			<UserFilter values={filters} onSubmit={onFilterSubmit} />
			<Link className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2' to='/users'>
				<Button block size='sm'>
					{t('Пользователи')}
				</Button>
			</Link>
			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!users || !users.results.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}
		</div>
	)
}

export default UserTableTools
