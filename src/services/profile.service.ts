import { apiInstance } from '@/services/api.instance'

const PROFILE = '/profile'

export const ProfileService = {
	async getProfile<T>() {
		return apiInstance.get<T>(`${PROFILE}/profile/`)
	},

	async updateProfile<T, U extends FormData>(data: U) {
		return apiInstance.patch<T>(`${PROFILE}/profile/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async updatePasswordAndUsername<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${PROFILE}/reset-login/`, data)
	},

	async getDeviceSessions<T>(params?: Record<string, unknown>) {
		try {
			// const ipRes = await fetch('https://api.ipify.org?format=json')
			// const { ip } = await ipRes.json()

			// const getLocation = (): Promise<{ lat: number; lng: number }> => {
			// 	return new Promise((resolve, reject) => {
			// 		if (!navigator.geolocation) {
			// 			return reject(new Error('Geolocation not supported'))
			// 		}
			// 		navigator.geolocation.getCurrentPosition(
			// 			(pos) => {
			// 				resolve({
			// 					lat: pos.coords.latitude,
			// 					lng: pos.coords.longitude
			// 				})
			// 			},
			// 			(err) => reject(err)
			// 		)
			// 	})
			// }

			// let lat = null
			// let lng = null

			try {
				// const location = await getLocation()
				// lat = location.lat
				// lng = location.lng
			} catch (e) {
				console.warn('Could not get geolocation', e)
			}

			return apiInstance.get<T>(`${PROFILE}/session/`, {
				params,
				// headers: {
				// 	HTTP_USER_AGENT: navigator.userAgent
				// 	// IP_ADDRESS: ip,
				// 	// REMOTE_ADDR_LAT: lat,
				// 	// REMOTE_ADDR_LON: lng
				// }
			})
		} catch (error) {
			console.error('Error getting device sessions:', error)
			throw error
		}
	},

	async deleteDevice<T>(id: number) {
		return apiInstance.delete<T>(`${PROFILE}/session/${id}/`)
	},

	async removeDeviceSession<T>(id: number) {
		return apiInstance.delete<T>(`${PROFILE}/session/${id}/`)
	}
}
