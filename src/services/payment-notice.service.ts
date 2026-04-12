import { PaymentOverdueNoticeBulkUpdateRequest } from '@/@types/payment-notice.types'
import { apiInstance } from '@/services/api.instance'

const PAYMENT_NOTICE = '/payment_notice'

export const PaymentNoticeService = {
	async getAllPaymentNoticeList<T>(params?: Record<string, unknown>) {
		return apiInstance.get<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/`, { params })
	},

	async getById<T>(id: number) {
		return apiInstance.get<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/${id}/`)
	},

	/* CREATE — JSON yoki FormData */
	async createPaymentNotice<T>(data: FormData | Record<string, unknown>): Promise<T> {
		const url = `${PAYMENT_NOTICE}/payment_overdue_notice/`
		const cfg =
			data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined

		return apiInstance.post<T>(url, data, cfg).then((r) => r.data)
	},

	/* UPDATE — JSON yoki FormData */
	async updatePaymentNotice<T>(
		id: number | string,
		data: FormData | Record<string, unknown>
	): Promise<T> {
		const url = `${PAYMENT_NOTICE}/payment_overdue_notice/${id}/` // trailing slash!
		const cfg =
			data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined

		return apiInstance.put<T>(url, data, cfg).then((r) => r.data)
	},
	async bulkSendPaymentNotices<T>(data: PaymentOverdueNoticeBulkUpdateRequest) {
		return apiInstance.post<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/send_notice/`, data)
	},
	async bulkDelayPaymentNotices<T>(data: PaymentOverdueNoticeBulkUpdateRequest) {
		return apiInstance.post<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/delay/`, data)
	},

	// 🔹 Process list olish
	async getProcessList<T>(paymentNoticeId: number) {
		return apiInstance.get<T>(`${PAYMENT_NOTICE}/process/`, {
			params: { payment_notice: paymentNoticeId }
		})
	},

	// 2️⃣ Status va file update qilish
	updateProcess: async <T = any>(
		processId: number,
		payload: {
			status?: 'done' | 'not_done'
			new_files?: File[]
			deleted_files?: number[]
		}
	) => {
		const formData = new FormData()

		// Agar file mavjud bo‘lsa
		if (payload.new_files && payload.new_files.length > 0) {
			payload.new_files.forEach((file) => formData.append('new_files', file))
		}

		// Agar status mavjud bo‘lsa
		if (payload.status) formData.append('status', payload.status)

		// Agar o‘chiriladigan fayl id’lari bo‘lsa
		if (payload.deleted_files && payload.deleted_files.length > 0) {
			payload.deleted_files.forEach((id) => formData.append('deleted_files', id.toString()))
		}

		// Agar file bo‘lsa PUT, aks holda PATCH ishlatamiz
		const method = payload.new_files?.length ? 'put' : 'patch'

		return apiInstance.request<T>({
			url: `${PAYMENT_NOTICE}/process/${processId}/`,
			method,
			data: formData,
			headers: { 'Content-Type': 'multipart/form-data' }
		})
	},
	/* ----------------- PDF generatsiya (server) ----------------- */
	async getGeneratedPdf<T>(id: number) {
		return apiInstance.get<T>(`${PAYMENT_NOTICE}/payment_overdue_notice/${id}/`, {
			responseType: 'blob'
		})
	},

	getOverdueNoticePdf(id: number) {
		return apiInstance.get<Blob>(`/api/v1/payment_notice/payment_overdue_notice/${id}/`, {
			responseType: 'blob'
		})
	},

	// service ichida
	async getCompanyByStir<T>(stir: string) {
		return apiInstance.get<T>(`/customer/get_by_inn/${stir}/`)
	},
	// ✅ YANGI: contract ID bo‘yicha navbatdagi kodni olish
	// payment-notice.service.ts
	async getNextCode(contractId: number) {
		return apiInstance
			.get<{ code: string }>(
				`${PAYMENT_NOTICE}/payment_overdue_notice/get_next_code/`,
				{ params: { contract: contractId } }
			)
			.then(r => r.data) // <-- shu sabab data yo'q, bevosita {code} qaytadi
	}

}
