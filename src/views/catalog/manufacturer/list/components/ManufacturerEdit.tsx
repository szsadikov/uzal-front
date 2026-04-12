import { Dispatch, SetStateAction, useEffect } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ManufacturerType } from '@/@types/tech.types'
import { Button, Drawer, FormItem, Input, Notification, Skeleton, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'

type Props = {
	id: number
	refetch?: () => Promise<unknown>
	isOpen: boolean
	setIsOpen: Dispatch<SetStateAction<boolean>>
}

type FormModel = {
	name_ru: string
	name_uz: string
}

const ManufacturerEdit = ({ id, refetch, isOpen, setIsOpen }: Props) => {
	const { t } = useTranslation()

	const { data: manufacturer, isLoading: isLoadingManufacturer } = useQuery({
		queryKey: ['get manufacturer', id],
		queryFn: () => TechService.getManufacturerById<ManufacturerType>(id),
		select: ({ data }) => data
	})

	const { control, handleSubmit, reset } = useForm<FormModel>({
		mode: 'onChange'
	})

	const { mutateAsync: mutateAsyncUpdateManufacturer, isPending: isPendingUpdateManufacturer } =
		useMutation({
			mutationKey: ['update manufacturer', id],
			mutationFn: (data: FormModel) =>
				TechService.updateManufacturer<ManufacturerType, FormModel>(id, data),
			async onSuccess() {
				if (refetch) await refetch()

				toast.push(<Notification type='success' title={t('Производитель изменен')} duration={2000} />, {
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

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		await mutateAsyncUpdateManufacturer(data).finally(() => setIsOpen(false))
	}

	useEffect(() => {
		if (manufacturer) {
			reset({
				name_ru: manufacturer.name_ru,
				name_uz: manufacturer.name_uz
			})
		}
	}, [manufacturer, reset])

	return (
		<Drawer
			title={t('Редактировать производителя')}
			isOpen={isOpen}
			footer={
				<div className='grid grow grid-cols-2 gap-2'>
					<Button size='md' className='grow' onClick={() => setIsOpen(false)}>
						{t('Отмена')}
					</Button>
					<Button
						size='md'
						variant='solid'
						className='grow'
						onClick={handleSubmit(onSubmit)}
						disabled={isLoadingManufacturer || isPendingUpdateManufacturer}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
			<div>
				<Controller
					control={control}
					name={'name_ru'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Производитель ru')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							{isLoadingManufacturer ? (
								<Skeleton height={44} />
							) : (
								<Input
									type='text'
									placeholder={t('Введите производителя')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
							)}
						</FormItem>
					)}
					rules={{
						required: t('Производитель обязателен')
					}}
				/>

				<Controller
					control={control}
					name={'name_uz'}
					render={({ field, fieldState: { invalid, error } }) => (
						<FormItem
							label={t('Производитель uz')}
							invalid={invalid}
							errorMessage={error && error.message}
						>
							{isLoadingManufacturer ? (
								<Skeleton height={44} />
							) : (
								<Input
									type='text'
									placeholder={t('Введите производителя')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
							)}
						</FormItem>
					)}
					rules={{
						required: t('Производитель обязателен')
					}}
				/>
			</div>
		</Drawer>
	)
}

export default ManufacturerEdit
