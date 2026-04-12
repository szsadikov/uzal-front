import { HiDownload } from 'react-icons/hi'
import dayjs from 'dayjs'
import { PaginatedResponse } from '@/@types/common'
import { Branch } from '@/@types/dataset.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { FilterQueries } from '../BranchesList'
import BranchAdd from './BranchAdd'
import BranchTableSearch from './BranchTableSearch'
import { useTranslation } from 'react-i18next'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	branches?: PaginatedResponse<Branch[]>
	isLoading: boolean
}

const BranchTableTools = ({ search, onSearch, branches, isLoading }: Props) => {
	const { t } = useTranslation()

	return (
		<div className='mb-4'>
			<div className='flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between'>
				<div className='w-full min-w-0 lg:max-w-2xl lg:flex-1'>
					<BranchTableSearch value={search} onChange={onSearch} />
				</div>

				{/* ACTIONS */}
				<div className='flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:flex-nowrap lg:justify-end'>
					{/* ДОБАВИТЬ: <sm 100%, ≥sm auto */}
					<div className='w-full mx-2 sm:w-auto'>
						<BranchAdd />
					</div>

					{/* ЭКСПОРТ (ixtiyoriy — xohlasangiz bu ham <sm 100% bo‘lsin) */}
					{isLoading ? (
						<Skeleton className='h-10 w-full sm:w-[112px]' />
					) : (
						branches && (
							<Button
								size='sm'
								className='h-10 w-full sm:w-auto'
								icon={<HiDownload />}
								onClick={() =>
									exportToExcel(
										branches.results,
										`Филиалы - ${dayjs().format('DD.MM.YYYY_HH-mm-ss')}`
									)
								}
							>
								{t('Экспорт')}
							</Button>
						)
					)}
				</div>
			</div>
		</div>
	)
}

export default BranchTableTools
