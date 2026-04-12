// src/pages/pkm/components/PKMTable.tsx (sizdagi yo'lga moslang)
import { CSSProperties, MouseEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next' // ⬅️ i18n
import { HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { PKM } from '@/@types/dataset.types'
import { type ColumnDef, ConfirmDialog, DataTable } from '@/components/shared'
import { Notification, Switcher, toast } from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import useThemeClass from '@/utils/hooks/useThemeClass'

type Props = {
	data: PKM[]
	total: number
	page: number
	size: number
	setPage: (p: number) => void
	setSize: (s: number) => void
	isLoading: boolean
	onEdit: (row: PKM) => void
}

const stop = (e: MouseEvent) => e.stopPropagation()

const ActionColumn = ({
	row,
	style,
	onEdit,
	onDelete,
	onToggle,
	toggleLoading
}: {
	row: PKM
	style?: CSSProperties
	onEdit?: (row: PKM) => void
	onDelete?: (row: PKM) => void
	onToggle?: (row: PKM, value: boolean) => void
	toggleLoading?: boolean
}) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	const handleSwitchChange = (v: boolean | any) => {
		const next = v && v.target !== undefined ? !!v.target.checked : !row.is_active
		onToggle?.(row, next)
	}

	return (
		<div className='justify-left flex items-center gap-1 text-lg' style={style}>
			<span
				className={`cursor-pointer p-2 hover:${textTheme}`}
				onClick={(e) => {
					stop(e)
					onEdit?.(row)
				}}
				title={t('Редактировать')}
				aria-label={t('Редактировать')}
			>
				<HiOutlinePencil />
			</span>

			<span
				className='cursor-pointer p-2 hover:text-red-500'
				onClick={(e) => {
					stop(e)
					onDelete?.(row)
				}}
				title={t('Удалить')}
				aria-label={t('Удалить')}
			>
				<HiOutlineTrash />
			</span>

			<div onClick={stop} className='inline-flex items-center pl-1'>
				<Switcher checked={row.is_active} onChange={handleSwitchChange} disabled={toggleLoading} />
			</div>
		</div>
	)
}

const formatDate = (s?: string) => (!s ? '-' : new Date(s).toLocaleString('ru-RU'))

const PKMTable = ({ data, total, page, size, setPage, setSize, isLoading, onEdit }: Props) => {
	const { t } = useTranslation() // ⬅️ i18n
	const qc = useQueryClient()
	const [rows, setRows] = useState<PKM[]>([])
	const [pendingToggleId, setPendingToggleId] = useState<number | null>(null)

	const [isDeleteDialogOpen, setDeleteDialogIsOpen] = useState(false)
	const [deleteId, setDeleteId] = useState<number | null>(null)

	useEffect(() => {
		setRows(data ?? [])
	}, [data])

	const { mutateAsync: delPKM } = useMutation({
		mutationFn: (id: number) => DatasetService.deletePKM(id),
		onMutate: async (id) => {
			const prev = rows
			setRows((old) => old.filter((r) => r.id !== id))
			return { prev }
		},
		onError: (_e, _id, ctx) => {
			if (ctx?.prev) setRows(ctx.prev)
			toast.push(<Notification type='danger' title={t('Не удалось удалить')} />, {
				placement: 'top-center'
			})
		},
		onSuccess: () => {
			toast.push(<Notification type='success' title={t('Удалено')} />, { placement: 'top-center' })
		},
		onSettled: () => {
			setDeleteDialogIsOpen(false)
			setDeleteId(null)
			qc.invalidateQueries({
				predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes('pkm')
			})
		}
	})

	const { mutateAsync: doToggleRequest } = useMutation({
		mutationFn: async ({
			id,
			is_active,
			rowSnapshot
		}: {
			id: number
			is_active: boolean
			rowSnapshot: PKM
		}) => {
			try {
				return await DatasetService.patchPKM(id, { is_active })
			} catch (e: any) {
				const status = e?.response?.status
				if (status === 400 || status === 422) {
					let full = rowSnapshot as any
					if (full.top_content === undefined || full.bottom_content === undefined) {
						try {
							const res = await DatasetService.getPKM(id)
							full = res?.data ?? full
						} catch {
							/* ignore */
						}
					}
					const payload = {
						name: full.name,
						investor: full.investor,
						top_content: full.top_content ?? ' ',
						bottom_content: full.bottom_content ?? ' ',
						is_active
					}

					return await DatasetService.patchPKM(id, payload)
				}
				throw e
			}
		}
	})

	const onToggle = async (row: PKM, next: boolean) => {
		setPendingToggleId(row.id)
		const prev = rows
		setRows((old) => old.map((r) => (r.id === row.id ? { ...r, is_active: next } : r)))

		try {
			await doToggleRequest({ id: row.id, is_active: next, rowSnapshot: row })
		} catch {
			setRows(prev)
			toast.push(<Notification type='danger' title={t('Не удалось обновить')} />, {
				placement: 'top-center'
			})
		} finally {
			setPendingToggleId(null)
			qc.invalidateQueries({
				predicate: (q) => Array.isArray(q.queryKey) && String(q.queryKey[0]).includes('pkm')
			})
		}
	}

	const onDeleteClick = (row: PKM) => {
		setDeleteDialogIsOpen(true)
		setDeleteId(row.id)
	}
	const onDeleteConfirm = () => {
		if (deleteId) delPKM(deleteId)
	}

	const columns: ColumnDef<PKM>[] = useMemo(
		() => [
			{
				header: 'ID',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('НАЗВАНИЕ ПКМ'),
				accessorKey: 'name',
				size: 280,
				enableSorting: false,
				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.name}
					</div>
				)
			},
			{
				header: t('ДАТА ДОБАВЛЕНИЕ'),
				accessorKey: 'created_at',
				size: 220,
				enableSorting: false,
				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.created_at)}
					</div>
				)
			},
			{
				header: t('ИНВЕСТОР'),
				accessorKey: 'investor',
				size: 240,
				enableSorting: false,
				cell: (props) => (
					<div className='text-left' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.investor}
					</div>
				)
			},
			{
				header: t('ДЕЙСТВИЕ'),
				id: 'actions',
				size: 160,
				enableSorting: false,
				meta: {
					// sticky faqat sm+ ekranlarda bo‘lsin; mobilda oddiy keltiriladi
					thClassName: 'sm:sticky sm:right-0 sm:z-[5]',
					tdClassName: 'sm:sticky sm:right-0',
					thStyle: { textAlign: 'center', width: '80px' },
					tdStyle: { textAlign: 'center', width: '80px' }
				},
				cell: (props) => (
					<ActionColumn
						row={props.row.original}
						style={{ minWidth: props.column.getSize() - 48 }}
						onEdit={onEdit}
						onDelete={onDeleteClick}
						onToggle={onToggle}
						toggleLoading={pendingToggleId === props.row.original.id}
					/>
				)
			}
		],
		[onEdit, pendingToggleId, rows, t] // ⬅️ t qo'shildi
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={rows}
				loading={isLoading}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				isPagination
				pagingData={{ total, pageIndex: page, pageSize: size }}
				onPaginationChange={setPage}
				onSelectChange={setSize}
			/>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				type='danger'
				title={t('Удалить ПКМ')}
				cancelText={t('Отменить')}
				confirmText={t('Удалить')}
				confirmButtonColor='red-600'
				onClose={() => setDeleteDialogIsOpen(false)}
				onRequestClose={() => setDeleteDialogIsOpen(false)}
				onCancel={() => setDeleteDialogIsOpen(false)}
				onConfirm={onDeleteConfirm}
			>
				<p>
					{t(
						'Вы уверены, что хотите удалить эту запись ПКМ? Связанные данные также могут быть удалены. Это действие не может быть отменено.'
					)}
				</p>
			</ConfirmDialog>
		</>
	)
}

export default PKMTable
