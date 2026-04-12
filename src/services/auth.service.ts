import axios from 'axios'
import type {
	ForgotPassword,
	ResetPassword,
	SignInCredential,
	SignInResponse,
	SignUpCredential,
	SignUpResponse
} from '@/@types/auth.types'
import { getOrCreateDeviceId } from '@/utils/device'
import { apiInstance } from './api.instance'

const PROFILE = '/profile'

const getIpAddress = async () => {
	const ipFromCache = sessionStorage.getItem('client_public_ip')
	if (ipFromCache) return ipFromCache

	try {
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), 2500)
		const { data } = await axios.get<{ ip: string }>('https://api.ipify.org?format=json', {
			signal: controller.signal
		})
		clearTimeout(timeout)
		if (!data) return
		sessionStorage.setItem('client_public_ip', data.ip)

		return data.ip
	} catch (err) {
		console.error(err)
	}
}

async function getClientPublicIp(): Promise<string | undefined> {
	if (typeof window === 'undefined') return undefined

	const cached = sessionStorage.getItem('client_public_ip')
	if (cached) return cached

	try {
		const controller = new AbortController()
		const t = setTimeout(() => controller.abort(), 2500)
		const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal })
		clearTimeout(t)
		if (!res.ok) return undefined
		const { ip } = (await res.json()) as { ip?: string }
		if (ip) sessionStorage.setItem('client_public_ip', ip)

		return ip
	} catch {
		return undefined
	}
}

export const AuthService = {
	async login(data: SignInCredential) {
		const ip = await getIpAddress()
		const deviceId = getOrCreateDeviceId()

		return await apiInstance.post<SignInResponse>(`${PROFILE}/token/`, data, {
			headers: {
				'X-Forwarded-For': ip,
				'X-Device-Id': deviceId
			}
		})
	},

	async register(data: SignUpCredential) {
		return await apiInstance.post<SignUpResponse>('/roles/lessee/', data)
	},

	// ⬇️ faqat shu yerda header qo‘shildi
	async apiSignIn(data: SignInCredential) {
		const ip = await getClientPublicIp()
		const deviceId = getOrCreateDeviceId()

		return await apiInstance.post<SignInResponse>(
			`${PROFILE}/token/`,
			data,
			ip ? { headers: { 'X-Forwarded-For': ip, 'X-Device-Id': deviceId } } : undefined
		)
	},

	async apiSignUp(data: SignUpCredential) {
		return apiInstance.post<SignUpResponse>('/roles/lessee/', data)
	},

	// async apiSignOut() {
	//   return apiInstance.post('/sign-out')
	// },

	async apiForgotPassword(data: ForgotPassword) {
		return apiInstance.post(`${PROFILE}/forgot-password/send-confirmation/`, data)
	},

	async apiResetPassword(data: ResetPassword) {
		return apiInstance.post(`${PROFILE}/forgot-password/`, data)
	}
}
