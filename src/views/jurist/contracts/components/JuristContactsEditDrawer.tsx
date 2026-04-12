import { forwardRef, type MouseEvent, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import { FormPatternInput } from '@/components/shared'
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
import { Branch } from '@/@types/dataset.types'
import {
	JuristContact,
	JuristContactFormModel,
	JuristContactsService
} from '../jurist-contacts.service'
import { JURIST_CONTACTS_QUERY_KEY } from '../jurist-contacts.constants'

type Props = {
	data: JuristContact
	onClose: () => void
}

type DrawerFooterProps = {
	onSaveClick: (e: MouseEvent<HTMLButtonElement>) => void
	onCancel: (e: MouseEvent<HTMLButtonElement>) => void
	isSubmitting?: boolean
}

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

type EditFormProps = {
	data: JuristContact
	branches: Branch[]
}

const EditForm = forwardRef<FormikProps<JuristContactFormModel>, EditFormProps>(
	({ data, branches }, ref) => {
		const { t } = useTranslation()

		const validationSchema = Yup.object().shape({
			branch: Yup.number().nullable().required(t('Обязательно')),
			role: Yup.string().required(t('Обязательно')),
			full_name: Yup.string().required(t('Обязательно')),
			phone_number: Yup.string().required(t('Обязательно'))
		})

		const branchOptions = branches.map((b) => ({ label: b.name, value: b.id }))

		return (
			<Formik<JuristContactFormModel>
				innerRef={ref}
				enableReinitialize
				initialValues={{
					branch: data.branch ?? null,
					role: data.role ?? '',
					full_name: data.full_name ?? '',
					phone_number: data.phone_number ?? ''
				}}
				validationSchema={validationSchema}
				onSubmit={() => {}}
			>
				{({ errors, touched }) => (
					<Form id='juristEditForm'>
						<FormContainer>
							{/* Филиал */}
							<FormItem
								invalid={!!(errors.branch && touched.branch)}
								errorMessage={errors.branch as string}
							>
								<h6 className='mb-2'>{t('Филиал')}</h6>
								<Field name='branch'>
									{({ field, form }: FieldProps) => (
										<Select
											field={field}
											form={form}
											placeholder={t('Выберите филиал')}
											options={branchOptions}
											value={branchOptions.find((o) => o.value === field.value) ?? null}
											onChange={(opt) =>
												form.setFieldValue(field.name, opt?.value ?? null)
											}
										/>
									)}
								</Field>
							</FormItem>

							{/* Роль */}
							<FormItem
								invalid={!!(errors.role && touched.role)}
								errorMessage={errors.role}
							>
								<h6 className='mb-2'>{t('Роль')}</h6>
								<Field
									name='role'
									component={Input}
									placeholder={t('Введите роль')}
								/>
							</FormItem>

							{/* ФИО */}
							<FormItem
								invalid={!!(errors.full_name && touched.full_name)}
								errorMessage={errors.full_name}
							>
								<h6 className='mb-2'>{t('ФИО')}</h6>
								<Field
									name='full_name'
									component={Input}
									placeholder={t('Введите ФИО')}
								/>
							</FormItem>

							{/* Номер телефона */}
							<FormItem
								invalid={!!(errors.phone_number && touched.phone_number)}
								errorMessage={errors.phone_number}
							>
								<h6 className='mb-2'>{t('Номер телефона')}</h6>
								<Field name='phone_number'>
									{({ field, form }: FieldProps) => (
										<FormPatternInput
											form={form}
											field={field}
											format='## ### ## ##'
											mask='_'
											inputPrefix='+998 '
											placeholder='__-___-__-__'
											value={field.value ?? ''}
											onValueChange={(e: { floatValue?: number; value?: string }) =>
												form.setFieldValue(field.name, e?.floatValue ?? e?.value ?? '')
											}
										/>
									)}
								</Field>
							</FormItem>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

const JuristContactsEditDrawer = ({ data, onClose }: Props) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const formikRef = useRef<FormikProps<JuristContactFormModel>>(null)

	const { data: branches = [] } = useQuery({
		queryKey: ['branches-all'],
		queryFn: () => DatasetService.getAllBranches<Branch[]>(),
		select: (res) => res.data
	})

	const { mutateAsync: updateContact, isPending } = useMutation({
		mutationFn: (values: JuristContactFormModel) =>
			JuristContactsService.update(data.id, values),
		onSuccess() {
			toast.push(
				<Notification type='success' title={t('Контакт юриста обновлён')} duration={2000} />,
				{ placement: 'top-center' }
			)
			queryClient.invalidateQueries({ queryKey: [JURIST_CONTACTS_QUERY_KEY] })
			onClose()
		},
		onError(error) {
			toast.push(<Notification type='danger' title={errorCatch(error)} duration={2000} />, {
				placement: 'top-center'
			})
		}
	})

	const handleSave = async () => {
		if (!formikRef.current) return
		const formik = formikRef.current
		formik.setTouched(
			{ branch: true, role: true, full_name: true, phone_number: true },
			true
		)
		const errors = await formik.validateForm()
		if (Object.keys(errors).length > 0) return
		await updateContact(formik.values)
	}

	return (
		<Drawer
			title={t('Редактировать контакт юриста')}
			isOpen
			onClose={onClose}
			onRequestClose={onClose}
			footer={
				<DrawerFooter
					onCancel={onClose}
					onSaveClick={handleSave}
					isSubmitting={isPending}
				/>
			}
		>
			<EditForm ref={formikRef} data={data} branches={branches} />
		</Drawer>
	)
}

export default JuristContactsEditDrawer
