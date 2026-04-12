import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPackage } from 'react-icons/fi'
import { HiInformationCircle, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import classNames from 'classnames'
import parse from 'html-react-parser'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Tech } from '@/@types/tech.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Avatar, Notification, Skeleton, Switcher, toast, Tooltip } from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import { unitName } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	techs?: PaginatedResponse<Tech[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const ModelColumn = ({ row, style }: { row: Tech; style?: CSSProperties }) => {
	const avatar = row.files.length ? (
		<Avatar className='min-h-[40px] min-w-[40px]' src={API_SERVER_URL + row.files[0].file} />
	) : (
		<Avatar className='min-h-[40px] min-w-[40px]' icon={<FiPackage />} />
	)

	return (
		<div className='flex items-start' style={style}>
			{avatar}
			<div className='ml-2 flex flex-col rtl:mr-2'>
				<Tooltip title={row.model_name_ru}>
					<span className='truncate-1'>{row.model_name_ru}</span>
				</Tooltip>
				<Tooltip title={row.type ? row.type.name_ru : '-'}>
					<span className='truncate-1'>{row.type ? row.type.name_ru : '-'}</span>
				</Tooltip>
			</div>
		</div>
	)
}

const CharacteristicColumn = ({ row, style }: { row: Tech; style?: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	const Content = ({ row }: { row: Tech }) => (
		<>
			{row.description && <p className='mb-4'>{parse(row.description)}</p>}
			{row.characteristics && row.characteristics.length ? (
				<ul className='flex flex-col gap-y-2'>
					{row.characteristics.map((ch, i) => (
						<li key={`${ch}_${i}`} className='grid grid-cols-2 gap-4'>
							<span>{ch.name}</span>
							<span>{ch.description}</span>
						</li>
					))}
				</ul>
			) : (
				<div>{t('Нет характиристики')}</div>
			)}
		</>
	)

	return (
		<div className='flex justify-center text-xl' style={style}>
			<Tooltip
				title={<Content row={row} />}
				placement='bottom'
				className={classNames('p-4', {
					'lg:min-w-[400px]': row.description || (row.characteristics && row.characteristics.length)
				})}
			>
				<span className={`cursor-pointer p-2 ${textTheme}`}>
					<HiInformationCircle />
				</span>
			</Tooltip>
		</div>
	)
}

const ActionColumn = ({
	row,
	onEdit,
	onDelete,
	onSwitch,
	isPendingActivate,
	style
}: {
	row: Tech
	onEdit: () => void
	onDelete: () => void
	onSwitch: () => void
	isPendingActivate: boolean
	style?: CSSProperties
}) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='flex items-center justify-center text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
				<HiOutlinePencil />
			</span>
			<span className='cursor-pointer p-2 hover:text-red-500' onClick={onDelete}>
				<HiOutlineTrash />
			</span>
			{isPendingActivate ? (
				<Skeleton width={44} height={24} className='ml-4 rounded-full' />
			) : (
				<Switcher className='ml-4' onChange={onSwitch} checked={row.is_active} />
			)}
		</div>
	)
}

const EquipmentTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	techs,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const [isDialogOpen, setDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	const navigate = useNavigate()

	const { mutate: mutateDelete, isPending: isPendingDelete } = useMutation({
		mutationKey: ['delete tech'],
		mutationFn: (id: number) => TechService.delete(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification type='success' title={t('Продукт удален')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setDialogIsOpen(false)
			setDeleteId(null)
		}
	})

	const { mutate: mutateActivate, isPending: isPendingActivate } = useMutation({
		mutationKey: ['update activity'],
		mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
			TechService.activate<Tech>(id, { is_active: !is_active }),
		async onSuccess({ data }) {
			if (refetch) await refetch()

			toast.push(
				<Notification
					type='success'
					title={data.is_active ? t('Активно') : t('Неактивно')}
					duration={2000}
				/>,
				{
					placement: 'top-center'
				}
			)
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onEdit = (id: number) => {
		// navigate(`/catalog/equipment/edit/${id}`)
		navigate(`/catalog/equipment/edit/${id}`, {
			state: { page: params.page }
		})
	}

	const onDelete = (id: number) => {
		setDialogIsOpen(true)
		setDeleteId(id)
	}

	const onDeleteConfirm = () => {
		if (deleteId) mutateDelete(deleteId)
	}

	// const onSwitch = (id: number, is_active: boolean) => {
	// 	mutateActivate({ id, is_active })
	// }

	const onSwitch = async (id: number, is_active: boolean) => {
		// 1) Avval optimistik update — texnikani ro‘yxatda joyini o‘zgartiramiz
		if (techs?.results) {
			const updated = techs.results.map((t) => (t.id === id ? { ...t, is_active: !is_active } : t))

			// 🔥 ACTIVE bo‘lganlarni tepaga chiqarib, id bo‘yicha sort qilamiz
			updated.sort((a, b) => {
				// active birinchi
				if (a.is_active && !b.is_active) return -1
				if (!a.is_active && b.is_active) return 1
				// ikkalasi ham activemas yoki ikkalasi ham active bo‘lsa -> id bo‘yicha

				return b.id - a.id
			})

			// front-da darrov yangilab turish (optimistic UI)
			techs.results = updated
		}

		// onPageChange(1)

		// 2) backendni yangilaymiz (asosiy o‘zgarish)
		mutateActivate({ id, is_active })
	}

	const columns: ColumnDef<Tech>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 left-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 left-0 z-1'
				},
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Модель'),
				accessorKey: 'model_name_ru',
				size: 290,
				sortable: true,
				cell: (props) => (
					<ModelColumn row={props.row.original} style={{ minWidth: props.column.getSize() - 48 }} />
				)
			},
			{
				header: t('Стрaна'),
				accessorKey: 'country',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.country ? props.row.original.country : '-'}
					</div>
				)
			},
			{
				header: t('Производитель'),
				accessorKey: 'manufacturer__name_lt',
				size: 260,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.manufacturer ? props.row.original.manufacturer.name_ru : '-'}
					</div>
				)
			},
			{
				header: t('Тип'),
				accessorKey: 'type__name_lt',
				size: 220,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.type ? props.row.original.type.name_ru : '-'}>
							<span className='truncate-2'>
								{props.row.original.type ? props.row.original.type.name_ru : '-'}
							</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('Ед. изм.'),
				accessorKey: 'measure_unit',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{unitName(props.row.original.measure_unit)}
					</div>
				)
			},
			{
				header: t('1С код'),
				accessorKey: 'code_1c',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.code_1c}</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Характеристики')}</div>,
				accessorKey: 'characteristics',
				size: 200,
				enableSorting: false,
				cell: (props) => (
					<CharacteristicColumn
						row={props.row.original}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			},
			{
				header: () => <div>{t('Действие')}</div>,
				id: 'actions',
				size: 190,
				enableSorting: false,
				meta: {
					thClassName: 'sticky bg-gray-50 dark:bg-gray-700 right-0 z-1',
					tdClassName: 'sticky bg-white dark:bg-gray-800 right-0 z-1'
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						onEdit={() => onEdit(props.row.original.id)}
						onDelete={() => onDelete(props.row.original.id)}
						onSwitch={() => onSwitch(props.row.original.id, props.row.original.is_active)}
						isPendingActivate={isPendingActivate}
						style={{ minWidth: props.column.getSize() - 48, maxWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[techs, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={techs?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading || isPendingDelete}
				pagingData={{
					total: techs?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			<ConfirmDialog
				isOpen={isDialogOpen}
				type='danger'
				title={t('Удалить продукт')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDialogIsOpen(false)}
				onRequestClose={() => setDialogIsOpen(false)}
				onCancel={() => setDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>
					{t(
						'Вы уверены, что хотите удалить этого продукта? Все записи, связанные с этим продуктом, также будут удалены. Это действие не может быть отменено.'
					)}
				</p>
			</ConfirmDialog>
		</>
	)
}

export default EquipmentTable
