import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Field, Form, Formik, type FormikProps } from 'formik'
import i18next from 'i18next'
import * as Yup from 'yup'
import type { SMSService } from '@/@types/dataset.types'
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

type FormModel = { day_count: number | '' }

type FilterFormProps = {
	values: FormModel
	onSubmitComplete: (values: FormModel) => void
	isSubmitting?: boolean
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
	isSubmitting?: boolean
}

/** Keshdan SMS ro‘yxatini xavfsiz olish */
function pickSmsListFromCache(queryClient: ReturnType<typeof useQueryClient>) {
	const a: any = queryClient.getQueryData(['sms service list'])
	const b: any = queryClient.getQueryData(['sms-service-list'])
	const cached = a ?? b
	const arr = cached?.results ?? cached?.data?.results ?? cached?.data ?? cached ?? []

	return (Array.isArray(arr) ? arr : []) as Array<{ id?: number; day_count?: number }>
}

/** Ichki forma */
const SmsNewForm = forwardRef<FormikProps<FormModel>, FilterFormProps>(
	({ values, onSubmitComplete, isSubmitting }, ref) => {
		const { t } = useTranslation()

		const validationSchema = Yup.object().shape({
			day_count: Yup.number()
				.nullable()
				.transform((_v, o) => (o === '' || o === null ? null : Number(o)))
				.typeError(t('Введите число'))
				.required(t('Обязательное поле'))
				.min(0, t('Не может быть меньше 0'))
				.max(2147483647, t('Слишком большое число'))
		})

		return (
			<Formik<FormModel>
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={onSubmitComplete}
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
										disabled={isSubmitting}
										invalid={isInvalid}
									/>
								</FormItem>
							</FormContainer>
						</Form>
					)
				}}
			</Formik>
		)
	}
)
SmsNewForm.displayName = 'SmsNewForm'

const DrawerFooter = ({ onSaveClick, onCancel, isSubmitting = false }: DrawerFooterProps) => {
	const { t } = useTranslation()

	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel} disabled={isSubmitting}>
				{t('Отмена')}
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick} disabled={isSubmitting}>
				{t('Сохранить')}
			</Button>
		</div>
	)
}

const SmsServiceAdd = () => {
	const { t } = useTranslation()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)
	const queryClient = useQueryClient()

	const { mutateAsync: createSmsService, isPending: isPendingCreateSms } = useMutation({
		mutationKey: ['create sms service'],
		mutationFn: (values: FormModel) => {
			const payload = { day_count: Number(values.day_count) } as { day_count: number }

			return DatasetService.createSMS<SMSService, typeof payload>(payload)
		},
		onSuccess: () => {
			setIsOpen(false)
			queryClient.invalidateQueries({ queryKey: ['sms service list'] })
			queryClient.invalidateQueries({ queryKey: ['sms-service-list'] })
			toast.push(<Notification type='success' title={t('Успешно добавлено')} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const formSubmit = async () => {
		const f = formikRef.current
		if (!f) return

		// 1) Formik validatsiya
		const errors = await f.validateForm()
		if (Object.keys(errors).length) {
			f.setErrors(errors) // xatolarni ko‘rsatish
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)

			return
		}

		// 2) Unikallik (cache)
		const list = pickSmsListFromCache(queryClient)
		const day = Number(f.values.day_count)
		const exists = list.some((x) => Number(x.day_count) === day)

		if (exists) {
			f.setErrors({ day_count: i18next.t('Такие дни уже существуют') })
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)

			return
		}

		try {
			await createSmsService(f.values)
		} catch (err: any) {
			const srvMsg =
				err?.response?.data?.day_count?.[0] ??
				err?.response?.data?.detail ??
				err?.response?.data?.message ??
				err?.message ??
				i18next.t('Такие дни уже существуют')

			f.setErrors({ day_count: srvMsg }) // ← borderni qizartiradi
			f.setFieldTouched('day_count', true, false)
			f.setSubmitting(false)

			return
		}
	}

	return (
		<>
			<Button
				variant='solid'
				size='sm'
				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiPlusCircle />}
				onClick={() => setIsOpen(true)}
			>
				{t('Добавить')}
			</Button>

			<Drawer
				title={t('Добавление SMS сервиса')}
				isOpen={isOpen}
				footer={
					<DrawerFooter
						onCancel={() => setIsOpen(false)}
						onSaveClick={formSubmit}
						isSubmitting={isPendingCreateSms}
					/>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<SmsNewForm
					ref={formikRef}
					values={{ day_count: '' }}
					isSubmitting={isPendingCreateSms}
					onSubmitComplete={() => setIsOpen(false)}
				/>
			</Drawer>
		</>
	)
}

export default SmsServiceAdd
