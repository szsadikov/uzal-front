import axios from 'axios'
import appConfig from '@/configs/app.config'
import {
	API_SERVER_URL,
	REQUEST_HEADER_AUTH_KEY,
	REQUEST_HEADER_LANG_KEY,
	TOKEN_TYPE
} from '@/constants/api.constant'
import { getAuthToken } from '@/utils/auth.utils'
import store, { signOutSuccess } from '../store'

const unauthorizedCode = [401] // 403 = ruxsat yo'q (token yaroqli), faqat 401 logout qiladi

type DeviceType = 'web' | 'ios' | 'android'

const getDeviceType = (): DeviceType => {
	const userAgent = navigator.userAgent.toLowerCase()
	if (/iphone|ipad|ipod/.test(userAgent)) return 'ios'
	if (/android/.test(userAgent)) return 'android'

	return 'web'
}

export const apiInstance = axios.create({
	baseURL: API_SERVER_URL + appConfig.apiPrefix,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
})

apiInstance.interceptors.request.use(
	(config) => {
		// ✅ Token'ni localStorage yoki sessionStorage'dan olish
		let accessToken = getAuthToken()

		// ✅ Agar storage'da yo'q bo'lsa, Redux state'dan olish (fallback)
		if (!accessToken) {
			const { auth } = store.getState()
			accessToken = auth.session.token
		}

		// ✅ Locale - Redux state'dan olish
		const { locale } = store.getState()
		let currentLang = locale?.currentLang

		// Agar Redux'da yo'q bo'lsa, default 'ru'
		if (!currentLang) {
			currentLang = 'ru'
		}

		// ✅ Token header'ga qo'shish
		if (accessToken) {
			config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE} ${accessToken}`
		}

		// ✅ Language header'ga qo'shish
		if (currentLang) {
			config.headers[REQUEST_HEADER_LANG_KEY] = currentLang
		}

		// ✅ Device type header'ga qo'shish
		config.headers['x-device-type'] = getDeviceType()

		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

apiInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		const { response } = error

		// ✅ 401/403 da logout qilish va storage tozalash
		if (response && unauthorizedCode.includes(response.status)) {
			// Storage'ni tozalash
			localStorage.removeItem('token')
			localStorage.removeItem('user')
			sessionStorage.removeItem('token')
			sessionStorage.removeItem('user')

			// Redux state'ni tozalash
			store.dispatch(signOutSuccess())
		}

		return Promise.reject(error)
	}
)
