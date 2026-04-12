// src/pages/branches/components/AdvanceEditDrawer.tsx
import { useTranslation } from 'react-i18next'   // ⬅️ i18n
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Field, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { ConstMetric } from '@/@types/dataset.types'
import {
	Button,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Notification,
	toast
} from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'

type Props = {
	data: ConstMetric
	onClose: () => void
}

const AdvanceEditDrawer = ({ data, onClose }: Props) => {
	const { t } = useTranslation() // ⬅️ i18n
	const queryClient = useQueryClient()

	const validationSchema = Yup.object().shape({
		min_deposit_percentage: Yup.number()
			.required(t('Обязательно'))
			.min(0, t('Не может быть меньше 0'))
			.max(100, t('Не может быть больше 100'))
	})

	const { mutateAsync: updateConstMetric, isPending } = useMutation({
		mutationFn: (values: { min_deposit_percentage: string }) =>
			DatasetService.updateConstMetric<never, { min_deposit_percentage: string }>(data.id, values),
		onSuccess(updatedData) {
			queryClient.setQueryData(['const_metric', data.id], updatedData)
			toast.push(<Notification type="success" title={t('Аванс обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
			onClose()
		},
		onError(error) {
			toast.push(<Notification type="danger" title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	return (
		<Drawer
			title={t('Редактировать аванс')}
			isOpen={true}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className="w-full text-right">
					<Button size="md" className="mr-2" onClick={onClose} disabled={isPending}>
						{t('Отмена')}
					</Button>
					<Button form="advanceEditForm" type="submit" size="md" variant="solid" disabled={isPending}>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<Formik
				initialValues={{ min_deposit_percentage: data.min_deposit_percentage }}
				validationSchema={validationSchema}
				onSubmit={async (values) => {
					await updateConstMetric(values)
				}}
			>
				{({ errors, touched }) => (
					<Form id="advanceEditForm">
						<FormContainer>
							<FormItem
								invalid={!!(errors.min_deposit_percentage && touched.min_deposit_percentage)}
								errorMessage={errors.min_deposit_percentage}
							>
								<h6 className="mb-2">{t('Аванс (%)')}</h6>
								<Field
									name="min_deposit_percentage"
									type="number"
									component={Input}
									placeholder={t('Введите процент аванса')}
								/>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</Drawer>
	)
}

export default AdvanceEditDrawer
