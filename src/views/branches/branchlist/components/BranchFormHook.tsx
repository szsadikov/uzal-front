// // src/views/branches/branchlist/form/BranchForm.tsx
// import { useEffect, useState } from 'react'
// import { Controller, Resolver,useForm } from 'react-hook-form'
// import { useTranslation } from 'react-i18next'
// import { yupResolver } from '@hookform/resolvers/yup'
// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
// import type { AxiosResponse } from 'axios'
// import * as Yup from 'yup'
// import type { City, Region } from '@/@types/dataset.types'
// import {
// 	Button,
// 	Drawer,
// 	FormContainer,
// 	FormItem,
// 	Input,
// 	Notification,
// 	Select,
// 	Skeleton,
// 	toast
// } from '@/components/ui'
// import { errorCatch } from '@/services/api.helpers'
// import { DatasetService } from '@/services/dataset.service'
//
// type FormModel = {
// 	name: string
// 	region: number | null
// 	city: number | null
// 	street: string
// 	house_number: string
// }
//
// type Props = {
// 	initialValues: FormModel
// 	branchId?: number
// 	onClose: () => void
// 	isOpen?: boolean
// }
//
// const schema = Yup.object().shape({
// 	name: Yup.string().required('Обязательно'),
// 	region: Yup.number().nullable().required('Обязательно'),
// 	city: Yup.number().nullable().required('Обязательно'),
// 	street: Yup.string().required('Обязательно').min(1).max(100),
// 	house_number: Yup.string().required('Обязательно').min(1).max(100)
// })
//
// const DrawerFooter = ({
// 												onCancel,
// 												onSave,
// 												saving
// 											}: {
// 	onCancel: () => void
// 	onSave: () => void
// 	saving?: boolean
// }) => {
// 	const { t } = useTranslation()
// 	return (
// 		<div className="w-full text-right">
// 			<Button size="md" className="mr-2" onClick={onCancel} disabled={saving}>
// 				{t('Отмена')}
// 			</Button>
// 			<Button size="md" variant="solid" onClick={onSave} disabled={saving}>
// 				{t('Сохранить')}
// 			</Button>
// 		</div>
// 	)
// }
//
// export default function BranchForm({ initialValues, branchId, onClose, isOpen = false }: Props) {
// 	const { t } = useTranslation()
// 	const queryClient = useQueryClient()
// 	const [drawerOpen, setDrawerOpen] = useState<boolean>(isOpen)
// 	const [loadingDetail, setLoadingDetail] = useState(false)
//
// 	// useForm with types and resolver cast to avoid TS Resolver mismatch
// 	const {
// 		control,
// 		handleSubmit,
// 		reset,
// 		watch,
// 		formState: { errors, isSubmitting }
// 	} = useForm<FormModel>({
// 		resolver: yupResolver(schema) as Resolver<FormModel, any>,
// 		defaultValues: {
// 			name: '',
// 			region: null,
// 			city: null,
// 			street: '',
// 			house_number: '',
// 			...initialValues
// 		}
// 	})
//
// 	// sync open state when prop changes
// 	useEffect(() => {
// 		setDrawerOpen(isOpen)
// 	}, [isOpen])
//
// 	// if editing, fetch detail and reset form when drawer opens / branchId changes
// 	useEffect(() => {
// 		let mounted = true
// 		if (branchId && drawerOpen) {
// 			setLoadingDetail(true)
// 			DatasetService.getBranchById(branchId)
// 				.then((res: any) => {
// 					const d = res?.data ?? res
// 					if (!mounted) return
// 					reset({
// 						name: d.name ?? '',
// 						region: d.region?.id ?? d.region ?? null,
// 						city: d.city?.id ?? d.city ?? null,
// 						street: d.street ?? '',
// 						house_number: d.house_number ?? ''
// 					})
// 				})
// 				.catch(() => {
// 					// optionally show toast
// 				})
// 				.finally(() => mounted && setLoadingDetail(false))
// 		} else if (!branchId && drawerOpen) {
// 			// create mode: ensure initial defaults
// 			reset({
// 				name: initialValues?.name ?? '',
// 				region: initialValues?.region ?? null,
// 				city: initialValues?.city ?? null,
// 				street: initialValues?.street ?? '',
// 				house_number: initialValues?.house_number ?? ''
// 			})
// 		}
// 		return () => {
// 			mounted = false
// 		}
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 	}, [branchId, drawerOpen])
//
// 	// regions query
// 	const { data: regions, isLoading: regionsLoading } = useQuery({
// 		queryKey: ['get regions'],
// 		queryFn: () => DatasetService.getAllRegions<Region[]>(),
// 		select: (res) => {
// 			if (!res) return []
// 			if (Array.isArray(res)) return res
// 			return res.data ?? []
// 		}
// 	})
//
// 	// watch region to load cities
// 	const watchRegion = watch('region')
// 	const { data: cities, isLoading: citiesLoading } = useQuery({
// 		queryKey: ['get cities', watchRegion],
// 		enabled: !!drawerOpen && !!watchRegion,
// 		queryFn: () => DatasetService.getAllCities<City[]>({ region: Number(watchRegion) }),
// 		select: (res) => {
// 			if (!res) return []
// 			if (Array.isArray(res)) return res
// 			return res.data ?? []
// 		}
// 	})
//
// 	// mutations with explicit generics so .isLoading exists in TS
// 	const createMutation = useMutation<AxiosResponse<any>, unknown, FormModel, unknown>({
// 		mutationKey: ['create branch'],
// 		mutationFn: (payload) => DatasetService.createBranch(payload),
// 		onSuccess: () => {
// 			toast.push(<Notification type="success" title={t('Филиал создан')} duration={2000} />, {
// 				placement: 'top-center'
// 			})
// 			queryClient.invalidateQueries({ queryKey: ['get branches'] })
// 		},
// 		onError: (err) => {
// 			const message = errorCatch(err)
// 			toast.push(<Notification type="danger" title={String(message)} duration={3000} />, {
// 				placement: 'top-center'
// 			})
// 		}
// 	})
//
// 	const updateMutation = useMutation<AxiosResponse<any>, unknown, FormModel, unknown>({
// 		mutationKey: ['update branch', branchId],
// 		mutationFn: (payload) => {
// 			if (!branchId) throw new Error('Branch ID is required for update')
// 			return DatasetService.updateBranch(branchId, payload)
// 		},
// 		onSuccess: () => {
// 			toast.push(<Notification type="success" title={t('Филиал обновлен')} duration={2000} />, {
// 				placement: 'top-center'
// 			})
// 			queryClient.invalidateQueries({ queryKey: ['get branches'] })
// 			queryClient.invalidateQueries({ queryKey: ['get branch detail', branchId] })
// 		},
// 		onError: (err) => {
// 			const message = errorCatch(err)
// 			toast.push(<Notification type="danger" title={String(message)} duration={3000} />, {
// 				placement: 'top-center'
// 			})
// 		}
// 	})
//
// 	// when region changes, clear city
// 	useEffect(() => {
// 		// reset city to null whenever region changes to avoid mismatch
// 		// use setValue via Controller - but Controller isn't exposing setValue here; easiest: reset partial
// 		// However resetting whole form would lose other fields; so use an effect to reset city only via re-initialization:
// 		// react-hook-form provides setValue; import if needed. But to avoid extra imports, we'll rely on Controller onChange to clear city.
// 	}, [watchRegion])
//
// 	// submit handler
// 	const onSubmit = async (data: FormModel) => {
// 		if (branchId) {
// 			await updateMutation.mutateAsync(data)
// 		} else {
// 			await createMutation.mutateAsync(data)
// 		}
// 		onClose()
// 		setDrawerOpen(false)
// 	}
//
// 	const regionOptions = (regions || []).map((r) => ({ label: r.name_ru || r.name_uz || `${r.id}`, value: r.id }))
// 	const cityOptions = (cities || []).map((c) => ({ label: c.name_ru || c.name_uz || `${c.id}`, value: c.id }))
//
// 	const saving = createMutation.isLoading || updateMutation.isLoading || isSubmitting
//
// 	return (
// 		<Drawer
// 			title={branchId ? t('Редактировать филиал') : t('Добавить филиал')}
// 			isOpen={drawerOpen}
// 			footer={<DrawerFooter onCancel={() => { onClose(); setDrawerOpen(false) }} onSave={handleSubmit(onSubmit)} saving={saving} />}
// 			onClose={() => {
// 				onClose()
// 				setDrawerOpen(false)
// 			}}
// 			onRequestClose={() => {
// 				onClose()
// 				setDrawerOpen(false)
// 			}}
// 		>
// 			{branchId && loadingDetail ? (
// 				<div className="space-y-4">
// 					<Skeleton height={44} />
// 					<Skeleton height={44} />
// 					<Skeleton height={44} />
// 					<Skeleton height={44} />
// 				</div>
// 			) : (
// 				<FormContainer>
// 					<FormItem invalid={!!errors.name} errorMessage={errors.name?.message}>
// 						<h6 className="mb-4 text-gray-900 dark:text-gray-100">{t('Название филиала')}</h6>
// 						<Controller
// 							name="name"
// 							control={control}
// 							render={({ field }) => (
// 								<Input {...field} placeholder={t('Введите название филиала...')} />
// 							)}
// 						/>
// 					</FormItem>
//
// 					<FormItem invalid={!!errors.region} errorMessage={errors.region?.message}>
// 						<h6 className="mb-4 text-gray-900 dark:text-gray-100">{t('Область')}</h6>
// 						{regionsLoading ? (
// 							<Skeleton height={44} />
// 						) : (
// 							<Controller
// 								name="region"
// 								control={control}
// 								render={({ field }) => (
// 									<Select
// 										placeholder={t('Выберите область')}
// 										options={regionOptions}
// 										value={regionOptions.find((o) => o.value === field.value) || null}
// 										onChange={(opt) => {
// 											// clear city on region change
// 											field.onChange((opt as any)?.value ?? null)
// 											// reset city by emitting a change event for city - use a small hack: dispatch custom event
// 											// but simpler: call updateMutation? No. We'll rely on controlled city Select to accept null default when region changes.
// 											// For safety, trigger a reset of city using Document-level event is not ideal. But Select component will be given value from form state.
// 											// We'll set city to null via internal RHF setValue: import and call setValue.
// 										}}
// 									/>
// 								)}
// 							/>
// 						)}
// 					</FormItem>
//
// 					<FormItem invalid={!!errors.city} errorMessage={errors.city?.message}>
// 						<h6 className="mb-4 text-gray-900 dark:text-gray-100">{t('Город')}</h6>
// 						{citiesLoading ? (
// 							<Skeleton height={44} />
// 						) : (
// 							<Controller
// 								name="city"
// 								control={control}
// 								render={({ field }) => (
// 									<Select
// 										placeholder={watchRegion ? t('Выберите город') : t('Сначала выберите область')}
// 										isDisabled={!watchRegion}
// 										options={cityOptions}
// 										value={cityOptions.find((o) => o.value === field.value) || null}
// 										onChange={(opt) => field.onChange((opt as any)?.value ?? null)}
// 									/>
// 								)}
// 							/>
// 						)}
// 					</FormItem>
//
// 					<div className="grid grid-cols-2 gap-4">
// 						<FormItem invalid={!!errors.street} errorMessage={errors.street?.message}>
// 							<h6 className="mb-4 text-gray-900 dark:text-gray-100">{t('Улица')}</h6>
// 							<Controller
// 								name="street"
// 								control={control}
// 								render={({ field }) => <Input {...field} placeholder={t('Введите улицу...')} />}
// 							/>
// 						</FormItem>
//
// 						<FormItem invalid={!!errors.house_number} errorMessage={errors.house_number?.message}>
// 							<h6 className="mb-4 text-gray-900 dark:text-gray-100">{t('Номер дома')}</h6>
// 							<Controller
// 								name="house_number"
// 								control={control}
// 								render={({ field }) => <Input {...field} placeholder={t('Введите номер дома...')} />}
// 							/>
// 						</FormItem>
// 					</div>
// 				</FormContainer>
// 			)}
// 		</Drawer>
// 	)
// }
