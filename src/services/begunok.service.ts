// src/services/begunok.service.ts
import { AxiosRequestConfig } from 'axios'
import type {
	BegunokAccountant1Patch,
	BegunokAccountantPatch,
	BegunokDetail,
	BegunokExpeditorPatch,
	BegunokFinancierPatch,
	BegunokJuristPatch,
	BegunokMarketing1Patch,
	BegunokMarketingPatch,
	BegunokMonitoringPatch,
	BegunokZamdepPatch,
} from '@/@types/begunok.types'
import { apiInstance } from '@/services/api.instance'

const ROOT = '/begunok/begunok'

export type BegunokListQuery = {
	page?: number
	size?: number
	search?: string
	[k: string]: any
}

export const BegunokService = {
	// LIST
	getAllBegunok<T = { count: number; results: BegunokDetail[] }>(params?: BegunokListQuery) {
		return apiInstance.get<T>(`${ROOT}/`, { params })
	},

	// CREATE
	create<T = BegunokDetail>(payload: Partial<BegunokDetail>, config?: AxiosRequestConfig) {
		return apiInstance.post<T>(`${ROOT}/`, payload, config)
	},

	// READ (detail)
	getById<T = BegunokDetail>(id: number | string, config?: AxiosRequestConfig) {
		return apiInstance.get<T>(`${ROOT}/${id}/`, config)
	},

	// FULL UPDATE (PUT)
	update<T = BegunokDetail>(id: number | string, payload: BegunokDetail, config?: AxiosRequestConfig) {
		return apiInstance.put<T>(`${ROOT}/${id}/`, payload, config)
	},

	// PARTIAL UPDATE (generic PATCH)
	partialUpdate<T = BegunokDetail>(id: number | string, payload: Partial<BegunokDetail>, config?: AxiosRequestConfig) {
		return apiInstance.patch<T>(`${ROOT}/${id}/`, payload, config)
	},

	// DELETE
	delete(id: number | string, config?: AxiosRequestConfig) {
		return apiInstance.delete(`${ROOT}/${id}/`, config)
	},

	/* ---------- ROLE-SPECIFIC PATCHES ---------- */

	// Экспедитор
	patchExpeditor<T = BegunokDetail>(
		id: number | string,
		data: BegunokExpeditorPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/expeditor0/`, data, config)
	},

	// Финансист
	patchFinance<T = BegunokDetail>(
		id: number | string,
		data: BegunokFinancierPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/finance0/`, data, config)
	},

	// Юрист
	patchJurist<T = BegunokDetail>(
		id: number | string,
		data: BegunokJuristPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/jurist0/`, data, config)
	},

	// Маркетинг
	patchMarketing<T = BegunokDetail>(
		id: number | string,
		data: BegunokMarketingPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/marketing0/`, data, config)
	},

	// Маркетинг-1
	patchMarketing1<T = BegunokDetail>(
		id: number | string,
		data: BegunokMarketing1Patch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/marketing1/`, data, config)
	},

	// Мониторинг
	patchMonitoring<T = BegunokDetail>(
		id: number | string,
		data: BegunokMonitoringPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/monitoring0/`, data, config)
	},

	// Зампред
	patchZamdep<T = BegunokDetail>(
		id: number | string,
		data: BegunokZamdepPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/zampred0/`, data, config)
	},

	// Бухгалтер
	patchAccountant<T = BegunokDetail>(
		id: number | string,
		data: BegunokAccountantPatch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/accountant0/`, data, config)
	},

	// Бухгалтер-1
	patchAccountant1<T = BegunokDetail>(
		id: number | string,
		data: BegunokAccountant1Patch,
		config?: AxiosRequestConfig,
	) {
		return apiInstance.patch<T>(`${ROOT}/${id}/accountant1/`, data, config)
	},
}
