import { type CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TableQueries, PaginatedResponse } from '@/@types/common'
import { Branch } from '@/@types/dataset.types'
import useThemeClass from '@/utils/hooks/useThemeClass'
import { DatasetService } from '@/services/dataset.service'
import { formatPhone } from '@/utils/format'
import { getLocalizedValueSuffixFirst } from '@/utils/localize'
import { JuristContact, JuristContactsService } from '../jurist-contacts.service'
import { JURIST_CONTACTS_QUERY_KEY } from '../jurist-contacts.constants'
import JuristContactsEditDrawer from './JuristContactsEditDrawer'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
}

const ActionColumn = ({
												style,
												onEdit,
												onDelete
											}: {
	style?: CSSProperties
	onEdit: () => void
	onDelete: () => void
}) => {
	const { textTheme } = useThemeClass()
	return (
		<div className='flex justify-center gap-1 text-lg' style={style}>
			<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onEdit}>
				<HiOutlinePencil />
			</span>
			<span className='cursor-pointer p-2 hover:text-red-500' onClick={onDelete}>
				<HiOutlineTrash />
			</span>
		</div>
	)
}

const JuristContactsTable = ({ params, onPageChange, onSizeChange, onSortingChange }: Props) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const [editData, setEditData] = useState<JuristContact | null>(null)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	// Branches — id → region nomi (til bo'yicha)
	const { i18n } = useTranslation()

	const { data: branches = [] } = useQuery({
		queryKey: ['branches-all'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>({ size: 1000 }),
		select: (res) => {
			const d = res.data as any
			return (d?.results ?? d) as Branch[]
		},
		staleTime: 5 * 60 * 1000
	})

	const getBranchName = (branchId: number | null): string => {
		if (!branchId) return '-'
		const branch = branches.find((b) => b.id === branchId)
		if (!branch) return `#${branchId}`
		// getLocalizedValueSuffixFirst — loyihadagi standart tarjima usuli
		return (
			getLocalizedValueSuffixFirst(branch.region as any, i18n.language, ['name']) ??
			branch.name ??
			`#${branchId}`
		)
	}

	const { data, isLoading } = useQuery({
		queryKey: [JURIST_CONTACTS_QUERY_KEY, params],
		queryFn: () => JuristContactsService.getAll(params),
		select: (res) => res.data as PaginatedResponse<JuristContact[]>
	})

	const { mutateAsync: deleteContact } = useMutation({
		mutationFn: (id: number) => JuristContactsService.remove(id),
		onSuccess() {
			toast.push(
				<Notification type='success' title={t('Контакт удалён')} duration={2000} />,
				{ placement: 'top-center' }
			)
			queryClient.invalidateQueries({ queryKey: [JURIST_CONTACTS_QUERY_KEY] })
			setDeleteId(null)
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const columns: ColumnDef<JuristContact>[] = useMemo(
		() => [
			{
				header: t('№'),
				accessorKey: 'id',
				size: 60,
				enableSorting: false,
				cell: (props) => (
					<div className='font-semibold'>
						{(params.page - 1) * params.size + props.row.index + 1}
					</div>
				)
			},
			{
				header: t('ФИЛИАЛ'),
				accessorKey: 'branch',
				enableSorting: false,
				cell: (props) => getBranchName(props.row.original.branch)
			},
			{
				header: t('ФИО'),
				accessorKey: 'full_name',
				enableSorting: false,
				cell: (props) => props.row.original.full_name
			},
			{
				header: t('РОЛЬ'),
				accessorKey: 'role',
				enableSorting: false,
				cell: (props) => props.row.original.role || '-'
			},
			{
				header: t('НОМЕР ТЕЛЕФОНА'),
				accessorKey: 'phone_number',
				enableSorting: false,
				cell: (props) => {
					const phone = props.row.original.phone_number
					if (!phone) return '-'
					const digits = String(phone).replace(/\D/g, '')
					// 9 xonali → 998 prefix qo'shib format
					const normalized = digits.length === 9 ? `998${digits}` : digits
					return formatPhone(normalized)
				}
			},
			{
				header: t('ДЕЙСТВИЕ'),
				id: 'actions',
				size: 120,
				enableSorting: false,
				meta: {
					thClassName: 'sticky right-0 z-[5]',
					tdClassName: 'sticky right-0',
					thStyle: { textAlign: 'center' },
					tdStyle: { textAlign: 'center' }
				},
				cell: (props) => (
					<ActionColumn
						onEdit={() => setEditData(props.row.original)}
						onDelete={() => setDeleteId(props.row.original.id)}
						style={{ minWidth: props.column.getSize() - 48 }}
					/>
				)
			}
		],
		[t, params.page, params.size, i18n.language, getBranchName]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={data?.results ?? []}
				loading={isLoading}
				pagingData={{
					total: data?.count ?? 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{editData && (
				<JuristContactsEditDrawer data={editData} onClose={() => setEditData(null)} />
			)}

			<ConfirmDialog
				isOpen={deleteId !== null}
				type='danger'
				title={t('Удалить контакт юриста')}
				cancelText={t('Отмена')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteId(null)}
				onRequestClose={() => setDeleteId(null)}
				onCancel={() => setDeleteId(null)}
				onConfirm={() => deleteId !== null && deleteContact(deleteId)}
			>
				<p>{t('Вы уверены, что хотите удалить контакт юриста?')}</p>
			</ConfirmDialog>
		</>
	)
}

export default JuristContactsTable
