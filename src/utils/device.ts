export const DEVICE_ID_KEY = 'app_device_id_v1'

function uuidv4Fallback() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8

		return v.toString(16)
	})
}

export function getOrCreateDeviceId() {
	try {
		const existing = localStorage.getItem(DEVICE_ID_KEY)
		if (existing) return existing

		const newId =
			typeof crypto !== 'undefined' && 'randomUUID' in crypto
				? (crypto as any).randomUUID()
				: uuidv4Fallback()

		localStorage.setItem(DEVICE_ID_KEY, newId)

		return newId
	} catch (err: any) {
		return typeof crypto !== 'undefined' && 'randomUUID' in crypto
			? (crypto as any).randomUUID()
			: uuidv4Fallback()
	}
}

export function readDeviceId(): string | null {
	try {
		return localStorage.getItem(DEVICE_ID_KEY)
	} catch {
		return null
	}
}
