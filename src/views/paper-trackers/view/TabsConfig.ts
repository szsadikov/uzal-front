// src/pages/paper-trackers/view/TabsConfig.ts
import { UserRoleEnum } from '@/@types/user.types'
import AccountantTab from '../Tabs/components/AccountantTab'
import ExpeditorTab from '../Tabs/components/ExpeditorTab'
import FinancierTab from '../Tabs/components/FinancierTab'
import LawyerTab from '../Tabs/components/LawyerTab'
import MarketingTab from '../Tabs/components/MarketingTab'
import MonitoringTab from '../Tabs/components/MonitoringTab'
import ZamdepTab from '../Tabs/components/ZamdepTab'

export type TabKey =
	| 'expeditor' | 'financier' | 'accountant' | 'lawyer'
	| 'marketing' | 'monitoring' | 'zamdep'

export const TABS: {
	key: TabKey
	label: string
	component: React.ComponentType<any>
	editors: UserRoleEnum[]
}[] = [
	{ key: 'expeditor',  label: 'Экспедитор',  component: ExpeditorTab,  editors: [UserRoleEnum.EXPEDITOR, UserRoleEnum.ADMIN] },
	{ key: 'financier',  label: 'Финансист',  component: FinancierTab,  editors: [UserRoleEnum.FINANCE, UserRoleEnum.ADMIN] },
	{ key: 'accountant', label: 'Бухгалтер',  component: AccountantTab, editors: [UserRoleEnum.ACCOUNTANT, UserRoleEnum.ADMIN] },
	{ key: 'lawyer',     label: 'Юрист',      component: LawyerTab,     editors: [UserRoleEnum.JURIST, UserRoleEnum.ADMIN] },
	{ key: 'marketing',  label: 'Маркетинг',  component: MarketingTab,  editors: [UserRoleEnum.MARKETING, UserRoleEnum.ADMIN] },
	{ key: 'monitoring', label: 'Мониторинг', component: MonitoringTab, editors: [UserRoleEnum.MONITORING, UserRoleEnum.ADMIN] },
	{ key: 'zamdep',     label: 'Зампред',    component: ZamdepTab,     editors: [UserRoleEnum.ZAMPRED, UserRoleEnum.ADMIN] },
]
