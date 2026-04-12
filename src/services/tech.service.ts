import { apiInstance } from '@/services/api.instance'

const TECH = '/tech'

export const TechService = {
	async getAllTechs<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/tech/`, { params })
	},

	async getById<T>(id: number) {
		return apiInstance.get<T>(`${TECH}/tech/${id}/`)
	},

	async create<T, U extends FormData>(data: U) {
		return apiInstance.post<T>(`${TECH}/tech/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async delete<T>(id: number) {
		return apiInstance.delete<T>(`${TECH}/tech/${id}/`)
	},

	async update<T, U extends FormData>(id: number, data: U) {
		return apiInstance.patch<T>(`${TECH}/tech/${id}/`, data, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
	},

	async activate<T>(id: number, data: { is_active: boolean }) {
		return apiInstance.patch<T>(`${TECH}/tech/${id}/`, data)
	},

	async getAllManufacturers<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/manufacturer/`, { params })
	},

	async getManufacturerById<T>(id: number) {
		return apiInstance.get<T>(`${TECH}/manufacturer/${id}/`)
	},

	async createManufacturer<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/manufacturer/`, data)
	},

	async updateManufacturer<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.put<T>(`${TECH}/manufacturer/${id}/`, data)
	},

	async deleteManufacturer<T>(id: number) {
		return apiInstance.delete<T>(`${TECH}/manufacturer/${id}/`)
	},

	async getAllTypes<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/type/`, { params })
	},

	async createType<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/type/`, data)
	},

	async deleteType<T>(id: number) {
		return apiInstance.delete<T>(`${TECH}/type/${id}/`)
	},

	async getAllWarehouses<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/tech/warehouse/`, { params })
	},

	async getAllStockOperations<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/stock_operation/`, { params })
	},

	async getUniqDeliveries<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/stock_operation/unique-deliveries/`, { params })
	},

	async createStockOperation<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/stock_operation/`, data)
	},

	async getAllDistributions<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/tech-distribution/`, { params })
	},

	async createDistribution<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/techregion/`, data)
	},

	async getAllDistributeOperations<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/distribute_operation/`, { params })
	},

	async createDistributeOperation<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/distribute_operation/`, data)
	},

	async getAllMonitors<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/tech_monitor/`, { params })
	},

	async createMonitoring<T>(params?: Record<string, unknown>) {
		return apiInstance.post<T>(`${TECH}/tech_monitor/`, { params })
	},

	async updateMonitoring<T>(id: number, data: Record<string, unknown>) {
		return apiInstance.put<T>(`${TECH}/tech_monitor/${id}/`, data)
	},

	async getMonitoringDetail<T>(id: number) {
		return apiInstance.get<T>(`${TECH}/tech_monitor/${id}/`)
	},

	async getAllMonitorTasks<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${TECH}/tech_monitor_task/`, { params })
	},

	async createMonitorTask<T, U extends Record<string, unknown>>(data: U) {
		return apiInstance.post<T>(`${TECH}/tech_monitor_task/`, data)
	},

	async updateMonitorTask<T, U extends Record<string, unknown>>(id: number, data: U) {
		return apiInstance.patch<T>(`${TECH}/tech_monitor_task/${id}/`, data)
	},

	async getMonitorTaskDetail<T>(id: number) {
		return apiInstance.get<T>(`${TECH}/tech_monitor_task/${id}/`)
	},

	async deleteMonitorTask<T>(id: number) {
		return apiInstance.delete<T>(`${TECH}/tech_monitor_task/${id}/`)
	},

	async changeMonitorTaskStatus<T>(id: number, status: 1 | 2 | 3, completed_at?: string | null) {
		return apiInstance.patch<T>(`${TECH}/tech_monitor_task/${id}/`, {
			status,
			completed_at: completed_at ?? null
		})
	}
}
