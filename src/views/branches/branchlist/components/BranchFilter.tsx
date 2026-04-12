// src/pages/branches/components/BranchFilter.tsx
import { forwardRef, type MouseEvent, useRef, useState } from 'react'
import { HiOutlineFilter } from 'react-icons/hi'
import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
import { Badge, Button, Drawer, FormContainer, FormItem, Option, Select } from '@/components/ui'
import { FilterQueries } from '../BranchesList'
import { useTranslation } from 'react-i18next'

type FilterFormProps = {
	values: FilterQueries
	onSubmitComplete: (values: FilterQueries) => void
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
}

type Props = {
	values: FilterQueries
	onSubmit: (filters: FilterQueries) => void
}

// Mock data types (replace with actual API data types)
type Region = { id: number; name: string }
type City = { id: number; name: string }

const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
	({ values, onSubmitComplete }, ref) => {
		// Mock data (replace with actual API calls using useQuery or similar)
		const regions: Region[] = [] // e.g., [{ id: 1, name: 'Tashkent' }, ...]
		const cities: City[] = [] // e.g., [{ id: 1, name: 'Chilanzar' }, ...]
		const statuses: Option[] = [
			{ label: 'Активный', value: 'true' },
			{ label: 'Неактивный', value: 'false' }
		]

		return (
			<Formik
				enableReinitialize
				innerRef={ref}
				initialValues={values}
				onSubmit={(values) => onSubmitComplete(values)}
			>
				{({ values, touched, errors }) => (
					<Form>
						<FormContainer>
							{/*<FormItem invalid={errors.search && touched.search} errorMessage={errors.search}>*/}
							{/*	<h6 className="mb-4">Поиск</h6>*/}
							{/*	<Field name="search">*/}
							{/*		{({ field }) => (*/}
							{/*			<Input*/}
							{/*				{...field}*/}
							{/*				placeholder="Поиск по филиалам"*/}
							{/*				prefix={<HiOutlineSearch />}*/}
							{/*			/>*/}
							{/*		)}*/}
							{/*	</Field>*/}
							{/*</FormItem>*/}

							<FormItem invalid={errors.region && touched.region} errorMessage={errors.region}>
								<h6 className='mb-4'>Регион</h6>
								<Field name='region'>
									{({ field, form }: FieldProps) => {
										if (!regions.length) return null

										const options: Option[] = regions.map((region) => ({
											label: region.name,
											value: region.id
										}))

										return (
											<Select
												placeholder='Выберите регион'
												isDisabled={!regions.length}
												isClearable
												field={field}
												form={form}
												options={options}
												value={options.find((option) => option.value === values.region)}
												onChange={(option) => form.setFieldValue(field.name, option?.value)}
											/>
										)
									}}
								</Field>
							</FormItem>

							<FormItem invalid={errors.city && touched.city} errorMessage={errors.city}>
								<h6 className='mb-4'>Город</h6>
								<Field name='city'>
									{({ field, form }: FieldProps) => {
										if (!cities.length) return null

										const options: Option[] = cities.map((city) => ({
											label: city.name,
											value: city.id
										}))

										return (
											<Select
												placeholder='Выберите город'
												isDisabled={!cities.length}
												isClearable
												field={field}
												form={form}
												options={options}
												value={options.find((option) => option.value === values.city)}
												onChange={(option) => form.setFieldValue(field.name, option?.value)}
											/>
										)
									}}
								</Field>
							</FormItem>

							<FormItem invalid={errors.status && touched.status} errorMessage={errors.status}>
								<h6 className='mb-4'>Статус</h6>
								<Field name='status'>
									{({ field, form }: FieldProps) => (
										<Select
											placeholder='Выберите статус'
											isDisabled={!statuses.length}
											isClearable
											field={field}
											form={form}
											options={statuses}
											value={statuses.find(
												(option) => option.value === (values.status?.toString() || '')
											)}
											onChange={(option) => form.setFieldValue(field.name, option?.value)}
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

const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
	return (
		<div className='w-full text-right'>
			<Button size='md' className='mr-2' onClick={onCancel}>
				Отмена
			</Button>
			<Button size='md' variant='solid' onClick={onSaveClick}>
				Сохранить
			</Button>
		</div>
	)
}

const BranchFilter = ({ values, onSubmit }: Props) => {
	const formikRef = useRef<FormikProps<FilterQueries>>(null)
	const [isOpen, setIsOpen] = useState(false)
	const { t } = useTranslation()

	const formSubmit = () => {
		if (formikRef.current) {
			onSubmit(formikRef.current.values)
			setIsOpen(false)
		}
	}

	// UserFilter.tsx (inside the component)
	const activeFilterKeys = ['region', 'city', 'status', ] as const

	const hasActiveFilters = activeFilterKeys.some((k) => {
		const v = (values as any)[k]

		return v !== null && v !== undefined && v !== '' // agar boshqa tur (masalan array/boolean) bo'lsa, kerak bo'lsa shartni kengaytiring
	})

	return (
		<>
			<Button
				size='sm'
				className='relative mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
				icon={<HiOutlineFilter />}
				onClick={() => setIsOpen(true)}
			>
				<span>{t('Фильтр')}</span>
				{hasActiveFilters && (
					<Badge className='absolute top-1 right-1 inline-flex size-2 items-center justify-center bg-indigo-500 p-1' />
				)}
			</Button>
			<Drawer
				title='Фильтр'
				isOpen={isOpen}
				footer={<DrawerFooter onCancel={() => setIsOpen(false)} onSaveClick={formSubmit} />}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<FilterForm ref={formikRef} values={values} onSubmitComplete={formSubmit} />
			</Drawer>
		</>
	)
}

FilterForm.displayName = 'FilterForm'

export default BranchFilter
