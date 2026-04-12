import { HiDownload, HiPlusCircle } from 'react-icons/hi'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import type { BegunokListItem } from '@/@types/begunok.types'
import { PaginatedResponse } from '@/@types/common'
import { UserRoleTextEnum } from '@/@types/user.types'
import { Button, Skeleton } from '@/components/ui'
import { exportToExcel } from '@/utils/files'
import { FilterQueries } from '../PaperTrackersList'
import Filter from './Filter'
import TableSearch from './TableSearch'

type Props = {
	search?: string
	onSearch: (value?: string) => void
	filters: FilterQueries
	onFilterSubmit: (filters: FilterQueries) => void
	papertrackers?: PaginatedResponse<BegunokListItem[]>
	isLoading?: boolean
	currentUserRole?: UserRoleTextEnum
	onAdd: () => void
}

const TableTools = ({
	search,
	onSearch,
	filters,
	onFilterSubmit,
	papertrackers,
	isLoading,
	currentUserRole,
	 onAdd
}: Props) => {
	return (
		<div className='flex flex-col lg:flex-row lg:items-center'>
			<div className='min-w-[260px] flex-1 lg:min-w-[360px]'>
				<TableSearch value={search} onChange={onSearch} />
			</div>

			{/* Ekspeditor bo'lmasa tugmani ko'rsatamiz */}
			{currentUserRole !== UserRoleTextEnum.EXPEDITOR && (

				<Button
					block
					size='sm'
					className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				>
					Ожидает мою подпись
				</Button>
			)}

			<Filter values={filters} onSubmit={onFilterSubmit} />

			<Link
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				to='/clients/archive'
			>
				<Button block size='sm'>
					Архив
				</Button>
			</Link>
			{isLoading ? (
				<Skeleton className='md:ml-2' width={106} height={36} />
			) : (
				papertrackers && (
					<Button
						className='mb-4 block md:mb-0 md:ml-2 md:inline-block'
						size='sm'
						icon={<HiDownload />}
						onClick={() =>
							exportToExcel(
								papertrackers.results,
								`Текущие договора - ${dayjs(new Date()).format('DD.MM.YYYY_HH-mm-ss')}`
							)
						}
					>
						Экспорт
					</Button>
				)
			)}

			{/* OLD: Link -> NEW: onAdd modal */}
			<Button
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				variant='solid'
				size='sm'
				icon={<HiPlusCircle />}
				onClick={onAdd}               // <-- MODAL NI OCHISH
			>
				Добавить
			</Button>

			{/*<Link*/}
			{/*	className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'*/}
			{/*	to='/paper-trackers-add'*/}
			{/*>*/}
			{/*	<Button variant='solid' size='sm' icon={<HiPlusCircle />}>*/}
			{/*		Добавить*/}
			{/*	</Button>*/}
			{/*</Link>*/}
		</div>
	)
}

export default TableTools
