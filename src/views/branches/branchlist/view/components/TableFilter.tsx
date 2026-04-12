// import { forwardRef, type MouseEvent, useRef, useState } from 'react'
// import { HiOutlineFilter } from 'react-icons/hi'
// import { Field, FieldProps, Form, Formik, FormikProps } from 'formik'
// import type { Branch } from '@/@types/dataset.types'
// import { User } from '@/@types/user.types'
// import { Button, Drawer, FormContainer, FormItem, Option, Select } from '@/components/ui'
// // import { FilterQueries } from '../EmployeesList'
// import { userRoleTextToName } from '@/utils/format'
//
// type FilterFormProps = {
// 	values: FilterQueries
// 	onSubmitComplete: (values: FilterQueries) => void
// }
//
// type DrawerFooterProps = {
// 	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
// 	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
// }
//
// type Props = {
// 	values: FilterQueries
// 	onSubmit: (filters: FilterQueries) => void
// }
//
// const FilterForm = forwardRef<FormikProps<FilterQueries>, FilterFormProps>(
// 	({ values, onSubmitComplete }, ref) => {
// 		const roles: Pick<User, 'id' | 'role'>[] = []
// 		const branches: Branch[] = []
//
// 		return (
// 			<Formik
// 				enableReinitialize
// 				innerRef={ref}
// 				initialValues={values}
// 				onSubmit={(values) => onSubmitComplete(values)}
// 			>
// 				{({ values, touched, errors }) => (
// 					<Form>
// 						<FormContainer>
// 							<FormItem invalid={errors.role && touched.role} errorMessage={errors.role}>
// 								<h6 className='mb-4'>Должность</h6>
// 								<Field name='role'>
// 									{({ field, form }: FieldProps) => {
// 										if (!roles) return
//
// 										const options = roles.map((role) => ({
// 											label: userRoleTextToName(role.role),
// 											value: role.id
// 										}))
//
// 										return (
// 											<Select
// 												placeholder='Выберите технику'
// 												isDisabled={!roles.length}
// 												isClearable
// 												field={field}
// 												form={form}
// 												options={options}
// 												value={options.filter((option) => option.value === values.role)}
// 												onChange={(option) => form.setFieldValue(field.name, option?.value)}
// 											/>
// 										)
// 									}}
// 								</Field>
// 							</FormItem>
//
// 							<FormItem invalid={errors.branch && touched.branch} errorMessage={errors.branch}>
// 								<h6 className='mb-4'>Филиал</h6>
// 								<Field name='branch'>
// 									{({ field, form }: FieldProps) => {
// 										if (!branches) return
//
// 										const options: Option[] = branches.map((branch) => ({
// 											label: branch.region.name_ru,
// 											value: branch.region.name_ru
// 										}))
//
// 										return (
// 											<Select
// 												placeholder='Выберите филиал'
// 												isDisabled={!branches.length}
// 												isClearable
// 												field={field}
// 												form={form}
// 												options={options}
// 												value={options.filter((option) => option.value === values.branch)}
// 												onChange={(option) => form.setFieldValue(field.name, option?.value)}
// 											/>
// 										)
// 									}}
// 								</Field>
// 							</FormItem>
// 						</FormContainer>
// 					</Form>
// 				)}
// 			</Formik>
// 		)
// 	}
// )
//
// const DrawerFooter = ({ onSaveClick, onCancel }: DrawerFooterProps) => {
// 	return (
// 		<div className='w-full text-right'>
// 			<Button size='md' className='mr-2' onClick={onCancel}>
// 				Отмена
// 			</Button>
// 			<Button size='md' variant='solid' onClick={onSaveClick}>
// 				Сохранить
// 			</Button>
// 		</div>
// 	)
// }
//
// const UserFilter = ({ values, onSubmit }: Props) => {
// 	const formikRef = useRef<FormikProps<FilterQueries>>(null)
//
// 	const [isOpen, setIsOpen] = useState(false)
//
// 	const formSubmit = () => {
// 		if (formikRef.current) {
// 			onSubmit(formikRef.current.values)
// 			setIsOpen(false)
// 		}
// 	}
//
// 	return (
// 		<>
// 			<Button
// 				size='sm'
// 				className='mb-4 block md:mb-0 md:inline-block md:ltr:ml-2 md:rtl:mr-2'
// 				icon={<HiOutlineFilter />}
// 				onClick={() => setIsOpen(true)}
// 			>
// 				Фильтр
// 			</Button>
// 			<Drawer
// 				title='Фильтр'
// 				isOpen={isOpen}
// 				footer={<DrawerFooter onCancel={() => setIsOpen(false)} onSaveClick={formSubmit} />}
// 				onClose={() => setIsOpen(false)}
// 				onRequestClose={() => setIsOpen(false)}
// 			>
// 				<FilterForm ref={formikRef} values={values} onSubmitComplete={() => setIsOpen(false)} />
// 			</Drawer>
// 		</>
// 	)
// }
//
// FilterForm.displayName = 'FilterForm'
//
// export default UserFilter
