// EquipmentEdit.tsx — URL params bilan
import { SubmitHandler } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useLocation,useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Tech } from '@/@types/tech.types'
import { DoubleSidedImage, Loading } from '@/components/shared'
import { Notification, toast } from '@/components/ui'
import { API_SERVER_URL } from '@/constants/api.constant'
import { errorCatch } from '@/services/api.helpers'
import { TechService } from '@/services/tech.service'
import EquipmentForm, { FormModel } from '../form/EquipmentForm'

const EquipmentEdit = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const location = useLocation()
	const { t } = useTranslation()

	const fromPage = (location.state && (location.state as any).page) ? (location.state as any).page : 1

	const { data: tech, isLoading: isLoadingTech } = useQuery({
		queryKey: ['get tech', id],
		queryFn: () => TechService.getById<Tech>(Number(id)),
		select: ({ data }) => data
	})

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update equipment', id],
		mutationFn: (data: FormData) => TechService.update<Tech, FormData>(Number(id), data),
		onSuccess() {
			toast.push(<Notification title={t('Техника обновлена')} type='success' duration={2500} />, {
				placement: 'top-center'
			})
			// URL query param sifatida page'ni yuborish
			navigate(`/catalog/equipment?page=${fromPage}`)
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
		formData.append('characteristics', JSON.stringify(data.characteristics))

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

		await mutateAsyncUpdate(formData)
	}

	// Discard tugmasini ham yangilash
	const handleDiscard = () => {
		navigate(`/catalog/equipment?page=${fromPage}`)
	}

	return (
		<>
			<Loading loading={isLoadingTech}>
				{tech ? (
					<EquipmentForm
						type='edit'
						defaultValues={{
							model_name_ru: tech.model_name_ru,
							model_name_uz: tech.model_name_uz,
							manufacturer: tech.manufacturer ? tech.manufacturer.id : null,
							country: tech.country ? tech.country : '',
							type: tech.type ? tech.type.id : null,
							measure_unit: tech.measure_unit,
							code_1c: tech.code_1c,
							ikpu_code: tech.ikpu_code,
							description: tech.description ? tech.description : '',
							characteristics:
								tech.characteristics && tech.characteristics.length ? tech.characteristics : null,
							files:
								tech.files && tech.files.length
									? tech.files.map((f) => ({
										id: f.id,
										file: API_SERVER_URL + f.file
									}))
									: []
						}}
						onFormSubmit={handleFormSubmit}
						isSubmitting={isLoadingTech || isPendingUpdate}
						onDiscard={handleDiscard}
					/>
				) : (
					<div className='flex h-full flex-col items-center justify-center'>
						<DoubleSidedImage
							src='/img/others/img-2.png'
							darkModeSrc='/img/others/img-2-dark.png'
							alt={t('Продукт не найден!')}
						/>
						<h3 className='mt-8'>{t('Продукт не найден!')}</h3>
					</div>
				)}
			</Loading>
		</>
	)
}

export default EquipmentEdit
