import { Fragment, useEffect, useState } from 'react'
import { pub } from '@/utils/publicUrl'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
	HiCheck,
	HiEye,
	HiOutlineCalendar,
	HiOutlineDuplicate,
	HiOutlineUsers,
	HiTrash
} from 'react-icons/hi'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { FileType } from '@/@types/common'
import {
	ContractApplication,
	ContractApplicationStatusEnum,
	ContractApplicationVotingStatusEnum
} from '@/@types/contract.types'
import { AdaptableCard, ConfirmDialog, DoubleSidedImage, IconText } from '@/components/shared'
import {
	Avatar,
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
	Tooltip,
	Upload
} from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { formatDate, formatPhone, formatPrice } from '@/utils/format'
import useThemeClass from '@/utils/hooks/useThemeClass'
import NewApplicationsViewTable from './components/NewApplicationsViewTable'
import NewApplicationsViewTools from './components/NewApplicationsViewTools'

const { TabNav, TabList, TabContent } = Tabs

type TabType = 'Details' | 'Files' | 'Comment' | 'Votes'

export type FormModel = {
	status: ContractApplicationStatusEnum
	comment: string
	files: FileType[]
	new_files?: FileType[]
	deleted_files?: FileType[]
}

const FILE_UPLOAD_SIZE = 8

const VotingStatus = ({ status }: { status: ContractApplicationVotingStatusEnum }) => {
	const { t } = useTranslation()

	switch (status) {
		case ContractApplicationVotingStatusEnum.NEW:
			return (
				<IconText className='mb-4 text-indigo-500' icon={<HiCheck className='text-lg' />}>
					<strong className='font-semibold'>Новое</strong>
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

const NewApplicationsView = () => {
	const { id } = useParams<{ id: string }>()
	const { t } = useTranslation()
	const navigate = useNavigate()
	const { textTheme } = useThemeClass()

	const [tab, setTab] = useState<TabType>('Details')
	const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false)
	const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

	const {
		data: application,
		isLoading: isLoadingApplication,
		refetch: refetchApplication
	} = useQuery({
		queryKey: ['get application', id],
		queryFn: () => ContractService.getApplicationById<ContractApplication>(Number(id)),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update application partially', id],
		mutationFn: (data: FormData) => ContractService.updateApplicationPartially(Number(id), data),
		async onSuccess() {
			if (refetchApplication) await refetchApplication()
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

	const { control, setValue, watch, handleSubmit, reset } = useForm<FormModel>({
		mode: 'onChange'
	})

	const files = watch('files') || []
	const new_files = watch('new_files') || []
	const deleted_files = watch('deleted_files') || []
	const isTouched = !!watch('comment') || !!watch('new_files')

	const onSubmitSave: SubmitHandler<FormModel> = async (data) => {
		const formData = new FormData()

		if (data.files.length || data.new_files?.length) {
			formData.append('status', String(ContractApplicationStatusEnum.DOCUMENT_GATHERING))
		} else {
			formData.append('status', String(ContractApplicationStatusEnum.IN_COMMISSION))
		}

		if (data.comment) formData.append('comment', data.comment)

		if (data.deleted_files) {
			data.deleted_files.map((f) => formData.append('deleted_files', JSON.stringify(f.id)))
		}

		if (data.new_files) {
			for (const url of data.new_files.map((f) => f.file)) {
				try {
					const response = await fetch(url)
					const blob = await response.blob()

					const mimeType = blob.type
					const extension = mimeType.split('/')[1]

					const fileName = url.split('/').pop() || 'file'
					const file = new File([blob], `${fileName}.${extension}`, { type: mimeType })

					formData.append('new_files', file)
				} catch (error) {
					console.warn(`Failed to fetch or convert blob URL: ${url}`, error)
				}
			}
		}

		await mutateAsyncUpdate(formData).then(() => {
			toast.push(<Notification type='success' title={t('Сохранено')} duration={2000} />, {
				placement: 'top-center'
			})
		})
	}

	const onSubmitSend: SubmitHandler<FormModel> = async (data) => {
		const formData = new FormData()

		formData.append('status', String(ContractApplicationStatusEnum.IN_COMMISSION))
		if (data.comment) formData.append('comment', data.comment)

		if (data.deleted_files) {
			data.deleted_files.map((f) => formData.append('deleted_files', JSON.stringify(f.id)))
		}

		if (data.new_files) {
			for (const url of data.new_files.map((f) => f.file)) {
				try {
					const response = await fetch(url)
					const blob = await response.blob()

					const mimeType = blob.type
					const extension = mimeType.split('/')[1]

					const fileName = url.split('/').pop() || 'file'
					const file = new File([blob], `${fileName}.${extension}`, { type: mimeType })

					formData.append('new_files', file)
				} catch (error) {
					console.warn(`Failed to fetch or convert blob URL: ${url}`, error)
				}
			}
		}

		await mutateAsyncUpdate(formData).then(() => {
			toast.push(<Notification type='success' title={t('Отправлено в комиссию')} duration={2000} />, {
				placement: 'top-center'
			})
		})
	}

	const handleCopyClick = async (text = '') => {
		await navigator.clipboard.writeText(text).then(() => {
			toast.push(<Notification title={t('Копировано')} type='success' duration={1000} />, {
				placement: 'top-center'
			})
		})
	}

	const beforeUpload = (file: FileList | null) => {
		let valid: boolean | string = true
		const allowedFileType = ['application/pdf']
		const maxFileSize = 10 * 1024 * 1024 // 10 MB

		if (file) {
			for (const f of file) {
				if (!allowedFileType.includes(f.type)) {
					valid = t('Пожалуйста, загрузите .pdf файл!')
				}

				if (f.size >= maxFileSize) {
					valid = t('Размер файла не должен превышать 10 МБ!')
				}
			}
		}

		return valid
	}

	const handleUpload = async (fileList: File[]) => {
		const latestUpload = fileList.length - 1
		const file: FileType = {
			id: fileList.length,
			file: URL.createObjectURL(fileList[latestUpload]),
			file_name: fileList[latestUpload].name,
			file_type: fileList[latestUpload].type,
			file_size: fileList[latestUpload].size
		}
		// setValue('files', [...files, ...[file]])
		setValue('new_files', [...(new_files || []), ...[file]])
	}

	const handleDelete = (deletedFile: FileType) => {
		const updatedFiles = files.filter((f) => f.id !== deletedFile.id)
		setValue('files', updatedFiles)

		const isNew = new_files.some((f) => f.id === deletedFile.id)

		if (!isNew) {
			setValue('deleted_files', [...deleted_files, deletedFile])
		}

		if (isNew) {
			const updatedNew = new_files.filter((f) => f.id !== deletedFile.id)
			setValue('new_files', updatedNew)
		}
	}

	const onDiscard = () => {
		if (!isTouched) navigate('/applications/new')
		else setIsDiscardDialogOpen(true)
	}

	const onDiscardConfirm = () => {
		handleSubmit(onSubmitSave)().finally(() => {
			setIsDiscardDialogOpen(false)
			navigate('/applications/new')
		})
	}

	const onSubmitConfirm = () => {
		handleSubmit(onSubmitSend)()
			.then(() => {
				navigate('/applications/new')
			})
			.finally(() => {
				setIsCompleteDialogOpen(false)
			})
	}

	useEffect(() => {
		if (application) {
			reset({
				status: application.status,
				comment: application.comment,
				files: application.files
			})
		}
	}, [application, reset])

	return (
		<>
			<AdaptableCard className='h-full' bodyClass='h-full'>
				<div className='mb-4 items-center justify-between lg:flex'>
					<h3 className='mb-4 lg:mb-0'>{t('Новые заявки')}</h3>
					<NewApplicationsViewTools
						application={application}
						isLoading={isLoadingApplication}
						onSaveClick={handleSubmit(onSubmitSave)}
						touched={isTouched}
					/>
				</div>

				<div className='mb-12 shadow-[0_9px_12px_0_rgba(0,0,0,0.15)]'>
					<NewApplicationsViewTable
						data={application ? [application] : []}
						isLoading={isLoadingApplication}
					/>
				</div>

				<Tabs value={tab} variant='pill' className='w-11/12'>
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
						<div className='rounded-sm border border-gray-200 p-5 dark:border-gray-600'>
							<h6 className='mb-5 text-xl'>{t('Реквизиты')}</h6>
							<ul className='grid grid-cols-2 gap-5'>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Организация')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.company_name}</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.company_name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Банк')}</span>
										{isLoadingApplication ? (
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
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.bank_details)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('ИНН')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && <strong className='inline-block'>{application.stir}</strong>
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.stir)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Директор')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.company_name}</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.company_name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Адрес')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{application.branch.region.name_uz}/{application.branch.street}
												</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.branch.name)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Телефон')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{formatPhone(application.phone_number)}
												</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.phone_number)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Расчетный счет')}</span>
										{isLoadingApplication ? (
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
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.account_number)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Техника')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>{application.tech.model_name_uz}</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.tech.model_name_uz)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('МФО')}</span>
										{isLoadingApplication ? (
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
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
												<HiOutlineDuplicate
													className={classNames('cursor-pointer text-xl', `hover:${textTheme}`)}
													onClick={() => handleCopyClick(application.lessee.mfo)}
												/>
											</Tooltip>
										)
									)}
								</li>
								<li className='grid grid-cols-[1fr_36px] items-end gap-x-4'>
									<div className='flex grow flex-col'>
										<span className='mb-1 inline-block'>{t('Сумма')}</span>
										{isLoadingApplication ? (
											<Skeleton height={21} />
										) : (
											application && (
												<strong className='inline-block'>
													{formatPrice(application.total_amount)}
												</strong>
											)
										)}
									</div>
									{isLoadingApplication ? (
										<Skeleton width={28} height={28} />
									) : (
										application && (
											<Tooltip
												title={t('Копировать')}
												wrapperClass='inline-flex justify-center items-center size-8 p-1'
											>
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
						<div className='grid grid-cols-4 gap-4'>
							{files &&
								files.length > 0 &&
								files.map((item, index) => (
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
											<span
												className='cursor-pointer p-1.5 text-gray-100 hover:text-gray-300'
												onClick={() => handleDelete(item)}
											>
												<HiTrash />
											</span>
										</div>
									</div>
								))}

							{new_files &&
								new_files.length > 0 &&
								new_files.map((item, index) => (
									<div
										key={`${item.id}_${index}`}
										className='group relative flex min-h-[250px] flex-col items-center justify-center rounded-sm border border-gray-200 bg-white px-2 py-4 dark:border-gray-700 dark:bg-gray-800'
									>
										<img
											src={pub('/img/others/pdf-colored.png')}
											alt='Pdf file'
											className='h-[68px] w-[68px] text-gray-800 dark:text-white'
										/>
										<span className='mt-4 text-center text-gray-800 dark:text-white'>
											{item.file_name}
										</span>
										<div className='absolute inset-2 hidden items-center justify-center bg-gray-900/[.7] text-xl group-hover:flex'>
											<span
												className='cursor-pointer p-1.5 text-gray-100 hover:text-gray-300'
												onClick={() => handleDelete(item)}
											>
												<HiTrash />
											</span>
										</div>
									</div>
								))}

							{files.length + new_files.length! < FILE_UPLOAD_SIZE && (
								<Upload
									draggable
									className='min-h-[250px]'
									beforeUpload={beforeUpload}
									showList={false}
									onChange={handleUpload}
								>
									<div className='flex max-w-full flex-col items-center justify-center px-4 py-2'>
										<DoubleSidedImage
											src={pub('/img/others/pdf.png')}
											darkModeSrc={pub('/img/others/pdf-dark.png')}
											className='h-[68px] w-[68px] text-gray-800 dark:text-white'
										/>
										<p className='mt-4 text-center font-semibold text-gray-800 dark:text-white'>
											{t('Загрузить')}
										</p>
									</div>
								</Upload>
							)}
						</div>
					</TabContent>
					<TabContent value='Comment'>
						<Controller
							control={control}
							name={'comment'}
							render={({ field, fieldState: { invalid, error } }) => (
								<FormItem
									label={t('Добавить комментарий')}
									invalid={invalid}
									errorMessage={error && error.message}
								>
									<Input
										type='text'
										textArea
										placeholder={t('Введите описание')}
										className='min-h-[240px]'
										value={field.value}
										onChange={field.onChange}
									/>
								</FormItem>
							)}
						/>
					</TabContent>
					<TabContent value='Votes'>
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
											<strong className='font-semibold'>{t('Создано:')}</strong>
											<span>{formatDate(application.application_date)}</span>
										</IconText>
									)
								)}

								<p className='my-4 font-semibold'>{t('Теги')}</p>
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
					</TabContent>

					<div className='mt-12 text-right'>
						<Button size='md' disabled={isPendingUpdate} onClick={onDiscard} className='mr-2'>
							{t('Отмена')}
						</Button>
						<Button
							size='md'
							variant='solid'
							loading={isLoadingApplication || isPendingUpdate}
							disabled={!files.length && !new_files.length}
							onClick={() => setIsCompleteDialogOpen(true)}
						>
							{t('Отправить в комиссию')}
						</Button>
					</div>
				</Tabs>
			</AdaptableCard>

			<ConfirmDialog
				isOpen={isDiscardDialogOpen}
				type='warning'
				title={t('Вы точно хотите отменить. Ваши изменения не будут сохранены!')}
				cancelText={t('Выйти')}
				confirmText={t('Сохранить и выйти')}
				confirmButtonColor='indigo-600'
				onClose={() => setIsDiscardDialogOpen(false)}
				onRequestClose={() => setIsDiscardDialogOpen(false)}
				onCancel={() => navigate('/applications/new')}
				onConfirm={onDiscardConfirm}
			/>

			<ConfirmDialog
				isOpen={isCompleteDialogOpen}
				type='success'
				title={t('Вы хотите отправить заявку в комиссию')}
				cancelText={t('Отмена')}
				confirmText={t('Отправить в комиссию')}
				confirmButtonColor='indigo-600'
				onClose={() => setIsCompleteDialogOpen(false)}
				onRequestClose={() => setIsCompleteDialogOpen(false)}
				onCancel={() => setIsCompleteDialogOpen(false)}
				onConfirm={onSubmitConfirm}
			/>
		</>
	)
}

export default NewApplicationsView
