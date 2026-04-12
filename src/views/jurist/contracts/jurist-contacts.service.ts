import { PaginatedResponse } from '@/@types/common'
import { apiInstance } from '@/services/api.instance'

export type JuristContact = {
	id: number
	branch: number | null          // API integer qaytaradi
	role: string
	full_name: string
	phone_number: string
}

export type JuristContactFormModel = {
	branch: number | null
	role: string
	full_name: string
	phone_number: string
}

const ROOT = '/dataset/payment_notice_document_sign'

export const JuristContactsService = {
	getAll(params?: Record<string, unknown>) {
		return apiInstance.get<PaginatedResponse<JuristContact[]>>(`${ROOT}/`, { params })
	},
	create(data: JuristContactFormModel) {
		return apiInstance.post<JuristContact>(`${ROOT}/`, data)
	},
	update(id: number, data: JuristContactFormModel) {
		return apiInstance.patch<JuristContact>(`${ROOT}/${id}/`, data)
	},
	remove(id: number) {
		return apiInstance.delete(`${ROOT}/${id}/`)
	}
}
