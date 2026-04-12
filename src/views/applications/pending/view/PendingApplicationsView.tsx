import { Fragment, useMemo, useState } from 'react'
import {
	HiCheck,
	HiEye,
	HiOutlineCalendar,
	HiOutlineDuplicate,
	HiOutlineUsers
} from 'react-icons/hi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import {
	ContractApplication,
	ContractApplicationStatusEnum,
	ContractApplicationVotingStatusEnum
} from '@/@types/contract.types'
import { UserRoleTextEnum } from '@/@types/user.types'
import {
	AdaptableCard,
	type ColumnDef,
	ConfirmDialog,
	DataTable,
	IconText
} from '@/components/shared'
import {
	Avatar,
	Badge,
	Button,
	Card,
	FormItem,
	Input,
	Notification,
	Skeleton,
	Tabs,
	Tag,
	Timeline,
	toast,
	Tooltip
} from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { useAppSelector } from '@/store'
import { formatDate, formatPhone, formatPrice, userRoleTextToName } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import PendingApplicationsViewTools from './components/PendingApplicationsViewTools'
import { useTranslation } from 'react-i18next'

const { TabNav, TabList, TabContent } = Tabs

type TabType = 'Details' | 'Files' | 'Comment' | 'Votes'

type FormModel = Pick<ContractApplication, 'voting_status'> & {
	comment?: string
}

const VotingStatus = ({ status }: { status: ContractApplicationVotingStatusEnum }) => {
	const { t } = useTranslation()

	switch (status) {
		case ContractApplicationVotingStatusEnum.NEW:
			return (
				<IconText className='mb-4 text-indigo-500' icon={<HiCheck className='text-lg' />}>
					<strong className='font-semibold'>{t('Новое')}</strong>
				</IconText>
			)
		case ContractApplicationVotingStatusEnum.IN_PROGRESS:
			return (
				<IconText className='mb-4 text-orange-500' icon={<HiCheck className='text-lg' />}>
					<strong className='font-semibold'>{t('В процессе')}</strong>
				</IconText>
			)
		case ContractApplicationVotingStatusEnum.APPROVED:
			return (
				<IconText className='mb-4 text-green-500' icon={<HiCheck className='text-lg' />}>
					<strong className='font-semibold'>{t('Согласовано')}</strong>
				</IconText>
			)
		case ContractApplicationVotingStatusEnum.REJECTED:
			return (
				<IconText className='mb-4 text-red-500' icon={<HiCheck className='text-lg' />}>
					<strong className='font-semibold'>{t('Отказано')}</strong>
				</IconText>
			)
	}
}

const VotingStatusTag = ({ status }: { status: ContractApplicationVotingStatusEnum }) => {
	const { t } = useTranslation()

	switch (status) {
		case ContractApplicationVotingStatusEnum.APPROVED:
			return (
				<Tag prefix className='mr-2 rtl:ml-2' prefixClass='bg-indigo-500'>
					{t('Подтвердить')}
				</Tag>
			)
		case ContractApplicationVotingStatusEnum.REJECTED:
			return (
				<Tag prefix className='mr-2 rtl:ml-2' prefixClass='bg-red-500'>
					{t('Отказать')}
				</Tag>
			)
		default:
			return (
				<Tag prefix className='mr-2 rtl:ml-2' prefixClass='bg-orange-500'>
					{t('Не голосовал')}
				</Tag>
			)
	}
}

const PendingApplicationsView = () => {
	const { t } = useTranslation()

	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const { textTheme } = useThemeClass()
	const { user } = useAppSelector((state) => state.auth.session)

	const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
	const [tab, setTab] = useState<TabType>('Details')
	const [rejectComment, setRejectComment] = useState('')

	const { data: application, isLoading } = useQuery({
		queryKey: ['get application', id],
		queryFn: () => ContractService.getApplicationById<ContractApplication>(Number(id)),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update votes by application', id],
		mutationFn: (data: FormModel) =>
			ContractService.updateVotesByApplicationId<ContractApplication, FormModel>(Number(id), data),
		async onSuccess() {
			await navigate('/applications/pending')
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const {
		approvedVotingStatusCount,
		rejectedVotingStatusCount,
		newVotingStatusCount,
		inProgressVotingStatusCount
	} = application?.votes.reduce(
		(acc, vote) => {
			if (vote.voting_status === ContractApplicationVotingStatusEnum.APPROVED)
				acc.approvedVotingStatusCount++

			if (vote.voting_status === ContractApplicationVotingStatusEnum.REJECTED)
				acc.rejectedVotingStatusCount++

			if (vote.voting_status === ContractApplicationVotingStatusEnum.NEW) acc.newVotingStatusCount++

			if (vote.voting_status === ContractApplicationVotingStatusEnum.IN_PROGRESS)
				acc.inProgressVotingStatusCount++

			return acc
		},
		{
			approvedVotingStatusCount: 0,
			rejectedVotingStatusCount: 0,
			newVotingStatusCount: 0,
			inProgressVotingStatusCount: 0
		}
	) ?? {
		approvedVotingStatusCount: 0,
		rejectedVotingStatusCount: 0,
		newVotingStatusCount: 0,
		inProgressVotingStatusCount: 0
	}

	const columns: ColumnDef<ContractApplication>[] = useMemo(
		() => [
			{
				header: '№',
				accessorKey: 'id',
				size: 80,
				enableSorting: false,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.id}
					</div>
				)
			},
			{
				header: t('Филиал'),
				accessorKey: 'branch',
				size: 190,
				sortable: true,
				cell: (props) => (
					<div className='font-semibold' style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.branch ? props.row.original.branch.name : '-'}
					</div>
				)
			},
			{
				header: t('Организация'),
				accessorKey: 'company_name',
				size: 290,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						<Tooltip title={props.row.original.company_name}>
							<span className='truncate-2'>{props.row.original.company_name}</span>
						</Tooltip>
					</div>
				)
			},
			{
				header: t('ИНН'),
				accessorKey: 'stir',
				size: 170,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>{props.row.original.stir}</div>
				)
			},
			{
				header: t('Техника'),
				accessorKey: 'tech',
				size: 200,
				sortable: true,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{props.row.original.tech?.model_name_ru ?? '-'}
					</div>
				)
			},
			{
				header: () => <div className='text-right'>{t('Сумма')}</div>,
				accessorKey: 'total_amount',
				size: 160,
				enableSorting: false,
				cell: (props) => (
					<div className='text-right' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPrice(props.row.original.total_amount)}
					</div>
				)
			},
			{
				header: t('Номер телефона'),
				accessorKey: 'phone_number',
				size: 200,
				enableSorting: false,
				authority: [UserRoleTextEnum.MARKETING],
				cell: (props) => (
					<div className='capitalize' style={{ minWidth: props.column.getSize() - 48 }}>
						{formatPhone(props.row.original.phone_number)}
					</div>
				)
			},
			{
				header: t('Статус'),
				accessorKey: 'status',
				size: 200,
				sortable: true,
				cell: (props) => {
					switch (props.row.original.status) {
						case ContractApplicationStatusEnum.NEW:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-indigo-500' />
									<span className='text-indigo-500'>{t('Новое')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.ASSIGNED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-orange-500' />
									<span className='text-orange-500'>{t('Назначен')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.DOCUMENT_GATHERING:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-yellow-500' />
									<span className='text-yellow-500'>{t('Сбор документов')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.IN_COMMISSION:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-purple-500' />
									<span className='text-purple-500'>{t('Комиссия')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.REJECTED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-red-500' />
									<span className='text-red-500'>{t('Отказано')}</span>
								</div>
							)
						case ContractApplicationStatusEnum.CONTRACT_CREATED:
							return (
								<div
									className='flex items-center gap-2'
									style={{ minWidth: props.column.getSize() - 48 }}
								>
									<Badge className='bg-green-500' />
									<span className='text-green-500'>{t('Составлен договор')}</span>
								</div>
							)
					}
				}
			},
			{
				header: t('Исполнитель'),
				accessorKey: 'sales',
				size: 240,
				sortable: true,
				cell: (props) => {
					const { sales } = props.row.original

					return (
						<div style={{ minWidth: props.column.getSize() - 48 }}>
							{sales
								? `${sales.profile.first_name} ${sales.profile.last_name} ${sales.profile.middle_name}`
								: '-'}
						</div>
					)
				}
			},
			{
				header: t('Дата'),
				accessorKey: 'application_date',
				size: 140,
				enableSorting: false,
				cell: (props) => (
					<div style={{ minWidth: props.column.getSize() - 48 }}>
						{formatDate(props.row.original.application_date)}
					</div>
				)
			}
		],
		[application, t]
	)

	const handleCopyClick = async (text = '') => {
		await navigator.clipboard.writeText(text).then(() => {
			toast.push(<Notification title={t('Копировано')} type='success' duration={1000} />, {
				placement: 'top-center'
			})
		})
	}

	const onApprove = async () => {
		await mutateAsyncUpdate({ voting_status: ContractApplicationVotingStatusEnum.APPROVED }).then(
			() => {
				toast.push(<Notification title={t('Подтверждено')} type='success' duration={2500} />, {
					placement: 'top-center'
				})
			}
		)
	}

	const onReject = async () => {
		console.log('rejectComment', rejectComment)

		await mutateAsyncUpdate({
			voting_status: ContractApplicationVotingStatusEnum.REJECTED,
			comment: rejectComment
		}).then(() => {
			toast.push(<Notification title={t('Отказано')} type='success' duration={2500} />, {
				placement: 'top-center'
			})
		})
	}

	return (
		<>
			<AdaptableCard className='h-full' bodyClass='h-full'>
				<div className='mb-4 items-center justify-between lg:flex'>
					<h3 className='mb-4 lg:mb-0'>{t('На проверке')}</h3>
					<PendingApplicationsViewTools application={application} isLoading={isLoading} />
				</div>

				<div className='mb-12 shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
					<DataTable
						columns={columns}
						userRole={user.role}
						data={application ? [application] : []}
						skeletonAvatarColumns={[0]}
						skeletonAvatarProps={{ className: 'rounded-md' }}
						loading={isLoading}
						isPagination={false}
					/>
				</div>

				{/*<Tabs value={tab} variant='pill' className='flex w-11/12 grow flex-col'>*/}
				<Tabs value={tab} variant='pill' className='flex w-full grow flex-col'>
					<TabList className='mb-8'>
						<span onClick={() => setTab('Details')}>
							<TabNav value='Details'>{t('Реквизиты')}</TabNav>
						</span>
						<span onClick={() => setTab('Files')}>
							<TabNav value='Files'>{t('Документы')}</TabNav>
						</span>
						<span onClick={() => setTab('Comment')}>
							<TabNav value='Comment'>{t('Комментарий')}</TabNav>
						</span>
						<span onClick={() => setTab('Votes')}>
							<TabNav value='Votes'>{t('Голосование')}</TabNav>
						</span>
					</TabList>

					<TabContent value='Details'>
						<div className='mb-6 rounded-sm border border-gray-200 p-5 dark:border-gray-600'>
							<h6 className='mb-5 text-xl'>{t('Реквизиты')}</h6>
							{/*<ul className='grid grid-cols-2 gap-5'>*/}
							<ul className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Организация')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.company_name}</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title={t('Копировать')}>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.company_name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Банк')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{application.lessee && application.lessee.bank_details
														? application.lessee.bank_details
														: '-'}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.bank_details)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('ИНН')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && <strong className='inline-block'>{application.stir}</strong>
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.stir)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Директор')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.company_name}</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.company_name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Адрес')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{application.branch.region.name_uz}/{application.branch.street}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.branch.name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Телефон')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{formatPhone(application.phone_number)}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.phone_number)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Расчетный счет')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{application.lessee && application.lessee.account_number
														? application.lessee.account_number
														: '-'}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.account_number)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Техника')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.tech.model_name_uz}</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title={t('Копировать')}>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.tech.model_name_uz)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('МФО')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{application.lessee && application.lessee.mfo
														? application.lessee.mfo
														: '-'}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.mfo)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='flex flex-wrap items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Сумма')}</span>
										{isLoading ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{formatPrice(application.total_amount)}
												</strong>
											)
										)}
									</div>
									{isLoading ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip title='Копировать'>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.total_amount)}
												/>
											</Tooltip>
										)
									)}
								</li>
							</ul>
						</div>
					</TabContent>
					<TabContent value='Files'>
						<div className='mb-6'>
							{isLoading ? (
								// <div className='grid grid-cols-4 gap-4'>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
									<Skeleton height={250} />
									<Skeleton height={250} />
									<Skeleton height={250} />
									<Skeleton height={250} />
								</div>
							) : application && application.files.length ? (
								// <div className='grid grid-cols-4 gap-4'>
								<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
									{application.files.map((item, index) => (
										<div
											key={`${item.id}_${index}`}
											className='group relative flex flex-col items-center justify-center rounded-sm border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800'
										>
											{item.is_previewable && (
												<img
													src={API_SERVER_URL + item.preview_url}
													alt={item.file_name}
													className='pointer-events-none max-h-[220px] min-h-[220px] grow object-contain'
												/>
											)}
											<span className='truncate-1 mt-2 inline-block'>{item.file_name}</span>

											<div className='absolute inset-0 hidden items-center justify-center bg-gray-900/[.7] text-xl group-hover:flex'>
												<a
													href={API_SERVER_URL + item.file}
													target='_blank'
													className='cursor-pointer p-1.5 text-gray-100 hover:text-gray-300'
												>
													<HiEye />
												</a>
											</div>
										</div>
									))}
								</div>
							) : (
								<div>Нет документов</div>
							)}
						</div>
					</TabContent>
					<TabContent value='Comment'>
						<h6 className='mb-5 text-xl'>{t('Комментарии')}</h6>
						<hr className='my-6' />

						{isLoading ? (
							<ul className='timeline'>
								<li className='timeline-item'>
									<div className='timeline-item-wrapper'>
										<div className='timeline-item-media'>
											<div className='timeline-item-media-content'>
												<Skeleton variant='circle' width={25} height={25} />
											</div>
											<div className='timeline-connect'></div>
										</div>
										<div className='timeline-item-content'>
											<p className='my-1 flex items-center'>
												<Skeleton width={160} height={21} />
												<Skeleton width={132} height={21} className='mx-2' />
											</p>
										</div>
									</div>
								</li>
							</ul>
						) : (
							application && (
								<Timeline className='mb-8'>
									<Timeline.Item
										media={
											application.sales.profile.profile_picture ? (
												<Avatar
													size={25}
													shape='circle'
													src={application.sales.profile.profile_picture}
													className='bg-amber-500'
												/>
											) : (
												<Avatar size={25} shape='circle' className='bg-amber-500'>
													{userRoleTextToName(application.sales.profile.role)?.trim()[0]}
												</Avatar>
											)
										}
									>
										<p className='my-1 flex items-center'>
											<span className='font-semibold text-gray-900 dark:text-gray-100'>
												{userRoleTextToName(application.sales.profile.role)}
											</span>
											{!application.comment && (
												<span className='mx-2'>- {t('Нет комментарий')}</span>
											)}
										</p>
										{application.comment && (
											<Card className='mt-4'>
												<p>{application.comment}</p>
											</Card>
										)}
									</Timeline.Item>
								</Timeline>
							)
						)}

						{isLoading ? (
							<ul className='timeline'>
								<li className='timeline-item'>
									<div className='timeline-item-wrapper'>
										<div className='timeline-item-media'>
											<div className='timeline-item-media-content'>
												<Skeleton variant='circle' width={25} height={25} />
											</div>
											<div className='timeline-connect'></div>
										</div>
										<div className='timeline-item-content'>
											<p className='my-1 flex items-center'>
												<Skeleton width={160} height={21} />
												<Skeleton width={132} height={21} className='mx-2' />
											</p>
										</div>
									</div>
								</li>
								<li className='timeline-item'>
									<div className='timeline-item-wrapper'>
										<div className='timeline-item-media'>
											<div className='timeline-item-media-content'>
												<Skeleton variant='circle' width={25} height={25} />
											</div>
											<div className='timeline-connect'></div>
										</div>
										<div className='timeline-item-content'>
											<p className='my-1 flex items-center'>
												<Skeleton width={160} height={21} />
												<Skeleton width={132} height={21} className='mx-2' />
											</p>
										</div>
									</div>
								</li>
								<li className='timeline-item'>
									<div className='timeline-item-wrapper'>
										<div className='timeline-item-media'>
											<div className='timeline-item-media-content'>
												<Skeleton variant='circle' width={25} height={25} />
											</div>
											<div className='timeline-connect'></div>
										</div>
										<div className='timeline-item-content'>
											<p className='my-1 flex items-center'>
												<Skeleton width={160} height={21} />
												<Skeleton width={132} height={21} className='mx-2' />
											</p>
										</div>
									</div>
								</li>
							</ul>
						) : application && application.votes.length ? (
							<Timeline>
								{application.votes.map((vote, index) => (
									<Timeline.Item
										key={`${vote.id}_${index}`}
										media={
											vote.branch_user.profile.profile_picture ? (
												<Avatar
													size={25}
													shape='circle'
													src={vote.branch_user.profile.profile_picture}
													className='bg-amber-500'
												/>
											) : (
												<Avatar size={25} shape='circle' className='bg-amber-500'>
													{userRoleTextToName(vote.branch_user.profile.role)?.trim()[0]}
												</Avatar>
											)
										}
									>
										<p className='my-1 flex items-center'>
											<span className='font-semibold text-gray-900 dark:text-gray-100'>
												{userRoleTextToName(vote.branch_user.profile.role)}
											</span>
											{!vote.comment && <span className='mx-2'>- {t('Нет комментарий')}</span>}
										</p>
										{vote.comment && (
											<Card className='mt-4'>
												<p>{vote.comment}</p>
											</Card>
										)}
									</Timeline.Item>
								))}
							</Timeline>
						) : (
							<div>{t('Нет комментарий')}</div>
						)}
					</TabContent>
					<TabContent value='Votes'>
						<div className='mb-6 grid gap-4 md:grid-cols-1 lg:grid-cols-3'>
							<AdaptableCard className='lg:col-span-2' rightSideBorder bodyClass='pt-5'>
								<h4>{t('Голосование')}</h4>
								<hr className='my-6' />

								{isLoading ? (
									<ul className='timeline'>
										<li className='timeline-item'>
											<div className='timeline-item-wrapper'>
												<div className='timeline-item-media'>
													<div className='timeline-item-media-content'>
														<Skeleton variant='circle' width={25} height={25} />
													</div>
													<div className='timeline-connect'></div>
												</div>
												<div className='timeline-item-content'>
													<p className='my-1 flex items-center'>
														<Skeleton width={160} height={21} />
														<Skeleton width={132} height={21} className='mx-2' />
													</p>
												</div>
											</div>
										</li>
										<li className='timeline-item'>
											<div className='timeline-item-wrapper'>
												<div className='timeline-item-media'>
													<div className='timeline-item-media-content'>
														<Skeleton variant='circle' width={25} height={25} />
													</div>
													<div className='timeline-connect'></div>
												</div>
												<div className='timeline-item-content'>
													<p className='my-1 flex items-center'>
														<Skeleton width={160} height={21} />
														<Skeleton width={132} height={21} className='mx-2' />
													</p>
												</div>
											</div>
										</li>
										<li className='timeline-item'>
											<div className='timeline-item-wrapper'>
												<div className='timeline-item-media'>
													<div className='timeline-item-media-content'>
														<Skeleton variant='circle' width={25} height={25} />
													</div>
													<div className='timeline-connect'></div>
												</div>
												<div className='timeline-item-content'>
													<p className='my-1 flex items-center'>
														<Skeleton width={160} height={21} />
														<Skeleton width={132} height={21} className='mx-2' />
													</p>
												</div>
											</div>
										</li>
									</ul>
								) : application && application.votes.length ? (
									<Timeline>
										{application.votes.map((vote, index) => (
											<Fragment key={`${vote.id}_${index}`}>
												<Timeline.Item
													media={
														vote.branch_user.profile.profile_picture ? (
															<Avatar
																size={25}
																shape='circle'
																src={API_SERVER_URL + vote.branch_user.profile.profile_picture}
																className='bg-amber-500'
															/>
														) : (
															<Avatar size={25} shape='circle' className='bg-amber-500'>
																{vote.branch_user.profile.first_name.trim()[0]}
															</Avatar>
														)
													}
												>
													<p className='my-1 flex items-center'>
														<span className='font-semibold text-gray-900 dark:text-gray-100'>
															{vote.branch_user.profile.first_name}{' '}
															{vote.branch_user.profile.last_name}
														</span>
														<span className='mx-2'>-</span>
														<VotingStatusTag status={vote.voting_status} />
													</p>
													{vote.comment && (
														<Card className='mt-4'>
															<p>{vote.comment}</p>
														</Card>
													)}
												</Timeline.Item>
											</Fragment>
										))}
									</Timeline>
								) : (
									<div>{t('Нет голосованных')}</div>
								)}
							</AdaptableCard>
							<AdaptableCard bodyClass='p-5'>
								<h4 className='mb-6'>{t('Статус')}</h4>
								{isLoading ? (
									<div className='mb-4 flex items-center gap-2'>
										<Skeleton width={18} height={18} />
										<Skeleton width={140} height={21} />
									</div>
								) : (
									application && <VotingStatus status={application.voting_status} />
								)}
								{isLoading ? (
									<div className='mb-4 flex items-center gap-2'>
										<Skeleton width={18} height={18} />
										<Skeleton width={120} height={21} />
									</div>
								) : (
									application && (
										<IconText
											className='mb-4'
											icon={<HiOutlineUsers className='text-lg opacity-70' />}
										>
											<strong className='font-semibold'>{t('Голоса')}:</strong>
											<span>
												{approvedVotingStatusCount + rejectedVotingStatusCount} /{' '}
												{application.votes.length}
											</span>
										</IconText>
									)
								)}
								{isLoading ? (
									<div className='mb-4 flex items-center gap-2'>
										<Skeleton width={18} height={18} />
										<Skeleton width={160} height={21} />
									</div>
								) : (
									application && (
										<IconText
											className='mb-4'
											icon={<HiOutlineCalendar className='text-lg opacity-70' />}
										>
											<strong className='font-semibold'>{t('Создано')}:</strong>
											<span>{formatDate(application.updated_at)}</span>
										</IconText>
									)
								)}

								<p className='my-4 font-semibold'>{t('Теги')}</p>
								<div className='flex flex-wrap gap-2'>
									{isLoading ? (
										<>
											<Skeleton width={134} height={26} className='rounded-full' />
											<Skeleton width={110} height={26} className='rounded-full' />
											<Skeleton width={134} height={26} className='rounded-full' />
										</>
									) : application && application.votes.length ? (
										<>
											<Tag prefix prefixClass='bg-indigo-500'>
												{t('Подтвердить')} - {approvedVotingStatusCount}
											</Tag>
											<Tag prefix prefixClass='bg-red-500'>
												{t('Отказать')} - {rejectedVotingStatusCount}
											</Tag>
											<Tag prefix prefixClass='bg-orange-500'>
												{t('Не голосовал')} - {newVotingStatusCount + inProgressVotingStatusCount}
											</Tag>
										</>
									) : (
										<div>{t('Нет тегов')}</div>
									)}
								</div>

								<hr className='mt-10 mb-8' />

								<p className='mb-4 font-semibold'>{t('Члены комиссии')}</p>
								{isLoading ? (
									<>
										<div className='mb-4 flex items-center gap-2'>
											<Skeleton variant='circle' width={25} height={25} />
											<Skeleton width={240} height={21} />
										</div>
										<div className='mb-4 flex items-center gap-2'>
											<Skeleton variant='circle' width={25} height={25} />
											<Skeleton width={240} height={21} />
										</div>
									</>
								) : (
									application &&
									application.votes.map((vote, index) => (
										<IconText
											key={`${vote.id}_${index}`}
											className='mb-4'
											icon={
												vote.branch_user.profile.profile_picture ? (
													<Avatar
														size={25}
														shape='circle'
														src={API_SERVER_URL + vote.branch_user.profile.profile_picture}
													/>
												) : (
													<Avatar size={25} shape='circle' className='bg-amber-500'>
														{vote.branch_user.profile.first_name.trim()[0]}
													</Avatar>
												)
											}
										>
											<span className='font-semibold text-gray-700 dark:text-gray-100'>
												{vote.branch_user.profile.first_name} {vote.branch_user.profile.last_name}
											</span>
										</IconText>
									))
								)}
							</AdaptableCard>
						</div>
					</TabContent>

					{application && user.role !== UserRoleTextEnum.SALES && (
						// <div className='mt-auto text-right'>
						<div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
							<Button
								size='md'
								variant='solid'
								color='red-500'
								className='w-full sm:mr-2 sm:w-auto'
								loading={isLoading || isPendingUpdate}
								disabled={[
									ContractApplicationVotingStatusEnum.APPROVED,
									ContractApplicationVotingStatusEnum.REJECTED
								].includes(application.my_voting_status)}
								onClick={() => setIsRejectDialogOpen(true)}
							>
								{t('Отказать')}
							</Button>
							<Link to='/applications/pending'>
								<Button size='md' className='w-full sm:mr-2 sm:w-auto'>
									{t('Назад')}
								</Button>
							</Link>
							<Button
								size='md'
								variant='solid'
								className='w-full sm:mr-2 sm:w-auto'
								loading={isLoading || isPendingUpdate}
								disabled={[
									ContractApplicationVotingStatusEnum.APPROVED,
									ContractApplicationVotingStatusEnum.REJECTED
								].includes(application.my_voting_status)}
								onClick={() => setIsApproveDialogOpen(true)}
							>
								{t('Подтвердить')}
							</Button>
						</div>
					)}
				</Tabs>
			</AdaptableCard>

			<ConfirmDialog
				isOpen={isApproveDialogOpen}
				type='success'
				title={t('Вы подтверждаете заявку?')}
				cancelText={t('Отмена')}
				confirmText={t('Подтвердить')}
				confirmButtonColor='indigo-600'
				onClose={() => setIsApproveDialogOpen(false)}
				onRequestClose={() => setIsApproveDialogOpen(false)}
				onCancel={() => setIsApproveDialogOpen(false)}
				onConfirm={onApprove}
			/>

			<ConfirmDialog
				isOpen={isRejectDialogOpen}
				type='danger'
				title={t('Вы хотите отказать заявку?')}
				cancelText={t('Отмена')}
				confirmText={t('Да')}
				confirmButtonColor='red-600'
				onClose={() => setIsRejectDialogOpen(false)}
				onRequestClose={() => setIsRejectDialogOpen(false)}
				onCancel={() => setIsRejectDialogOpen(false)}
				onConfirm={onReject}
			>
				<FormItem>
					<h6 className='mb-2 text-sm'>{t('Комментарии на отказ')}</h6>
					<Input
						textArea
						className='min-h-[132px]'
						placeholder={t('Напишите комментарии которые необходимо исправить')}
						onChange={(e) => setRejectComment(e.target.value)}
					/>
				</FormItem>
			</ConfirmDialog>
		</>
	)
}

export default PendingApplicationsView
