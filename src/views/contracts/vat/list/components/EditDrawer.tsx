// src/pages/branches/components/AdvanceEditDrawer.tsx
import { useTranslation } from 'react-i18next'
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

const EditDrawer = ({ data, onClose }: Props) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const validationSchema = Yup.object().shape({
		vat: Yup.number()
			.required(t('Обязательно'))
			.min(0, t('Не может быть меньше 0'))
			.max(100, t('Не может быть больше 100'))
	})

	const { mutateAsync: updateConstMetric, isPending } = useMutation({
		mutationFn: (values: { vat: string }) =>
			DatasetService.updateConstMetric<never, { vat: string }>(data.id, values),
		onSuccess(updatedData) {
			queryClient.setQueryData(['const_metric', data.id], updatedData)
			toast.push(<Notification type="success" title={t('НДС обновлен')} duration={2000} />, {
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
			title={t('Редактировать НДС')}
			isOpen={true}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className="w-full text-right">
					<Button size="md" className="mr-2" onClick={onClose} disabled={isPending}>
						{t('Отменить')}
					</Button>
					<Button
						form="advanceEditForm"
						type="submit"
						size="md"
						variant="solid"
						disabled={isPending}
					>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<Formik
				initialValues={{ vat: data.vat }}
				validationSchema={validationSchema}
				onSubmit={async (values) => {
					await updateConstMetric(values)
				}}
			>
				{({ errors, touched }) => (
					<Form id="advanceEditForm">
						<FormContainer>
							<FormItem invalid={!!(errors.vat && touched.vat)} errorMessage={errors.vat}>
								<h6 className="mb-2">{t('НДС (%)')}</h6>
								<Field
									name="vat"
									type="number"
									component={Input}
									placeholder={t('Введите процент НДС')}
								/>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</Drawer>
	)
}

export default EditDrawer
