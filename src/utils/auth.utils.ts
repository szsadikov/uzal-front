// utils/auth.utils.ts

import { User } from '@/@types/user.types'

interface AuthData {
	token: string
	user: User
}

/**
 * Token va user ma'lumotlarini saqlash
 * @param data - token va user
 * @param remember - true: localStorage, false: sessionStorage
 */
export const saveAuthData = (data: AuthData, remember: boolean) => {
	const storage = remember ? localStorage : sessionStorage

	storage.setItem('token', data.token)
	storage.setItem('user', JSON.stringify(data.user))

	// ✅ Ikkinchi storage'ni tozalash (conflict oldini olish)
	if (remember) {
		sessionStorage.removeItem('token')
		sessionStorage.removeItem('user')
	} else {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
	}
}

/**
 * Token va user ma'lumotlarini o'qish
 * @returns AuthData yoki null
 */
export const loadAuthData = (): AuthData | null => {
	// Avval localStorage dan tekshirish
	let token = localStorage.getItem('token')
	let userStr = localStorage.getItem('user')

	// Agar localStorage da bo'lmasa, sessionStorage dan olish
	if (!token) {
		token = sessionStorage.getItem('token')
		userStr = sessionStorage.getItem('user')
	}

	if (!token || !userStr) return null

	try {
		const user = JSON.parse(userStr)

return { token, user }
	} catch {
		return null
	}
}

/**
 * Auth ma'lumotlarini butunlay tozalash
 */
export const clearAuthData = () => {
	localStorage.removeItem('token')
	localStorage.removeItem('user')
	sessionStorage.removeItem('token')
	sessionStorage.removeItem('user')
}

/**
 * Tokenni olish (axios interceptor uchun)
 * @returns token string yoki null
 */
export const getAuthToken = (): string | null => {
	return localStorage.getItem('token') || sessionStorage.getItem('token')
}

/**
 * User ma'lumotlarini olish
 * @returns User object yoki null
 */
export const getAuthUser = (): User | null => {
	const userStr = localStorage.getItem('user') || sessionStorage.getItem('user')

	if (!userStr) return null

	try {
		return JSON.parse(userStr)
	} catch {
		return null
	}
}
