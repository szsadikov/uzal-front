// BegunokList ichidagi "begunok" obyektining tipi
export type BegunokListCore = {
	readonly id: number
	expeditor_confirmation: boolean
	finance_confirmation: boolean
	accountant_confirmation: boolean
	jurist_confirmation: boolean
	marketing_confirmation: boolean
	zampred_monitoring_confirmation: boolean
	zampred_confirmation: boolean
	uzmashlizing_confirmation: boolean
}

// Status qiymatlari enum ekan (6 ta). Aniq qiymatlar bo‘lmasa, hozircha number qilib qo‘yamiz.
// Agar qiymatlari ma’lum bo‘lsa, quyidagicha enum qilib berish mumkin:
// export enum BegunokStatus { ... }
export type BegunokStatus = number // yoki: 0 | 1 | 2 | 3 | 4 | 5

// Ro‘yxat elementi
export type BegunokListItem = {
	readonly id: number
	client_company_name: string // maxLength: 100
	status: BegunokStatus
	stir: string // maxLength: 100
	code: string // misol: "08/23-001 -> 08(region-code)/23(year)-001"
	tech_model: string // maxLength: 100
	begunok: BegunokListCore
}

// To‘liq javob (paginated)
export type BegunokListResponse = {
	count: number
	next: string | null
	previous: string | null
	results: BegunokListItem[]
}

// src/@types/begunok.types.ts

export type DateString = string // "YYYY-MM-DD"
export type Nullable<T> = T | null

export type RoleName =
	| 'expeditor'
	| 'finance'
	| 'accountant'
	| 'jurist'
	| 'marketing'
	| 'monitoring'
	| 'zampred'
	| 'marketing1'
	| 'accountant1'

export type BegunokRole = {
	id: number
	name: RoleName | string
	name_ru: string
	name_uz: string
}

export type BegunokFile = { id?: number; name?: string; url?: string; size?: number } | string

export type BegunokProcess = {
	id: number
	order: number
	role: BegunokRole
	status: 'new' | 'current' | 'completed' | 'rejected' | string
	files: BegunokFile[]
}

/** Begunok detail (swagger) */
export interface BegunokDetail {
	/** ID (readOnly) */
	id: number
	/** Code (B + contract.code bo‘lishi mumkin) */
	code: string

	/** Contract (required) */
	contract: number

	/** --- Client info (required) --- */
	client_company_name: string // Lizing oluvchi nomi
	client_company_region: string // Lizing oluvchi manzili viloyat
	client_company_district: string // Lizing oluvchi manzili tuman
	client_stir: string // Lizing oluvchi STIR

	/** --- Tech (required) --- */
	tech_type: string // Lizing obyekti 2.tip
	tech_model: string // Lizing obyekti 1.model

	/** --- Contract (required) --- */
	contract_code: string // Lizing shartnomasi raqami
	contract_date: string // $date, Lizing shartnomasi sanasi

	/** --- Insurance (required) --- */
	insurance_code: string // Sug‘urta polisi raqami
	insurance_date: string // $date, Sug‘urta polisi sanasi

	/** --- Expeditor --- */
	expeditor_confirmation?: boolean
	expeditor?: number | null
	expeditor_insurance_policy?: string | null // polis straxovki
	expeditor_insurance_policy_date?: string | null // $date

	/** --- Finance --- */
	finance_confirmation?: boolean
	finance?: number | null
	financial_situation?: boolean // moliyaviy holati
	no_debt?: boolean // qarzdorligi mavjud emas

	/** --- Accountant --- */
	accountant_confirmation?: boolean
	accountant?: number | null
	deposit?: string | null // $decimal, summa avans
	registration_fee?: string | null // $decimal, poshlino za registratsiyu
	invoice?: string | null // schet faktura
	insurance_act?: string | null // sugurta akti
	invoice_date?: string | null // $date
	insurance_act_date?: string | null // $date

	/** --- Jurist --- */
	jurist_confirmation?: boolean
	jurist?: number | null
	supply_contract?: string | null // taminot shartnomasi
	supply_contract_date?: string | null // $date
	jurist_insurance_policy?: string | null // insurance policy
	jurist_insurance_policy_date?: string | null // $date
	has_supply_contract?: boolean // taminotchi bilan shartnoma

	/** --- Marketing --- */
	marketing_confirmation?: boolean
	marketing?: number | null
	contract_application_code?: string | null // filial expert qarori
	contract_application_date?: string | null // $date
	noted?: string | null // qayt etildi
	noted_date?: string | null // $date
	marketing_has_supply_contract?: boolean // taminotchi bilan tuzilgan shartnoma

	/** --- Monitoring --- */
	monitoring_confirmation?: boolean
	monitoring?: number | null
	acceptance_certificate?: string | null // qabul qilish topshirish shartnomasi
	acceptance_certificate_date?: string | null // $date
	department_record?: string | null // bo‘limda qayt etildi
	department_record_date?: string | null // $date

	/** --- Marketing1 --- */
	marketing1_confirmation?: boolean
	marketing1?: number | null
	marketing_date?: string | null // $date

	/** --- Zampred --- */
	zampred_confirmation?: boolean
	zampred?: number | null
	zampred_date?: string | null // $date

	/** --- Accountant1 --- */
	accountant1_confirmation?: boolean
	accountant1?: number | null
	waybill?: string | null // yuk xati
	waybill_date?: string | null // $date

	/** Process (readOnly) */
	processes: BegunokProcess[]
}

// PATCH payloads:

export interface BegunokExpeditorPatch {
	expeditor_confirmation?: boolean
	expeditor_insurance_policy?: string | null
	expeditor_insurance_policy_date?: string | null // $date
}

export interface BegunokFinancierPatch {
	finance_confirmation?: boolean
	finance?: number | null
	financial_situation?: boolean
	no_debt?: boolean
}

export interface BegunokAccountantPatch {
	accountant_confirmation?: boolean
	accountant?: number | null
	deposit?: string | null
	registration_fee?: string | null
	invoice?: string | null
	insurance_act?: string | null
	invoice_date?: string | null
	insurance_act_date?: string | null
}

export interface BegunokJuristPatch {
	jurist_confirmation?: boolean
	jurist?: number | null
	supply_contract?: string | null
	supply_contract_date?: string | null
	jurist_insurance_policy?: string | null
	jurist_insurance_policy_date?: string | null
	has_supply_contract?: boolean
}

export interface BegunokMarketingPatch {
	marketing_confirmation?: boolean
	marketing?: number | null
	contract_application_code?: string | null
	contract_application_date?: string | null
	noted?: string | null
	noted_date?: string | null
	marketing_has_supply_contract?: boolean
}

export interface BegunokMonitoringPatch {
	monitoring_confirmation?: boolean
	monitoring?: number | null
	acceptance_certificate?: string | null
	acceptance_certificate_date?: string | null
	department_record?: string | null
	department_record_date?: string | null
}

export interface BegunokMarketing1Patch {
	marketing1_confirmation?: boolean
	marketing1?: number | null
	marketing_date?: string | null
}

export interface BegunokZamdepPatch {
	zampred_confirmation?: boolean
	zampred?: number | null
	zampred_date?: string | null
}

export interface BegunokAccountant1Patch {
	accountant1_confirmation?: boolean
	accountant1?: number | null
	waybill?: string | null
	waybill_date?: string | null
}
