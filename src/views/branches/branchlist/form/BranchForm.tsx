// src/views/branches/branchlist/form/BranchForm.tsx
import { forwardRef, type MouseEvent, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
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
import { errorCatch } from '@/services/api.helpers'
import { DatasetService } from '@/services/dataset.service'

type FormModel = {
	name: string
	region: number | null
	city: number | null
	street: string
	house_number: string
}

type BranchFormProps = {
	initialValues: FormModel
	branchId?: number
	onClose: () => void
	isOpen?: boolean
}

/* ---------- helpers ---------- */
function unwrapArrayOrData<T>(res: any): T[] {
	if (Array.isArray(res)) return res as T[]
	if (res && Array.isArray(res.data)) return res.data as T[]

	return []
}

/* ---------- City Select ---------- */
function CitiesSelect({ isEdit, isOpen }: { isEdit: boolean; isOpen: boolean }) {
	const { t } = useTranslation()
	const { values, errors, touched } = useFormikContext<FormModel>()

	const { data: cities, isLoading: isLoadingCities } = useQuery({
		queryKey: ['get cities', values.region],
		enabled: isOpen && typeof values.region === 'number' && values.region > 0,
		queryFn: () => DatasetService.getAllCities<City[]>({ region: Number(values.region) }),
		select: (res) => unwrapArrayOrData<City>(res)
	})

	const cityOptions =
		(cities || []).map((c) => ({
			label: c.name_ru || c.name_uz || String(c.id),
			value: c.id
		})) ?? []

	return (
		<FormItem
			invalid={!!(errors.city && touched.city)}
			errorMessage={errors.city as string | undefined}
		>
			<h6 className='mb-4 text-gray-900 dark:text-gray-100'>{t('Город')}</h6>
			{isLoadingCities ? (
				<Skeleton height={44} />
			) : (
				<Field name='city'>
					{({ field, form }: FieldProps) => (
						<Select
							placeholder={values.region ? t('Выберите город') : t('Сначала выберите область')}
							isDisabled={isEdit || !values.region}
							isClearable={!isEdit}
							field={field}
							form={form}
							options={cityOptions}
							value={cityOptions.find((o) => o.value === values.city) || null}
							onChange={(opt) => form.setFieldValue(field.name, (opt as any)?.value ?? null)}
						/>
					)}
				</Field>
			)}
		</FormItem>
	)
}

/* ---------- Formik Wrapper ---------- */
const BranchFormInner = forwardRef<FormikProps<FormModel>, BranchFormProps & { isOpen: boolean }>(
	({ initialValues, isOpen, branchId }, ref) => {
		const { t } = useTranslation()
		const isEdit = Boolean(branchId)

		const validationSchema = Yup.object().shape({
			name: Yup.string().required(t('Обязательно')),
			region: Yup.mixed().required(t('Обязательно')),
			city: Yup.mixed().required(t('Обязательно')),
			street: Yup.string().required(t('Обязательно')).min(1).max(100),
			house_number: Yup.string().required(t('Обязательно')).min(1).max(100)
		})

		const { data: regions, isLoading: isLoadingRegions } = useQuery({
			queryKey: ['get regions'],
			queryFn: () => DatasetService.getAllRegions<Region[]>(),
			select: (res) => unwrapArrayOrData<Region>(res)
		})

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={initialValues}
				validationSchema={validationSchema}
				onSubmit={() => {}}
			>
				{({ values, touched, errors }) => (
					<Form>
						<FormContainer>
							{/* Name */}
							<FormItem invalid={!!(errors.name && touched.name)} errorMessage={errors.name}>
								<h6 className='mb-4 text-gray-900 dark:text-gray-100'>{t('Название филиала')}</h6>
								<Field name='name'>
									{({ field }: FieldProps) => (
										<Input
											{...field}
											invalid={!!errors.name}
											placeholder={t('Введите название филиала')}
											className='border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400'
										/>
									)}
								</Field>
							</FormItem>

							{/* Region */}
							<FormItem invalid={!!(errors.region && touched.region)} errorMessage={errors.region}>
								<h6 className='mb-4 text-gray-900 dark:text-gray-100'>{t('Область')}</h6>
								{isLoadingRegions ? (
									<Skeleton height={44} />
								) : (
									regions && (
										<Field name='region'>
											{({ field, form }: FieldProps) => {
												const regionOptions = regions.map((r) => ({
													label: r.name_ru || r.name_uz || String(r.id),
													value: r.id
												}))

												return (
													<Select
														placeholder={t('Выберите область')}
														isDisabled={isEdit || !regionOptions.length}
														isClearable={!isEdit}
														field={field}
														form={form}
														options={regionOptions}
														value={regionOptions.find((o) => o.value === values.region) || null}
														onChange={(opt) => {
															form.setFieldValue('region', (opt as any)?.value ?? null)
															form.setFieldValue('city', null)
														}}
													/>
												)
											}}
										</Field>
									)
								)}
							</FormItem>

							{/* City */}
							<CitiesSelect isEdit={isEdit} isOpen={isOpen} />

							{/* Street + House */}
							<div className='grid grid-cols-2 gap-4'>
								<FormItem
									invalid={!!(errors.street && touched.street)}
									errorMessage={errors.street}
								>
									<h6 className='mb-4 text-gray-900 dark:text-gray-100'>{t('Улица')}</h6>
									<Field name='street'>
										{({ field }: FieldProps) => (
											<Input
												{...field}
												invalid={!!errors.street}
												placeholder={t('Введите улицу...')}
												className='border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400'
											/>
										)}
									</Field>
								</FormItem>

								<FormItem
									invalid={!!(errors.house_number && touched.house_number)}
									errorMessage={errors.house_number}
								>
									<h6 className='mb-4 text-gray-900 dark:text-gray-100'>{t('Номер дома')}</h6>
									<Field name='house_number'>
										{({ field }: FieldProps) => (
											<Input
												{...field}
												invalid={!!errors.house_number}
												placeholder={t('Введите номер дома...')}
												className='border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400'
											/>
										)}
									</Field>
								</FormItem>
							</div>
						</FormContainer>
					</Form>
				)}
			</Formik>
		)
	}
)

/* ---------- Drawer Footer ---------- */
const DrawerFooter = ({
	onSaveClick,
	onCancel,
	isSubmitting = false
}: {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
	isSubmitting?: boolean
}) => {
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

/* ---------- Main ---------- */
const BranchForm = ({ initialValues, branchId, onClose, isOpen = false }: BranchFormProps) => {
	const { t } = useTranslation()
	const queryClient = useQueryClient()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [drawerOpen, setDrawerOpen] = useState(isOpen)

	const { data: detail, isLoading: isDetailLoading } = useQuery({
		enabled: !!branchId,
		queryKey: ['get branch detail', branchId],
		queryFn: () => DatasetService.getBranchById(branchId as number),
		select: (res: any) => (res?.data ? res.data : res)
	})

	const normalizedInitialValues: FormModel = useMemo(() => {
		if (detail && branchId) {
			return {
				name: detail.name ?? '',
				region: detail.region?.id ?? detail.region ?? null,
				city: detail.city?.id ?? detail.city ?? null,
				street: detail.street ?? '',
				house_number: detail.house_number ?? ''
			}
		}

		return {
			name: initialValues?.name ?? '',
			region: initialValues?.region ?? null,
			city: initialValues?.city ?? null,
			street: initialValues?.street ?? '',
			house_number: initialValues?.house_number ?? ''
		}
	}, [
		branchId,
		detail?.name,
		detail?.region,
		detail?.city,
		detail?.street,
		detail?.house_number,
		initialValues?.name,
		initialValues?.region,
		initialValues?.city,
		initialValues?.street,
		initialValues?.house_number
	])

	const { mutateAsync: createBranch, isPending: isCreating } = useMutation({
		mutationKey: ['create branch'],
		mutationFn: (values: FormModel) => DatasetService.createBranch<never, FormModel>(values),
		onSuccess() {
			toast.push(<Notification type='success' title={t('Филиал создан')} duration={2000} />, {
				placement: 'top-center'
			})
			queryClient.invalidateQueries({ queryKey: ['get branches'] })
		},
		onError(error) {
			const axiosError = error as AxiosError<{ message?: string }>
			const message = errorCatch(error)
			toast.push(
				<Notification
					type='danger'
					title={JSON.stringify(axiosError.response?.data) || message}
					duration={3000}
				/>,
				{ placement: 'top-center' }
			)
		}
	})

	const { mutateAsync: updateBranch, isPending: isUpdating } = useMutation({
		mutationKey: ['update branch', branchId],
		mutationFn: (values: FormModel) => {
			if (!branchId) throw new Error('Branch ID is required for update')

			return DatasetService.updateBranch<FormModel>(branchId, values)
		},
		onSuccess() {
			toast.push(<Notification type='success' title={t('Филиал обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
			queryClient.invalidateQueries({ queryKey: ['get branches'] })
			queryClient.invalidateQueries({ queryKey: ['get branch detail', branchId] })
		},
		onError(error) {
			const axiosError = error as AxiosError<{ message?: string }>
			const message = errorCatch(error)
			toast.push(
				<Notification
					type='danger'
					title={JSON.stringify(axiosError.response?.data) || message}
					duration={3000}
				/>,
				{ placement: 'top-center' }
			)
		}
	})

	const formSubmit = async () => {
		const formik = formikRef.current
		if (!formik) return

		formik.setTouched(
			{ name: true, region: true, city: true, street: true, house_number: true },
			true
		)
		const errors = await formik.validateForm()
		if (Object.keys(errors).length > 0) return

		const payload: FormModel = { ...formik.values }
		if (branchId) await updateBranch(payload)
		else await createBranch(payload)

		onClose()
		setDrawerOpen(false)
	}

	return (
		<Drawer
			title={branchId ? t('Редактировать филиал') : t('Добавить филиал')}
			isOpen={drawerOpen}
			footer={
				<DrawerFooter
					onCancel={() => {
						onClose()
						setDrawerOpen(false)
					}}
					onSaveClick={formSubmit}
					isSubmitting={branchId ? isUpdating : isCreating}
				/>
			}
			onClose={() => {
				onClose()
				setDrawerOpen(false)
			}}
			onRequestClose={() => {
				onClose()
				setDrawerOpen(false)
			}}
		>
			{branchId && isDetailLoading ? (
				<div className='space-y-4'>
					<Skeleton height={44} />
					<Skeleton height={44} />
					<Skeleton height={44} />
					<Skeleton height={44} />
				</div>
			) : (
				<BranchFormInner
					key={branchId ? `edit-${branchId}` : 'create'}
					ref={formikRef}
					initialValues={normalizedInitialValues}
					branchId={branchId}
					onClose={onClose}
					isOpen={drawerOpen}
				/>
			)}
		</Drawer>
	)
}

export default BranchForm
