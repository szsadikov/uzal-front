import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { PaginatedResponse } from '@/@types/common'
import { UserRegistryRow,UserRoleTextEnum  } from '@/@types/user.types'
import { Skeleton } from '@/components/ui'
import Button from '@/components/ui/Button'
import { ProfileService } from '@/services/profile.service'
import { exportToExcel } from '@/utils/files'
import { formatDate, userRoleNumToText, userRoleTextToName } from '@/utils/format'
import { getLocalizedValueSuffixFirst } from '@/utils/localize'
import { FilterQueries } from '../UsersRegistryList'
// import UserAdd from './UserAdd'
import UserFilter from './UserFilter'
import UserTableSearch from './UserTableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	users?: PaginatedResponse<UserRegistryRow []>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const UserTableTools = ({
													search,
													onSearch,
													filters,
													onFilterSubmit,
													users,
													isLoading
												}: Props) => {
	const { t, i18n } = useTranslation()

	const { data: profile } = useQuery({
		queryKey: ['profile'],
		queryFn: () => ProfileService.getProfile()
	})

	const roleText: UserRoleTextEnum | undefined =
		(profile as any)?.role ?? (profile as any)?.data?.role

	const isAdmin = roleText === UserRoleTextEnum.ADMIN

	// const showPinfl = isAdmin
	// const showLogin = isAdmin
	const showRegion = !isAdmin
	// const showActivity = true // xohlasangiz rolega bog‘lang

	const onExportToExel = async () => {
		try {
			if (!users || !users.results?.length) return

			const clearedData = users.results.map((item: UserRegistryRow) => {
				const p = item.profile

				const fullName = [p.first_name, p.last_name, p.middle_name].filter(Boolean).join(' ').trim() || '-'

				const row: Record<string, string | number> = {
					'№': item.id,
					Имя: fullName,
					'Номер телефона': p.phone_number || '-',
					Логин: p.username || '-',
					Должность: userRoleTextToName(userRoleNumToText(item.role)) || '-',
					ИНН: item.stir || '-',
					Компания: item.company_name || '-',
					'Р/с': item.account_number || '-',
					МФО: item.mfo || '-',
					Банк: item.bank_details || '-',
					Адрес: item.address || '-',
					Директор: item.director_name || '-',
				}

				if (showRegion) {
					row['Область'] = item.region
						? getLocalizedValueSuffixFirst(item.region, i18n.language, ['name']) || '-'
						: '-'
				}

				return row
			})

			await exportToExcel(
				clearedData,
				`Пользователи - ${formatDate(new Date(), 'DD.MM.YYYY_HH-mm-ss')}`
			)
		} catch (err) {
			console.error('Export error:', err)
			// Istasangiz toast ishlating:
			// toast.push(<Notification type="danger" title="Экспорт не удался">Проверьте данные</Notification>)
		}
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<UserTableSearch value={search} onChange={onSearch} />
			<UserFilter values={filters} onSubmit={onFilterSubmit}  currentUserRoleText={roleText} />

			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/users-register'
			>
				<Button block size='sm'>
					{t('Новые')}
				</Button>
			</Link>

			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					disabled={!users || !users.results?.length}
					onClick={onExportToExel}
				>
					{t('Экспорт')}
				</Button>
			)}

			{/*<UserAdd refetch={refetch} />*/}
		</div>
	)
}

export default UserTableTools
