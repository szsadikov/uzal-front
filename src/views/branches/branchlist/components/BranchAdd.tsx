// src/pages/branches/components/BranchNew.tsx
import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next' // ⬅️ qo‘shildi
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Field, FieldProps, Form, Formik, FormikProps, useFormikContext } from 'formik'
import * as Yup from 'yup'
import type { City, Region } from '@/@types/dataset.types'
import {
	Button,
	Drawer,
	FormContainer,
	FormItem,
	Input,
	Notification,
	Select,
	Skeleton,
	toast
} from '@/components/ui'
import { DatasetService } from '@/services/dataset.service'
import { formatAxiosErrorDualLang } from '@/utils/formatAxiosError'

type FormModel = {
	name: string
	region: number | null
	city: number | null
	street: string
	house_number: string
}

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

const BranchNewForm = forwardRef<FormikProps<FormModel>, FilterFormProps & { isOpen: boolean }>(
	({ values, onSubmitComplete, isSubmitting = false, isOpen }, ref) => {
		const { t } = useTranslation() // ⬅️ qo‘shildi

		const validationSchema = Yup.object().shape({
			name: Yup.string().required(t('Поле обязательно')),
			region: Yup.mixed().required(t('Поле обязательно')),
			city: Yup.mixed().required(t('Поле обязательно')),
			street: Yup.string().required(t('Поле обязательно')).min(1).max(100),
			house_number: Yup.string().required(t('Поле обязательно')).min(1).max(100)
		})

		const { data: regions, isLoading: isLoadingRegions } = useQuery({
			queryKey: ['get regions'],
			queryFn: () => DatasetService.getAllRegions<Region[]>(),
			select: (res) => res.data
		})

		useQuery({
			queryKey: ['get cities', values.region],
			enabled: !!values.region,
			queryFn: () => {
				return DatasetService.getAllCities<City[]>({ region: Number(values.region) })
			},
			select: (res) => res.data
		})

		const CitiesSelect = () => {
			const { values, errors, touched } = useFormikContext<FormModel>()
			const { t } = useTranslation() // ⬅️ qo‘shildi (lokal)

			const { data: cities, isLoading: isLoadingCities } = useQuery({
				queryKey: ['get cities', values.region],
				enabled: isOpen && typeof values.region === 'number' && values.region > 0,
				queryFn: () => DatasetService.getAllCities<City[]>({ region: Number(values.region) }),
				select: (res) => res.data
			})

			const cityOptions = (cities || []).map((c) => ({
				label: c.name_ru || c.name_uz || String(c.id),
				value: c.id
			}))

			return (
				<FormItem
					invalid={!!(errors.city && touched.city)}
					errorMessage={errors.city as string | undefined}
				>
					<h6 className="mb-4">{t('Город')}</h6>
					{isLoadingCities ? (
						<Skeleton height={44} />
					) : (
						<Field name="city">
							{({ field, form }: FieldProps) => (
								<Select
									placeholder={
										values.region ? t('Выберите город') : t('Сначала выберите область')
									}
									isDisabled={!values.region || false}
									isClearable
									field={field}
									form={form}
									options={cityOptions}
									value={cityOptions.find((option) => option.value === values.city) || null}
									onChange={(option) => form.setFieldValue(field.name, option?.value ?? null)}
								/>
							)}
						</Field>
					)}
				</FormItem>
			)
		}

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				validationSchema={validationSchema}
				onSubmit={onSubmitComplete}
			>
				{({ values, touched, errors }) => (
					<Form>
						<FormContainer>
							<FormItem invalid={!!(errors.name && touched.name)} errorMessage={errors.name}>
								<h6 className="mb-4">{t('Название филиала')}</h6>
								<Field
									name="name"
									type="text"
									placeholder={t('Введите название филиала')}
									component={Input}
								/>
							</FormItem>

							<FormItem invalid={!!(errors.region && touched.region)} errorMessage={errors.region}>
								<h6 className="mb-4">{t('Область')}</h6>
								{isLoadingRegions ? (
									<Skeleton height={44} />
								) : (
									regions && (
										<Field name="region">
											{({ field, form }: FieldProps) => {
												const regionOptions = regions.map((r) => ({
													label: r.name_ru || r.name_uz || String(r.id),
													value: r.id
												}))

												return (
													<Select
														placeholder={t('Выберите область')}
														isDisabled={!regionOptions.length || isSubmitting}
														isClearable
														field={field}
														form={form}
														options={regionOptions}
														value={
															regionOptions.find((option) => option.value === values.region) || null
														}
														onChange={(option) => {
															// Region o‘zgarsa city ni tozalaymiz
															form.setFieldValue('city', null)
															form.setFieldValue(field.name, option?.value ?? null)
														}}
													/>
												)
											}}
										</Field>
									)
								)}
							</FormItem>

							<CitiesSelect />

							<div className="grid grid-cols-2 gap-4">
								<FormItem invalid={!!(errors.street && touched.street)} errorMessage={errors.street}>
									<h6 className="mb-4">{t('Улица')}</h6>
									<Field
										name="street"
										type="text"
										placeholder={t('Введите улицу...')}
										component={Input}
									/>
								</FormItem>

								<FormItem
									invalid={!!(errors.house_number && touched.house_number)}
									errorMessage={errors.house_number}
								>
									<h6 className="mb-4">{t('Номер дома')}</h6>
									<Field
										name="house_number"
										type="text"
										placeholder={t('Введите номер дома...')}
										component={Input}
									/>
								</FormItem>
							</div>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

const DrawerFooter = ({ onSaveClick, onCancel, isSubmitting = false }: DrawerFooterProps) => {
	const { t } = useTranslation() // ⬅️ qo‘shildi
	return (
		<div className="w-full text-right">
			<Button size="md" className="mr-2" onClick={onCancel} disabled={isSubmitting}>
				{t('Отменить')}
			</Button>
			<Button size="md" variant="solid" onClick={onSaveClick} disabled={isSubmitting}>
				{t('Сохранить')}
			</Button>
		</div>
	)
}

const BranchAdd = () => {
	const { t } = useTranslation() // ⬅️ qo‘shildi
	const queryClient = useQueryClient()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const { mutateAsync: createBranch, isPending: isCreating } = useMutation({
		mutationKey: ['create branch'],
		mutationFn: (values: FormModel) => DatasetService.createBranch<never, FormModel>(values),
		onSuccess() {
			toast.push(<Notification type="success" title={t('Филиал создан')} duration={2000} />, {
				placement: 'top-center'
			})
			queryClient.invalidateQueries({ queryKey: ['get branches'] })
		},
		onError(error) {
			const text = formatAxiosErrorDualLang(error)
			toast.push(<Notification type="danger" title={text} duration={5000} />, {
				placement: 'top-center'
			})
		}
	})

	// ✅ Save bosilganda: avval validatsiya + touched ni yoqish
	const formSubmit = async () => {
		if (!formikRef.current) return
		const formik = formikRef.current
		formik.setTouched(
			{ name: true, region: true, city: true, street: true, house_number: true },
			true
		)
		const errors = await formik.validateForm()
		if (Object.keys(errors).length > 0) return
		await createBranch(formik.values)
		setIsOpen(false)
	}

	return (
		<>
			<Button
				variant="solid"
				size="sm"
				className="block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2"
				icon={<HiPlusCircle />}
				block
				onClick={() => setIsOpen(true)}
			>
				{t('Добавить')}
			</Button>

			<Drawer
				title={t('Добавить филиал')}
				isOpen={isOpen}
				footer={
					<DrawerFooter
						onCancel={() => setIsOpen(false)}
						onSaveClick={formSubmit}
						isSubmitting={isCreating}
					/>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<BranchNewForm
					ref={formikRef}
					isOpen={isOpen}
					values={{ name: '', region: null, city: null, street: '', house_number: '' }}
					isSubmitting={isCreating}
					onSubmitComplete={async (values) => {
						await createBranch(values)
						setIsOpen(false)
					}}
				/>
			</Drawer>
		</>
	)
}

export default BranchAdd
