import { type MouseEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPlusCircle } from 'react-icons/hi'
import { useMutation } from '@tanstack/react-query'
import { FormikProps } from 'formik'
import { User, UserRoleEnum, UserRoleTextEnum } from '@/@types/user.types'
import { Button, Drawer, Notification, toast } from '@/components/ui'
import { UserService } from '@/services/user.service'
import { userRoleNumToText } from '@/utils/format'
import UserForm, { FormModel } from './UserForm'

type Props = {
	branchId: number
	refetch?: () => Promise<unknown>
}

export type CreateUserRequest = {
	profile: {
		username: string
		first_name: string
		middle_name: string
		last_name: string
		phone_number: string
		email: string
		pinfl: string
		password: string
		role: number
	}
	branch: number
	procuration_date: string | null
	procuration_number: number | null
	is_active: boolean
}

type DrawerFooterProps = {
	onSaveClick: (event: MouseEvent<HTMLButtonElement>) => void
	onCancel: (event: MouseEvent<HTMLButtonElement>) => void
	isSubmitting?: boolean
}

/* =======================
   Drawer footer
   ======================= */

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

/* =======================
   Error parser (typesafe)
   ======================= */

type ApiErrorData = unknown
type ApiError = { response?: { data?: ApiErrorData } }

function collectStringsDeep(input: unknown, acc: string[] = []): string[] {
	if (typeof input === 'string') acc.push(input)
	else if (Array.isArray(input)) input.forEach((i) => collectStringsDeep(i, acc))
	else if (input && typeof input === 'object')
		Object.values(input as Record<string, unknown>).forEach((v) => collectStringsDeep(v, acc))

	return acc
}

/* =======================
   Container
   ======================= */

const UserAdd = ({ branchId, refetch }: Props) => {
	const { t } = useTranslation()
	const formikRef = useRef<FormikProps<FormModel>>(null)
	const [isOpen, setIsOpen] = useState(false)

	const parseApiErrors = (error: unknown): string[] => {
		const Fallback = t('Unknown error')
		const err = error as ApiError | null
		const data = err?.response?.data
		if (typeof data === 'string') return [data]
		if (data && typeof (data as { detail?: unknown }).detail === 'string') {
			return [(data as { detail: string }).detail]
		}
		const messages = collectStringsDeep(data)

		return messages.length ? messages : [Fallback]
	}

	const { mutateAsync: mutateAsyncCreateUser, isPending: isPendingCreateUser } = useMutation({
		mutationKey: ['create user'],
		mutationFn: (data: CreateUserRequest) => {
			const roleId = Number(data.profile.role)
			const roleTextEnum = (
				Number.isFinite(roleId) ? userRoleNumToText(roleId) : String(data.profile.role)
			) as UserRoleTextEnum

			if (String(roleTextEnum).toLowerCase().startsWith('branch')) {
				return UserService.createBranchUser<User, CreateUserRequest>(data)
			}

			return UserService.create<User, CreateUserRequest>(roleTextEnum, data)
		},
		async onSuccess() {
			if (refetch) await refetch()
			toast.push(<Notification type='success' title={t('Сотрудник создан')} duration={2000} />, {
				placement: 'top-center'
			})
		},
		onError(error) {
			parseApiErrors(error).forEach((msg) =>
				toast.push(<Notification type='danger' title={msg} duration={2000} />, {
					placement: 'top-center'
				})
			)
		}
	})

	const initialValues: FormModel = {
		username: '',
		first_name: '',
		middle_name: '',
		last_name: '',
		phone_number: '',
		email: '',
		pinfl: '',
		password: '',
		role: null,
		procuration_date: null,
		procuration_number: null,
		is_active: true
	}

	// const formSubmit = async () => {
	// 	const values = formikRef.current?.values
	// 	if (!values) return
	// 	const isBD = Number(values.role) === UserRoleEnum.BRANCH_DIRECTOR
	//
	// 	const formData: CreateUserRequest = {
	// 		profile: {
	// 			username: values.username,
	// 			first_name: values.first_name,
	// 			middle_name: values.middle_name,
	// 			last_name: values.last_name,
	// 			phone_number: `998${values.phone_number}`,
	// 			email: values.email,
	// 			pinfl: values.pinfl,
	// 			password: values.password,
	// 			role: Number(values.role)
	// 		},
	// 		branch: branchId,
	// 		procuration_date: isBD ? (values.procuration_date ?? null) : null,
	// 		procuration_number: isBD
	// 			? values.procuration_number !== undefined && values.procuration_number !== null
	// 				? Number(values.procuration_number)
	// 				: null
	// 			: null,
	// 		is_active: values.is_active ?? true
	// 	}
	//
	// 	await mutateAsyncCreateUser(formData)
	// 	setIsOpen(false)
	// }

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
				title={t('Добавить сотрудника')}
				isOpen={isOpen}
				footer={
					<DrawerFooter
						onCancel={() => setIsOpen(false)}
						onSaveClick={() => formikRef.current?.submitForm()}
						isSubmitting={isPendingCreateUser}
					/>
				}
				onClose={() => setIsOpen(false)}
				onRequestClose={() => setIsOpen(false)}
			>
				<UserForm
					ref={formikRef}
					values={initialValues}
					isSubmitting={isPendingCreateUser}
					onSubmitComplete={async (vals) => {
						const isBD = Number(vals.role) === UserRoleEnum.BRANCH_DIRECTOR
						const payload = {
							profile: {
								username: vals.username,
								first_name: vals.first_name,
								middle_name: vals.middle_name,
								last_name: vals.last_name,
								phone_number: `998${vals.phone_number}`,
								email: vals.email,
								pinfl: vals.pinfl,
								password: vals.password,
								role: Number(vals.role)
							},
							branch: branchId,
							procuration_date: isBD ? (vals.procuration_date ?? null) : null,
							procuration_number: isBD ? (vals.procuration_number ?? null) : null,
							is_active: vals.is_active ?? true
						} as CreateUserRequest

						await mutateAsyncCreateUser(payload)
						setIsOpen(false)
					}}
				/>
			</Drawer>
		</>
	)
}

export default UserAdd
