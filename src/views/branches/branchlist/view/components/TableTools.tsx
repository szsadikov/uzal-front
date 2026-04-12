import { useTranslation } from 'react-i18next'
import { HiDownload } from 'react-icons/hi'
import dayjs from 'dayjs'
import { PaginatedResponse } from '@/@types/common'
import { User } from '@/@types/user.types'
import { Skeleton } from '@/components/ui'
import Button from '@/components/ui/Button'
import { exportToExcel } from '@/utils/files'
// import { FilterQueries } from '../ViewBranchTable'
// import UserFilter from './TableFilter'
// import UserTableSearch from './TableSearch'
import UserAdd from './UserAdd'

type Props = {
	users?: PaginatedResponse<User[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
	branchId: number
}

const mapUsersForExport = (rows: User[] = []) =>
	(rows as any[]).map((u) => {
		const p = u?.profile ?? u
		const b = u?.branch ?? u?.profile?.branch
		const region = b?.region ?? u?.region
		const address = [b?.street, b?.house_number].filter(Boolean).join(' ')

		return {
			ID: u?.id ?? '',
			FIRST_NAME: p?.first_name ?? '',
			LAST_NAME: p?.last_name ?? '',
			MIDDLE_NAME: p?.middle_name ?? '',
			PHONE_NUMBER: p?.phone_number ?? '',
			ROLE: p?.role ?? '', // agar sizda enum bo‘lsa, kerak bo‘lsa namega map qiling
			REGION: region?.name_uz ?? region?.name_ru ?? '',
			REGION_CODE: region?.region_code ?? '',
			ADDRESS: address
		}
	})

const TableTools = ({ users, isLoading, refetch, branchId }: Props) => {
	const { t } = useTranslation()
	const handleExport = () => {
		const data = mapUsersForExport(users?.results || [])
		const fileName = `Пользователи - ${dayjs(new Date()).format('DD.MM.YYYY_HH-mm-ss')}`
		exportToExcel(data, fileName) // 🟢 utilingizni o‘zgartirmadik
	}

	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (users?.results?.length ?? 0) > 0 ? (
				<Button
					className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
					size='sm'
					icon={<HiDownload />}
					onClick={handleExport}
				>
					{t('Экспорт')}
				</Button>
			) : null}

			<UserAdd refetch={refetch} branchId={branchId} />
		</div>
	)
}

export default TableTools
