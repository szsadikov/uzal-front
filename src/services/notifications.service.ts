import { apiInstance } from '@/services/api.instance'

const BASE = '/websocket/notifications'

// API item
export type WsNotification = {
	id: number
	text: string
	created_at: string
	updated_at: string | null
	read_at: string | null
}

// Paginatsiya konteyneri
export type Paginated<T> = {
	count: number
	next: string | null
	previous: string | null
	results: T[]
	page_number: number
	page_size: number
	next_page_number: number | null
}

export type ListParams = {
	search?: string
	page?: number
	size?: number
}

export const NotificationsService = {
	// GET /websocket/notifications/
	async list<T = Paginated<WsNotification>>(params?: ListParams) {
		return apiInstance.get<T>(`${BASE}/`, { params })
	},

	// POST /websocket/notifications/mark_read/
	async markRead<T = { notification_ids: number[] }>(notification_ids: number[]) {
		return apiInstance.post<T>(`${BASE}/mark_read/`, { notification_ids })
	},
}
