import { UserRoleTextEnum } from '@/@types/user.types'
import { apiInstance } from '@/services/api.instance'

const PROFILE = '/profile'
const ROLES = '/roles'

export const UserService = {
	async getAllUsers<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${PROFILE}/user-list/`, { params })
	},
	async getAllUsersRegistry<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${ROLES}/lessee/`, { params })
	},

	async getByIdAndRole<T>(id: number, role: UserRoleTextEnum | string) {
		const roleText = String(role ?? '').toLowerCase()
		if (roleText.startsWith('branch')) {
			return apiInstance.get<T>(`${ROLES}/branch_user/${id}/`)
		}

		return apiInstance.get<T>(`${ROLES}/${role}/${id}/`)
	},

	async getAllRoles<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${PROFILE}/role/`, { params })
	},

	async getAllBranchEmployees<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${ROLES}/monitoring/`, { params })
	},

	async getLesseeById<T>(id: number) {
		return apiInstance.get<T>(`${ROLES}/lessee/${id}/`)
	},

	async getAllSales<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${ROLES}/sales/`, { params })
	},

	async create<T, U extends Record<string, unknown>>(role: UserRoleTextEnum, data: U) {
		return apiInstance.post<T>(`${ROLES}/${role}/`, data)
	},

	async createBranchUser<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${ROLES}/branch_user/`, data)
	},

	async updateBranchUser<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.patch<T>(`${ROLES}/branch_user/${id}/`, data)
	},

	async update<T, U extends Record<string, unknown>>(role: UserRoleTextEnum, id: number, data: U) {
		return apiInstance.patch<T>(`${ROLES}/${role}/${id}/`, data)
	},

	async updatePartially<T, U extends FormData>(role: UserRoleTextEnum, id: number, data: U) {
		return apiInstance.patch<T>(`${ROLES}/${role}/${id}/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async delete<T>(id: number) {
		return apiInstance.delete<T>(`${PROFILE}/user-list/${id}/`)
	},
	async deleteRegistry<T>(id: number) {
		return apiInstance.delete<T>(`${ROLES}/lessee/${id}/`)
	},

	async deleteBranchUser<T>(id: number, params?: Record<string, unknown>) {
		return apiInstance.delete<T>(`${PROFILE}/user-list/${id}/`, { params })
	}
}
