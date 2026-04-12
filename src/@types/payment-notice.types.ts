export enum PaymentOverdueNoticeStatusEnum {
	NEW = 'new',
	// PROCESSING,
	DELAYED = 'delayed',
	PROCESSING = 'processing'
	// PROCESSED
}

export type Region = {
	id: number
	name_ru: string
	name_uz: string
	name_uzl: string
	name_latin: string
	name_lt: string
	region_code: string
}

export type Branch = {
	id: number
	name: string
	region: Region
	city: number
	street: string
	house_number: string
	position: string | null
}

export type PaymentOverdueNotice = {
	id: number
	code: string
	contract: number
	company_name: string
	stir: string
	phone_number: string
	contract_code: string
	month_overdue: number
	date_of_payment: Date | string
	days_in_the_month: number
	main_amount_of_payment: string
	total_amount: string
	overdue_amount: string
	rent_percent: number
	notice_date: Date | string
	status: string
	sms_status: string
	delayed_time: Date | string
	pdf_document: string
	html_document: string
	process_status: string
	branch: Branch | null
}

export type PaymentOverdueNoticeBulkUpdateRequest = {
	ids: number[]
}

export type DelayNotice = {
	ids: number[]
	delayed_time: string // ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
}

// Process step detail type
export type PaymentOverdueNoticeProcessDetail = {
	id: number
	process_name: string
	process_name_ru: string
	process_name_uz: string
	process_name_lt: string
	order: number
	status: 'done' | 'not_done' // enum kelayotgan bo‘lsa shu yerda ko‘rsatiladi
	completed_at?: string | null // ISO 8601 datetime yoki null
	notes?: string
	process_files?: ProcessFile[] // agar fayl struktura alohida bo‘lsa shu type yozamiz
}

// Agar process_files obyektlari bor bo‘lsa (strukturasi keyinroq aniqlasak bo‘ladi)
export type ProcessFile = {
	id: number
	file: string
}

export type UpdatePayload = {
	status: string
	new_files?: string[]
	deleted_files?: number[]
}

// Paginated response for processes
export type PaginatedProcessResponse = {
	count: number
	next: string | null
	previous: string | null
	results: PaymentOverdueNoticeProcessDetail[]
}

// Muvaffaqiyatli javob
export type CompanyDataSuccess = {
	Наименование: string
}

// Xatolik javobi
export type CompanyDataError = {
	СообщитьПользователю: string
}

// API javobi umumiy tipi
export type CompanyByInnResponse =
	| { name: string; data: CompanyDataSuccess }
	| { name: string; data: CompanyDataError }
