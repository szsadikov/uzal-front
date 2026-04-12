import { Server } from 'miragejs'
import {
	ContractApplicationStatusEnum,
	ContractApplicationVotingStatusEnum,
	ContractStatusEnum
} from '@/@types/contract.types'
import { PaymentOverdueNoticeStatusEnum } from '@/@types/payment-notice.types'

export default function dashboardFakeApi(server: Server, apiPrefix: string) {
	// ── GET /api/v1/contract/contract/ ──────────────────────────────────────
	server.get(`${apiPrefix}/contract/contract/`, () => ({
		count: 142,
		next: null,
		previous: null,
		results: [
			{
				id: 1, code: 'UZL-2024-001', contract_date: '2024-01-15',
				branch_region: 'Ташкентская область',
				client_company_name: 'ООО "Агро Технология"', stir: '123456789',
				tech_model: 'John Deere 5090E', tech_type: 'Трактор',
				price_with_gps: '450000000', deposit_percentage: '30', rent_period: 5,
				status: ContractStatusEnum.CURRENT_CLIENT,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 1, application_date: '2023-12-01' }, created_at: '2024-01-15'
			},
			{
				id: 2, code: 'UZL-2024-002', contract_date: '2024-02-10',
				branch_region: 'Самаркандская область',
				client_company_name: 'ФХ "Зафар Агро"', stir: '987654321',
				tech_model: 'Case IH Optum 270', tech_type: 'Трактор',
				price_with_gps: '620000000', deposit_percentage: '30', rent_period: 7,
				status: ContractStatusEnum.TECH_GIVEN,
				fond: true, dummy_contract: false, pdf_document: '',
				contract_application: { id: 2, application_date: '2024-01-20' }, created_at: '2024-02-10'
			},
			{
				id: 3, code: 'UZL-2024-003', contract_date: '2024-03-05',
				branch_region: 'Ферганская область',
				client_company_name: 'ООО "Фарғона Экин"', stir: '112233445',
				tech_model: 'New Holland T7.210', tech_type: 'Трактор',
				price_with_gps: '380000000', deposit_percentage: '25', rent_period: 5,
				status: ContractStatusEnum.DEPOSIT_PAID,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 3, application_date: '2024-02-15' }, created_at: '2024-03-05'
			},
			{
				id: 4, code: 'UZL-2024-004', contract_date: '2024-03-18',
				branch_region: 'Андижанская область',
				client_company_name: 'ФХ "Андижон Боғи"', stir: '556677889',
				tech_model: 'Claas Axion 850', tech_type: 'Комбайн',
				price_with_gps: '890000000', deposit_percentage: '30', rent_period: 7,
				status: ContractStatusEnum.PENDING_TRANSFER,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 4, application_date: '2024-02-28' }, created_at: '2024-03-18'
			},
			{
				id: 5, code: 'UZL-2024-005', contract_date: '2024-04-02',
				branch_region: 'Наманганская область',
				client_company_name: 'ООО "Наманган Зироат"', stir: '334455667',
				tech_model: 'Fendt 724 Vario', tech_type: 'Трактор',
				price_with_gps: '750000000', deposit_percentage: '30', rent_period: 5,
				status: ContractStatusEnum.CURRENT_CLIENT,
				fond: true, dummy_contract: false, pdf_document: '',
				contract_application: { id: 5, application_date: '2024-03-10' }, created_at: '2024-04-02'
			},
			{
				id: 6, code: 'UZL-2024-006', contract_date: '2024-05-12',
				branch_region: 'Бухарская область',
				client_company_name: 'ФХ "Бухоро Дала"', stir: '445566778',
				tech_model: 'Deutz-Fahr Agrotron 6160', tech_type: 'Трактор',
				price_with_gps: '510000000', deposit_percentage: '30', rent_period: 5,
				status: ContractStatusEnum.CANCELED,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 6, application_date: '2024-04-20' }, created_at: '2024-05-12'
			},
			{
				id: 7, code: 'UZL-2024-007', contract_date: '2024-06-20',
				branch_region: 'Навоийская область',
				client_company_name: 'ООО "Навоий Агро"', stir: '998877665',
				tech_model: 'Massey Ferguson 7726', tech_type: 'Трактор',
				price_with_gps: '430000000', deposit_percentage: '25', rent_period: 5,
				status: ContractStatusEnum.CURRENT_CLIENT,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 7, application_date: '2024-05-30' }, created_at: '2024-06-20'
			},
			{
				id: 8, code: 'UZL-2024-008', contract_date: '2024-07-08',
				branch_region: 'Кашкадарьинская область',
				client_company_name: 'ФХ "Қашқадарё Буғдой"', stir: '221133447',
				tech_model: 'John Deere 6130R', tech_type: 'Трактор',
				price_with_gps: '560000000', deposit_percentage: '30', rent_period: 7,
				status: ContractStatusEnum.TECH_GIVEN,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 8, application_date: '2024-06-15' }, created_at: '2024-07-08'
			},
			{
				id: 9, code: 'UZL-2024-009', contract_date: '2024-08-14',
				branch_region: 'Хорезмская область',
				client_company_name: 'ООО "Хоразм Пахта"', stir: '667788991',
				tech_model: 'Case IH Magnum 340', tech_type: 'Трактор',
				price_with_gps: '820000000', deposit_percentage: '30', rent_period: 7,
				status: ContractStatusEnum.CLIENT_CHANGED,
				fond: true, dummy_contract: false, pdf_document: '',
				contract_application: { id: 9, application_date: '2024-07-25' }, created_at: '2024-08-14'
			},
			{
				id: 10, code: 'UZL-2024-010', contract_date: '2024-09-03',
				branch_region: 'Джизакская область',
				client_company_name: 'ФХ "Жиззах Мева"', stir: '883322110',
				tech_model: 'New Holland CR9.90', tech_type: 'Комбайн',
				price_with_gps: '1150000000', deposit_percentage: '30', rent_period: 7,
				status: ContractStatusEnum.CURRENT_CLIENT,
				fond: false, dummy_contract: false, pdf_document: '',
				contract_application: { id: 10, application_date: '2024-08-10' }, created_at: '2024-09-03'
			}
		]
	}))

	// ── GET /api/v1/contract/new-clients/ ────────────────────────────────────
	server.get(`${apiPrefix}/contract/new-clients/`, () => ({
		count: 47,
		next: null,
		previous: null,
		results: [
			{ contract: { id: 11, code: 'UZL-2024-011', contract_date: '2024-10-01', branch_region: 'Ташкентская область', client_company_name: 'ФХ "Тошкент Буғдой"', stir: '100200300', tech_model: 'John Deere 5090E', price_with_gps: '460000000', deposit_percentage: '30', rent_period: 5, status: ContractStatusEnum.PENDING_TRANSFER, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 11, application_date: '2024-09-15' }, created_at: '2024-10-01', deposit: '138000000' }, position: 1 },
			{ contract: { id: 12, code: 'UZL-2024-012', contract_date: '2024-10-05', branch_region: 'Самаркандская область', client_company_name: 'ООО "Самарқанд Зироат"', stir: '200300400', tech_model: 'Case IH Puma 185', price_with_gps: '520000000', deposit_percentage: '30', rent_period: 5, status: ContractStatusEnum.PENDING_TRANSFER, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 12, application_date: '2024-09-20' }, created_at: '2024-10-05', deposit: '156000000' }, position: 2 },
			{ contract: { id: 13, code: 'UZL-2024-013', contract_date: '2024-10-10', branch_region: 'Ферганская область', client_company_name: 'ФХ "Фарғона Боғ"', stir: '300400500', tech_model: 'New Holland T5.115', price_with_gps: '310000000', deposit_percentage: '25', rent_period: 5, status: ContractStatusEnum.DEPOSIT_PAID, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 13, application_date: '2024-09-25' }, created_at: '2024-10-10', deposit: '77500000' }, position: 3 },
			{ contract: { id: 14, code: 'UZL-2024-014', contract_date: '2024-10-15', branch_region: 'Андижанская область', client_company_name: 'ООО "Андижон Агро"', stir: '400500600', tech_model: 'Fendt 516 Vario', price_with_gps: '680000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.PENDING_TRANSFER, fond: true, dummy_contract: false, pdf_document: '', contract_application: { id: 14, application_date: '2024-10-01' }, created_at: '2024-10-15', deposit: '204000000' }, position: 4 },
			{ contract: { id: 15, code: 'UZL-2024-015', contract_date: '2024-10-18', branch_region: 'Наманганская область', client_company_name: 'ФХ "Наманган Экин"', stir: '500600700', tech_model: 'Claas Xerion 4000', price_with_gps: '940000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.DEPOSIT_PAID, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 15, application_date: '2024-10-05' }, created_at: '2024-10-18', deposit: '282000000' }, position: 5 },
			{ contract: { id: 16, code: 'UZL-2024-016', contract_date: '2024-10-22', branch_region: 'Бухарская область', client_company_name: 'ООО "Бухоро Ғалла"', stir: '600700800', tech_model: 'John Deere 7R 290', price_with_gps: '780000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.PENDING_TRANSFER, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 16, application_date: '2024-10-10' }, created_at: '2024-10-22', deposit: '234000000' }, position: 6 },
			{ contract: { id: 17, code: 'UZL-2024-017', contract_date: '2024-10-25', branch_region: 'Навоийская область', client_company_name: 'ФХ "Навоий Боғ"', stir: '700800900', tech_model: 'Massey Ferguson 8737', price_with_gps: '870000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.DEPOSIT_PAID, fond: true, dummy_contract: false, pdf_document: '', contract_application: { id: 17, application_date: '2024-10-12' }, created_at: '2024-10-25', deposit: '261000000' }, position: 7 },
			{ contract: { id: 18, code: 'UZL-2024-018', contract_date: '2024-11-01', branch_region: 'Кашкадарьинская область', client_company_name: 'ООО "Қашқадарё Зироат"', stir: '800900100', tech_model: 'Case IH Axial-Flow 8250', price_with_gps: '1050000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.PENDING_TRANSFER, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 18, application_date: '2024-10-18' }, created_at: '2024-11-01', deposit: '315000000' }, position: 8 },
			{ contract: { id: 19, code: 'UZL-2024-019', contract_date: '2024-11-05', branch_region: 'Хорезмская область', client_company_name: 'ФХ "Хоразм Мева"', stir: '900100200', tech_model: 'New Holland CX8.90', price_with_gps: '970000000', deposit_percentage: '25', rent_period: 7, status: ContractStatusEnum.DEPOSIT_PAID, fond: false, dummy_contract: false, pdf_document: '', contract_application: { id: 19, application_date: '2024-10-22' }, created_at: '2024-11-05', deposit: '242500000' }, position: 9 },
			{ contract: { id: 20, code: 'UZL-2024-020', contract_date: '2024-11-10', branch_region: 'Джизакская область', client_company_name: 'ООО "Жиззах Дала"', stir: '110220330', tech_model: 'Fendt 942 Vario', price_with_gps: '1300000000', deposit_percentage: '30', rent_period: 7, status: ContractStatusEnum.PENDING_TRANSFER, fond: true, dummy_contract: false, pdf_document: '', contract_application: { id: 20, application_date: '2024-10-28' }, created_at: '2024-11-10', deposit: '390000000' }, position: 10 }
		]
	}))

	// ── GET /api/v1/contract/applications/ ───────────────────────────────────
	server.get(`${apiPrefix}/contract/applications/`, () => ({
		count: 12,
		next: null,
		previous: null,
		results: [
			{
				id: 101, code: 'APP-2024-101', stir: '111222333',
				company_name: 'ФХ "Тошкент Буғдой"', phone_number: '+998901234567',
				total_amount: '460000000',
				status: ContractApplicationStatusEnum.IN_COMMISSION,
				voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-01', created_at: '2024-11-01', updated_at: '2024-11-02',
				branch: { id: 1, name: 'Тошкент филиал', region: { id: 1, name_ru: 'Ташкентская область', name_uz: 'Toshkent viloyati', region_code: '10' }, city: 1, street: 'Амир Темур', house_number: '1', position: 1 },
				tech: { id: 1, model_name_ru: 'John Deere 5090E', model_name_uz: 'John Deere 5090E', manufacturer: { id: 1, name_ru: 'John Deere', name_uz: 'John Deere' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 5, price: '420000000', tech_price_with_vat: 450000000, tech_price_with_gps: 460000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 102, code: 'APP-2024-102', stir: '222333444',
				company_name: 'ООО "Самарқанд Зироат"', phone_number: '+998909876543',
				total_amount: '635000000',
				status: ContractApplicationStatusEnum.DOCUMENT_GATHERING,
				voting_status: ContractApplicationVotingStatusEnum.NEW,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-03', created_at: '2024-11-03', updated_at: '2024-11-03',
				branch: { id: 2, name: 'Самарқанд филиал', region: { id: 2, name_ru: 'Самаркандская область', name_uz: 'Samarqand viloyati', region_code: '11' }, city: 2, street: 'Регистон', house_number: '7', position: 2 },
				tech: { id: 2, model_name_ru: 'Case IH Optum 270', model_name_uz: 'Case IH Optum 270', manufacturer: { id: 2, name_ru: 'Case IH', name_uz: 'Case IH' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 3, price: '590000000', tech_price_with_vat: 620000000, tech_price_with_gps: 635000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 103, code: 'APP-2024-103', stir: '333444555',
				company_name: 'ФХ "Фарғона Мева"', phone_number: '+998912345678',
				total_amount: '390000000',
				status: ContractApplicationStatusEnum.NEW,
				voting_status: ContractApplicationVotingStatusEnum.NEW,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-05', created_at: '2024-11-05', updated_at: '2024-11-05',
				branch: { id: 3, name: 'Фарғона филиал', region: { id: 3, name_ru: 'Ферганская область', name_uz: "Farg'ona viloyati", region_code: '12' }, city: 3, street: 'Мустақиллик', house_number: '22', position: 3 },
				tech: { id: 3, model_name_ru: 'New Holland T7.210', model_name_uz: 'New Holland T7.210', manufacturer: { id: 3, name_ru: 'New Holland', name_uz: 'New Holland' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 8, price: '355000000', tech_price_with_vat: 380000000, tech_price_with_gps: 390000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 104, code: 'APP-2024-104', stir: '444555666',
				company_name: 'ООО "Андижон Агро"', phone_number: '+998918765432',
				total_amount: '720000000',
				status: ContractApplicationStatusEnum.ASSIGNED,
				voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				my_voting_status: ContractApplicationVotingStatusEnum.APPROVED,
				application_date: '2024-11-07', created_at: '2024-11-07', updated_at: '2024-11-08',
				branch: { id: 4, name: 'Андижон филиал', region: { id: 4, name_ru: 'Андижанская область', name_uz: 'Andijon viloyati', region_code: '13' }, city: 4, street: 'Навоий', house_number: '5', position: 4 },
				tech: { id: 4, model_name_ru: 'Claas Axion 850', model_name_uz: 'Claas Axion 850', manufacturer: { id: 4, name_ru: 'Claas', name_uz: 'Claas' }, type: { id: 2, name_ru: 'Комбайн', name_uz: 'Kombayn' }, count: 2, price: '860000000', tech_price_with_vat: 900000000, tech_price_with_gps: 920000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 105, code: 'APP-2024-105', stir: '555666777',
				company_name: 'ФХ "Наманган Экин"', phone_number: '+998903334455',
				total_amount: '310000000',
				status: ContractApplicationStatusEnum.IN_COMMISSION,
				voting_status: ContractApplicationVotingStatusEnum.APPROVED,
				my_voting_status: ContractApplicationVotingStatusEnum.APPROVED,
				application_date: '2024-11-09', created_at: '2024-11-09', updated_at: '2024-11-10',
				branch: { id: 5, name: 'Наманган филиал', region: { id: 5, name_ru: 'Наманганская область', name_uz: 'Namangan viloyati', region_code: '14' }, city: 5, street: 'Ислом Каримов', house_number: '12', position: 5 },
				tech: { id: 5, model_name_ru: 'Massey Ferguson 5712', model_name_uz: 'Massey Ferguson 5712', manufacturer: { id: 5, name_ru: 'Massey Ferguson', name_uz: 'Massey Ferguson' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 6, price: '280000000', tech_price_with_vat: 300000000, tech_price_with_gps: 310000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 106, code: 'APP-2024-106', stir: '666777888',
				company_name: 'ООО "Бухоро Ғалла"', phone_number: '+998904445566',
				total_amount: '540000000',
				status: ContractApplicationStatusEnum.NEW,
				voting_status: ContractApplicationVotingStatusEnum.NEW,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-11', created_at: '2024-11-11', updated_at: '2024-11-11',
				branch: { id: 6, name: 'Бухоро филиал', region: { id: 6, name_ru: 'Бухарская область', name_uz: 'Buxoro viloyati', region_code: '15' }, city: 6, street: 'Ипак Йўли', house_number: '3', position: 6 },
				tech: { id: 6, model_name_ru: 'Fendt 724 Vario', model_name_uz: 'Fendt 724 Vario', manufacturer: { id: 6, name_ru: 'Fendt', name_uz: 'Fendt' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 4, price: '700000000', tech_price_with_vat: 730000000, tech_price_with_gps: 750000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 107, code: 'APP-2024-107', stir: '777888999',
				company_name: 'ФХ "Навоий Боғ"', phone_number: '+998905556677',
				total_amount: '430000000',
				status: ContractApplicationStatusEnum.ASSIGNED,
				voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-12', created_at: '2024-11-12', updated_at: '2024-11-13',
				branch: { id: 7, name: 'Навоий филиал', region: { id: 7, name_ru: 'Навоийская область', name_uz: 'Navoiy viloyati', region_code: '16' }, city: 7, street: 'Навоий', house_number: '8', position: 7 },
				tech: { id: 7, model_name_ru: 'John Deere 6155R', model_name_uz: 'John Deere 6155R', manufacturer: { id: 1, name_ru: 'John Deere', name_uz: 'John Deere' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 7, price: '400000000', tech_price_with_vat: 420000000, tech_price_with_gps: 430000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 108, code: 'APP-2024-108', stir: '888999000',
				company_name: 'ООО "Қашқадарё Зироат"', phone_number: '+998906667788',
				total_amount: '1050000000',
				status: ContractApplicationStatusEnum.IN_COMMISSION,
				voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				my_voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				application_date: '2024-11-14', created_at: '2024-11-14', updated_at: '2024-11-15',
				branch: { id: 8, name: 'Қашқадарё филиал', region: { id: 8, name_ru: 'Кашкадарьинская область', name_uz: 'Qashqadaryo viloyati', region_code: '17' }, city: 8, street: 'Мустақиллик', house_number: '18', position: 8 },
				tech: { id: 8, model_name_ru: 'Case IH Axial-Flow 8250', model_name_uz: 'Case IH Axial-Flow 8250', manufacturer: { id: 2, name_ru: 'Case IH', name_uz: 'Case IH' }, type: { id: 2, name_ru: 'Комбайн', name_uz: 'Kombayn' }, count: 2, price: '980000000', tech_price_with_vat: 1020000000, tech_price_with_gps: 1050000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 109, code: 'APP-2024-109', stir: '199288377',
				company_name: 'ФХ "Хоразм Пахта"', phone_number: '+998907778899',
				total_amount: '850000000',
				status: ContractApplicationStatusEnum.NEW,
				voting_status: ContractApplicationVotingStatusEnum.NEW,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-16', created_at: '2024-11-16', updated_at: '2024-11-16',
				branch: { id: 9, name: 'Хоразм филиал', region: { id: 9, name_ru: 'Хорезмская область', name_uz: 'Xorazm viloyati', region_code: '21' }, city: 9, street: 'Амир Темур', house_number: '4', position: 9 },
				tech: { id: 9, model_name_ru: 'New Holland CX8.90', model_name_uz: 'New Holland CX8.90', manufacturer: { id: 3, name_ru: 'New Holland', name_uz: 'New Holland' }, type: { id: 2, name_ru: 'Комбайн', name_uz: 'Kombayn' }, count: 3, price: '800000000', tech_price_with_vat: 830000000, tech_price_with_gps: 850000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			},
			{
				id: 110, code: 'APP-2024-110', stir: '466577688',
				company_name: 'ООО "Жиззах Мева"', phone_number: '+998908889900',
				total_amount: '370000000',
				status: ContractApplicationStatusEnum.ASSIGNED,
				voting_status: ContractApplicationVotingStatusEnum.IN_PROGRESS,
				my_voting_status: ContractApplicationVotingStatusEnum.NEW,
				application_date: '2024-11-18', created_at: '2024-11-18', updated_at: '2024-11-18',
				branch: { id: 10, name: 'Жиззах филиал', region: { id: 10, name_ru: 'Джизакская область', name_uz: 'Jizzax viloyati', region_code: '19' }, city: 10, street: 'Шарқ', house_number: '9', position: 10 },
				tech: { id: 10, model_name_ru: 'Deutz-Fahr 5130.4 G', model_name_uz: 'Deutz-Fahr 5130.4 G', manufacturer: { id: 7, name_ru: 'Deutz-Fahr', name_uz: 'Deutz-Fahr' }, type: { id: 1, name_ru: 'Трактор', name_uz: 'Traktor' }, count: 9, price: '340000000', tech_price_with_vat: 360000000, tech_price_with_gps: 370000000, vat: 12, is_active: true },
				votes: [], files: [], new_files: [], deleted_files: [], comment: '', sales: null, lessee: null
			}
		]
	}))

	// ── GET /api/v1/payment_notice/payment_overdue_notice/ ───────────────────
	server.get(`${apiPrefix}/payment_notice/payment_overdue_notice/`, () => ({
		count: 23,
		next: null,
		previous: null,
		results: [
			{ id: 201, code: 'PON-2024-201', contract: 1, contract_code: 'UZL-2024-001', company_name: 'ООО "Агро Технология"', stir: '123456789', phone_number: '+998901111111', month_overdue: 2, date_of_payment: '2024-09-01', days_in_the_month: 30, main_amount_of_payment: '7500000', total_amount: '8100000', overdue_amount: '600000', rent_percent: 10, notice_date: '2024-11-01', status: PaymentOverdueNoticeStatusEnum.NEW, sms_status: 'not_sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'pending', branch: { id: 1, name: 'Тошкент филиал', region: { id: 1, name_ru: 'Ташкентская область', name_uz: 'Toshkent viloyati', name_uzl: 'Toshkent viloyati', name_latin: 'Tashkent', name_lt: 'Tashkent', region_code: '10' }, city: 1, street: 'Амир Темур', house_number: '1', position: '1' } },
			{ id: 202, code: 'PON-2024-202', contract: 3, contract_code: 'UZL-2024-003', company_name: 'ООО "Фарғона Экин"', stir: '112233445', phone_number: '+998902222222', month_overdue: 1, date_of_payment: '2024-10-01', days_in_the_month: 31, main_amount_of_payment: '6200000', total_amount: '6820000', overdue_amount: '620000', rent_percent: 10, notice_date: '2024-11-05', status: PaymentOverdueNoticeStatusEnum.NEW, sms_status: 'sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'pending', branch: { id: 3, name: 'Фарғона филиал', region: { id: 3, name_ru: 'Ферганская область', name_uz: "Farg'ona viloyati", name_uzl: "Farg'ona viloyati", name_latin: 'Fergana', name_lt: 'Fergana', region_code: '12' }, city: 3, street: 'Мустақиллик', house_number: '22', position: '3' } },
			{ id: 203, code: 'PON-2024-203', contract: 5, contract_code: 'UZL-2024-005', company_name: 'ООО "Наманган Зироат"', stir: '334455667', phone_number: '+998903333333', month_overdue: 3, date_of_payment: '2024-08-01', days_in_the_month: 31, main_amount_of_payment: '11200000', total_amount: '12544000', overdue_amount: '1344000', rent_percent: 12, notice_date: '2024-11-08', status: PaymentOverdueNoticeStatusEnum.DELAYED, sms_status: 'sent', delayed_time: '2024-11-30T00:00:00', pdf_document: '', html_document: '', process_status: 'delayed', branch: { id: 5, name: 'Наманган филиал', region: { id: 5, name_ru: 'Наманганская область', name_uz: 'Namangan viloyati', name_uzl: 'Namangan viloyati', name_latin: 'Namangan', name_lt: 'Namangan', region_code: '14' }, city: 5, street: 'Ислом Каримов', house_number: '12', position: '5' } },
			{ id: 204, code: 'PON-2024-204', contract: 7, contract_code: 'UZL-2024-007', company_name: 'ООО "Навоий Агро"', stir: '998877665', phone_number: '+998904444444', month_overdue: 1, date_of_payment: '2024-10-15', days_in_the_month: 31, main_amount_of_payment: '5800000', total_amount: '6380000', overdue_amount: '580000', rent_percent: 10, notice_date: '2024-11-10', status: PaymentOverdueNoticeStatusEnum.NEW, sms_status: 'not_sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'pending', branch: { id: 7, name: 'Навоий филиал', region: { id: 7, name_ru: 'Навоийская область', name_uz: 'Navoiy viloyati', name_uzl: 'Navoiy viloyati', name_latin: 'Navoiy', name_lt: 'Navoiy', region_code: '16' }, city: 7, street: 'Навоий', house_number: '8', position: '7' } },
			{ id: 205, code: 'PON-2024-205', contract: 8, contract_code: 'UZL-2024-008', company_name: 'ФХ "Қашқадарё Буғдой"', stir: '221133447', phone_number: '+998905555555', month_overdue: 2, date_of_payment: '2024-09-08', days_in_the_month: 30, main_amount_of_payment: '9400000', total_amount: '10340000', overdue_amount: '940000', rent_percent: 10, notice_date: '2024-11-12', status: PaymentOverdueNoticeStatusEnum.PROCESSING, sms_status: 'sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'processing', branch: { id: 8, name: 'Қашқадарё филиал', region: { id: 8, name_ru: 'Кашкадарьинская область', name_uz: 'Qashqadaryo viloyati', name_uzl: 'Qashqadaryo viloyati', name_latin: 'Kashkadarya', name_lt: 'Kashkadarya', region_code: '17' }, city: 8, street: 'Мустақиллик', house_number: '18', position: '8' } },
			{ id: 206, code: 'PON-2024-206', contract: 2, contract_code: 'UZL-2024-002', company_name: 'ФХ "Зафар Агро"', stir: '987654321', phone_number: '+998906666666', month_overdue: 4, date_of_payment: '2024-07-10', days_in_the_month: 31, main_amount_of_payment: '13500000', total_amount: '15120000', overdue_amount: '1620000', rent_percent: 12, notice_date: '2024-11-14', status: PaymentOverdueNoticeStatusEnum.DELAYED, sms_status: 'sent', delayed_time: '2024-12-15T00:00:00', pdf_document: '', html_document: '', process_status: 'delayed', branch: { id: 2, name: 'Самарқанд филиал', region: { id: 2, name_ru: 'Самаркандская область', name_uz: 'Samarqand viloyati', name_uzl: 'Samarqand viloyati', name_latin: 'Samarkand', name_lt: 'Samarkand', region_code: '11' }, city: 2, street: 'Регистон', house_number: '7', position: '2' } },
			{ id: 207, code: 'PON-2024-207', contract: 9, contract_code: 'UZL-2024-009', company_name: 'ООО "Хоразм Пахта"', stir: '667788991', phone_number: '+998907777777', month_overdue: 1, date_of_payment: '2024-10-14', days_in_the_month: 31, main_amount_of_payment: '17000000', total_amount: '18700000', overdue_amount: '1700000', rent_percent: 10, notice_date: '2024-11-15', status: PaymentOverdueNoticeStatusEnum.NEW, sms_status: 'not_sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'pending', branch: { id: 9, name: 'Хоразм филиал', region: { id: 9, name_ru: 'Хорезмская область', name_uz: 'Xorazm viloyati', name_uzl: 'Xorazm viloyati', name_latin: 'Khorezm', name_lt: 'Khorezm', region_code: '21' }, city: 9, street: 'Амир Темур', house_number: '4', position: '9' } },
			{ id: 208, code: 'PON-2024-208', contract: 4, contract_code: 'UZL-2024-004', company_name: 'ФХ "Андижон Боғи"', stir: '556677889', phone_number: '+998908888888', month_overdue: 2, date_of_payment: '2024-09-18', days_in_the_month: 30, main_amount_of_payment: '18500000', total_amount: '20350000', overdue_amount: '1850000', rent_percent: 10, notice_date: '2024-11-16', status: PaymentOverdueNoticeStatusEnum.PROCESSING, sms_status: 'sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'processing', branch: { id: 4, name: 'Андижон филиал', region: { id: 4, name_ru: 'Андижанская область', name_uz: 'Andijon viloyati', name_uzl: 'Andijon viloyati', name_latin: 'Andijan', name_lt: 'Andijan', region_code: '13' }, city: 4, street: 'Навоий', house_number: '5', position: '4' } },
			{ id: 209, code: 'PON-2024-209', contract: 6, contract_code: 'UZL-2024-006', company_name: 'ФХ "Бухоро Дала"', stir: '445566778', phone_number: '+998909999999', month_overdue: 5, date_of_payment: '2024-06-12', days_in_the_month: 30, main_amount_of_payment: '10800000', total_amount: '12096000', overdue_amount: '1296000', rent_percent: 12, notice_date: '2024-11-18', status: PaymentOverdueNoticeStatusEnum.NEW, sms_status: 'not_sent', delayed_time: '', pdf_document: '', html_document: '', process_status: 'pending', branch: { id: 6, name: 'Бухоро филиал', region: { id: 6, name_ru: 'Бухарская область', name_uz: 'Buxoro viloyati', name_uzl: 'Buxoro viloyati', name_latin: 'Bukhara', name_lt: 'Bukhara', region_code: '15' }, city: 6, street: 'Ипак Йўли', house_number: '3', position: '6' } },
			{ id: 210, code: 'PON-2024-210', contract: 10, contract_code: 'UZL-2024-010', company_name: 'ФХ "Жиззах Мева"', stir: '883322110', phone_number: '+998900000001', month_overdue: 1, date_of_payment: '2024-10-03', days_in_the_month: 31, main_amount_of_payment: '22000000', total_amount: '24200000', overdue_amount: '2200000', rent_percent: 10, notice_date: '2024-11-20', status: PaymentOverdueNoticeStatusEnum.DELAYED, sms_status: 'sent', delayed_time: '2024-12-31T00:00:00', pdf_document: '', html_document: '', process_status: 'delayed', branch: { id: 10, name: 'Жиззах филиал', region: { id: 10, name_ru: 'Джизакская область', name_uz: 'Jizzax viloyati', name_uzl: 'Jizzax viloyati', name_latin: 'Jizzakh', name_lt: 'Jizzakh', region_code: '19' }, city: 10, street: 'Шарқ', house_number: '9', position: '10' } }
		]
	}))

	// ── GET /api/v1/dataset/region/ ──────────────────────────────────────────
	server.get(`${apiPrefix}/dataset/region/`, () => ({
		count: 14,
		next: null,
		previous: null,
		results: [
			{ id: 1, name_ru: 'Ташкентская область', name_uz: 'Toshkent viloyati', region_code: '10', is_active: true, position: 1 },
			{ id: 2, name_ru: 'Самаркандская область', name_uz: 'Samarqand viloyati', region_code: '11', is_active: true, position: 2 },
			{ id: 3, name_ru: 'Ферганская область', name_uz: "Farg'ona viloyati", region_code: '12', is_active: true, position: 3 },
			{ id: 4, name_ru: 'Андижанская область', name_uz: 'Andijon viloyati', region_code: '13', is_active: true, position: 4 },
			{ id: 5, name_ru: 'Наманганская область', name_uz: 'Namangan viloyati', region_code: '14', is_active: true, position: 5 },
			{ id: 6, name_ru: 'Бухарская область', name_uz: 'Buxoro viloyati', region_code: '15', is_active: true, position: 6 },
			{ id: 7, name_ru: 'Навоийская область', name_uz: 'Navoiy viloyati', region_code: '16', is_active: true, position: 7 },
			{ id: 8, name_ru: 'Кашкадарьинская область', name_uz: 'Qashqadaryo viloyati', region_code: '17', is_active: true, position: 8 },
			{ id: 9, name_ru: 'Сурхандарьинская область', name_uz: 'Surxondaryo viloyati', region_code: '18', is_active: true, position: 9 },
			{ id: 10, name_ru: 'Джизакская область', name_uz: 'Jizzax viloyati', region_code: '19', is_active: true, position: 10 },
			{ id: 11, name_ru: 'Сырдарьинская область', name_uz: 'Sirdaryo viloyati', region_code: '20', is_active: true, position: 11 },
			{ id: 12, name_ru: 'Хорезмская область', name_uz: 'Xorazm viloyati', region_code: '21', is_active: true, position: 12 },
			{ id: 13, name_ru: 'Республика Каракалпакстан', name_uz: "Qoraqalpog'iston Respublikasi", region_code: '22', is_active: true, position: 13 },
			{ id: 14, name_ru: 'г. Ташкент', name_uz: 'Toshkent shahri', region_code: '23', is_active: true, position: 14 }
		]
	}))

	// ── GET /api/v1/profile/role/ ────────────────────────────────────────────
	server.get(`${apiPrefix}/profile/role/`, () => ([
		{ id: 1,  name: 'superadmin',                         name_ru: 'Суперадмин',                    name_uz: 'Superadmin' },
		{ id: 2,  name: 'admin',                              name_ru: 'Администратор',                 name_uz: 'Administrator' },
		{ id: 3,  name: 'marketing',                          name_ru: 'Маркетинг',                     name_uz: 'Marketing' },
		{ id: 4,  name: 'sales',                              name_ru: 'Продажи',                       name_uz: 'Sotuv' },
		{ id: 5,  name: 'monitoring',                         name_ru: 'Мониторинг',                    name_uz: 'Monitoring' },
		{ id: 6,  name: 'jurist',                             name_ru: 'Юрист',                         name_uz: 'Yurist' },
		{ id: 7,  name: 'accountant',                         name_ru: 'Бухгалтер',                     name_uz: 'Buxgalter' },
		{ id: 8,  name: 'finance',                            name_ru: 'Финансы',                       name_uz: 'Moliya' },
		{ id: 9,  name: 'uzmashlizing',                       name_ru: 'УзМашЛизинг',                   name_uz: 'UzMashLizing' },
		{ id: 10, name: 'zampred',                            name_ru: 'Зампред',                       name_uz: 'Zapred' },
		{ id: 11, name: 'zampredmonitoring',                  name_ru: 'Зампред (мониторинг)',           name_uz: 'Zapred (monitoring)' },
		{ id: 12, name: 'expeditor',                          name_ru: 'Экспедитор',                    name_uz: 'Ekspeditor' },
		{ id: 13, name: 'branch_accountant',                  name_ru: 'Бухгалтер филиала',             name_uz: 'Filial buxgalteri' },
		{ id: 14, name: 'branch_main_accountant',             name_ru: 'Главный бухгалтер филиала',     name_uz: 'Filial bosh buxgalteri' },
		{ id: 15, name: 'branch_director',                    name_ru: 'Директор филиала',              name_uz: 'Filial direktori' },
		{ id: 16, name: 'branch_zamdirector',                 name_ru: 'Зам. директора филиала',        name_uz: 'Filial direktor oʻrinbosari' },
		{ id: 17, name: 'branch_specialist_lizing_operations',name_ru: 'Специалист по лизингу',         name_uz: 'Lizing mutaxassisi' },
		{ id: 18, name: 'branch_jurist',                      name_ru: 'Юрист филиала',                 name_uz: 'Filial yurist' },
		{ id: 19, name: 'lessee',                             name_ru: 'Лизингополучатель',             name_uz: 'Lizing oluvchi' }
	]))

	// ── GET /api/v1/dashboard/monthly-stats/ ────────────────────────────────
	server.get(`${apiPrefix}/dashboard/monthly-stats/`, () => ([
		{ month: 'Янв', new: 8,  current: 15, completed: 3 },
		{ month: 'Фев', new: 10, current: 18, completed: 4 },
		{ month: 'Мар', new: 13, current: 20, completed: 5 },
		{ month: 'Апр', new: 11, current: 22, completed: 6 },
		{ month: 'Май', new: 15, current: 25, completed: 7 },
		{ month: 'Июн', new: 18, current: 28, completed: 9 },
		{ month: 'Июл', new: 16, current: 26, completed: 8 },
		{ month: 'Авг', new: 19, current: 30, completed: 10 },
		{ month: 'Сен', new: 12, current: 24, completed: 7 },
		{ month: 'Окт', new: 14, current: 27, completed: 8 },
		{ month: 'Ноя', new: 12, current: 22, completed: 6 },
		{ month: 'Дек', new: 9,  current: 19, completed: 5 },
	]))
}
