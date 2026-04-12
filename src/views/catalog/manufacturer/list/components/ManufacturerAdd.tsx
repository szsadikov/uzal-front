import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { ManufacturerType } from '@/@types/tech.types'
import { Button, Drawer, FormItem, Input, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'

type Props = {
	refetch?: () => Promise<unknown>
}

type FormModel = {
	name_ru: string
	name_uz: string
}

const ManufacturerAdd = ({ refetch }: Props) => {
	const { t } = useTranslation()

	const [isOpen, setIsOpen] = useState(false)

	const { control, handleSubmit } = useForm<FormModel>({
		mode: 'onChange'
	})

	const { mutateAsync: mutateAsyncCreateManufacturer, isPending: isPendingCreateManufacturer } =
		useMutation({
			mutationKey: ['create manufacturer'],
			mutationFn: (data: FormModel) =>
				TechService.createManufacturer<ManufacturerType, FormModel>(data),
			async onSuccess({ data }) {
				if (refetch) await refetch()

				toast.push(
					<Notification
						type='success'
						title={`${t('Производитель добавлен')}: ${data.id}`}
						duration={2000}
					/>,
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
			}
		})

	const onSubmit: SubmitHandler<FormModel> = async (data) => {
		await mutateAsyncCreateManufacturer(data).finally(() => setIsOpen(false))
	}

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				{t('Добавить')}
			</Button>

			<Drawer
				title={t('Добавить производителя')}
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
							disabled={isPendingCreateManufacturer}
						>
							{t('Добавить')}
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
								<Input
									type='text'
									placeholder={t('Введите производителя')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
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
								<Input
									type='text'
									placeholder={t('Введите производителя')}
									value={field.value}
									onChange={field.onChange}
									invalid={invalid}
								/>
							</FormItem>
						)}
						rules={{
							required: t('Производитель обязателен')
						}}
					/>
				</div>
			</Drawer>
		</>
	)
}

export default ManufacturerAdd
