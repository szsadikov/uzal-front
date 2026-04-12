import { CSSProperties, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineDocumentText, HiOutlineDotsVertical } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import classNames from 'classnames'
import { PaginatedResponse, TableQueries } from '@/@types/common'
import { Contract, ContractStatusEnum, NewContract } from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import { type ColumnDef, ConfirmDialog, DataTable, type OnSortParam } from '@/components/shared'
import { Badge, Dropdown, Notification, toast, Tooltip } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { useAppSelector } from '@/store'
import { formatDate, formatMonths, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import ChangeClientDrawer from './ChangeClientDrawer'
import ReplaceTechDrawer from './ReplaceTechDrawer'

type Props = {
	params: TableQueries
	onPageChange: (page: number) => void
	onSizeChange: (size: number) => void
	onSortingChange: (sort: OnSortParam) => void
	contracts?: PaginatedResponse<NewContract[]>
	isLoading?: boolean
	refetch?: () => Promise<unknown>
}

const DocsColumn = ({ row, style }: { row: NewContract; style: CSSProperties }) => {
	const { textTheme } = useThemeClass()
	const { t } = useTranslation()

	const onDocsClick = () => {
		window.open(row.contract.pdf_document, '_blank')
	}

	return (
		<div className='flex justify-center text-lg' style={style}>
			<Tooltip title={row.contract.pdf_document ? t('Посмотреть') : t('Нет документа')}>
				<span
					className={classNames(`cursor-pointer p-2 hover:${textTheme}`, {
						'pointer-events-none opacity-40': !row.contract.pdf_document
					})}
					onClick={onDocsClick}
				>
					<HiOutlineDocumentText size={18} />
				</span>
			</Tooltip>
		</div>
	)
}

const ActionColumn = ({
	row,
	index,
	onDropdownOpen,
	onReplaceTech,
	onRefundTech,
	onCancel,
	onChangeClient,
	// onEquipmentIssuePending,
	onEquipmentIssue,
	style
}: {
	row: NewContract
	index: number
	onDropdownOpen?: () => void
	onReplaceTech: () => void
	onRefundTech: () => void
	onCancel: () => void
	onChangeClient: () => void
	// onEquipmentIssuePending: () => void
	onEquipmentIssue: () => void
	style: CSSProperties
}) => {
	const { t } = useTranslation()

	const { textTheme } = useThemeClass()

	const isLasterRow = [8, 9, 10].includes(index + 1)

	return (
		<Dropdown
			onOpen={onDropdownOpen}
			className='flex justify-center text-lg'
			menuStyle={{ minWidth: 167 }}
			placement={isLasterRow ? 'top-end' : 'bottom-end'}
			style={style}
			renderTitle={
				<span className={`inline-block cursor-pointer p-2 hover:${textTheme}`}>
					<HiOutlineDotsVertical size={16} />
				</span>
			}
			toggleClassName='block w-max mx-auto'
		>
			<Dropdown.Item
				className={classNames('px-3 py-2', {
					'pointer-events-none opacity-60': [
						ContractStatusEnum.TECH_GIVEN,
						ContractStatusEnum.CANCELED,
						ContractStatusEnum.TECH_RETURNED,
						ContractStatusEnum.PENDING_TRANSFER
					].includes(row.contract.status)
				})}
				onClick={onReplaceTech}
			>
				{t('Замена техники')}
			</Dropdown.Item>
			<Dropdown.Item
				className={classNames('px-3 py-2', {
					'pointer-events-none opacity-60': [
						ContractStatusEnum.TECH_GIVEN,
						ContractStatusEnum.CANCELED,
						ContractStatusEnum.TECH_RETURNED,
						ContractStatusEnum.PENDING_TRANSFER
					].includes(row.contract.status)
				})}
				onClick={onRefundTech}
			>
				{t('Возврат средств')}
			</Dropdown.Item>
			<Dropdown.Item
				className={classNames('px-3 py-2', {
					'pointer-events-none opacity-60': [
						ContractStatusEnum.TECH_GIVEN,
						ContractStatusEnum.CANCELED,
						ContractStatusEnum.TECH_RETURNED
					].includes(row.contract.status)
				})}
				onClick={onCancel}
			>
				{t('Отменить')}
			</Dropdown.Item>
			<Dropdown.Item
				className={classNames('px-3 py-2', {
					'pointer-events-none opacity-60': [
						ContractStatusEnum.TECH_GIVEN,
						ContractStatusEnum.CANCELED,
						ContractStatusEnum.TECH_RETURNED,
						ContractStatusEnum.PENDING_TRANSFER
					].includes(row.contract.status)
				})}
				onClick={onChangeClient}
			>
				{t('Переуступка')}
			</Dropdown.Item>
			{/*<Dropdown.Item className='px-3 py-2' onClick={onEquipmentIssuePending}>*/}
			{/*	Ожидание выдачи техники*/}
			{/*</Dropdown.Item>*/}
			<Dropdown.Item
				className={classNames('px-3 py-2', {
					'pointer-events-none opacity-60': [
						ContractStatusEnum.TECH_GIVEN,
						ContractStatusEnum.CANCELED,
						ContractStatusEnum.TECH_RETURNED,
						ContractStatusEnum.PENDING_TRANSFER
					].includes(row.contract.status)
				})}
				onClick={onEquipmentIssue}
			>
				{t('Выдача техники')}
			</Dropdown.Item>
		</Dropdown>
	)
}

const NewContractsTable = ({
	params,
	onPageChange,
	onSizeChange,
	onSortingChange,
	contracts,
	isLoading,
	refetch
}: Props) => {
	const { t } = useTranslation()

	const { user } = useAppSelector((state) => state.auth.session)

	const [isReplaceDrawerOpen, setReplaceDrawerOpen] = useState(false)
	const [isRefundDialogOpen, setRefundDialogOpen] = useState(false)
	const [isCancelDialogOpen, setCancelDialogIsOpen] = useState(false)
	const [isChangeClientDrawerOpen, setChangeClientDrawerOpen] = useState(false)
	const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
	const [refundId, setRefundId] = useState<number | null>(null)
	const [cancelId, setCancelId] = useState<number | null>(null)

	const { mutateAsync: mutateAsyncRefundTech } = useMutation({
		mutationKey: ['update refund'],
		mutationFn: (id: number) => ContractService.updateRefundTech(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(
				<Notification title={t('Успешно возвращено средства')} type='success' duration={2500} />,
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
		},
		onSettled() {
			setRefundDialogOpen(false)
		}
	})

	const { mutateAsync: mutateAsyncCancel } = useMutation({
		mutationKey: ['update cancel'],
		mutationFn: (id: number) => ContractService.updateCancel(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification title={t('Отменено')} type='success' duration={2500} />, {
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
			setCancelDialogIsOpen(false)
		}
	})

	const { mutateAsync: mutateAsyncEquipmentIssue } = useMutation({
		mutationKey: ['update equipment issue'],
		mutationFn: (id: number) => ContractService.updateEquipmentIssue<Contract>(id),
		async onSuccess() {
			if (refetch) await refetch()

			toast.push(<Notification title={t('Успешно')} type='success' duration={2500} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const { mutateAsync: mutateAsyncContract } = useMutation({
		mutationKey: ['get contract'],
		mutationFn: (id: number) => ContractService.getContractById<Contract>(id),
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onRefundTechConfirm = async () => {
		if (refundId) await mutateAsyncRefundTech(refundId)
	}

	const onCancelConfirm = async () => {
		if (cancelId) await mutateAsyncCancel(cancelId)
	}

	const columns: ColumnDef<NewContract>[] = useMemo(
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
						{props.row.original.contract.id}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch_region',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.branch_region}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'status',
				size: 260,
				sortable: true,
				cell: (props) => {
					switch (props.row.original.contract.status) {
						case ContractStatusEnum.PENDING_TRANSFER:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-indigo-500' />
									<span className='text-indigo-500'>{t('Ожидание оплаты')}</span>
								</div>
							)
						case ContractStatusEnum.DEPOSIT_PAID:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-orange-500' />
									<span className='text-orange-500'>{t('Ожидание выдачи техники')}</span>
								</div>
							)
						case ContractStatusEnum.TECH_GIVEN:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-green-500' />
									<span className='text-green-500'>{t('Выдача техники')}</span>
								</div>
							)
						case ContractStatusEnum.CANCELED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Отменен')}</span>
								</div>
							)
						case ContractStatusEnum.CLIENT_CHANGED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-yellow-500' />
									<span className='text-yellow-500'>{t('Переуступка')}</span>
								</div>
							)
						case ContractStatusEnum.TECH_RETURNED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Возврат средств')}</span>
								</div>
							)
					}
				}
			},
			{
				header: t('Наименование'),
				accessorKey: 'client_company_name',
				size: 260,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.contract.client_company_name}>
							<span className='truncate-2'>{props.row.original.contract.client_company_name}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.stir}
					</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'tech_model',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.tech_model}
					</div>
				)
			},
			{
				header: t('№Заявки'),
				accessorKey: 'contract_application_id',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.contract_application
							? props.row.original.contract.contract_application.id
							: '-'}
					</div>
				)
			},
			{
				header: t('Дата заявки'),
				accessorKey: 'contract_application_date',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.contract_application
							? formatDate(props.row.original.contract.contract_application.application_date)
							: '-'}
					</div>
				)
			},
			{
				header: t('№Договора'),
				accessorKey: 'code',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.contract.code}
					</div>
				)
			},
			{
				header: t('Дата договора'),
				accessorKey: 'contract_date',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.contract.contract_date)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Сумма с GPS')}</div>,
				accessorKey: 'price_with_gps',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.price_with_gps)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('%Аванса')}</div>,
				accessorKey: 'deposit_percentage',
				size: 160,
				sortable: true,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.deposit_percentage)}%
					</div>
				)
			},
			{
				header: t('Срок договора'),
				accessorKey: 'rent_period',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatMonths(props.row.original.contract.rent_period)}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Аванс сумма')}</div>,
				accessorKey: 'deposit',
				size: 170,
				sortable: true,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.contract.deposit)}
					</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Аванс факт')}</div>,
				accessorKey: 'deposit_fact',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div className='text-center' style={{ minWidth: props.column.getSize() - 48 }}>
						-
					</div>
				)
			},
			{
				header: t('Очередь'),
				accessorKey: 'position',
				size: 140,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.position}</div>
				)
			},
			{
				header: () => <div className='text-center'>{t('Документы')}</div>,
				id: 'docs',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<DocsColumn row={props.row.original} style={{ minWidth: props.column.getSize() - 48 }} />
				)
			},
			{
				header: () => <div className='text-center'>{t('Действие')}</div>,
				id: 'actions',
				size: 140,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING],
				cell: (props) => {
					const onReplaceTech = async () => {
						await mutateAsyncContract(props.row.original.contract.id).then(({ data }) => {
							setReplaceDrawerOpen(true)
							setSelectedContract(data)
						})
					}

					const onRefundTech = (id: number) => {
						setRefundDialogOpen(true)
						setRefundId(id)
					}

					const onCancel = (id: number) => {
						setCancelDialogIsOpen(true)
						setCancelId(id)
					}

					const onChangeClient = async () => {
						await mutateAsyncContract(props.row.original.contract.id).then(({ data }) => {
							setChangeClientDrawerOpen(true)
							setSelectedContract(data)
						})
					}

					// const onEquipmentIssuePending = async () => {
					// 	await mutateAsyncEquipmentIssue({
					// 		id: props.row.original.contract.id,
					// 		data: {
					// 			status: ContractStatusEnum.DEPOSIT_PAID
					// 		}
					// 	})
					// }

					const onEquipmentIssue = async () => {
						await mutateAsyncEquipmentIssue(props.row.original.contract.id)
					}

					return (
						<ActionColumn
							style={{ minWidth: props.column.getSize() - 48 }}
							row={props.row.original}
							index={props.row.index}
							onReplaceTech={onReplaceTech}
							onRefundTech={() => onRefundTech(props.row.original.contract.id)}
							onCancel={() => onCancel(props.row.original.contract.id)}
							onChangeClient={onChangeClient}
							// onEquipmentIssuePending={onEquipmentIssuePending}
							onEquipmentIssue={onEquipmentIssue}
						/>
					)
				}
			}
		],
		[contracts, t]
	)

	return (
		<>
			<DataTable
				columns={columns}
				userRole={user.role}
				data={contracts?.results || []}
				skeletonAvatarColumns={[0]}
				skeletonAvatarProps={{ className: 'rounded-md' }}
				loading={isLoading}
				pagingData={{
					total: contracts?.count || 0,
					pageIndex: params.page,
					pageSize: params.size
				}}
				onPaginationChange={onPageChange}
				onSelectChange={onSizeChange}
				onSort={onSortingChange}
			/>

			{selectedContract && (
				<ReplaceTechDrawer
					contract={selectedContract}
					isOpen={isReplaceDrawerOpen}
					setIsOpen={setReplaceDrawerOpen}
					refetch={refetch}
				/>
			)}

			{selectedContract && (
				<ChangeClientDrawer
					contract={selectedContract}
					isOpen={isChangeClientDrawerOpen}
					setIsOpen={setChangeClientDrawerOpen}
					refetch={refetch}
				/>
			)}

			<ConfirmDialog
				isOpen={isRefundDialogOpen}
				type='success'
				title={t('Вы точно хотите возврат средств?')}
				cancelText={t('Отложить')}
				confirmText={t('Возврат')}
				confirmButtonColor='indigo-600'
				onClose={() => setRefundDialogOpen(false)}
				onRequestClose={() => setRefundDialogOpen(false)}
				onCancel={() => setRefundDialogOpen(false)}
				onConfirm={onRefundTechConfirm}
			>
				<p>
					{t('Вы уверены, что хотите сохранить этот договор? Все записи, связанные с этим продуктом,\n' +
						'\t\t\t\t\tтакже будут удалены. Это действие нельзя отменить.')}
				</p>
			</ConfirmDialog>

			<ConfirmDialog
				isOpen={isCancelDialogOpen}
				type='danger'
				title={t('Вы точно хотите отменить?')}
				cancelText={t('Отмена')}
				confirmText={t('Да')}
				confirmButtonColor='red-600'
				onClose={() => setCancelDialogIsOpen(false)}
				onRequestClose={() => setCancelDialogIsOpen(false)}
				onCancel={() => setCancelDialogIsOpen(false)}
				onConfirm={onCancelConfirm}
			>
				<p>
					{t('Вы уверены, что хотите удалить этот продукт? Все записи, связанные с этим продуктом, также\n' +
						'\t\t\t\t\tбудут удалены. Это действие нельзя отменить.')}
				</p>
			</ConfirmDialog>
		</>
	)
}

export default NewContractsTable
