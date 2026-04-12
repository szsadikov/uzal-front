import { apiInstance } from '@/services/api.instance'

const CUSTOMER = '/customer'

export const CustomerService = {
	async getAllCurrentContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CUSTOMER}/current_client/`, { params })
	},

	async getAllCurrentContractPayments<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CUSTOMER}/current_client/payments/`, { params })
	},

	async getByInn<T>(stir: string) {
		return apiInstance.get<T>(`${CUSTOMER}/get_by_inn/${stir}/`)
	}
}
