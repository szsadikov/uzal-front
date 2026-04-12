import { Dispatch, SetStateAction, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery } from '@tanstack/react-query'
import { FormikProps } from 'formik'
import { UserRoleTextEnum } from '@/@types/user.types'
import { Button, Drawer, Notification, Skeleton, toast } from '@/components/ui'
import { UserService } from '@/services/user.service'
import UserForm, { FormModel } from './UserForm'

type Props = {
	id: number
	role?: UserRoleTextEnum | null
	isOpen: boolean
	branchId: number
	setIsOpen: Dispatch<SetStateAction<boolean>>
	refetch?: () => Promise<unknown>
}

/* PATCH body */
type UpdateUserRequest = {
	profile: Partial<
		Pick<
			FormModel,
			| 'username'
			| 'first_name'
			| 'middle_name'
			| 'last_name'
			| 'phone_number'
			| 'email'
			| 'pinfl'
			| 'password'
			| 'role'
		>
	>
	branch?: number
	procuration_date?: string | null
	procuration_number?: number | null
	is_active?: boolean
}

// 1) API tiplari
type ApiUserProfile = {
	username?: string
	first_name?: string
	middle_name?: string
	last_name?: string
	phone_number?: string
	email?: string
	pinfl?: string
	role?: number | string | null
}

type ApiUser = {
	id: number
	profile?: ApiUserProfile
	procuration_date?: string | null
	procuration_number?: number | null
}

/* ===== Container ===== */
const UserEdit = ({ id, role, isOpen, branchId, setIsOpen, refetch }: Props) => {
	const { t } = useTranslation()

	const { data: userData, isLoading: isLoadingUser } = useQuery({
		queryKey: ['user-by-id-role', { id, role }],
		queryFn: () =>
			UserService.getByIdAndRole<ApiUser>(id, role ?? UserRoleTextEnum.BRANCH_DIRECTOR),
		select: ({ data }) => data,
		enabled: isOpen && !!id && !!role
	})

	const initialValues: FormModel | null = useMemo(() => {
		if (!userData) return null
		const u = userData.profile
		const strip998 = (raw?: string) => (raw ? String(raw).replace(/^998/, '') : '')

		return {
			username: u?.username ?? '',
			first_name: u?.first_name ?? '',
			middle_name: u?.middle_name ?? '',
			last_name: u?.last_name ?? '',
			phone_number: strip998(u?.phone_number) ?? '',
			email: u?.email ?? '',
			pinfl: u?.pinfl ?? '',
			password: '',
			role: null,
			role_text: (u?.role as UserRoleTextEnum) ?? (role as UserRoleTextEnum) ?? null, // ✅ enum sifatida aniqladik
			procuration_date: userData.procuration_date ?? null,
			procuration_number: userData.procuration_number ?? null,
			is_active: true
		}
	}, [userData, role])

	const toRequestFormat = (current: FormModel, initial: FormModel): UpdateUserRequest => {
		const profile: UpdateUserRequest['profile'] = {}

		if (current.username !== initial.username) profile.username = current.username
		if (current.first_name !== initial.first_name) profile.first_name = current.first_name
		if (current.middle_name !== initial.middle_name) profile.middle_name = current.middle_name
		if (current.last_name !== initial.last_name) profile.last_name = current.last_name
		if (current.email !== initial.email) profile.email = current.email
		if (current.pinfl !== initial.pinfl) profile.pinfl = current.pinfl

		const currPhone = current.phone_number ? `998${current.phone_number}` : ''
		const initPhone = initial.phone_number ? `998${initial.phone_number}` : ''
		if (currPhone !== initPhone) profile.phone_number = currPhone

		if (current.password) profile.password = current.password
		// Agar role'ni o'zgartirishga ruxsat bersang:
		// if (current.role !== initial.role) profile.role = current.role

		const body: UpdateUserRequest = { profile, branch: branchId, is_active: true }
		if (current.procuration_date !== initial.procuration_date)
			body.procuration_date = current.procuration_date
		if (current.procuration_number !== initial.procuration_number)
			body.procuration_number = current.procuration_number

		return body
	}

	const parseApiErrors = (error: unknown): string[] => {
		const Fallback = t('Unknown error')
		if (!error || typeof error !== 'object') return [Fallback]
		if ('response' in (error as any) && (error as any).response?.data) {
			const data = (error as any).response.data
			if (typeof data === 'string') return [data]
			if (typeof data.detail === 'string') return [data.detail]
			const msgs: string[] = []
			const walk = (o: any) => {
				if (Array.isArray(o)) o.forEach(walk)
				else if (o && typeof o === 'object') Object.values(o).forEach(walk)
				else if (typeof o === 'string') msgs.push(o)
			}
			walk(data)

			return msgs.length ? msgs : [Fallback]
		}

		return ['Unknown error']
	}

	console.log(typeof role)

	const { mutateAsync: mutateAsyncUpdate, isPending: isPendingUpdate } = useMutation({
		mutationKey: ['update user by role', id],
		mutationFn: ({ data }: { data: UpdateUserRequest }) => {
			// if (!role) throw new Error('Missing role')
			//
			// return UserService.update(role, id, data) // 🔸 role-based update
			if (!id) throw new Error('Missing id')
			if (!role) throw new Error('Missing role')

			// role prop to‘g‘ridan-to‘g‘ri kelyapti, faqat endpoint tanlaymiz
			const isBranchRole = String(role).toLowerCase().startsWith('branch')

			if (isBranchRole) {
				// ✅ Filial xodimlari uchun endpoint
				return UserService.updateBranchUser(id, data)
			}

			// ✅ Oddiy foydalanuvchi endpoint
			return UserService.update(role, id, data)
		},
		onSuccess: async () => {
			if (refetch) await refetch()
			toast.push(<Notification type='success' title={t('Пользователь обновлен')} duration={2000} />, {
				placement: 'top-center'
			})
			setIsOpen(false)
		},
		onError: (error) => {
			parseApiErrors(error).forEach((msg) => {
				toast.push(<Notification type='danger' title={msg} duration={2000} />, {
					placement: 'top-center'
				})
			})
		}
	})

	const formikRef = useRef<FormikProps<FormModel>>(null)

	const formSubmit = async () => {
		if (!formikRef.current || !initialValues) return
		const { values } = formikRef.current
		const payload = toRequestFormat(values, initialValues)
		await mutateAsyncUpdate({ data: payload })
	}

	return (
		<Drawer
			title={t('Редактировать')}
			isOpen={isOpen}
			lockScroll={!isOpen}
			footer={
				<div className='w-full text-right'>
					<Button
						size='md'
						className='mr-2'
						onClick={() => setIsOpen(false)}
						disabled={isPendingUpdate}
					>
						Отмена
					</Button>
					<Button
						size='md'
						variant='solid'
						onClick={formSubmit}
						disabled={isPendingUpdate || isLoadingUser || !initialValues}
					>
						Сохранить
					</Button>
				</div>
			}
			onClose={() => setIsOpen(false)}
			onRequestClose={() => setIsOpen(false)}
		>
			{isLoadingUser || !initialValues ? (
				<div className='space-y-4'>
					<Skeleton height={44} />
					<Skeleton height={44} />
					<Skeleton height={44} />
				</div>
			) : (
				<UserForm
					ref={formikRef}
					values={initialValues}
					isSubmitting={isPendingUpdate}
					disableRoleChange={true}
					onSubmitComplete={async (vals) => {
						const payload = toRequestFormat(vals, initialValues)
						await mutateAsyncUpdate({ data: payload })
						setIsOpen(false)
					}}
				/>
			)}
		</Drawer>
	)
}

export default UserEdit
