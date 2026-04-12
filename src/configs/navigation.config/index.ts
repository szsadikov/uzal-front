import type { NavigationTree } from '@/@types/navigation'
import { NAV_ITEM_TYPE_COLLAPSE, NAV_ITEM_TYPE_ITEM } from '@/constants/navigation.constant'
import {
	ACCOUNTANT,
	ADMIN,
	BRANCH_ACCOUNTANT,
	BRANCH_DIRECTOR,
	BRANCH_JURIST,
	BRANCH_MAIN_ACCOUNTANT,
	BRANCH_SPECIALIST_LIZING_OPERATIONS,
	BRANCH_ZAMDIRECTOR,
	EXPEDITOR,
	FINANCE,
	GHOST,
	JURIST,
	LESSEE,
	MARKETING,
	MONITORING,
	SALES,
	SUPERADMIN,
	ZAMPRED,
	ZAMPREDMONITORING
} from '@/constants/roles.constant'

const navigationConfig: NavigationTree[] = [
	{
		key: 'home',
		path: '/',
		title: 'Главное',
		translateKey: 'Главное',
		icon: 'HomeIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [
			SUPERADMIN, ADMIN, MARKETING, SALES, MONITORING,
			JURIST, ACCOUNTANT, FINANCE, ZAMPRED,
			ZAMPREDMONITORING, EXPEDITOR, BRANCH_ACCOUNTANT,
			BRANCH_MAIN_ACCOUNTANT, BRANCH_DIRECTOR,
			BRANCH_ZAMDIRECTOR,
			BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_JURIST, LESSEE
		],
		subMenu: []
	},
	{
		key: 'user_registry',
		path: '/users-register',
		title: 'Реестр пользователей',
		translateKey: 'Реестр пользователей',
		icon: 'UsersIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [ADMIN],
		subMenu: []
	},
	{
		key: 'users',
		path: '/users',
		title: 'Сотрудники',
		translateKey: 'Сотрудники',
		icon: 'UsersIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, ADMIN, MARKETING, ZAMPREDMONITORING],
		subMenu: []
	},
	{
		key: 'branches',
		path: '',
		title: 'Филиалы',
		translateKey: 'Филиалы',
		icon: 'ClientsIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [SUPERADMIN, ADMIN],
		subMenu: [
			{
				key: 'branches_list',
				path: '/branches',
				title: 'Филиалы',
				translateKey: 'Филиалы',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'branches_regions',
				path: '/branches/regions',
				title: 'Область',
				translateKey: 'Область',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			}
		]
	},
	{
		key: 'contracts',
		path: '',
		title: 'Договор',
		translateKey: 'Договор',
		icon: 'CatalogIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [SUPERADMIN, ADMIN],
		subMenu: [
			{
				key: 'contracts_list',
				path: '/contracts',
				title: 'Договор',
				translateKey: 'Договор',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'contracts_prefix',
				path: '/contracts/prefix',
				title: 'Префикс',
				translateKey: 'Префикс',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'contracts_pkm',
				path: '/contracts/pkm',
				title: 'ПКМ',
				translateKey: 'ПКМ',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'contracts_advance',
				path: '/contracts/advance',
				title: 'Аванс',
				translateKey: 'Аванс',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'contracts_vat',
				path: '/contracts/vat',
				title: 'НДС',
				translateKey: 'НДС',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'contracts_gps',
				path: '/contracts/gps',
				title: 'GPS',
				translateKey: 'GPS',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'request_admin',
				path: '/request-admin',
				title: 'Талабнома',
				translateKey: 'Талабнома',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [SUPERADMIN, ADMIN],
				subMenu: []
			}
		]
	},
	{
		key: 'sms_service',
		path: '/sms-service',
		title: 'SMS сервис',
		translateKey: 'SMS сервис',
		icon: 'SmsServiceIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, ADMIN],
		subMenu: []
	},

	{
		key: 'lessee_catalog_list',
		path: '/lessee/catalog',
		title: 'Каталог',
		translateKey: 'Каталог',
		icon: 'CatalogListIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, LESSEE],
		subMenu: []
	},
	{
		key: 'applications_new',
		path: '/applications/new',
		title: 'Новые заявки',
		translateKey: 'Новые заявки',
		icon: 'ApplicationsIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, LESSEE],
		subMenu: []
	},
	{
		key: 'clients_new_contracts',
		path: '/clients/new-contracts',
		title: 'Новые договора',
		translateKey: 'Новые договора',
		icon: 'ContractsIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, LESSEE],
		subMenu: []
	},
	{
		key: 'clients_current_contracts',
		path: '/clients/current-contracts',
		title: 'Текущие договора',
		translateKey: 'Текущие договора',
		icon: 'ContractsIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, LESSEE],
		subMenu: []
	},

	{
		key: 'clients',
		path: '',
		title: 'Клиенты',
		translateKey: 'Клиенты',
		icon: 'WarehouseIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [],
		subMenu: [
			{
				key: 'clients_new_contracts',
				path: '/clients/new-contracts',
				title: 'Новые договора',
				translateKey: 'Новые договора',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [SUPERADMIN, MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE],
				subMenu: []
			},
			{
				key: 'clients_current_contracts',
				path: '/clients/current-contracts',
				title: 'Текущие договора',
				translateKey: 'Текущие договора',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE],
				subMenu: []
			}
		]
	},

	{
		key: 'requests',
		path: '',
		title: 'Заявления',
		translateKey: 'Заявления',
		icon: 'WindowIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [SUPERADMIN, JURIST],
		subMenu: [
			{
				key: 'requests_new',
				path: '/requests/new',
				title: 'Новые заявления',
				translateKey: 'Новые заявления',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'requests_current',
				path: '/requests/current',
				title: 'Текущие заявления',
				translateKey: 'Текущие заявления',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'requests_deferred',
				path: '/requests/deferred',
				title: 'Отложенные заявления',
				translateKey: 'Отложенные заявления',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			}
		]
	},

	{
		key: 'jurist_contacts',
		path: '/jurist/contacts',
		title: 'Контакты Юристов',
		translateKey: 'Контакты Юристов',
		icon: 'UsersIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [JURIST, SUPERADMIN],
		subMenu: []
	},
	{ key: 'marketing_clients', path: '/marketing/clients',
		title: 'Реестр компаний', translateKey: 'Реестр компаний',
		icon: 'UsersIcon', type: NAV_ITEM_TYPE_ITEM,
		authority: [MARKETING, SUPERADMIN], subMenu: [] },

	{
		key: 'applications',
		path: '',
		title: 'Заявки',
		translateKey: 'Заявки',
		icon: 'ApplicationsIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [],
		subMenu: [
			{
				key: 'applications_new',
				path: '/applications/new',
				title: 'Новые заявки',
				translateKey: 'Новые заявки',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [SUPERADMIN, BRANCH_DIRECTOR, SALES],
				subMenu: []
			},
			{
				key: 'applications_pending',
				path: '/applications/pending',
				title: 'На проверку',
				translateKey: 'На проверку',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [
					SUPERADMIN,
					MARKETING,
					SALES,
					BRANCH_MAIN_ACCOUNTANT,
					BRANCH_ZAMDIRECTOR,
					BRANCH_JURIST,
					BRANCH_SPECIALIST_LIZING_OPERATIONS,
					BRANCH_DIRECTOR
				],
				subMenu: []
			}
		]
	},

	{
		key: 'monitoring',
		path: '/monitoring',
		title: 'Мониторинг',
		translateKey: 'Мониторинг',
		icon: 'MonitoringIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, MARKETING, MONITORING, ZAMPREDMONITORING],
		subMenu: []
	},
	{
		key: 'tasks',
		path: '/tasks',
		title: 'Задачи',
		translateKey: 'Задачи',
		icon: 'CollectionIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, ZAMPREDMONITORING],
		subMenu: []
	},
	{
		key: 'catalog',
		path: '',
		title: 'Каталог',
		translateKey: 'Каталог',
		icon: 'CatalogIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [SUPERADMIN, MARKETING],
		subMenu: [
			{
				key: 'catalog_equipment',
				path: '/catalog/equipment',
				title: 'Техника',
				translateKey: 'Техника',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'catalog_equipment_type',
				path: '/catalog/equipment-type',
				title: 'Тип техники',
				translateKey: 'Тип техники',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'catalog_manufacturer',
				path: '/catalog/manufacturer',
				title: 'Производитель',
				translateKey: 'Производитель',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			}
		]
	},
	{
		key: 'warehouse',
		path: '',
		title: 'Склад',
		translateKey: 'Склад',
		icon: 'WarehouseIcon',
		type: NAV_ITEM_TYPE_COLLAPSE,
		authority: [SUPERADMIN, MARKETING],
		subMenu: [
			{
				key: 'warehouse_incoming',
				path: '/warehouse/incoming',
				title: 'Приход',
				translateKey: 'Приход',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			},
			{
				key: 'warehouse_regional_distribution',
				path: '/warehouse/regional-distribution',
				title: 'Распределение по областям',
				translateKey: 'Распределение по областям',
				icon: '',
				type: NAV_ITEM_TYPE_ITEM,
				authority: [],
				subMenu: []
			}
		]
	},
	{
		key: 'paper_trackers',
		path: '/paper-trackers',
		title: 'Бегунки',
		translateKey: 'Бегунки',
		icon: 'SquareIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [
			SUPERADMIN,
			MARKETING,
			JURIST,
			EXPEDITOR,
			FINANCE,
			BRANCH_ACCOUNTANT,
			ACCOUNTANT,
			ZAMPRED
		],
		subMenu: []
	},

	{
		key: 'lessee_requests_list',
		path: '/lessee/requests',
		title: 'Талабнома',
		translateKey: 'Талабнома',
		icon: 'RequestsIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [SUPERADMIN, LESSEE],
		subMenu: []
	},

	{
		key: 'client_catalog',
		path: '/client',
		title: 'Каталог',
		translateKey: 'Каталог',
		icon: 'CatalogListIcon',
		type: NAV_ITEM_TYPE_ITEM,
		authority: [GHOST],
		subMenu: []
	}
]

export default navigationConfig
