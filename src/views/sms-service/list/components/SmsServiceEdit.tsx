import { useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Field, Form, Formik, type FormikProps } from 'formik'
import * as Yup from 'yup'
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
import { useTranslation } from 'react-i18next'

type SMSRow = { id: number; day_count: number }
type FormModel = { day_count: number | '' }


/** Keshdan SMS ro‘yxatini xavfsiz olish */
function pickSmsListFromCache(queryClient: ReturnType<typeof useQueryClient>) {
	const a: any = queryClient.getQueryData(['sms service list'])
	const b: any = queryClient.getQueryData(['sms-service-list'])
	const cached = a ?? b
	const arr = cached?.results ?? cached?.data?.results ?? cached?.data ?? cached ?? []

	return (Array.isArray(arr) ? arr : []) as Array<SMSRow>
}

export default function SmsServiceEdit({
	open,
	item,
	onClose,
	onSaved,
	loading
}: {
	open: boolean
	item?: SMSRow | null
	onClose: () => void
	onSaved?: () => void
	loading?: boolean
}) {
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const queryClient = useQueryClient()
	const { t } = useTranslation()

	const validationSchema = Yup.object().shape({
		day_count: Yup.number()
			.nullable()
			.transform((_v, o) => (o === '' || o === null ? null : Number(o)))
			.typeError(t('Raqam kiriting'))
			.required(t('Поле обязательно'))
			.min(0, t("0 dan kichik bo'lishi mumkin emas"))
			.max(2147483647, t('Juda katta son'))
	})

	const { mutateAsync: updateSms, isPending } = useMutation({
		mutationFn: (payload: FormModel) =>
			DatasetService.updateSMS<void, { day_count: number }>(Number(item?.id), {
				day_count: Number(payload.day_count)
			}),
		onSuccess: () => {
			toast.push(
				<Notification title={t('Успешно')} type='success'>
					{t('Изменения сохранены')}
				</Notification>
			)
			queryClient.invalidateQueries({ queryKey: ['sms service list'] })
			queryClient.invalidateQueries({ queryKey: ['sms-service-list'] })
			onSaved?.()
			onClose()
		}
	})

	const submit = async () => {
		const f = formikRef.current
		if (!f || !item) return

		// 1) Formik validatsiya
		const errs = await f.validateForm()
		if (Object.keys(errs).length) {
			f.setErrors(errs)
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)
			return
		}

		// 2) Unikallik (o‘zidan tashqari)
		const list = pickSmsListFromCache(queryClient)
		const day = Number(f.values.day_count)
		const exists = list.some((x) => x.id !== item.id && Number(x.day_count) === day)

		if (exists) {
			f.setErrors({ day_count: t('Bu kun allaqachon mavjud') })
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)
			return
		}

		// 3) Serverga yuborish + server “exists”
		try {
			await updateSms({ day_count: day })
		} catch (err: any) {
			const srvMsg =
				err?.response?.data?.day_count?.[0] ??
				err?.response?.data?.detail ??
				err?.response?.data?.message ??
				err?.message ??
				t('Bu kun allaqachon mavjud')

			f.setErrors({ day_count: srvMsg })
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)
			return
		}
	}

	return (
		<Drawer
			isOpen={open}
			width={440}
			title={t('Редактирование SMS сервиса')}
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<div className='w-full text-right'>
					<Button className='mr-2' onClick={onClose} disabled={isPending || loading}>
						{t('Отмена')}
					</Button>
					<Button variant='solid' loading={isPending || loading} onClick={submit}>
						{t('Сохранить')}
					</Button>
				</div>
			}
		>
			<Formik<FormModel>
				innerRef={formikRef}
				enableReinitialize
				initialValues={{ day_count: (item?.day_count ?? '') as any }}
				validationSchema={validationSchema}
				onSubmit={() => void 0}
			>
				{({ errors }) => {
					const isInvalid = !!errors.day_count

					return (
						<Form>
							<FormContainer>
								<FormItem invalid={isInvalid} errorMessage={errors.day_count as string}>
									<h6 className='mb-4'>{t('За сколько дней')}</h6>
									<Field
										as={Input}
										type='number'
										name='day_count'
										placeholder={t('Введите количество дней')}
										inputMode='numeric'
										disabled={isPending || loading}
										invalid={isInvalid}
									/>
								</FormItem>
							</FormContainer>
						</Form>
					)
				}}
			</Formik>
		</Drawer>
	)
}
