// SmsServiceTable.tsx
import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next' // ⬅️ i18n
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { TableQueries } from '@/@types/common'
import { SMSService } from '@/@types/dataset.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import useThemeClass from '@/utils/hooks/useThemeClass'
import SmsServiceDeleteConfirmation from './SmsServiceDeleteConfirmation'
import SmsServiceEdit from './SmsServiceEdit'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	smsList?: SMSService[]
	total?: number
	isLoading: boolean
	refetch?: () => Promise<unknown>
}

type ActionProps = {
	row: SMSService
	style?: CSSProperties
	onDelete: (id: number) => void
	onEdit?: (row: SMSService) => void
}

const ActionColumn = ({ row, style, onDelete, onEdit }: ActionProps) => {
	const { textTheme } = useThemeClass()

	return (
		<div className='justify-left flex text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={() => onEdit?.(row)}>
				<HiOutlinePencil />
			</span>
			<span className='cursor-pointer p-2 hover:text-red-500' onClick={() => onDelete(row.id)}>
				<HiOutlineTrash />
			</span>
		</div>
	)
}

const SmsServiceTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	smsList,
	total,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)
	const [isEditOpen, setIsEditOpen] = useState(false)
	const [current, setCurrent] = useState<SMSService | null>(null)

	const openEdit = (row: SMSService) => {
		setCurrent(row)
		setIsEditOpen(true)
	}
	const closeEdit = () => {
		setIsEditOpen(false)
		setCurrent(null)
	}

	const openDelete = (id: number) => {
		setDeleteId(id)
		setDeleteDialogIsOpen(true)
	}
	const closeDelete = () => {
		setDeleteDialogIsOpen(false)
		setDeleteId(null)
	}

	const { mutateAsync: removeSms, isPending: isDeleting } = useMutation({
		mutationKey: ['delete sms service', deleteId],
		mutationFn: async () => {
			if (deleteId == null) throw new Error('ID is null')
			await DatasetService.deleteSMS<void>(deleteId)
		},
		async onSuccess() {
			toast.push(<Notification type='success' title={t('Запись удалена')} duration={1600} />, {
				placement: 'top-center'
			})
			closeDelete()
			if (refetch) await refetch()
		},
		onError(error) {
			console.error(error)
			toast.push(<Notification type='danger' title={t('Ошибка при удалении')} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onDeleteConfirm = async () => {
		await removeSms()
	}

	const columns: ColumnDef<SMSService>[] = useMemo(
		() => [
			{ header: '№', accessorKey: 'id', sortable: true, size: 80 },
			{
				header: t('Дни'),
				accessorKey: 'day_count',
				size: 150,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.day_count}
					</div>
				)
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 50,
				meta: {
					thClassName: 'sticky right-0 z-[5] ',
					tdClassName: 'sticky right-0 ',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						onDelete={openDelete}
						onEdit={openEdit}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={smsList || []}
				loading={isLoading || isDeleting}
				pagingData={{
					total: total ?? smsList?.length ?? 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			<SmsServiceDeleteConfirmation
				isOpen={isDeleteDialogOpen}
				onClose={closeDelete}
				onConfirm={onDeleteConfirm}
				title={t('Удалить SMS-сервис')}
				message={t('Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить.')}
				confirmText={isDeleting ? t('Удаление...') : t('Удалить')}
				cancelText={t('Отменить')}
			/>

			<SmsServiceEdit
				open={isEditOpen}
				item={current}
				onClose={closeEdit}
				onSaved={async () => {
					if (refetch) await refetch()
				}}
			/>
		</>
	)
}

export default SmsServiceTable
