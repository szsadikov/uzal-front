---
paths:
  - "src/views/home/**/*.tsx"
  - "src/configs/routes.config/**/*.ts"
  - "src/utils/hooks/useAuth.ts"
---

# Архитектура дашбордов по ролям

## Принцип

Каждая роль (или группа) имеет **свой маршрут** и **свой компонент**. Никогда не рендерить разный контент через `if (role === X)` внутри одного компонента.

## Текущие дашборды

| Роли | Маршрут | Компонент |
|------|---------|-----------|
| SUPERADMIN, ADMIN | `/` | `src/views/home/Home.tsx` |
| MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED | `/dashboard/office` | `src/views/home/office/OfficeDashboard.tsx` |
| BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS, BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT | `/dashboard/branch` | `src/views/home/branch/BranchDashboard.tsx` |
| MONITORING, ZAMPREDMONITORING | `/dashboard/monitoring` | `src/views/home/monitoring/MonitoringDashboard.tsx` |

## Добавление дашборда для отдельной роли

**Шаг 1.** Создай компонент в `src/views/home/<role>/`:
```
src/views/home/marketing/MarketingDashboard.tsx
```

**Шаг 2.** Добавь маршрут в `src/configs/routes.config/routes.config.ts`:
```ts
{
  key: 'dashboard_marketing',
  path: '/dashboard/marketing',
  component: lazy(() => import('@/views/home/marketing/MarketingDashboard')),
  authority: [MARKETING]
},
```

**Шаг 3.** Добавь проверку в `getEntryPathByRole` в `src/utils/hooks/useAuth.ts` **до** общей группы:
```ts
export function getEntryPathByRole(role: string): string {
  if (role === MARKETING) return '/dashboard/marketing'
  if (OFFICE_ROLES.includes(role)) return '/dashboard/office'
  // ...
}
```

`authority` в маршруте обеспечивает изоляцию — роль не откроет чужой дашборд по прямому URL.

## Тестирование роли локально

Поменяй `role` в `src/mock/fakeApi/authFakeApi.ts` и перелогинься:
```ts
role: 'marketing'       // → /dashboard/marketing
role: 'branch_director' // → /dashboard/branch
role: 'monitoring'      // → /dashboard/monitoring
role: 'admin'           // → /  (восстанови после теста!)
```
