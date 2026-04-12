import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentText, HiOutlineEye } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Branch,PaymentOverdueNotice, PaymentOverdueNoticeStatusEnum } from '@/@types/payment-notice.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, DataTable, type OnSortParam } from '@/components/shared'
import { Notification, toast, Tooltip } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { PaymentNoticeService } from '@/services/payment-notice.service'
import { formatPhone, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import CurrentRequestsView from '../../view/CurrentRequestsView'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	payment_notice?: PaginatedResponse<PaymentOverdueNotice[]>
	isLoading: boolean
}

type ProcessStatusDto = {
	order: number
	process_name:
		| 'filed_in_court'
		| 'court_decision_accepted'
		| 'transferred_to_mib'
		| 'executed'
		| 'executed_early'
		| 'court_rejected'
	process_name_ru: string
	process_name_uz: string
}

/* ---------- Kichik cell komponentlar ---------- */
const ActionColumn = ({
	onViewClick,
	style
}: {
	onViewClick: () => void
	style: CSSProperties
}) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onViewClick}>
					<HiOutlineEye />
				</span>
			</Tooltip>
		</div>
	)
}

const DocsColumn = ({ onDocsClick, style }: { onDocsClick: () => void; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	return (
		<div className='text-center text-lg' style={style}>
			<Tooltip title={t('Посмотреть')}>
				<span className={`cursor-pointer p-2 hover:${textTheme}`} onClick={onDocsClick}>
					<HiOutlineDocumentText size={18} />
				</span>
			</Tooltip>
		</div>
	)
}

/* ---------- Asosiy jadval ---------- */
const CurrentRequestsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	payment_notice,
	isLoading
}: Props) => {
	const { t } = useTranslation()
	const { i18n } = useTranslation()
	const lang = (i18n?.language as 'ru' | 'uz' | 'oz') || 'ru'
	const [isDrawerOpen, setIsDrawerOpen] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState<PaymentOverdueNotice | null>(null)

	// 1) Bitta normalize yordamchi:
	const norm = (v: unknown) => (v == null ? '' : String(v).toLowerCase())

	// 2) Hamma joyda SHU filterni ishlatamiz:
	const rowsAll = payment_notice?.results ?? []
	const rows = rowsAll.filter(
		(i) => norm(i.status) === norm(PaymentOverdueNoticeStatusEnum.PROCESSING)
	)

	// process_status (obyekt yoki kod) uchun palitra
	const statusPalette: Record<ProcessStatusDto['process_name'], { dot: string; text: string }> = {
		filed_in_court: { dot: 'bg-orange-500', text: 'text-orange-600' }, // Подано в суд
		court_decision_accepted: { dot: 'bg-yellow-500', text: 'text-yellow-600' }, // Принято судебное решение
		transferred_to_mib: { dot: 'bg-purple-500', text: 'text-purple-600' }, // Передано в МИБ
		executed: { dot: 'bg-green-500', text: 'text-green-600' }, // Исполнено
		executed_early: { dot: 'bg-green-500', text: 'text-green-600' }, // Исполнено досрочно
		court_rejected: { dot: 'bg-red-500', text: 'text-red-600' } // Суд отклонил
	}

	// process_status obyekt/kod bo‘lishi yoki null bo‘lishi mumkin — RU label + rangni qaytaramiz
	function pickProcessStatus(ps: unknown) {
		const isObj = typeof ps === 'object' && ps !== null
		const code = (isObj ? (ps as any).process_name : ps) as
			| ProcessStatusDto['process_name']
			| undefined
		const palette = code ? statusPalette[code] : undefined

		// Labelni backenddan olamiz (RU/UZ). OZ bo‘lsa ham hozircha UZ ni ishlatamiz.
		const label =
			(isObj &&
				((lang === 'ru' ? (ps as any).process_name_ru : (ps as any).process_name_uz) as
					| string
					| undefined)) ||
			undefined

		if (code || label) {
			return {
				label: label ?? String(code),
				dot: palette?.dot ?? 'bg-gray-300',
				text: palette?.text ?? 'text-gray-500'
			}
		}

		return null
	}

	const smsStatusMap: Record<string, { label: string; dot: string; text: string }> = {
		// confirmed: { label: 'Подтверждено', dot: 'bg-green-500', text: 'text-green-600' },
		confirmed: { label: t('Доставлено'), dot: 'bg-orange-500', text: 'text-orange-600' },
		read: { label: t('Прочитано'), dot: 'bg-green-500', text: 'text-green-600' },
		not_send: { label: t('Не доставлено'), dot: 'bg-red-500', text: 'text-red-600' },
		send: { label: t('Отправлено'), dot: 'bg-blue-500', text: 'text-blue-600' },
		pending: { label: t('В ожидании'), dot: 'bg-gray-400', text: 'text-gray-500' },
		failed: { label: t('Ошибка'), dot: 'bg-red-500', text: 'text-red-600' }
	}

	// PDF uchun mutation
	const { mutateAsync: mutateAsyncNotice } = useMutation({
		mutationKey: ['get overdue notice'],
		mutationFn: (id: number) =>
			PaymentNoticeService.getById<{ pdf_document?: string; pdf_url?: string }>(id),
		onError(error) {
			const message = errorCatch(error)
			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const moneyMeta = { meta: { thClassName: 'text-right', tdClassName: 'text-right tabular-nums' } }

	const regionLocaleMap = {
		ru: 'name_ru',
		uz: 'name_uzl', // latin
		oz: 'name_uz'   // cyrill
	} as const

	const getRegionName = (branch: Branch | null) => {
		if (!branch?.region) return '-'

		const key = regionLocaleMap[lang] || 'name_ru'

		return branch.region[key] || '-'
	}

	const columns: ColumnDef<PaymentOverdueNotice>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 100,
				enableSorting: false,
				cell: (props) => (
					<div
						className='text-center font-semibold'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Наименование'),
				accessorKey: 'company_name',
				size: 350,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.company_name}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch',
				size: 250,
				cell: (props) => {
					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{getRegionName(props.row.original.branch)}
						</div>
					)
				}
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 120,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'contract_code',
				size: 150,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract_code}
					</div>
				)
			},
			{
				header: t('№талабнома'),
				accessorKey: 'code',
				size: 150,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.code}</div>
				)
			},
			{
				header: t('Дата оплаты'),
				accessorKey: 'date_of_payment',
				size: 200,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.date_of_payment
							? new Date(props.row.original.date_of_payment).toLocaleDateString()
							: '-'}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'process_status',
				size: 250,
				cell: (props) => {
					const { process_status } = props.row.original
					const ps = pickProcessStatus(process_status as any)

					return ps ? (
						<div
							className='flex items-center gap-2'
							style={{ minWidth: props.column.getSize() - 48 }}
						>
							<span className={`inline-block h-2.5 w-2.5 rounded-full ${ps.dot}`} />
							<span className={`font-medium ${ps.text}`}>{ps.label}</span>
						</div>
					) : (
						<span className='text-gray-500'>—</span>
					)
				}
			},
			{
				header: t('МЕСЯЦ'),
				accessorKey: 'month_overdue',
				size: 120,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.month_overdue}
					</div>
				)
			},
			// {
			// 	header: 'ДАТА ОТЛОЖЕННОСТИ',
			// 	accessorKey: 'delayed_time',
			// 	size: 200,
			// 	cell: (props) => (
			// 		<div style={{ minWidth: props.column.getSize() - 48 }}>
			// 			{props.row.original.delayed_time
			// 				? new Date(props.row.original.delayed_time).toLocaleString()
			// 				: '-'}
			// 		</div>
			// 	)
			// },
			{
				header: t('Дни в месяце'),
				accessorKey: 'days_in_the_month',
				size: 180,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.days_in_the_month}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Основной долг')}</span>,
				accessorKey: 'main_amount_of_payment',
				size: 200,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.main_amount_of_payment)}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Общая сумма')}</span>,
				accessorKey: 'total_amount',
				size: 200,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: () => <span className='ml-auto'>{t('Просрочка')}</span>,
				accessorKey: 'overdue_amount',
				size: 180,
				sortable: true,
				...moneyMeta,
				cell: (props) => (
					<div
						className='text-right text-red-500'
						style={{ minWidth: props.column.getSize() - 48 }}
					>
						{formatPrice(props.row.original.overdue_amount)}
					</div>
				)
			},
			{
				header: t('Талабнома'),
				accessorKey: 'notice',
				size: 150,
				enableSorting: false,
				cell: (props) => {
					const onDocs = async () => {
						const { data } = await mutateAsyncNotice(props.row.original.id)
						const url = data?.pdf_document ?? data?.pdf_url
						if (!url) {
							toast.push(<Notification type='danger' title='Pdf не найден' duration={2000} />, {
								placement: 'top-center'
							})

							return
						}
						window.open(url, '_blank', 'noopener,noreferrer')
					}

					return (
						<DocsColumn onDocsClick={onDocs} style={{ minWidth: props.column.getSize() - 48 }} />
					)
				}
			},
			{
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING, UserRoleTextEnum.SALES, UserRoleTextEnum.JURIST],
				cell: (props) => (
					<div className='capitalize' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			},
			{
				header: t('СМС Статус'),
				accessorKey: 'sms_status', // << to‘g‘rilandi
				size: 150,
				cell: (props) => {
					const s = smsStatusMap[props.row.original.sms_status as keyof typeof smsStatusMap]

					return s ? (
						<div
							className='flex items-center gap-2'
							style={{ minWidth: props.column.getSize() - 48 }}
						>
							<span className={`inline-block h-2.5 w-2.5 rounded-full ${s.dot}`} />
							<span className={`font-medium ${s.text}`}>{s.label}</span>
						</div>
					) : (
						<span className='text-gray-500'>—</span>
					)
				}
			},
			{
				header: t('Действие'),
				id: 'actions',
				size: 140,
				meta: { className: 'sticky right-0 bg-white dark:bg-gray-900 z-10' },
				cell: (props) => {
					const onView = () => {
						const selected = rows.find((c) => c.id === props.row.original.id)
						if (!selected) return
						setSelectedRequest(selected)
						setIsDrawerOpen(true)
					}

					return (
						<ActionColumn onViewClick={onView} style={{ minWidth: props.column.getSize() - 48 }} />
					)
				}
			}
		],
		[rows, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				data={rows}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: payment_notice?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{selectedRequest && (
				<CurrentRequestsView
					request={selectedRequest}
					isOpen={isDrawerOpen}
					onClose={() => {
						setIsDrawerOpen(false)
						setSelectedRequest(null)
					}}
					onRequestClose={() => {
						setIsDrawerOpen(false)
						setSelectedRequest(null)
					}}
				/>
			)}
		</>
	)
}

export default CurrentRequestsTable
