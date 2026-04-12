# Frontend Demo — Claude Code Context

## Проект

Фронтенд-часть платформы управления лизингом сельхозтехники UzMashLizing (Узбекистан).
Выделена из основного монорепо для независимой разработки с мок-данными.
Основной проект находится на GitLab, этот репозиторий публикуется на GitHub Pages для демонстрации команде.

## Стек

- **React** + **Expo Web** / **Vite**
- **TypeScript** (строгий режим, без `any`)
- **Tailwind CSS** + twSafelistGenerator
- **MSW** (Mock Service Worker) для мок-данных в dev-режиме
- **GitHub Actions** для деплоя на GitHub Pages

## Структура проекта
src/
@types/         ← TypeScript типы и интерфейсы
assets/         ← статические ресурсы
components/     ← переиспользуемые UI-компоненты
shared/       ← общие компоненты (AuthorityCheck, DataTable и др.)
template/     ← компоненты шаблона (навигация, хедер и др.)
route/        ← компоненты маршрутизации (AuthorityGuard и др.)
configs/
navigation.config/  ← конфиг навигации с правами доступа
routes.config/      ← конфиг маршрутов
constants/      ← константы (роли, навигация и др.)
locales/        ← переводы (i18n)
mock/           ← MSW хендлеры и мок-данные
data/         ← JSON-файлы с тестовыми данными
fakeApi/      ← обработчики эндпоинтов
services/       ← API-запросы
store/          ← глобальное состояние
utils/
hooks/        ← кастомные хуки (useAuthority и др.)
views/          ← экраны / страницы приложения
App.tsx
main.tsx
public/
mockServiceWorker.js  ← MSW service worker (не трогать, генерируется автоматически)
.github/
workflows/
deploy.yml    ← автодеплой на GitHub Pages

## Ключевые команды
```bash
npm run dev        # Запуск с моками (MSW активен)
npm run build      # Сборка для GitHub Pages
npm run preview    # Проверить сборку локально
npm run lint       # Линтер
npm run type-check # Проверка типов
```

## Переменные окружения

| Переменная | Dev | Prod |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | реальный API |
| `VITE_USE_MOCKS` | `true` | `false` |

## Мок-данные

Все API-запросы в dev-режиме перехватываются MSW.
Мок-хендлеры находятся в `src/mock/fakeApi/`.
Статические данные находятся в `src/mock/data/`.

При добавлении нового API-эндпоинта:
1. Создай или обнови хендлер в `src/mock/fakeApi/`
2. Добавь тестовые данные в `src/mock/data/`
3. Подключи хендлер в общий индексный файл моков

## Синхронизация с GitLab
```bash
git fetch gitlab
git merge gitlab/main --no-edit
git push origin main
```

## Деплой

Каждый push в ветку `main` автоматически деплоится на GitHub Pages.
URL: `https://USERNAME.github.io/REPO_NAME/`

## Важные правила при разработке

- **Не трогай** `public/mockServiceWorker.js` — генерируется автоматически
- **Не коммить** `.env.local` или файлы с реальными токенами
- **TypeScript строго** — избегай `any`, всегда указывай типы
- **Мок-данные** должны отражать реальную структуру API (те же поля и типы)
- **Компоненты** делай независимыми от источника данных (props-driven)
- **Двуязычность обязательна** — всегда заполнять `name_ru` и `name_uz`
- **Суммы хранятся как `string`** — не использовать `number` для денежных полей
- **Даты** принимают `Date | string` — использовать единый форматтер
- **`FileType`** используется везде для файлов — не создавать отдельных типов

---

## Контекст бизнес-логики

### Домен

Платформа управления лизингом сельхозтехники (UzMashLizing, Узбекистан).
Основной язык интерфейса — русский, данные хранятся билингвально (`name_ru` / `name_uz`).

---

### Основные сущности

#### User (пользователь)
```ts
id: number
username: string
first_name, middle_name, last_name: string
phone_number, email, pinfl: string
is_active: boolean
role: UserRoleTextEnum        // строковый идентификатор роли
role_id: UserRoleEnum         // числовой идентификатор роли
region: { id, name_ru, name_uz, region_code }
```

#### UserRoleEnum (числовые значения)
SUPERADMIN=1, ADMIN, MARKETING, SALES, MONITORING,
JURIST, ACCOUNTANT, FINANCE, UZMASHLIZING, ZAMPRED,
ZAMPREDMONITORING, EXPEDITOR, BRANCH_ACCOUNTANT,
BRANCH_MAIN_ACCOUNTANT, BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR,
BRANCH_SPECIALIST_LIZING_OPERATIONS, BRANCH_JURIST, LESSEE

#### Tech (техника)
```ts
id: number
model_name_ru, model_name_uz: string
manufacturer: { id, name_ru, name_uz }
type: { id, name_ru, name_uz }
count: number
price: string                  // строка, не number
tech_price_with_vat: number
tech_price_with_gps: number
vat: number
measure_unit: MeasureUnitEnum  // PIECES=1
is_active: boolean
code_1c, ikpu_code, ikpu_name: string
characteristics: TechCharacteristicItem[]
files: FileType[]
```

#### Branch (филиал)
```ts
id: number
name: string
region: { id, name_ru, name_uz }
city: { id, name_ru, name_uz }
street, house_number: string
position: number
branch_users_count: string
```

#### Region
```ts
id: number
name_ru, name_uz: string
region_code: string
is_active: boolean
position: number
```

#### Contract (договор лизинга) — центральная сущность
```ts
id: number
code, contract_date: string
// Реквизиты филиала
branch_region, branch_city, branch_street, branch_house: string
branch_director: string
procuration_date, procuration_number
// Техника
tech: number
tech_model, tech_type, tech_manufacturer: string
tech_obj: Tech
// Финансовые условия (все суммы — string)
deposit_percentage: string     // аванс %
price_with_vat: string         // цена + НДС
price_with_gps: string         // цена + НДС + GPS
rent_percent: string           // лизинговый процент
rent_period: number            // срок лизинга в годах
loan_type: ContractLoanTypeEnum        // Аннуитет=1, Дифференциал=2
payment_period: ContractPaymentPeriodEnum  // Месяц=1, Квартал=2
// Реквизиты клиента
client_company_name, client_director: string
stir, mfo, oked, hr: string
// Флаги
fond: boolean
dummy_contract: boolean
// Документы
pdf_document: string
files: FileType[]
```

#### ContractStatusEnum
PENDING_TRANSFER=1  // Ожидание оплаты
DEPOSIT_PAID        // Ожидание выдачи техники
TECH_GIVEN          // Выдача техники
CANCELED            // Отменён
CLIENT_CHANGED      // Переуступка
TECH_RETURNED       // Возврат средств

#### ContractApplication (заявка на договор)
```ts
id: number
code: string
branch: Branch
stir, company_name, phone_number: string
tech: Tech
total_amount: string
status: ContractApplicationStatusEnum
voting_status: ContractApplicationVotingStatusEnum
my_voting_status: ContractApplicationVotingStatusEnum
sales: Sale
lessee: Lessee
votes: Vote[]
files: FileType[]
application_date, created_at, updated_at: Date | string
```

#### ContractApplicationStatusEnum
NEW=1               // Новое
ASSIGNED            // Назначен
DOCUMENT_GATHERING  // Сбор документов
IN_COMMISSION       // Комиссия
REJECTED            // Отказано
CONTRACT_CREATED    // Составлен договор

#### ContractApplicationVotingStatusEnum
NEW=1         // Новое
IN_PROGRESS   // В процессе
APPROVED      // Согласовано
REJECTED      // Отказано

#### PaymentOverdueNotice (уведомление о просрочке)
```ts
id: number
code, contract_code: string
contract: number
company_name, stir, phone_number: string
month_overdue: number
date_of_payment: Date | string
days_in_the_month: number
main_amount_of_payment, total_amount, overdue_amount: string
rent_percent: number
notice_date: Date | string
status, sms_status, process_status: string
delayed_time: Date | string
pdf_document, html_document: string
branch: Branch | null
```

#### PaymentOverdueNoticeStatusEnum
NEW = 'new'
DELAYED = 'delayed'
PROCESSING = 'processing'

#### TechMonitorTaskDetail (мониторинг техники)
```ts
id: number
region, client, phone_number, created_by: string
deadline: string
status: TechMonitorTaskStatus
monitoring: MonitoringRef
completed_at: string | null
employee: string | null
```

#### TechMonitorTaskStatus
WAITING=1         // В ожидании
DONE=2            // Выполнен
MISSED_DEADLINE=3 // Не выполнен

#### Lessee (лизингополучатель)
```ts
id: number
profile: User
stir, company_name: string
account_number, mfo, bank_details: string
address, director_name: string
region: Region
```

#### PKM
```ts
id: number
name, investor: string
top_content, bottom_content: string
is_active: boolean
created_at: string
```

---

### Ключевые бизнес-правила

- Договор создаётся только после того как заявка достигла статуса `CONTRACT_CREATED`
- Голосование по заявке (`Vote`) — каждый `BranchUser` голосует отдельно
- Техника имеет остатки по 14 регионам (`region_1_count` … `region_14_count`)
- Все денежные суммы хранятся как `string` — никогда не использовать `number` для денег
- Двуязычность обязательна — всегда заполнять `name_ru` и `name_uz`
- Даты принимают `Date | string` — использовать единый форматтер во всём проекте
- `FileType` используется везде — не создавать отдельных типов для файлов

---

## Роли и права доступа

### Доступ к разделам по ролям

| Раздел | Роли |
|--------|------|
| Реестр пользователей | ADMIN |
| Сотрудники | SUPERADMIN, ADMIN, MARKETING, ZAMPREDMONITORING |
| Филиалы | SUPERADMIN, ADMIN |
| Договор (настройки) | SUPERADMIN, ADMIN |
| SMS сервис | SUPERADMIN, ADMIN |
| Клиенты → Новые договора | SUPERADMIN, MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE |
| Клиенты → Текущие договора | SUPERADMIN, MARKETING, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE |
| Заявления | SUPERADMIN, JURIST |
| Контакты юристов | SUPERADMIN, JURIST |
| Реестр компаний | SUPERADMIN, MARKETING |
| Заявки → Новые | SUPERADMIN, BRANCH_DIRECTOR, SALES |
| Заявки → На проверку | SUPERADMIN, MARKETING, SALES, BRANCH_MAIN_ACCOUNTANT, BRANCH_ZAMDIRECTOR, BRANCH_JURIST, BRANCH_SPECIALIST_LIZING_OPERATIONS, BRANCH_DIRECTOR |
| Мониторинг | SUPERADMIN, MARKETING, MONITORING, ZAMPREDMONITORING |
| Задачи | SUPERADMIN, ZAMPREDMONITORING |
| Каталог техники | SUPERADMIN, MARKETING |
| Склад | SUPERADMIN, MARKETING |
| Бегунки | SUPERADMIN, MARKETING, JURIST, EXPEDITOR, FINANCE, BRANCH_ACCOUNTANT, ACCOUNTANT, ZAMPRED |
| Портал лизингополучателя | SUPERADMIN, LESSEE |
| Каталог (гость) | GHOST |

---

### Группы ролей по функциям

**Администраторы** — полный доступ ко всему:
`SUPERADMIN`, `ADMIN`

**Головной офис** — аналитика, каталог, склад, мониторинг:
`MARKETING`, `SALES`, `JURIST`, `EXPEDITOR`, `ACCOUNTANT`, `FINANCE`, `ZAMPRED`, `MONITORING`

**Филиальные сотрудники** — работа с заявками своего филиала:
`BRANCH_DIRECTOR`, `BRANCH_ZAMDIRECTOR`, `BRANCH_SPECIALIST_LIZING_OPERATIONS`,
`BRANCH_JURIST`, `BRANCH_ACCOUNTANT`, `BRANCH_MAIN_ACCOUNTANT`

**Мониторинг** — только просмотр мониторинга и задач:
`ZAMPREDMONITORING`

**Лизингополучатель** — клиентский портал (каталог, заявки, договора):
`LESSEE`

**Гость** — только просмотр каталога без авторизации:
`GHOST`

---

### Логика useAuthority
```ts
useAuthority(userAuthority: string[], authority: string[], emptyCheck = false)
```

- `authority = []` → возвращает `true` (доступно всем авторизованным)
- `authority = []` + `emptyCheck = true` → возвращает `false`
- Совпадение через `Array.some` — достаточно одной совпадающей роли
- Если `userAuthority` пуст → возвращает `!emptyCheck`
```tsx
// Пример использования
const canEdit = useAuthority(currentUser.role, [ADMIN, SUPERADMIN])
const canDelete = useAuthority(currentUser.role, [SUPERADMIN])
```

---

### Компонент AuthorityCheck

Рендерит `children` только если роль совпадает, иначе возвращает `null`.
```tsx
<AuthorityCheck userAuthority={currentUser.role} authority={[ADMIN, SUPERADMIN]}>
    <button>Удалить</button>
</AuthorityCheck>
```

Типичные сценарии:
- Скрыть кнопку "Удалить" / "Редактировать" для ограниченных ролей
- Скрыть колонку таблицы с чувствительными данными
- Скрыть блок формы (например, поле скидки только для FINANCE)

**Важно:** `AuthorityCheck` только скрывает UI.
Для защиты маршрутов используй `AuthorityGuard`.

---

## Архитектура дашбордов по ролям

### Принцип: каждая роль → отдельный маршрут и компонент

Каждая роль (или группа ролей) имеет **свой маршрут** и **свой компонент дашборда**.
Никогда не рендерить разный контент через `if (role === X)` внутри одного компонента — это приводит к росту сложности и трудно масштабируется.

### Текущие дашборды

| Роли | Маршрут | Компонент |
|------|---------|-----------|
| SUPERADMIN, ADMIN | `/` | `src/views/home/Home.tsx` |
| MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED | `/dashboard/office` | `src/views/home/office/OfficeDashboard.tsx` |
| BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS, BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT | `/dashboard/branch` | `src/views/home/branch/BranchDashboard.tsx` |
| MONITORING, ZAMPREDMONITORING | `/dashboard/monitoring` | `src/views/home/monitoring/MonitoringDashboard.tsx` |

### Как добавить дашборд для отдельной роли

Если роли внутри одной группы нужны **разные** дашборды (например, MARKETING и JURIST оба в `/dashboard/office`, но хотят видеть разное):

**Шаг 1.** Создай новый компонент:
```
src/views/home/marketing/MarketingDashboard.tsx
src/views/home/jurist/JuristDashboard.tsx
```

**Шаг 2.** Добавь маршрут в `src/configs/routes.config/routes.config.ts`:
```ts
{
  key: 'dashboard_marketing',
  path: '/dashboard/marketing',
  component: lazy(() => import('@/views/home/marketing/MarketingDashboard')),
  authority: [MARKETING]
},
{
  key: 'dashboard_jurist',
  path: '/dashboard/jurist',
  component: lazy(() => import('@/views/home/jurist/JuristDashboard')),
  authority: [JURIST]
},
```

**Шаг 3.** Добавь проверку в `getEntryPathByRole` в `src/utils/hooks/useAuth.ts` **до** общей группы:
```ts
export function getEntryPathByRole(role: string): string {
  if (role === MARKETING) return '/dashboard/marketing'
  if (role === JURIST)    return '/dashboard/jurist'
  if (OFFICE_ROLES.includes(role)) return '/dashboard/office'
  // ...
}
```

`authority` в маршруте обеспечивает изоляцию — роль не сможет открыть чужой дашборд напрямую по URL.

### Тестирование роли локально

Поменяй `role` в `src/mock/fakeApi/authFakeApi.ts` и перелогинься:
```ts
role: 'marketing'      // → /dashboard/marketing или /dashboard/office
role: 'branch_director' // → /dashboard/branch
role: 'monitoring'     // → /dashboard/monitoring
role: 'admin'          // → /  (восстанови после теста!)
```