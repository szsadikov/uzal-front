import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import type { PaginatedResponse, TableQueries } from '@/@types/common'
import type { TechMonitorTaskDetail } from '@/@types/tech.types'
import { techMonitorStatusLabel, TechMonitorTaskStatus } from '@/@types/tech.types'
import type { ColumnDef, OnSortParam } from '@/components/shared'
import { ConfirmDialog, DataTable } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	data?: PaginatedResponse<TechMonitorTaskDetail[]>
	isLoading: boolean
	onEditRow?: (row: TechMonitorTaskDetail) => void
	onDeleted?: () => void // <-- parent ro'yxatini yangilash uchun optional callback
}

// ---- helpers
const CellText = ({
	children,
	style,
	// center = false,
	strong = false,
	wrap = true
}: {
	// eslint-disable-next-line no-undef
	children: React.ReactNode
	style?: CSSProperties
	center?: boolean
	strong?: boolean
	wrap?: boolean
}) => (
	<div
		className={[
			strong ? 'font-semibold' : '',
			wrap ? 'leading-tight whitespace-normal' : 'truncate'
		].join(' ')}
		style={style}
	>
		{children}
	</div>
)

const formatPhone = (phone?: string) => {
	if (!phone) return '—'
	const d = phone.replace(/\D/g, '')
	if (d.length >= 12) {
		const cc = d.slice(0, 3)
		const op = d.slice(3, 5)
		const p1 = d.slice(5, 8)
		const p2 = d.slice(8, 10)
		const p3 = d.slice(10, 12)

		return `+${cc} ${op} ${p1} ${p2} ${p3}`
	}

	return phone
}

const formatDate = (iso?: string) => {
	if (!iso) return '—'
	const d = new Date(iso)
	if (Number.isNaN(d.getTime())) return '—'
	const dd = String(d.getDate()).padStart(2, '0')
	const mm = String(d.getMonth() + 1).padStart(2, '0')
	const yyyy = d.getFullYear()

	return `${dd}.${mm}.${yyyy}`
}

const statusColor = (s?: number) => {
	switch (s) {
		case TechMonitorTaskStatus.DONE :
			return 'bg-green-500'
		// case TechMonitorTaskStatus.FAILED:
		// 	return 'bg-red-500'
		case TechMonitorTaskStatus.WAITING :
		default:
			return 'bg-orange-400'
	}
}

const isDeadlineOverdue = (deadline?: string, status?: number) => {
	if (!deadline) return false
	const d = new Date(deadline).getTime()
	const now = Date.now()
	// Qizil sana: FAILED yoki WAITING  bo‘lib deadline o‘tgan

	return (
		status === TechMonitorTaskStatus.MISSED_DEADLINE  || (status === TechMonitorTaskStatus.WAITING  && d < now)
	)
}

const StatusBadge = ({ value }: { value?: number }) => (
	<div className='flex items-center gap-2'>
		<span className={`inline-block h-2.5 w-2.5 rounded-full ${statusColor(value)}`} />
		<span>{techMonitorStatusLabel(value)}</span>
	</div>
)

const Table = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	data,
	isLoading,
	onDeleted
}: Props) => {
	const { t } = useTranslation()
	// --- DELETE dialog state
	const [isDeleteOpen, setDeleteOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	const { mutate: mutateDelete, isPending: isDeleting } = useMutation({
		mutationKey: ['delete-tech-monitor-task'],
		mutationFn: (id: number) => TechService.deleteMonitorTask(id),
		async onSuccess() {
			onDeleted?.()
			toast.push(<Notification type='success' title={t('Задача удалена')} duration={2000} />, {
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
			setDeleteOpen(false)
			setDeleteId(null)
		}
	})


	const handleConfirmDelete = () => {
		if (deleteId != null) mutateDelete(deleteId)
	}

	const columns: ColumnDef<TechMonitorTaskDetail>[] = useMemo(
		() => [
			// №
			{
				header: '№',
				accessorKey: 'id',
				size: 60,
				cell: (props) => (
					<CellText center style={{ minWidth: props.column.getSize() - 16 }}>
						{props.row.original.id}
					</CellText>
				)
			},
			// ФИЛИАЛ (region)
			{
				header: t('Филиал'),
				accessorKey: 'region',
				size: 120,
				cell: (props) => (
					<CellText strong style={{ minWidth: props.column.getSize() - 16 }}>
						{props.row.original.region || '—'}
					</CellText>
				)
			},
			// СОТРУДНИК
			{
				header: t('Сотрудник'),
				accessorKey: 'employee',
				size: 180,
				cell: (props) => {
					const p = props.row.original.monitoring?.profile
					const full =
						[p?.last_name, p?.first_name, p?.middle_name].filter(Boolean).join(' ') ||
						props.row.original.employee || // fallback agar string kelgan bo‘lsa
						props.row.original.created_by || // yana bir fallback
						'—'

					return <CellText style={{ minWidth: props.column.getSize() - 16 }}>{full}</CellText>
				}
			},

			// КЛИЕНТ
			{
				header: t('Клиенты'),
				accessorKey: 'client',
				size: 240,
				cell: (props) => (
					<CellText style={{ minWidth: props.column.getSize() - 16 }}>
						{props.row.original.client || '—'}
					</CellText>
				)
			},
			// ТЕЛЕФОН
			{
				header: t('Телефон'),
				accessorKey: 'phone_number',
				size: 170,
				cell: (props) => (
					<CellText style={{ minWidth: props.column.getSize() - 16 }}>
						{formatPhone(props.row.original.phone_number)}
					</CellText>
				)
			},
			// ДАТА ВЫПОЛНЕНИЯ (deadline)
			{
				header: t('Дата выполнения'),
				accessorKey: 'deadline',
				size: 140,
				cell: (props) => {
					const { deadline, status } = props.row.original
					const text = formatDate(deadline)
					const danger = isDeadlineOverdue(deadline, status)

					return (
						<CellText style={{ minWidth: props.column.getSize() - 16 }}>
							<span className={danger ? 'font-semibold text-red-500' : ''}>{text}</span>
						</CellText>
					)
				}
			},
			{
				header: t('Статус'),
				accessorKey: 'status',
				size: 120,
				cell: ({ getValue, column }) => {
					const value = getValue<number | null>()

					return (
						<div style={{ minWidth: Math.max(180, column.getSize() - 16) }}>
							<StatusBadge value={value ?? undefined} />
						</div>
					)
				}
			},
			// КЕМ НАЗНАЧЕН (created_by)
			{
				header: t('КЕМ НАЗНАЧЕН'),
				accessorKey: 'created_by',
				size: 180,
				cell: (props) => (
					<CellText style={{ minWidth: props.column.getSize() - 16 }}>
						{props.row.original.created_by || '—'}
					</CellText>
				)
			}
		],
		[t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={data?.results || []}
				loading={isLoading || isDeleting}
				pagingData={{
					total: data?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
			/>

			<ConfirmDialog
				isOpen={isDeleteOpen}
				type='danger'
				title={t('Удалить задачу')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteOpen(false)}
				onRequestClose={() => setDeleteOpen(false)}
				onCancel={() => setDeleteOpen(false)}
				onConfirm={handleConfirmDelete}
			>
				<p>{t('Вы уверены, что хотите удалить эту задачу мониторинга? Это действие нельзя отменить.')}</p>
			</ConfirmDialog>
		</>
	)
}

export default Table
