import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Tech } from '@/@types/tech.types'
import { Notification, toast } from '@/components/ui'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import EquipmentForm, { FormModel } from '../form/EquipmentForm'

const EquipmentAdd = () => {
	const navigate = useNavigate()
	const { t } = useTranslation()

	const { mutateAsync: mutateAsyncCreate, isPending: isPendingCreate } = useMutation({
		mutationKey: ['create new equipment'],
		mutationFn: (data: FormData) => TechService.create<Tech, FormData>(data),
		onSuccess({ data }) {
			toast.push(
				<Notification title={`${t('Продукт создан')}: ${data.id}`} type='success' duration={2500} />,
				{
					placement: 'top-center'
				}
			)
			navigate('/catalog/equipment')
		},
		onError(error) {
			const message = errorCatch(error)

			toast.push(<Notification type='danger' title={message} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const handleFormSubmit: SubmitHandler<FormModel> = async (data) => {
		const formData = new FormData()

		formData.append('model_name_ru', data.model_name_ru)
		formData.append('model_name_uz', data.model_name_uz)
		formData.append('manufacturer', String(data.manufacturer))
		formData.append('country', data.country)
		formData.append('type', String(data.type))
		formData.append('measure_unit', String(data.measure_unit))
		formData.append('code_1c', data.code_1c)
		formData.append('ikpu_code', data.ikpu_code)
		formData.append('description', data.description)

		if (data.characteristics) {
			formData.append('characteristics', JSON.stringify(data.characteristics))
		}
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

					formData.append('files', file)
				} catch (error) {
					console.warn(`Failed to fetch or convert blob URL: ${url}`, error)
				}
			}
		}

		await mutateAsyncCreate(formData)
	}

	return (
		<EquipmentForm
			defaultValues={
				{
					model_name_ru: '',
					model_name_uz: '',
					manufacturer: null,
					country: '',
					type: null,
					measure_unit: null,
					code_1c: '',
					ikpu_code: '',
					description: '',
					files: [],
					characteristics: []
				} as FormModel
			}
			type='new'
			onFormSubmit={handleFormSubmit}
			isSubmitting={isPendingCreate}
			onDiscard={() => navigate('/catalog/equipment')}
		/>
	)
}

export default EquipmentAdd
