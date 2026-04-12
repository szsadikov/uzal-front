import { Dispatch, Fragment, type MouseEvent, SetStateAction } from 'react'
import { HiCheck, HiOutlineCalendar, HiOutlineUsers } from 'react-icons/hi'
import { useQuery } from '@tanstack/react-query'
import { ContractApplication, ContractApplicationVotingStatusEnum } from '@/@types/contract.types'
import { AdaptableCard, Container, IconText } from '@/components/shared'
import { Avatar, Button, Card, Drawer, Skeleton, Tag, Timeline } from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { ContractService } from '@/services/contract.service'
import { formatDate } from '@/utils/format'
import useResponsive from '@/utils/hooks/useResponsive'
import { useTranslation } from 'react-i18next'

type Props = {
	id: number
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
}

type DrawerFooterProps = {
	onClose: (event: MouseEvent<HTMLButtonElement>) => void
	isSubmitting?: boolean
}

const DrawerFooter = ({ onClose, isSubmitting = false }: DrawerFooterProps) => {
	const { t } = useTranslation()

	return (
		<div className='w-full text-right'>
			<Button size='md' variant='solid' onClick={onClose} disabled={isSubmitting}>
				{t('Закрыть')}
			</Button>
		</div>
	)
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

const PendingApplicationsView = ({ id, isOpen, setIsOpen }: Props) => {
	const { windowWidth, larger } = useResponsive()
	const { t } = useTranslation()

	const { data: application, isLoading: isLoadingApplication } = useQuery({
		queryKey: ['get application', id],
		queryFn: () => ContractService.getApplicationById<ContractApplication>(id),
		select: ({ data }) => data
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

	return (
		<Drawer
			title={t('Члены комиссии')}
			placement='right'
			width={larger.lg ? windowWidth - 315 : windowWidth}
			isOpen={isOpen}
			footer={<DrawerFooter onClose={() => setIsOpen(false)} />}
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
			<Container className='h-full'>
				<div className='grid gap-4 md:grid-cols-1 lg:grid-cols-3'>
					<AdaptableCard className='lg:col-span-2' rightSideBorder bodyClass='pt-5'>
						<h4>{t('Голосование')}</h4>
						<hr className='my-6' />

						{isLoadingApplication ? (
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
													{vote.branch_user.profile.first_name} {vote.branch_user.profile.last_name}
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
						{isLoadingApplication ? (
							<div className='mb-4 flex items-center gap-2'>
								<Skeleton width={18} height={18} />
								<Skeleton width={140} height={21} />
							</div>
						) : (
							application && <VotingStatus status={application.voting_status} />
						)}
						{isLoadingApplication ? (
							<div className='mb-4 flex items-center gap-2'>
								<Skeleton width={18} height={18} />
								<Skeleton width={120} height={21} />
							</div>
						) : (
							application && application.votes.length && (
								<IconText className='mb-4' icon={<HiOutlineUsers className='text-lg opacity-70' />}>
									<strong className='font-semibold'>Голоса:</strong>
									<span>
										{approvedVotingStatusCount + rejectedVotingStatusCount} /{' '}
										{application.votes.length}
									</span>
								</IconText>
							)
						)}
						{isLoadingApplication ? (
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
									<span>{formatDate(application.application_date)}</span>
								</IconText>
							)
						)}

						<p className='my-4 font-semibold'>Теги</p>
						<div className='flex flex-wrap gap-2'>
							{isLoadingApplication ? (
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
						{isLoadingApplication ? (
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
			</Container>
		</Drawer>
	)
}

export default PendingApplicationsView
