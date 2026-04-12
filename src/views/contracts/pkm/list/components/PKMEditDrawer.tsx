// src/pages/pkm/components/PKMEditDrawer.tsx
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PKM, PKMCreate } from '@/@types/dataset.types'
import { Button, Drawer, FormContainer, FormItem, Input, Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'

type Props = {
	data: PKM | null
	onClose: () => void
	onSaved: () => void
}

const PKMEditDrawer = ({ data, onClose, onSaved }: Props) => {
	const { t } = useTranslation()
	const qc = useQueryClient()
	const isEdit = Boolean(data?.id)

	const { control, handleSubmit } = useForm<PKMCreate>({
		defaultValues: {
			name: data?.name || '',
			investor: data?.investor || '',
			top_content: data?.top_content || '',
			bottom_content: data?.bottom_content || ''
		}
	})

	const { mutateAsync, isPending } = useMutation({
		mutationFn: (payload: PKMCreate) =>
			isEdit ? DatasetService.updatePKM(data!.id, payload) : DatasetService.createPKM(payload),
		async onSuccess() {
			await qc.invalidateQueries({ queryKey: ['pkm_list'] })
			onSaved()
		},
		onError(err) {
			toast.push(<Notification type="danger" title={errorCatch(err)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onSubmit = async (values: PKMCreate) => {
		await mutateAsync(values)
	}

	return (
		<Drawer
			title={isEdit ? t('Редактировать ПКМ') : t('Добавить ПКМ')}
			isOpen
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className="w-full text-right">
					<Button size="md" className="mr-2" onClick={onClose} disabled={isPending}>
						{t('Отмена')}
					</Button>
					<Button
						form="pkmForm"
						type="submit"
						size="md"
						variant="solid"
						loading={isPending}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<form id="pkmForm" onSubmit={handleSubmit(onSubmit)}>
				<FormContainer>
					{/* Name Field */}
					<Controller
						control={control}
						name="name"
						rules={{
							required: t('Название обязательно'),
							minLength: {
								value: 2,
								message: t('Минимум 2 символа')
							}
						}}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Название')}
								invalid={invalid}
								errorMessage={error?.message}
							>
								<Input
									{...field}
									placeholder={t('Введите название')}
									invalid={invalid}
								/>
							</FormItem>
						)}
					/>

					{/* Investor Field */}
					<Controller
						control={control}
						name="investor"
						rules={{
							required: t('Инвестор обязательно'),
							minLength: {
								value: 2,
								message: t('Минимум 2 символа')
							}
						}}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Инвестор')}
								invalid={invalid}
								errorMessage={error?.message}
							>
								<Input
									{...field}
									placeholder={t('Введите инвестор')}
									invalid={invalid}
								/>
							</FormItem>
						)}
					/>

					{/* Top Content Field */}
					<Controller
						control={control}
						name="top_content"
						rules={{
							required: t('Верхний текст обязательно'),
							minLength: {
								value: 10,
								message: t('Минимум 10 символов')
							}
						}}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Верхний текст')}
								invalid={invalid}
								errorMessage={error?.message}
							>
								<textarea
									{...field}
									rows={5}
									className={`w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500 transition-colors ${
										invalid ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder={t('Введите верхний текст')}
								/>
							</FormItem>
						)}
					/>

					{/* Bottom Content Field */}
					<Controller
						control={control}
						name="bottom_content"
						rules={{
							required: t('Нижний текст обязательно'),
							minLength: {
								value: 10,
								message: t('Минимум 10 символов')
							}
						}}
						render={({ field, fieldState: { invalid, error } }) => (
							<FormItem
								label={t('Нижний текст')}
								invalid={invalid}
								errorMessage={error?.message}
							>
								<textarea
									{...field}
									rows={5}
									className={`w-full rounded-md border px-3 py-2 outline-none focus:border-blue-500 transition-colors ${
										invalid ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder={t('Введите нижний текст')}
								/>
							</FormItem>
						)}
					/>
				</FormContainer>
			</form>
		</Drawer>
	)
}

export default PKMEditDrawer
