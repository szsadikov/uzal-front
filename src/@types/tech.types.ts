import { FileType } from './common'
import i18n from 'i18next'

export enum MeasureUnitEnum {
	PIECES = 1
}

export enum TechStockOperationActionEnum {
	INCOME = 1,
	COUNT_CHANGE,
	PRICE_CHANGE
}

export enum TechDistributeOperationActionEnum {
	DISTRIBUTE = 1,
	REDISTRIBUTE
}

export type TechCharacteristicItem = {
	name: string
	description: string
}

export type Tech = {
	id: number
	model_name_ru: string
	model_name_uz: string
	manufacturer: {
		id: number
		name_ru: string
		name_uz: string
	}
	type: {
		id: number
		name_ru: string
		name_uz: string
	}
	count: number
	price: string
	overall_price: number
	tech_price_with_vat: number
	tech_price_with_gps: number
	vat: number
	measure_unit: MeasureUnitEnum
	position: number
	country: string
	is_active: boolean
	code_1c: string
	ikpu_code: string
	ikpu_name: string
	description: string
	characteristics: TechCharacteristicItem[]
	files: FileType[]
}

export type ManufacturerType = {
	id: number
	name_ru: string
	name_uz: string
	position: number
	is_active: boolean
}

export type TechType = {
	id: number
	name_ru: string
	name_uz: string
	position: number
	is_active: boolean
}

export type TechStockOperation = {
	id: number
	tech: {
		id: number
		name_ru: string
		name_uz: string
	}
	action: TechStockOperationActionEnum
	invoice: string
	stir: string
	delivery: string
	unit_before: number
	unit_after: number
	price: null
	price_with_vat: null
	overall_price: null
	vat: number
	executed_by: {
		id: number
		name: string
	}
	created_at: Date | string
}

export type TechDistribution = {
	id: number
	model_name_ru: string
	model_name_uz: string
	manufacturer: ManufacturerType
	type: TechType
	count: number
	price: string
	measure_unit: MeasureUnitEnum
	code_1c: string
	pkm: string
	description: string
	tech_undistributed_count: number
	region_1_count: number
	region_2_count: number
	region_3_count: number
	region_4_count: number
	region_5_count: number
	region_6_count: number
	region_7_count: number
	region_8_count: number
	region_9_count: number
	region_10_count: number
	region_11_count: number
	region_12_count: number
	region_13_count: number
	region_14_count: number
}

export type TechDistributeOperation = {
	id: number
	tech: {
		id: number
		name_ru: number
		name_uz: number
	}
	action: TechDistributeOperationActionEnum
	from_region: {
		id: number
		name_ru: string
		name_uz: string
		region_code: string
	}
	to_region: {
		id: number
		name_ru: string
		name_uz: string
		region_code: string
	}
	count: number
	executed_by: {
		id: number
		name: string
	}
	created_at: Date | string
}

// UI helper (label)
export const techMonitorStatusLabel = (s?: number | TechMonitorTaskStatus) => {
	switch (s) {
		case TechMonitorTaskStatus.DONE:
			return i18n.t('Выполнен')
		case TechMonitorTaskStatus.MISSED_DEADLINE:
			return i18n.t('Не выполнен')
		case TechMonitorTaskStatus.WAITING:
		default:
			return i18n.t('В ожидании')
	}
}

export enum TechMonitorTaskStatus {
	WAITING  = 1,
	DONE  = 2,
	MISSED_DEADLINE = 3
}

export type MonitoringProfile = {
	id?: number
	phone_number?: string | null
	first_name?: string | null
	middle_name?: string | null
	last_name?: string | null
	last_login?: string | null
}

export type MonitoringRef = {
	id?: number
	profile?: MonitoringProfile | null
}

export type TechMonitorTaskDetail = {
	id: number
	region: string
	monitoring?: MonitoringRef | null
	client: string
	deadline: string
	status: TechMonitorTaskStatus
	phone_number: string
	created_by: string
	completed_at: string | null
	employee?: string | null
}

/** Create/Update payload (Swagger: TechMonitorTaskCU)  */
export interface TechMonitorTaskCU extends Record<string, unknown> {
	monitoring: number
	contract: number
	deadline: string
	phone_number: string
	status?: TechMonitorTaskStatus
	completed_at?: string | null
}

// monitoring create
export type TechMonitoringCreate = {
	id?: number // readOnly: true
	license_plate_number?: string | null // maxLength: 255, minLength: 1
	condition?: string | null // Enum bo‘lishi mumkin
	vin?: string | null // maxLength: 255, minLength: 1
	engine_number?: string | null // maxLength: 255, minLength: 1
	comment?: string | null // minLength: 1
	images?: string[] // uri bo‘lishi kerak, maxItems: 10
	task: number // required
}

// @/@types/tech.types.ts
export type TechMonitoringClient = {
	name: string
	stir: string
}

export type TechMonitoringDetail = {
	id: number
	monitoring: string
	client: TechMonitoringClient
	license_plate_number: string
	condition: number
	vin: string
	engine_number: string
	comment: string
	images: string[]
	updated_at: string
}
