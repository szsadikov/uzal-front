import { lazy } from 'react'
import type { Routes } from '@/@types/routes'
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
	JURIST,
	LESSEE,
	MARKETING,
	MONITORING,
	SALES,
	SUPERADMIN,
	ZAMPRED,
	ZAMPREDMONITORING
} from '@/constants/roles.constant'
import { authRoutes } from './auth.routes'

export const publicRoutes: Routes = [...authRoutes]

export const protectedRoutes: Routes = [
	{
		key: 'home',
		path: '/',
		component: lazy(() => import('@/views/home/Home')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'dashboard_office',
		path: '/dashboard/office',
		component: lazy(() => import('@/views/home/office/OfficeDashboard')),
		authority: [MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED]
	},
	{
		key: 'dashboard_branch',
		path: '/dashboard/branch',
		component: lazy(() => import('@/views/home/branch/BranchDashboard')),
		authority: [
			BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT
		]
	},
	{
		key: 'dashboard_monitoring',
		path: '/dashboard/monitoring',
		component: lazy(() => import('@/views/home/monitoring/MonitoringDashboard')),
		authority: [MONITORING, ZAMPREDMONITORING]
	},

	{
		key: 'access_denied',
		path: '/access-denied',
		component: lazy(() => import('@/views/access-denied/AccessDenied')),
		authority: []
	},
	{
		key: 'notification',
		path: '/notification',
		component: lazy(() => import('@/views/account/ActivityLog')),
		authority: []
	},

	{
		key: 'account_settings',
		path: '/account/settings/:tab',
		component: lazy(() => import('@/views/account/settings/Settings')),
		authority: [],
		meta: {
			header: 'Настройки',
			headerContainer: true
		}
	},
	{
		key: 'account_activity_log',
		path: '/account/activity-log',
		component: lazy(() => import('@/views/account/ActivityLog')),
		authority: []
	},
	{
		key: 'users',
		path: '/users',
		component: lazy(() => import('@/views/users/list/UsersList')),
		authority: [SUPERADMIN, ADMIN, MARKETING, ZAMPREDMONITORING]
	},
	{
		key: 'users_archive',
		path: '/users/archive',
		component: lazy(() => import('@/views/users/archive/list/UsersList')),
		authority: [SUPERADMIN, ADMIN, MARKETING, ZAMPREDMONITORING]
	},
	{
		key: 'user_registry',
		path: '/users-register',
		component: lazy(() => import('@/views/user-registry/list/UsersRegistryList')),
		authority: [ADMIN]
	},
	{
		key: 'users_register_archive',
		path: '/user-registry/archive',
		component: lazy(() => import('@/views/user-registry/archive/list/UsersRegistryList')),
		authority: [ADMIN]
	},

	{
		key: 'branches_list',
		path: '/branches',
		component: lazy(() => import('@/views/branches/branchlist/BranchesList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'branches_regions',
		path: '/branches/regions',
		component: lazy(() => import('@/views/branches/regions/list/RegionsList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'branches_employee_view',
		path: '/branches/employee-view/:id',
		component: lazy(() => import('@/views/branches/branchlist/view/ViewBranchTable')),
		authority: [SUPERADMIN, ADMIN]
	},

	{
		key: 'contracts_list',
		path: '/contracts',
		component: lazy(() => import('@/views/contracts/list/ContractsList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'contracts_prefix',
		path: '/contracts/prefix',
		component: lazy(() => import('@/views/contracts/prefix/list/PrefixList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'contracts_pkm',
		path: '/contracts/pkm',
		component: lazy(() => import('@/views/contracts/pkm/list/PkmList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'contracts_advance',
		path: '/contracts/advance',
		component: lazy(() => import('@/views/contracts/advance/list/AdvanceList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'contracts_vat',
		path: '/contracts/vat',
		component: lazy(() => import('@/views/contracts/vat/list/VatList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'contracts_gps',
		path: '/contracts/gps',
		component: lazy(() => import('@/views/contracts/gps/list/GpsList')),
		authority: [SUPERADMIN, ADMIN]
	},

	{
		key: 'requests_new',
		path: '/requests/new',
		component: lazy(() => import('@/views/requests/new/list/NewRequestList')),
		authority: [SUPERADMIN, JURIST]
	},
	{
		key: 'requests_current',
		path: '/requests/current',
		component: lazy(() => import('@/views/requests/current/list/CurrentList')),
		authority: [SUPERADMIN, JURIST]
	},
	{
		key: 'request_add',
		path: '/request-add',
		component: lazy(() => import('@/views/requests/current/add/CurrentAdd')),
		authority: [SUPERADMIN, JURIST]
	},
	{
		key: 'requests_deferred',
		path: '/requests/deferred',
		component: lazy(() => import('@/views/requests/deferred/list/DeferredList')),
		authority: [SUPERADMIN, JURIST]
	},
	{
		key: 'lessee_requests_list',
		path: '/lessee/requests',
		component: lazy(() => import('@/views/requests/(lessee)/list/RequestsList')),
		authority: [SUPERADMIN, LESSEE]
	},

	{
		key: 'request_admin',
		path: '/request-admin',
		component: lazy(() => import('@/views/contracts/request/RequestList')),
		authority: [SUPERADMIN, ADMIN]
	},
	{
		key: 'sms_service',
		path: '/sms-service',
		component: lazy(() => import('@/views/sms-service/list/SmsServiceList')),
		authority: [SUPERADMIN, ADMIN]
	},

	{
		key: 'clients_new_contracts',
		path: '/clients/new-contracts',
		component: lazy(() => import('@/views/clients/new-contracts/list/NewContractsList')),
		authority: [SUPERADMIN, MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'clients_new_contracts_add',
		path: '/clients/new-contracts/new',
		component: lazy(() => import('@/views/clients/new-contracts/add/NewContractsAdd')),
		authority: [SUPERADMIN, MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'clients_new_contracts_add_id',
		path: '/clients/new-contracts/new/:id',
		component: lazy(() => import('@/views/clients/new-contracts/add/id/NewContractsAddId')),
		authority: [SUPERADMIN, MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'clients_current_contracts',
		path: '/clients/current-contracts',
		component: lazy(() => import('@/views/clients/current-contracts/list/CurrentContractsList')),
		authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'clients_archive',
		path: '/clients/archive',
		component: lazy(() => import('@/views/clients/archive/list/ArchiveList')),
		authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'clients_archive_current',
		path: '/clients/archive_current',
		component: lazy(() => import('@/views/clients/archive-current/list/ArchiveList')),
		authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE]
	},
	{
		key: 'applications_new',
		path: '/applications/new',
		component: lazy(() => import('@/views/applications/new/list/NewApplicationsList')),
		authority: [SUPERADMIN, BRANCH_DIRECTOR, SALES, LESSEE]
	},
	{
		key: 'applications_new_view',
		path: '/applications/new/:id',
		component: lazy(() => import('@/views/applications/new/view/NewApplicationsView')),
		authority: [SUPERADMIN, BRANCH_DIRECTOR, SALES, LESSEE]
	},
	{
		key: 'applications_pending',
		path: '/applications/pending',
		component: lazy(() => import('@/views/applications/pending/list/PendingApplicationsList')),
		authority: [
			SUPERADMIN,
			MARKETING,
			SALES,
			BRANCH_MAIN_ACCOUNTANT,
			BRANCH_ZAMDIRECTOR,
			BRANCH_JURIST,
			BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_DIRECTOR
		]
	},
	{
		key: 'applications_pending_view',
		path: '/applications/pending/:id',
		component: lazy(() => import('@/views/applications/pending/view/PendingApplicationsView')),
		authority: [
			SUPERADMIN,
			MARKETING,
			SALES,
			BRANCH_MAIN_ACCOUNTANT,
			BRANCH_ZAMDIRECTOR,
			BRANCH_JURIST,
			BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_DIRECTOR
		]
	},
	{
		key: 'applications_archive',
		path: '/applications/archive',
		component: lazy(() => import('@/views/applications/archive/list/ArchiveApplicationsList')),
		authority: [
			SUPERADMIN,
			MARKETING,
			SALES,
			BRANCH_MAIN_ACCOUNTANT,
			BRANCH_ZAMDIRECTOR,
			BRANCH_JURIST,
			BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_DIRECTOR
		]
	},

	{
		key: 'applications_pending_archive',
		path: '/applications/pending/archive',
		component: lazy(() => import('@/views/applications/archive/pending/PendingApplicationsList')),
		authority: [
			SUPERADMIN,
			MARKETING,
			SALES,
			BRANCH_MAIN_ACCOUNTANT,
			BRANCH_ZAMDIRECTOR,
			BRANCH_JURIST,
			BRANCH_SPECIALIST_LIZING_OPERATIONS,
			BRANCH_DIRECTOR
		]
	},

	{
		key: 'monitoring',
		path: '/monitoring',
		component: lazy(() => import('@/views/monitoring/list/list/MonitoringList')),
		authority: [SUPERADMIN, MARKETING, MONITORING, ZAMPREDMONITORING]
	},
	{
		key: 'tasks',
		path: '/tasks',
		component: lazy(() => import('@/views/monitoring/tasklist/list/TasksList')),
		authority: [SUPERADMIN, ZAMPREDMONITORING]
	},
	{
		key: 'tasks_archive',
		path: '/tasks/archive',
		component: lazy(() => import('@/views/monitoring/tasklist/archive/list/TasksArchiveList')),
		authority: [SUPERADMIN, ZAMPREDMONITORING]
	},
	{
		key: 'catalog_equipment',
		path: '/catalog/equipment',
		component: lazy(() => import('@/views/catalog/equipment/list/EquipmentList')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'catalog_equipment_new',
		path: '/catalog/equipment/new',
		component: lazy(() => import('@/views/catalog/equipment/add/EquipmentAdd')),
		authority: [SUPERADMIN, MARKETING],
		meta: {
			header: 'Добавить новый продукт'
		}
	},
	{
		key: 'catalog_equipment_edit',
		path: '/catalog/equipment/edit/:id',
		component: lazy(() => import('@/views/catalog/equipment/edit/EquipmentEdit')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'catalog_equipment_type',
		path: '/catalog/equipment-type',
		component: lazy(() => import('@/views/catalog/equipment-type/list/EquipmentTypeList')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'catalog_manufacturer',
		path: '/catalog/manufacturer',
		component: lazy(() => import('@/views/catalog/manufacturer/list/ManufacturerList')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'lessee_catalog_list',
		path: '/lessee/catalog',
		component: lazy(() => import('@/views/catalog/(lessee)/list/CatalogList')),
		authority: [SUPERADMIN, LESSEE]
	},
	{
		key: 'lessee_catalog_view',
		path: '/lessee/catalog/:id',
		component: lazy(() => import('@/views/catalog/(lessee)/view/CatalogView')),
		authority: [SUPERADMIN, LESSEE]
	},
	{
		key: 'lessee_catalog_calculator',
		path: '/lessee/catalog/calculator',
		component: lazy(() => import('@/views/catalog/(lessee)/calculator/CatalogCalculator')),
		authority: [SUPERADMIN, LESSEE]
	},

	{
		key: 'warehouse_incoming',
		path: '/warehouse/incoming',
		component: lazy(() => import('@/views/warehouse/incoming/list/IncomingList')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'warehouse_regional_distribution',
		path: '/warehouse/regional-distribution',
		component: lazy(
			() => import('@/views/warehouse/regional-distribution/list/RegionalDistributionList')
		),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'warehouse_incoming_history',
		path: '/warehouse/incoming/history',
		component: lazy(() => import('@/views/warehouse/incoming/history/list/HistoryList')),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'warehouse_regional_distribution_history',
		path: '/warehouse/regional-distribution/history',
		component: lazy(
			() => import('@/views/warehouse/regional-distribution/history/list/HistoryList')
		),
		authority: [SUPERADMIN, MARKETING]
	},
	{
		key: 'paper_trackers',
		path: '/paper-trackers',
		component: lazy(() => import('@/views/paper-trackers/list/PaperTrackersList')),
		authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, FINANCE, BRANCH_ACCOUNTANT, ACCOUNTANT, ZAMPRED]
	},
	{
		key: 'paper_trackers_add',
		path: '/paper-trackers-add/:id',
		component: lazy(() => import('../../views/paper-trackers/add/PaperTrackersAdd')),
		authority: [SUPERADMIN, MARKETING, JURIST, EXPEDITOR, FINANCE, BRANCH_ACCOUNTANT, ACCOUNTANT, ZAMPRED]
	},
	{
		key: 'jurist_contacts',
		path: '/jurist/contacts',
		component: lazy(() => import('@/views/jurist/contracts/list/JuristContactsList')),
		authority: [JURIST, SUPERADMIN]
	},
	{
		key: 'marketing_clients',
		path: '/marketing/clients',
		component: lazy(() => import('@/views/marketing/clients/list/MarketingClientsList')),
		authority: [MARKETING, SUPERADMIN]
	},
	{
		key: 'marketing_client_view',
		path: '/marketing/clients/:id',
		component: lazy(() => import('@/views/marketing/clients/view/MarketingClientView')),
		authority: [MARKETING, SUPERADMIN]
	},
]
