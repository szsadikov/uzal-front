import { apiInstance } from '@/services/api.instance'
import { PaginatedResponse } from '@/@types/common'

// ─── Type ─────────────────────────────────────────────────────────────────────

export type MarketingClient = {
	id: number
	stir: string
	client_company_name: string
	branch: {
		id: number
		name: string
		region: {
			id: number
			name_ru: string
			name_uz: string
			name_uzl?: string
			region_code: string
		}
	} | null
	phone_number: string
	// Counts — backendda bo'lsa:
	applications_count?: number
	new_contracts_count?: number
	current_contracts_count?: number
	requests_count?: number
	leasing_count?: number
	// Amounts
	overall_contract_amount?: string
	overdue_amount?: string
	contract_amount_left?: string
}

// ─── Service ──────────────────────────────────────────────────────────────────
// ⚠ Endpoint tayyor bo'lganda ROOT ni o'zgartiring

const ROOT = '/customer/current_client' // yoki '/customer/clients'

export const MarketingClientsService = {
	getAll(params?: Record<string, unknown>) {
		return apiInstance.get<PaginatedResponse<MarketingClient[]>>(`${ROOT}/`, { params })
	},
	getById(id: number) {
		return apiInstance.get<MarketingClient>(`${ROOT}/${id}/`)
	},
	update(id: number, data: Partial<MarketingClient>) {
		return apiInstance.patch<MarketingClient>(`${ROOT}/${id}/`, data)
	}
}
