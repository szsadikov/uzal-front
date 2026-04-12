// src/pages/regions/components/RegionsEditDrawer.tsx
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { Region } from '@/@types/dataset.types'
import {
	Button,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Notification,
	Select,
	toast
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'

type Props = {
	data: Region
	onClose: () => void
}

type FormModel = {
	name_ru: string
	name_uz: string
	position: number
	is_active: boolean
	region_code: string
}

const RegionsEditDrawer = ({ data, onClose }: Props) => {
	const { t } = useTranslation() // ⬅️ i18n

	const validationSchema = Yup.object().shape({
		name_ru: Yup.string().required(t('Обязательно')),
		name_uz: Yup.string().required(t('Обязательно')),
		position: Yup.number().required(t('Обязательно')),
		is_active: Yup.boolean().required(t('Обязательно')),
		region_code: Yup.string().required(t('Обязательно'))
	})

	const queryClient = useQueryClient()
	const { mutateAsync: updateRegion, isPending } = useMutation({
		mutationFn: (values: FormModel) => DatasetService.updateRegion<never>(data.id, values),
		onSuccess() {
			toast.push(<Notification type='success' title={t('Регион обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
			queryClient.invalidateQueries({ queryKey: ['get regions'] })
			onClose()
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	return (
		<Drawer
			title={t('Редактировать регион')}
			isOpen={true}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button size='md' className='mr-2' onClick={onClose} disabled={isPending}>
						{t('Отмена')}
					</Button>
					<Button
						form='regionEditForm'
						type='submit'
						size='md'
						variant='solid'
						disabled={isPending}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<Formik
				initialValues={{
					name_ru: data.name_ru || '',
					name_uz: data.name_uz || '',
					position: data.position || 0,
					is_active: data.is_active ?? true,
					region_code: data.region_code || ''
				}}
				validationSchema={validationSchema}
				onSubmit={async (values) => {
					await updateRegion(values)
				}}
			>
				{({ errors, touched }) => (
					<Form id='regionEditForm'>
						<FormContainer>
							<FormItem
								invalid={!!(errors.name_ru && touched.name_ru)}
								errorMessage={errors.name_ru}
							>
								<h6 className='mb-2'>{t('Название (RU)')}</h6>
								<Field
									name='name_ru'
									component={Input}
									placeholder={t('Введите название на русском')}
								/>
							</FormItem>

							<FormItem
								invalid={!!(errors.name_uz && touched.name_uz)}
								errorMessage={errors.name_uz}
							>
								<h6 className='mb-2'>{t('Название (UZ)')}</h6>
								<Field
									name='name_uz'
									component={Input}
									placeholder={t('Введите название на узбекском')}
								/>
							</FormItem>

							<FormItem
								invalid={!!(errors.position && touched.position)}
								errorMessage={errors.position}
							>
								<h6 className='mb-2'>{t('Позиция')}</h6>
								<Field
									name='position'
									type='number'
									component={Input}
									placeholder={t('Порядковый номер')}
								/>
							</FormItem>

							<FormItem
								invalid={!!(errors.is_active && touched.is_active)}
								errorMessage={errors.is_active}
							>
								<h6 className='mb-2'>{t('Статус')}</h6>
								<Field name='is_active'>
									{({ field, form }: any) => (
										<Select
											field={field}
											form={form}
											options={[
												{ label: t('Активный'), value: true },
												{ label: t('Неактивный'), value: false }
											]}
											value={[
												{ label: t('Активный'), value: true },
												{ label: t('Неактивный'), value: false }
											].find((opt) => opt.value === field.value)}
											onChange={(opt) => form.setFieldValue(field.name, opt?.value)}
										/>
									)}
								</Field>
							</FormItem>

							<FormItem
								invalid={!!(errors.region_code && touched.region_code)}
								errorMessage={errors.region_code}
							>
								<h6 className='mb-2'>{t('Код региона')}</h6>
								<Field
									name='region_code'
									component={Input}
									placeholder={t('Введите код региона')}
								/>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</Drawer>
	)
}

export default RegionsEditDrawer
