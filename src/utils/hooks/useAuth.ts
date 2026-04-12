import { useNavigate } from 'react-router-dom'
import type { SignInCredential, SignUpCredential } from '@/@types/auth.types'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import {
	MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED,
	BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS,
	BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT,
	MONITORING, ZAMPREDMONITORING
} from '@/constants/roles.constant'
import { AuthService } from '@/services/auth.service'
import { signInSuccess, signOutSuccess, useAppDispatch, useAppSelector } from '@/store'
import { clearAuthData, saveAuthData } from '@/utils/auth.utils'
import { useQueryParams } from './useQueryParams'

const OFFICE_ROLES = [MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED]
const BRANCH_ROLES = [
	BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS,
	BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT
]
const MONITORING_ROLES = [MONITORING, ZAMPREDMONITORING]

export function getEntryPathByRole(role: string): string {
	if (OFFICE_ROLES.includes(role)) return '/dashboard/office'
	if (BRANCH_ROLES.includes(role)) return '/dashboard/branch'
	if (MONITORING_ROLES.includes(role)) return '/dashboard/monitoring'
	return appConfig.authenticatedEntryPath
}

type Status = 'success' | 'failed'
type AuthResult = { status: Status; message: string; code?: number }

// Axios error type helper
interface AxiosErrorResponse {
	response?: {
		status?: number
		data?: {
			message?: string
		}
	}
	message?: string
}

function useAuth() {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const query = useQueryParams()

	const {
		session: { token, signedIn, user }
	} = useAppSelector((state) => state.auth)

	const normalizeError = (err: unknown): AuthResult => {
		const error = err as AxiosErrorResponse
		const code = error?.response?.status
		const backendMsg = error?.response?.data?.message
		let message = backendMsg || error?.message || String(err)
		if (code === 400 || code === 401) {
			message = 'Неверный логин или пароль'
		} else if (code === 403) {
			message = 'Доступ запрещён'
		} else if (code === 429) {
			message = 'Слишком много попыток входа. Попробуйте позже.'
		} else if (code && code >= 500) {
			message = 'Сервер временно недоступен. Попробуйте позже.'
		}

		return { status: 'failed', message, code }
	}

	const signIn = async (
		values: SignInCredential
	): Promise<{ status: Status; message: string } | undefined> => {
		try {
			const resp = await AuthService.apiSignIn(values)

			if (!resp || !resp.data) {
				return { status: 'failed', message: 'Пустой ответ сервера' }
			}

			const { token, user } = resp.data

			// ✅ Storage ga saqlash - faqat shu yerda!
			saveAuthData({ token, user }, values.is_remember || false)

			// Redux state ga yuborish
			dispatch(signInSuccess({ token, user }))

			// Redirect
			const redirectUrl = query.get(REDIRECT_URL_KEY)
			navigate(redirectUrl ? redirectUrl : getEntryPathByRole(user.role))

			return { status: 'success', message: 'OK' }
		} catch (errors) {
			return normalizeError(errors)
		}
	}

	const signUp = async (values: SignUpCredential) => {
		try {
			const resp = await AuthService.apiSignUp(values)
			if (resp.data) {
				const { token, user } = resp.data

				// Default: sessionStorage ga yozish
				saveAuthData({ token, user }, false)

				dispatch(signInSuccess({ token, user }))
				const redirectUrl = query.get(REDIRECT_URL_KEY)
				navigate(redirectUrl ? redirectUrl : getEntryPathByRole(user.role))

				return { status: 'success', message: 'OK' }
			}

			return { status: 'failed', message: 'Пустой ответ сервера' }
		} catch (errors) {
			return normalizeError(errors)
		}
	}

	const signOut = async () => {
		// ✅ Barcha storage ni tozalash
		clearAuthData()

		dispatch(signOutSuccess())
		navigate(appConfig.unAuthenticatedEntryPath)
	}

	return {
		authenticated: token && signedIn,
		user,
		signIn,
		signUp,
		signOut
	}
}

export default useAuth
