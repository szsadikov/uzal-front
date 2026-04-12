// src/pages/.../form/Form.tsx
import { forwardRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, FieldProps, Form, Formik, FormikProps, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { FormPatternInput } from '@/components/shared'
import { DatePicker, FormContainer, FormItem, Select } from '@/components/ui'

export type Option = { label: string; value: number }

export type TaskFormValues = {
	branch: number | null
	employee: number | null
	client: number | null
	phone_number: string
	deadline: Date | null // ← string emas
}

type Props = {
	values: TaskFormValues
	onSubmitComplete: (values: TaskFormValues) => void
	isSubmitting?: boolean

	branchOptions: Option[]
	employeeOptions?: Option[]
	clientOptions?: Option[]

	onLoadEmployees?: (branchId: number | null) => Promise<Option[]> | Option[]
	onLoadClients?: (employeeId: number | null) => Promise<Option[]> | Option[]

	/** server-side search & infinite scroll (ixtiyoriy) */
	clientLoading?: boolean
	clientHasMore?: boolean
	onClientSearch?: (q: string) => void
	onClientLoadMore?: () => void

	onBranchChange?: (branchId: number | null) => void

	/** Edit rejimida backend labellariga tayangan holda tanlangan option’ni ko‘rsatish uchun */
	editLabels?: {
		region?: string | null
		monitoring?: string | null
		client?: string | null
	}
}

const findOption = (opts: Option[] | undefined, val: number | null) =>
	(opts ?? []).find((o) => o.value === val) ?? null

const ensureOptionByLabel = (
	opts: Option[] | undefined,
	label?: string | null,
	valueFallback = -1
) => {
	if (!label) return null
	const found = (opts ?? []).find((o) => (o.label || '').trim() === label.trim())

	return found ?? { label, value: valueFallback }
}

type BodyProps = Omit<
	Props,
	| 'values'
	| 'onSubmitComplete'
	| 'isSubmitting'
	| 'branchOptions'
	| 'employeeOptions'
	| 'clientOptions'
> & {
	isEdit: boolean
	branchOptions: Option[]
	employeeOptions?: Option[]
	clientOptions?: Option[]
	outerSubmitting?: boolean
}

const FormBody = ({
	isEdit,
	branchOptions,
	employeeOptions = [],
	clientOptions = [],
	onLoadEmployees,
	onLoadClients,
	clientLoading,
	clientHasMore,
	onClientSearch,
	onClientLoadMore,
	onBranchChange,
	editLabels,
	outerSubmitting
}: BodyProps) => {
	const { t } = useTranslation()

	const { values, errors, touched, setFieldValue, isSubmitting } =
		useFormikContext<TaskFormValues>()
	const submitting = !!outerSubmitting || isSubmitting

	useEffect(() => {
		// Edit rejimida ochilganda dependent options bo‘sh bo‘lsa yuklab qo‘yamiz
		if (!isEdit) return

		if (!employeeOptions.length) onLoadEmployees?.(values.branch ?? null)
		if (values.employee && !clientOptions.length) onLoadClients?.(values.employee)
	}, [isEdit, values.branch, values.employee, employeeOptions.length, clientOptions.length])

	const branchSynthetic = ensureOptionByLabel(
		branchOptions,
		editLabels?.region,
		values.branch ?? -1
	)
	const branchOpts =
		branchSynthetic && !branchOptions.some((o) => o.label.trim() === branchSynthetic.label.trim())
			? [branchSynthetic, ...branchOptions]
			: branchOptions
	const branchValue = findOption(branchOptions, values.branch) || branchSynthetic

	const employeeSynthetic = ensureOptionByLabel(
		employeeOptions,
		editLabels?.monitoring,
		values.employee ?? -1
	)
	const employeeOpts =
		employeeSynthetic &&
		!employeeOptions.some((o) => o.label.trim() === employeeSynthetic.label.trim())
			? [employeeSynthetic, ...employeeOptions]
			: employeeOptions
	const employeeValue = findOption(employeeOptions, values.employee) || employeeSynthetic

	// Клиент (editda label ko'rsatish uchun synthetic option + ro'yxatga qo'shish)
	const clientSynthetic = ensureOptionByLabel(
		clientOptions,
		editLabels?.client,
		values.client ?? -1
	)
	const clientOpts =
		clientSynthetic && !clientOptions.some((o) => o.label.trim() === clientSynthetic.label.trim())
			? [clientSynthetic, ...clientOptions]
			: clientOptions
	const clientValue = findOption(clientOptions, values.client) || clientSynthetic

	const disablePastDates = (current?: Date | null) => {
		if (!current) return false

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const date = new Date(current)
		date.setHours(0, 0, 0, 0)

		// true qaytgani tanlab bo‘lmaydi
		return date < today          // faqat bugundan oldingi sanalar bloklanadi
	}

	return (
		<Form>
			<FormContainer>
				{/* Филиал */}
				<FormItem
					label={t('Филиал')}
					invalid={!!(errors.branch && touched.branch)}
					errorMessage={errors.branch as string | undefined}
				>
					<Field name='branch'>
						{({ field, form }: FieldProps<number | null>) => (
							<Select
								placeholder={t('Выберите филиал')}
								isDisabled={submitting || isEdit}
								isClearable={!isEdit}
								field={field}
								form={form}
								options={branchOpts}
								value={branchValue}
								onChange={async (opt: Option | null) => {
									if (isEdit) return
									const v = opt?.value ?? null
									form.setFieldValue(field.name, v)
									await setFieldValue('employee', null)
									await setFieldValue('client', null)
									onBranchChange?.(v)
									onLoadEmployees?.(v)
								}}
							/>
						)}
					</Field>
				</FormItem>

				{/* Сотрудник */}
				<FormItem
					label={t('Сотрудник')}
					invalid={!!(errors.employee && touched.employee)}
					errorMessage={errors.employee as string | undefined}
				>
					<Field name='employee'>
						{({ field, form }: FieldProps<number | null>) => (
							<Select
								placeholder={t('Выберите сотрудника')}
								isDisabled={submitting || (!isEdit && !values.branch)}
								isClearable
								field={field}
								form={form}
								options={employeeOpts}
								value={employeeValue}
								onChange={async (opt: Option | null) => {
									const v = opt?.value ?? null
									await form.setFieldValue(field.name, v) // employee ni o‘rnatamiz
									await setFieldValue('client', null) // klientni reset
									await onLoadClients?.(v) // <-- FAQAT klientlarni yuklang!
								}}
							/>
						)}
					</Field>
				</FormItem>

				{/* Клиент */}
				<FormItem
					label={t('Клиент')}
					invalid={!!(errors.client && touched.client)}
					errorMessage={errors.client as string | undefined}
				>
					<Field name='client'>
						{({ field, form }: FieldProps<number | null>) => (
							<Select
								placeholder={t('Выберите клиент')}
								isDisabled={submitting || isEdit || (!isEdit && !values.employee)}
								isClearable={!isEdit}
								field={field}
								form={form}
								options={clientOpts}
								value={clientValue}
								onChange={(opt: Option | null) => {
									if (isEdit) return
									form.setFieldValue(field.name, opt?.value ?? null)
								}}
								isLoading={clientLoading}
								onInputChange={(input: string, { action }: any) => {
									if (action === 'input-change') onClientSearch?.(input)

									return input
								}}
								onMenuScrollToBottom={() => {
									if (!clientLoading && clientHasMore) onClientLoadMore?.()
								}}
							/>
						)}
					</Field>
				</FormItem>

				{/* Телефон */}
				<FormItem
					label={t('Номер телефона')}
					invalid={!!(errors.phone_number && touched.phone_number)}
					errorMessage={errors.phone_number as string | undefined}
				>
					<Field name='phone_number'>
						{({ field, form }: FieldProps) => (
							<FormPatternInput
								form={form}
								field={field}
								format='## ### ## ##'
								mask='_'
								inputPrefix='+998 '
								placeholder='__-___-__-__'
								value={field.value}
								onValueChange={(e) => {
									const digits = String(e?.formattedValue || '')
										.replace(/\D/g, '')
										.slice(-9)
									form.setFieldValue(field.name, digits) // keep 9 digits in form
								}}
							/>
						)}
					</Field>
				</FormItem>

				{/* Дата выполнения */}
				<FormItem
					label={t('Дата выполнения')}
					invalid={!!(errors.deadline && touched.deadline)}
					errorMessage={errors.deadline as string | undefined}
				>
					<Field name='deadline'>
						{({ field, form }: FieldProps<Date | null>) => {
							// deadline har ikki ko‘rinishda bo‘lishi mumkin: Date yoki ISO string
							const v = field.value as unknown
							const dateValue =
								typeof v === 'string' ? (v ? new Date(v) : null) : (v as Date | null)

							// const today = new Date()
							// today.setHours(0, 0, 0, 0)

							return (
								<DatePicker
									field={field}
									form={form}
									value={dateValue} // <-- MUHIM: qiymatni aniq beramiz
									placeholder='YYYY-MM-DD'
									clearable
									className='h-11'
									onChange={(d) => form.setFieldValue(field.name, d ?? null)}
									// disabledDate={(d?: Date | null) => {
									// 	if (!d) return false
									// 	const x = new Date(d)
									// 	x.setHours(0, 0, 0, 0)
									// 	return x < today // true => shu kun disable bo‘ladi
									// }}

									disableDate={disablePastDates}
								/>
							)
						}}
					</Field>
				</FormItem>
			</FormContainer>
		</Form>
	)
}

const TaskForm = forwardRef<FormikProps<TaskFormValues>, Props>(
	(
		{
			values,
			onSubmitComplete,
			isSubmitting,
			branchOptions,
			employeeOptions,
			clientOptions,
			onLoadEmployees,
			onLoadClients,
			clientLoading,
			clientHasMore,
			onClientSearch,
			onClientLoadMore,
			onBranchChange,
			editLabels
		},
		ref
	) => {
		const { t } = useTranslation()

		// values.deadline string bo‘lib kelishi mumkin — normalize qilamiz
		const normalized: TaskFormValues = {
			...values,
			deadline:
				values.deadline && !(values.deadline instanceof Date)
					? new Date(values.deadline as unknown as string)
					: values.deadline
		}

		const isEdit = !!(
			editLabels &&
			(editLabels.region || editLabels.monitoring || editLabels.client)
		)

		const makeSchema = (isEdit: boolean) =>
			Yup.object().shape({
				// Edit: optional | Create: required
				branch: isEdit
					? Yup.number().nullable()
					: Yup.number().nullable().required(t('Поле обязательно')),

				// Edit: optional | Create: required
				employee: isEdit
					? Yup.number().nullable()
					: Yup.number().nullable().required(t('Поле обязательно')),

				// Edit: optional | Create: required
				client: isEdit
					? Yup.number().nullable()
					: Yup.number().nullable().required(t('Поле обязательно')),

				phone_number: Yup.string().required(t('Поле обязательно')),

				// Edit: optional | Create: required
				deadline: isEdit
					? Yup.date().nullable().typeError(t('Неверная дата'))
					: Yup.date().nullable().typeError(t('Неверная дата')).required(t('Поле обязательно'))
			})

		return (
			<Formik<TaskFormValues>
				innerRef={ref}
				initialValues={normalized}
				validationSchema={makeSchema(isEdit)} // <-- use dynamic schema
				enableReinitialize
				onSubmit={(vals) => onSubmitComplete(vals)}
			>
				<FormBody
					isEdit={isEdit}
					branchOptions={branchOptions}
					employeeOptions={employeeOptions}
					clientOptions={clientOptions}
					onLoadEmployees={onLoadEmployees}
					onLoadClients={onLoadClients}
					clientLoading={clientLoading}
					clientHasMore={clientHasMore}
					onClientSearch={onClientSearch}
					onClientLoadMore={onClientLoadMore}
					onBranchChange={onBranchChange}
					editLabels={editLabels}
					outerSubmitting={isSubmitting}
				/>
			</Formik>
		)
	}
)

TaskForm.displayName = 'TaskForm'
export default TaskForm
