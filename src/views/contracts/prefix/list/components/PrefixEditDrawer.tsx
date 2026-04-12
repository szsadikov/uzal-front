// src/pages/prefix/components/PrefixEditDrawer.tsx
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@tanstack/react-query'
import { Field, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import type { ContractMeta } from '@/@types/dataset.types'
import {
	Button,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Notification,
	toast
} from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'

type FormModel = {
	year: number | null
	number: string | null
	region_code: string
}

export default function PrefixEditDrawer({
	open,
	item,
	onClose,
	onSaved
}: {
	open: boolean
	item: ContractMeta | null
	onClose: () => void
	onSaved?: (updated?: ContractMeta) => Promise<unknown> | void
}) {
	const { t } = useTranslation() // ⬅️ i18n

	// ⬇️ Yup xabarlarini i18n orqali
	const schema = Yup.object({
		year: Yup.number()
			.nullable()
			.transform((v, o) => (o === '' ? null : v))
			.min(1900, t('Не меньше 1900'))
			.max(2100, t('Не больше 2100')),
		region_code: Yup.string()
			.required(t('Код области обязателен'))
			.matches(/^\d{2}$/, t('Код области должен содержать ровно 2 цифры')),
		number: Yup.string().nullable()
	})

	const formikRef = useRef<FormikProps<FormModel>>(null)

	const { mutateAsync, isPending } = useMutation({
		mutationKey: ['update contract meta', item?.id],
		mutationFn: async (payloadUI: FormModel) => {
			if (!item) throw new Error('No item')
			const prepared = {
				year: payloadUI.year,
				number: (item as any)?.number ?? null,
				region_code: payloadUI.region_code.padStart(2, '0')
			}
			await DatasetService.updateContractMeta<void, typeof prepared>(item.id, prepared)
		},
		async onSuccess() {
			try {
				if (item) {
					const { data: fresh } = await DatasetService.getContractMetaById<ContractMeta>(item.id)
					toast.push(<Notification type='success' title={t('Сохранено')} duration={1500} />, {
						placement: 'top-center'
					})
					await onSaved?.(fresh)
				} else {
					toast.push(<Notification type='success' title={t('Сохранено')} duration={1500} />, {
						placement: 'top-center'
					})
					await onSaved?.()
				}
			} catch (e) {
				console.error(e)
				toast.push(
					<Notification type='warning' title={t('Сохранено, но обновление не удалось')} />,
					{ placement: 'top-center' }
				)
			} finally {
				onClose()
			}
		},
		onError(err) {
			console.error(err)
			toast.push(
				<Notification type='danger' title={t('Ошибка при сохранении')} duration={2000} />,
				{ placement: 'top-center' }
			)
		}
	})

	return (
		<Drawer
			isOpen={open}
			title={t('Изменить префикс')}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button className='mr-2' onClick={onClose} disabled={isPending}>
						{t('Отмена')}
					</Button>
					<Button variant='solid' type='submit' form='prefix-form' disabled={isPending}>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<Formik<FormModel>
				innerRef={formikRef}
				enableReinitialize
				initialValues={{
					year: item?.year ?? null,
					number: item?.number == null ? '' : String(item.number),
					region_code:
						item?.region?.region_code != null
							? String(item.region.region_code).replace(/\D/g, '').slice(0, 2).padStart(2, '0')
							: ''
				}}
				validationSchema={schema}
				onSubmit={async (values) => {
					const payload: FormModel = {
						year: values.year,
						number: (item as any)?.number ?? null,
						region_code: (values.region_code ?? '').padStart(2, '0')
					}
					await mutateAsync(payload)
				}}
			>
				{({ errors, touched, values, setFieldValue, handleSubmit }) => (
					<Form id='prefix-form' onSubmit={handleSubmit}>
						<FormContainer>
							{/* Faqat ko‘rsatish uchun */}
							<FormItem label={t('Область')}>
								<Input value={item?.region?.name_ru ?? '—'} readOnly />
							</FormItem>

							{/* Код области (2 xonali) */}
							<FormItem
								label={t('Код области')}
								invalid={!!errors.region_code && !!touched.region_code}
								errorMessage={errors.region_code}
							>
								<Field name='region_code'>
									{() => (
										<Input
											type='text'
											inputMode='numeric'
											placeholder='01'
											value={values.region_code}
											maxLength={2}
											invalid={!!errors.region_code}
											onChange={(e) => {
												const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 2)
												setFieldValue('region_code', onlyDigits)
											}}
											onBlur={() => {
												if (values.region_code) {
													setFieldValue('region_code', values.region_code.padStart(2, '0'))
												}
											}}
										/>
									)}
								</Field>
							</FormItem>

							{/* Год */}
							<FormItem
								label={t('Год')}
								invalid={!!errors.year && !!touched.year}
								errorMessage={errors.year}
							>
								<Field name='year'>
									{() => (
										<Input
											type='text'
											inputMode='numeric'
											value={values.year ?? ''}
											placeholder={t('Например: 2025')}
											maxLength={4}
											onChange={(e) => {
												const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 4)
												setFieldValue('year', onlyDigits ? Number(onlyDigits) : null)
											}}
										/>
									)}
								</Field>
							</FormItem>

							{/* ❌ Tahrirlanmaydi (disabled) */}
							<FormItem label={t('Начальный номер')}>
								<Field name='number'>
									{() => (
										<Input
											type='text'
											value={values.number ?? ''}
											readOnly
											disabled
											placeholder='0001'
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
