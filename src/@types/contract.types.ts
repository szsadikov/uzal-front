import { FileType } from '@/@types/common'
import { Branch, Region } from '@/@types/dataset.types'
import { Tech } from '@/@types/tech.types'
import { User } from '@/@types/user.types'

export enum ContractLoanTypeEnum {
	ANNUITY = 1,
	DIFFERENTIATED
}

export enum ContractPaymentPeriodEnum {
	MONTH = 1,
	QUARTER
}

export enum ContractStatusEnum {
	PENDING_TRANSFER = 1, // Ожидание оплаты
	DEPOSIT_PAID, // Ожидание выдачи техники
	TECH_GIVEN, // Выдача техники
	CANCELED, // Отменен
	CLIENT_CHANGED, // Переуступка
	TECH_RETURNED, // Возврат средств
	CURRENT_CLIENT // Текущий клиент (активный лизинг)
}

export enum ContractApplicationStatusEnum {
	NEW = 1, // Новое
	ASSIGNED, // Назначен
	DOCUMENT_GATHERING, // Сбор документов
	IN_COMMISSION, // Комиссия
	REJECTED, // Отказано
	CONTRACT_CREATED // Составлен договор
}

export enum ContractApplicationVotingStatusEnum {
	NEW = 1, // Новое
	IN_PROGRESS, // В процессе
	APPROVED, // Согласовано
	REJECTED // Отказано
}

export type Contract = {
	id: number
	code: string
	contract_date: Date | string
	region: number
	branch_region: string // filial manzili, viloyat
	branch_city: string // filial manzili, shahar
	branch_street: string // Lizing Beruvchining filial manzili, ko'cha
	branch_house: string // Lizing Beruvchining filial manzili, uy
	branch_director: string // filial direktori
	procuration_date: Date | string // доверенность для директора филиала
	procuration_number: number // доверенность номер для директора филиала
	tech: number
	tech_model: string // texnika rusumi
	tech_type: string // texnika turi
	tech_manufacturer: string // texnika ishlab chiqaruvchisi
	tech_obj: Tech
	deposit_percentage: string // avans foizi, %
	price_with_vat: string // texnika narxi + НДС
	price_with_vat_in_words: string
	price_with_gps: string // texnika narxi + НДС + GPS
	price_with_gps_in_words: string
	rent_percent: string // Lizing Beruvchining daromad foizi, lizing foizi, %
	rent_percent_in_words: string
	rent_period: number // Lizing muddati, yil
	rent_period_in_words: string
	loan_type: ContractLoanTypeEnum // Аннуитет - 1, Дифференциал - 2
	payment_period: ContractPaymentPeriodEnum // Месяц - 1, Квартал - 2
	client_company_name: string // Lizing Oluvchining kompaniya nomi
	client_director: string // Lizing Oluvchining direktori
	client_district: string // Lizing Oluvchining manzili, tuman
	client_village: string // Lizing Oluvchining manzili, qishloq
	client_bank: string // Lizing Oluvchining banki
	hr: string
	mfo: string
	stir: string
	oked: string
	fond: boolean
	dummy_contract: boolean
	pdf_document: string
	contract_application: {
		id: number
		application_date: Date | string
	}
	pkm?: Pkm
	files: FileType[]
	new_files?: FileType[]
	deleted_files?: FileType[]
	created_at: Date | string
}

export type CurrentContract = {
	id: number
	contract_id: string
	branch: {
		id: number
		name: string
		city: number
		house_number: string
		position: number
		region: {
			id: number
			name_ru: string
			name_uz: string
			region_code: string
		}
		street: string
	}
	client_id: string
	client_company_name: string
	stir: string
	contract_code: string
	contract_date: Date | string
	overall_contract_amount: string
	contract_amount_left: string
	overdue_amount: string
	overall_contract_months: number
	current_contract_month: number
	document_url: string
	address: string
	branch_full: string
	branch_region_name: string
	phone_number: string
	tech_code_1c: string
	tech_name: string
}

export type CurrentContractPayment = {
	id: number
	month: number
	payment_date: Date | string
	days_in_month: number
	main_payment: string
	margin_payment: string
	total_payment: string
	overdue_amount: string
}

export type NewContract = {
	contract: Pick<
		Contract,
		| 'id'
		| 'branch_region'
		| 'client_company_name'
		| 'stir'
		| 'tech_model'
		| 'code'
		| 'contract_application'
		| 'created_at'
		| 'price_with_gps'
		| 'deposit_percentage'
		| 'rent_period'
		| 'fond'
		| 'dummy_contract'
		| 'contract_date'
		| 'pdf_document'
	> & {
		status: ContractStatusEnum
		deposit: string
	}
	position: number
}

export type ArchiveContract = Pick<
	Contract,
	| 'id'
	| 'branch_region'
	| 'client_company_name'
	| 'code'
	| 'contract_date'
	| 'created_at'
	| 'deposit_percentage'
	| 'dummy_contract'
	| 'fond'
	| 'price_with_gps'
	| 'rent_period'
	| 'stir'
	| 'tech_model'
	| 'pdf_document'
> & {
	deposit: string
	status: ContractStatusEnum
}

export type DefaultContract = {
	date: Date | string
	contract_number: string
	region: {
		id: number
		name: string
	}
	branch: {
		city: string
		street: string
		house_number: string
		director_first_name: string
		director_last_name: string
		director_middle_name: string
		phone_number: string
		procuration_date: Date | string
		procuration_number: number
	}
	deposit: string
}

export type Sale = {
	id: number
	profile: User
	region: Region
}

export type Lessee = {
	id: number
	profile: User
	stir: string
	company_name: string
	account_number: string
	mfo: string
	bank_details: string
	address: string
	director_name: string
	region: Region
}

export type Vote = {
	id: number
	branch_user: {
		id: number
		profile: User
		branch: Branch
		procuration_date: Date | string
		procuration_number: number
		is_active: boolean
		created_at: Date | string
		updated_at: Date | string
	}
	voting_status: ContractApplicationVotingStatusEnum
	comment: string
	voted_at: Date | string
	created_at: Date | string
	updated_at: Date | string
}

export type Pkm = {
	id: number
	name: string
	investor: string
	top_content: string
	bottom_content: string
}

export type ContractApplication = {
	id: number
	code: string
	branch: Branch
	stir: string
	company_name: string
	tech: Tech
	total_amount: string
	phone_number: string
	status: ContractApplicationStatusEnum
	voting_status: ContractApplicationVotingStatusEnum
	my_voting_status: ContractApplicationVotingStatusEnum
	sales: Sale
	lessee: Lessee
	files: FileType[]
	new_files: string[]
	deleted_files: string[]
	votes: Vote[]
	comment: string
	application_date: Date | string
	created_at: Date | string
	updated_at: Date | string
}

export type Customer = {
	name: string
	data: {
		СообщитьПользователю: string
		ИНН: string
		КодОКПО: string
		КодИНН: string
		ДатаРегистрации: Date | string
		Наименование: string
		ПочтовыйАдрес: string
		КодСОАТО: string
		Адрес: string
		КонтактныеТелефоны: string
		КодОПФ: string
		КодОКОНХ: string
		КодОКЕД: string
		КодСООГУ: string
		КодКСДП: string
		СтатусПредприятия: string
		ТипПредприятия: string
		АдресЭлектроннойПочты: string
		ПКМ439: boolean
		ОсновнойРасчетныйСчет: string
		БанкМФО: string
		БанкНаименование: string
		КодПНДС: string
		ПИНФЛ: string
		ПаспортСерия: string
		ПаспортНомер: string
		ПаспортДатаВыдачи: Date | string
		СтатусНалогоплательщика: string
	}
}

export type CurrentRequestContract = {
	id: number
	contract_id: string
	branch: string
	client_id: string
	client_company_name: string
	stir: string
	contract_code: string
	contract_date: Date | string
	overall_contract_amount: string
	contract_amount_left: string
	overdue_amount: string
	overall_contract_months: number
	current_contract_month: number
	tech: string
	client_phone_number?: string
}
