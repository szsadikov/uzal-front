import { HTMLAttributes, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { ContractApplication, Lessee } from '@/@types/contract.types'
import { Tech } from '@/@types/tech.types'
import { ConfirmDialog } from '@/components/shared'
import { Button, Notification, toast } from '@/components/ui'
import appConfig from '@/configs/app.config'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { ContractService } from '@/services/contract.service'
import { UserService } from '@/services/user.service'
import { useAppSelector } from '@/store'
import { formatPrice } from '@/utils/format'
import useAuth from '@/utils/hooks/useAuth'
import useDarkMode from '@/utils/hooks/useDarkmode'
import { useTranslation } from 'react-i18next'

type Props = HTMLAttributes<HTMLDivElement> & {
	tech: Tech
}

type FormModel = {
	branch?: number
	stir: string
	company_name: string
	tech?: number
	total_amount: string
	phone_number?: string
	sales?: number
	lessee?: number
	new_files?: string[]
}

const CatalogInfo = ({ tech, className }: Props) => {
	const [isDark] = useDarkMode()
	const navigate = useNavigate()
	const { user } = useAppSelector((state) => state.auth.session)
	const { authenticated } = useAuth()
	const { t } = useTranslation()

	const [isLeaveRequestDialogOpen, setLeaveRequestDialogIsOpen] = useState(false)

	const { data: lessee, isLoading: isLoadingLessee } = useQuery({
		queryKey: ['get lessee'],
		queryFn: () => UserService.getLesseeById<Lessee>(user.role_id),
		select: ({ data }) => data,
		enabled: isLeaveRequestDialogOpen
	})

	const { mutateAsync: mutateAsyncLeaveRequest } = useMutation({
		mutationKey: ['leave a request'],
		mutationFn: (data: FormModel) =>
			ContractService.leaveRequest<ContractApplication, FormModel>(data),
		onSuccess() {
			toast.push(
				<Notification title={t('Заявка успешно отправлено')} type='success' duration={2500} />,
				{
					placement: 'top-center'
				}
			)
			navigate('/lessee/catalog')
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onSettled() {
			setLeaveRequestDialogIsOpen(false)
		}
	})

	const onLeaveRequest = () => {
		if (!authenticated) {
			window.location.href = appConfig.unAuthenticatedEntryPath + '?client'
		} else {
			setLeaveRequestDialogIsOpen(true)
		}
	}

	const onLeaveRequestConfirm = async () => {
		if (!lessee) return

		await mutateAsyncLeaveRequest({
			stir: lessee.stir,
			company_name: lessee.company_name,
			tech: tech.id,
			total_amount: tech.price,
			phone_number: user.phone_number,
			lessee: user.role_id,
			branch: lessee.region.id
		})
	}

	return (
		<>
			<div className={classNames(className)}>
				<div className='mb-1 text-lg'>{tech.model_name_ru}</div>
				<div className='mb-2'>{tech.type.name_ru}</div>
				<div className='mt-4 text-lg font-semibold'>
					<span>{formatPrice(tech.price)}</span>
					<small className='ml-1'>{t('сум')}</small>
				</div>
				<div dangerouslySetInnerHTML={{ __html: tech.description }} className='my-8' />

				{tech.characteristics && tech.characteristics.length ? (
					<ul className='flex flex-col gap-y-3'>
						{tech.characteristics.map((char, index) => (
							<li key={`${char}_${index}`} className='grid grid-cols-5 gap-4'>
								<b className='col-span-2'>{char.name}</b>
								<span className='col-span-3'>{char.description}</span>
							</li>
						))}
					</ul>
				) : (
					<div className='text-red-500'>{t('Нет характеристики')}</div>
				)}

				<Button
					variant='solid'
					size='sm'
					className='mt-12 px-24'
					loading={isLoadingLessee}
					onClick={onLeaveRequest}
				>
					{t('Оставить заявку')}
				</Button>
			</div>

			<ConfirmDialog
				isOpen={isLeaveRequestDialogOpen}
				type='success'
				title={t('Оставить заявку на лизинг')}
				cancelText={t('Отмена')}
				confirmText={t('Оставить заявку')}
				confirmButtonColor='indigo-600'
				onClose={() => setLeaveRequestDialogIsOpen(false)}
				onRequestClose={() => setLeaveRequestDialogIsOpen(false)}
				onCancel={() => setLeaveRequestDialogIsOpen(false)}
				onConfirm={onLeaveRequestConfirm}
			>
				<div className='mt-4 grid grid-cols-3 gap-x-5'>
					{tech.files.length ? (
						<img
							src={API_SERVER_URL + tech.files[0].file}
							alt={tech.model_name_ru}
							className='col-span-1 h-[78px] object-contain'
						/>
					) : (
						<img
							src={isDark ? '/img/others/upload-dark.png' : '/img/others/upload.png'}
							alt='no-photo'
							className='col-span-1 h-[78px] object-contain'
						/>
					)}
					<div className='col-span-2'>
						<div className='text-base'>{tech.model_name_ru}</div>
						<div className='mb-1 text-sm'>{tech.type.name_ru}</div>
						<div className='mt-2 text-base font-semibold'>
							<span>{formatPrice(tech.price)}</span>
							<small className='ml-1'>сум</small>
						</div>
					</div>
				</div>
			</ConfirmDialog>
		</>
	)
}

export default CatalogInfo
