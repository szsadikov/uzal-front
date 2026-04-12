export type Branch = {
	id: number
	name: string
	region: {
		id: number
		name_ru: string
		name_uz: string
		name_latin: string
	}
	city: {
		id: number
		region: number
		name_ru: string
		name_uz: string
	}
	street: string // filial manzili, ko'cha
	house_number: string // filial manzili, uy
	// first_name: string // filial direktori ismi
	// last_name: string // filial direktori familiyasi
	// middle_name: string // filial direktori otasining ismi
	// phone_number: string
	// director: string
	// procuration_date: Date | string // доверенность
	// procuration_number: number // доверенность номер
	position: number
	// status: boolean
	branch_users_count: string
}

export type Region = {
	id: number
	name_ru: string
	name_uz: string
	position: number
	is_active: boolean
	region_code: string
}

export type City = {
	id: number
	region: Region
	name_ru: string
	name_uz: string
	position: number
	is_active: boolean
}

export type ContractMeta = {
	id: number
	region: Region
	year: number
	number: number
	position: number
}

export type ContractMetric = {
	deposit: number
	gps: number
	gps_with_vat: number
	vat: number
}

export type ConstMetric = {
	id: number
	vat: string // НДС
	gps: string // GPS, summa
	min_deposit_percentage: string // Avans foizi
	min_threshold: string // Минимальный порог суммы
}

export type SMSService = {
	id: number
	day_count: number
}

// src/@types/pkm.types.ts
export type PKM = {
	id: number
	name: string
	investor: string
	top_content: string
	bottom_content: string
	is_active: boolean
	created_at: string
}

export type PKMCreate = Omit<PKM, 'id' | 'created_at' | 'is_active'> & { is_active?: boolean }
export type PKMUpdate = Partial<PKMCreate> & { is_active?: boolean }

