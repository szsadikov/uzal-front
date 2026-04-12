import axios from 'axios'
import appConfig from '@/configs/app.config'
import {
	API_SERVER_URL,
	REQUEST_HEADER_AUTH_KEY,
	REQUEST_HEADER_LANG_KEY,
	TOKEN_TYPE
} from '@/constants/api.constant'
import store, { signOutSuccess } from '../store'
import { getAuthToken } from '@/utils/auth.utils'

const unauthorizedCode = [401] // 403 = ruxsat yo'q (token yaroqli), faqat 401 logout qiladi

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

		// ✅ Agar storage'da yo'q bo'lsa, Redux state'dan olish
		if (!accessToken) {
			const { auth } = store.getState()
			accessToken = auth.session.token
		}

		// ✅ Locale - Redux state'dan olish yoki localStorage'dan
		const { locale } = store.getState()
		let currentLang = locale.currentLang

		// Agar Redux'da yo'q bo'lsa, localStorage'dan olish
		if (!currentLang) {
			currentLang = localStorage.getItem('locale') || 'ru'
		}

		// ✅ Token header'ga qo'shish
		if (accessToken) {
			config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE} ${accessToken}`
		}

		// ✅ Language header'ga qo'shish
		if (currentLang) {
			config.headers[REQUEST_HEADER_LANG_KEY] = currentLang
		}

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

		if (response && unauthorizedCode.includes(response.status)) {
			store.dispatch(signOutSuccess())
		}

		return Promise.reject(error)
	}
)
