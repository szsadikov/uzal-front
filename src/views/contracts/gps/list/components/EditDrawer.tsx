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

type Props = { data: ConstMetric; onClose: () => void }
/* =========== Pul formatlari (o‘zgarmagan) =========== */
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
	const qc = useQueryClient()
	const { t } = useTranslation()

	/* =============== Валидация (i18n) =============== */
	const validationSchema = Yup.object().shape({
		gps: Yup.string().required(t('Поле GPS обязательно')),
		vat: Yup.string().test('is-percent', t('Введите целое число в диапазоне 0–100'), (v) => {
			if (v === '' || v === undefined || v === null) return true
			const n = Number((v ?? '').toString().replace(',', '.'))

			return Number.isFinite(n) && n >= 0 && n <= 100 && Number.isInteger(n)
		}),
		min_threshold_withVat: Yup.string().nullable()
	})


	// 🔤 UI matnlari — i18n orqali
	const T = {
		drawerTitle: t('Редактировать GPS'),
		btnCancel: t('Отмена'),
		btnSave: t('Сохранить'),

		gpsLabel: t('GPS'),
		gpsPlaceholder: t('Введите цену GPS'),

		vatLabel: t('НДС, %'),
		vatPlaceholder: t('12'),

		priceWithVatLabel: t('Цена с НДС'),
		priceWithVatPlaceholder: t('Автоматически рассчитывается'),

		notifUpdatedTitle: t('GPS обновлён')
	}

	const { mutateAsync: updateConstMetric, isPending } = useMutation({
		mutationFn: (values: { gps: string }) =>
			DatasetService.updateConstMetric<never, { gps: string }>(data.id, values),
		onSuccess(updatedData) {
			qc.setQueryData(['const_metric', data.id], updatedData)
			toast.push(<Notification type='success' title={T.notifUpdatedTitle} duration={2000} />, {
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

	const initialVat = (() => {
		const n = Number((data.vat ?? '').toString().replace(',', '.'))

		return Number.isFinite(n) ? String(Math.round(n)) : '0'
	})()

	const initialGpsDisplay = fromBackendToDisplay(data.gps ?? '')
	const initialWithVatDisplay = (() => {
		const gpsNum = Number(toBackendDotDecimal(initialGpsDisplay) || '0')
		const vatNum = Number(initialVat || '0')
		const withVat = gpsNum * (1 + vatNum / 100)

		return fromBackendToDisplay(withVat.toFixed(2))
	})()

	return (
		<Drawer
			title={T.drawerTitle}
			isOpen={true}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button size='md' className='mr-2' onClick={onClose} disabled={isPending}>
						{T.btnCancel}
					</Button>
					<Button
						form='advanceEditForm'
						type='submit'
						size='md'
						variant='solid'
						disabled={isPending}
					>
						{T.btnSave}
					</Button>
				</div>
			}
		>
			<Formik
				enableReinitialize
				initialValues={{
					gps: initialGpsDisplay,
					vat: initialVat,
					min_threshold_withVat: initialWithVatDisplay
				}}
				validationSchema={validationSchema}
				onSubmit={async (values) => {
					const gpsStr = toBackendDotDecimal(values.gps ?? '')
					await updateConstMetric({ gps: gpsStr })
				}}
			>
				{({ errors, touched, values, setFieldValue }) => (
					<Form id='advanceEditForm'>
						<FormContainer>
							{/* GPS */}
							<FormItem invalid={!!(errors.gps && touched.gps)} errorMessage={errors.gps}>
								<h6 className='mb-2'>{T.gpsLabel}</h6>
								<Field name='gps'>
									{() => (
										<Input
											placeholder={T.gpsPlaceholder}
											inputMode='decimal'
											value={values.gps}
											invalid={!!errors.gps}
											onChange={(e) => {
												const display = formatMoneyInput(e.target.value)
												setFieldValue('gps', display)
												const gpsNum = Number(toBackendDotDecimal(display) || '0')
												const vatNum = Number(values.vat || '0')
												const withVat = gpsNum * (1 + vatNum / 100)
												setFieldValue(
													'min_threshold_withVat',
													fromBackendToDisplay(withVat.toFixed(2))
												)
											}}
											onWheel={(e: any) => e.currentTarget.blur()}
										/>
									)}
								</Field>
							</FormItem>

							{/* НДС (%) — UI hisob-kitob */}
							<FormItem invalid={!!(errors.vat && touched.vat)} errorMessage={errors.vat}>
								<h6 className='mb-2'>{T.vatLabel}</h6>
								<Field name='vat'>
									{() => (
										<div className='relative'>
											<Input
												type='text'
												inputMode='numeric'
												placeholder={T.vatPlaceholder}
												value={values.vat}
												maxLength={3}
												readOnly
												onChange={(e) => {
													const digits = e.target.value.replace(/\D/g, '')
													const num = digits === '' ? '' : Math.min(Number(digits), 100)
													const asStr = num === '' ? '0' : String(num)
													setFieldValue('vat', asStr)
													const gpsNum = Number(toBackendDotDecimal(values.gps ?? '') || '0')
													const vatNum = Number(asStr || '0')
													const withVat = gpsNum * (1 + vatNum / 100)
													setFieldValue(
														'min_threshold_withVat',
														fromBackendToDisplay(withVat.toFixed(2))
													)
												}}
											/>
											<span className='pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-500'>
												%
											</span>
										</div>
									)}
								</Field>
							</FormItem>

							{/* Цена с НДС — readonly */}
							<FormItem>
								<h6 className='mb-2'>{T.priceWithVatLabel}</h6>
								<Field name='min_threshold_withVat'>
									{() => (
										<Input
											placeholder={T.priceWithVatPlaceholder}
											value={values.min_threshold_withVat}
											readOnly
										/>
									)}
								</Field>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		</Drawer>
	)
}

export default EditDrawer
