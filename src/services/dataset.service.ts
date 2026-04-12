import { PKM, PKMCreate, PKMUpdate } from '@/@types/dataset.types'
import { apiInstance } from '@/services/api.instance'

const DATASET = '/dataset'

export const DatasetService = {
	async getAllBranches<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/branch/`, { params })
	},

	async getBranchById<T>(id: number) {
		return apiInstance.get<T>(`${DATASET}/branch/${id}/`)
	},

	async getAllRegions<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/region/`, { params })
	},

	async getAllCities<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/city/`, { params })
	},

	async getAllPkm<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/pkm/`, { params })
	},

	async getPkmById<T>(id: number) {
		return apiInstance.get<T>(`${DATASET}/pkm/${id}/`)
	},

	async createBranch<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${DATASET}/branch/`, data)
	},

	async updateBranch<T>(id: number, data: Record<string, unknown>) {
		return apiInstance.patch<T>(`${DATASET}/branch/${id}/`, data)
	},

	// async updateRegion<T, U extends Record<string, unknown>>(id: number, data: U) {
	// 	return apiInstance.put<T>(`${DATASET}/region/${id}/`, data)
	// },

	async updateRegion<T, U extends Record<string, unknown> = Record<string, unknown>>(
		id: number,
		data: U
	) {
		return apiInstance.put<T>(`${DATASET}/region/${id}/`, data)
	},

	async deleteBranch<T>(id: number) {
		return apiInstance.delete<T>(`${DATASET}/branch/${id}/`)
	},

	async getMetaContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/contract_meta/`, { params })
	},

	async createContractMeta<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${DATASET}/contract_meta/`, data)
	},

	// async updateContractMeta<T, U extends Record<string, unknown>>(data: U) {
	// 	return apiInstance.patch<T>(`${DATASET}/contract_meta/`, data)
	// },

	async updateContractMeta<T = void, P = { year: number | null; number: number | null }>(
		id: number,
		payload: P
	) {
		return apiInstance.patch<T>(`${DATASET}/contract_meta/${id}/`, payload)
	},

	async getContractMetaById<T = unknown>(id: number) {
		return apiInstance.get<T>(`${DATASET}/contract_meta/${id}/`)
	},

	async getConstMetricById<T>(id: number) {
		return apiInstance.get<T>(`${DATASET}/const_metric/${id}/`)
	},

	async updateConstMetric<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.put<T>(`${DATASET}/const_metric/${id}/`, data)
	},

	async getSMSList<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/sms_service/`, { params })
	},

	async createSMS<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${DATASET}/sms_service/`, data)
	},

	async updateSMS<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.patch<T>(`${DATASET}/sms_service/${id}/`, data)
	},

	async deleteSMS<T = void>(id: number) {
		return apiInstance.delete<T>(`${DATASET}/sms_service/${id}/`)
	},

	async getNumToWord<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/num-to-word`, { params })
	},
	// GET /dataset/pkm/?search=&is_active=&page=&size=
	getPKMList<T>(params?: { search?: string; is_active?: string; page?: number; size?: number }) {
		return apiInstance.get<T>('/dataset/pkm/', { params })
	},

	getPKM(id: number) {
		return apiInstance.get(`/dataset/pkm/${id}/`)
	},

	// POST /dataset/pkm/
	createPKM<T = PKM, B = PKMCreate>(body: B) {
		return apiInstance.post<T>('/dataset/pkm/', body)
	},

	// PUT /dataset/pkm/{id}/
	updatePKM<T = PKM, B = PKMCreate>(id: number, body: B) {
		return apiInstance.put<T>(`/dataset/pkm/${id}/`, body)
	},

	// PATCH /dataset/pkm/{id}/
	patchPKM<T = PKM, B = PKMUpdate>(id: number, body: B) {
		return apiInstance.patch<T>(`/dataset/pkm/${id}/`, body)
	},

	// DELETE /dataset/pkm/{id}/
	deletePKM<T = unknown>(id: number) {
		return apiInstance.delete<T>(`/dataset/pkm/${id}/`)
	},
}
