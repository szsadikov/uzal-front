import { apiInstance } from '@/services/api.instance'

const CONTRACT = '/contract'

export const ContractService = {
	async getAllNewContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/new-clients/`, { params })
	},

	async getNewContract<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/new-contract/`, { params })
	},

	async getAllArchiveContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/contract/archive/`, { params })
	},

	async getContractById<T>(id: number) {
		return apiInstance.get<T>(`${CONTRACT}/contract/${id}/`)
	},

	async getAllApplications<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/applications/`, { params })
	},

	async getApplicationById<T>(id: number) {
		return apiInstance.get<T>(`${CONTRACT}/applications/${id}/`)
	},

	async create<T, U extends FormData>(data: U) {
		return apiInstance.post<T>(`${CONTRACT}/contract/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async createApplications<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${CONTRACT}/applications/`, data)
	},

	async leaveRequest<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${CONTRACT}/applications/lessee/`, data)
	},

	async update<T, U extends FormData>(id: number, data: U) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async updateReplaceTech<T, U extends FormData>(id: number, data: U) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/change_tech/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async updateRefundTech<T>(id: number) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/return_tech/`)
	},

	async updateCancel<T>(id: number) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/cancel/`)
	},

	async updateChangeClient<T, U extends FormData>(id: number, data: U) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/change_client/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async updateEquipmentIssue<T>(id: number) {
		return apiInstance.put<T>(`${CONTRACT}/contract/${id}/give_tech/`)
	},

	async updateApplications<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.put<T>(`${CONTRACT}/applications/${id}/`, data)
	},

	async updateApplicationPartially<T, U extends FormData>(id: number, data: U) {
		return apiInstance.patch<T>(`${CONTRACT}/applications/${id}/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async updateVotesByApplicationId<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.patch<T>(`${CONTRACT}/application/votes/${id}/vote/`, data)
	},

	async delete<T>(id: number) {
		return apiInstance.delete<T>(`${CONTRACT}/contract/${id}/`)
	},

	async deleteApplications<T>(id: number) {
		return apiInstance.delete<T>(`${CONTRACT}/applications/${id}/`)
	}
}
