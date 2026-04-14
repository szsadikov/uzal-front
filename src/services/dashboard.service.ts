import { apiInstance } from '@/services/api.instance'

const CONTRACT = '/contract'
const PAYMENT_NOTICE = '/payment_notice'
const DATASET = '/dataset'

export const DashboardService = {
	async getContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/contract/`, {
			params: { page_size: 10, ...params }
		})
	},

	async getNewContracts<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/new-clients/`, {
			params: { page_size: 10, ...params }
		})
	},

	async getApplications<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${CONTRACT}/applications/`, {
			params: { page_size: 10, ...params }
		})
	},

	async getOverdueNotices<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/`, {
			params: { page_size: 10, status: 'new', ...params }
		})
	},

	async getRegions<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${DATASET}/region/`, { params })
	},

	async getMonthlyStats<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>('/dashboard/monthly-stats/', { params })
	},

	async getMarketingStats<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>('/dashboard/marketing-stats/', { params })
	},

	async getRegionalStats<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>('/dashboard/regional-stats/', { params })
	},

	async getEquipmentByRegion<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>('/dashboard/equipment-by-region/', { params })
	}
}
