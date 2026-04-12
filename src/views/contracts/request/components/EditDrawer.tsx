// src/pages/branches/components/AdvanceEditDrawer.tsx
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

type FormValues = {
	min_threshold: string
}

/* =========== Хелперы форматирования денежных значений =========== */
function formatMoneyInput(raw: string): string {
	const cleaned = raw.replace(/[^\d,]/g, '')
	if (!cleaned) return ''
	const [intRaw, fracRaw = ''] = cleaned.split(',')
	const intDigits = intRaw.replace(/\D/g, '')
	const fracDigits = fracRaw.replace(/\D/g, '').slice(0, 2)
	const groupedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	if (cleaned.endsWith(',') && fracDigits.length === 0) return groupedInt + ','

	return fracDigits.length ? `${groupedInt},${fracDigits}` : groupedInt
}

function toBackendDotDecimal(display: string): string {
	if (!display) return ''
	const normalized = display.replace(/\s+/g, '').replace(',', '.')
	const m = normalized.match(/^(\d+)(?:\.(\d{0,2}))?$/)
	if (!m) return ''
	const intPart = m[1]
	const frac = m[2] ?? ''
	if (frac.length === 0) return intPart

	return `${intPart}.${frac.padEnd(2, '0')}`
}

function fromBackendToDisplay(value?: string | number | null): string {
	if (value === null || value === undefined || value === '') return ''
	const s = String(value).replace(',', '.')
	const [intRaw, fracRaw = ''] = s.split('.')
	const intDigits = intRaw.replace(/\D/g, '')
	const groupedInt = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
	const frac = fracRaw.replace(/\D/g, '').padEnd(2, '0').slice(0, 2)

	return frac ? `${groupedInt},${frac}` : groupedInt
}

const EditDrawer = ({ data, onClose }: Props) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()

	const validationSchema = Yup.object().shape({
		min_threshold: Yup.string()
			.required(t('Талабнома суммаси киритилиши шарт'))
			.test('valid-number', t('Тўғри сумма киритинг'), (value) => {
				if (!value) return false
				const normalized = value.replace(/\s+/g, '').replace(',', '.')

				return /^\d+(\.\d{0,2})?$/.test(normalized)
			})
	})

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<FormValues>({
		resolver: yupResolver(validationSchema),
		defaultValues: {
			min_threshold: fromBackendToDisplay(data?.min_threshold ?? '')
		},
		mode: 'onSubmit'
	})

	const { mutateAsync: updateConstMetric, isPending } = useMutation({
		mutationFn: (values: { min_threshold: string }) =>
			DatasetService.updateConstMetric<never, { min_threshold: string }>(data.id, values),
		onSuccess(updatedData) {
			queryClient.setQueryData(['const_metric', data.id], updatedData)
			toast.push(<Notification type='success' title={t('Сумма обновлена')} duration={2000} />, {
				placement: 'top-center'
			})
			onClose()
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const onSubmit = async (values: FormValues) => {
		const payload = { min_threshold: toBackendDotDecimal(values.min_threshold ?? '') }
		await updateConstMetric(payload)
	}

	const isLoading = isPending || isSubmitting

	return (
		<Drawer
			title={t('Редактировать сумму')}
			isOpen={true}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button size='md' className='mr-2' onClick={onClose} disabled={isLoading}>
						{t('Отмена')}
					</Button>
					<Button size='md' variant='solid' disabled={isLoading} onClick={handleSubmit(onSubmit)}>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormContainer>
					<FormItem invalid={!!errors.min_threshold} errorMessage={errors.min_threshold?.message}>
						<h6 className='mb-2'>{t('Талабнома')}</h6>
						<Controller
							name='min_threshold'
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type='text'
									inputMode='decimal'
									placeholder={t('Талабнома суммасини киритинг')}
									value={field.value}
									onChange={(e) => field.onChange(formatMoneyInput(e.target.value))}
									onWheel={(e: any) => e.currentTarget.blur()}
									invalid={!!errors.min_threshold}
								/>
							)}
						/>
					</FormItem>
				</FormContainer>
			</form>
		</Drawer>
	)
}

export default EditDrawer
