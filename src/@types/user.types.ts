export enum UserRoleEnum {
	SUPERADMIN = 1,
	ADMIN,
	MARKETING,
	SALES,
	MONITORING,
	JURIST,
	ACCOUNTANT,
	FINANCE,
	UZMASHLIZING,
	ZAMPRED,
	ZAMPREDMONITORING,
	EXPEDITOR,
	BRANCH_ACCOUNTANT,
	BRANCH_MAIN_ACCOUNTANT,
	BRANCH_DIRECTOR,
	BRANCH_ZAMDIRECTOR,
	BRANCH_SPECIALIST_LIZING_OPERATIONS,
	BRANCH_JURIST,
	LESSEE
}

export enum UserRoleTextEnum {
	GHOST = 'ghost',
	SUPERADMIN = 'superadmin',
	ADMIN = 'admin',
	MARKETING = 'marketing',
	SALES = 'sales',
	MONITORING = 'monitoring',
	JURIST = 'jurist',
	ACCOUNTANT = 'accountant',
	FINANCE = 'finance',
	UZMASHLIZING = 'uzmashlizing',
	ZAMPRED = 'zampred',
	ZAMPREDMONITORING = 'zampredmonitoring',
	EXPEDITOR = 'expeditor',
	BRANCH_ACCOUNTANT = 'branch_accountant',
	BRANCH_MAIN_ACCOUNTANT = 'branch_main_accountant',
	BRANCH_DIRECTOR = 'branch_director',
	BRANCH_ZAMDIRECTOR = 'branch_zamdirector',
	BRANCH_SPECIALIST_LIZING_OPERATIONS = 'branch_specialist_lizing_operations',
	BRANCH_JURIST = 'branch_jurist',
	LESSEE = 'lessee'
}

export type UserRole = {
	id: UserRoleEnum
	name: UserRoleTextEnum
	name_ru: string
	name_uz: string
}

export type User = {
	id: number
	username: string
	first_name: string
	middle_name: string
	last_name: string
	phone_number: string
	email: string
	pinfl: string
	is_active: boolean
	profile_picture: string
	last_login: Date | string
	role: UserRoleTextEnum
	role_id: UserRoleEnum
	parent_role_id: number
	procuration_number: number
	role_obj: UserRole
	region: {
		id: number
		name_ru: string
		name_uz: string
		region_code: string
	}
}

export type Session = {
	id: number
	user_agent: string
	ip_address: string
	last_seen: Date | string
	address: string
	latitude: string
	longitude: string
	is_current: boolean
}

export interface ProfileCreate {
	username: string // required
	title?: string // Username field title
	first_name?: string // optional
	middle_name?: string // optional
	last_name?: string // optional
	phone_number?: string | null // nullable
	email?: string // email format
	pinfl?: string | null // nullable
	password: string // required
	role?: number | null // nullable
}

export interface BranchUserCreate {
	profile: ProfileCreate // required
	branch: number // required
	procuration_date: string // date format, required
	procuration_number: number // required
	is_active?: boolean // optional
}

export interface BranchEmployee {
	id: number
	profile: {
		id: number
		username: string
		first_name: string
		middle_name: string
		last_name: string
		phone_number: string
		email: string
		pinfl: string
		role: UserRoleTextEnum
		profile_picture: string | null
	}
	branch: {
		id: number
		name: string
		region: {
			id: number
			name_ru: string
			name_uz: string
			region_code: string
		}
		city: number
		street: string
		house_number: string
		position: number
	}
	procuration_date: string
	procuration_number: number
	is_active: boolean
	created_at: string
	updated_at: string
}

export type UserRegistryRow = {
	role: UserRoleEnum
	id: number
	profile: {
		id: number
		username: string
		first_name: string
		middle_name: string
		last_name: string
		phone_number: string
		email: string
		pinfl: string | null
		role: UserRoleEnum
		profile_picture: string | null
		"registered_device_type": string | null,
		"last_ios_request_at": string | null,
		"last_android_request_at": string | null,
		"last_web_request_at": string | null
	}
	region: {
		id: number
		name_ru: string
		name_uz: string
		name_uzl: string
		name_latin: string
		region_code: string
		name_lt: string
	} | null

	stir: string
	company_name: string
	account_number: string
	mfo: string
	bank_details: string
	address: string
	director_name: string
	registered_at: string
}
