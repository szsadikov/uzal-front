---
paths:
  - "src/@types/**/*.ts"
  - "src/services/**/*.ts"
  - "src/store/**/*.ts"
  - "src/mock/data/**/*.ts"
---

# Доменные сущности

Платформа управления лизингом сельхозтехники (UzMashLizing, Узбекистан).

## User

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

## Tech (техника)

```ts
id: number
model_name_ru, model_name_uz: string
manufacturer: { id, name_ru, name_uz }
type: { id, name_ru, name_uz }
count: number
price: string                  // строка, не number!
tech_price_with_vat: number
tech_price_with_gps: number
vat: number
measure_unit: MeasureUnitEnum  // PIECES=1
is_active: boolean
code_1c, ikpu_code, ikpu_name: string
characteristics: TechCharacteristicItem[]
files: FileType[]
```

Техника имеет остатки по 14 регионам: `region_1_count` … `region_14_count`.

## Branch (филиал)

```ts
id: number
name: string
region: { id, name_ru, name_uz }
city: { id, name_ru, name_uz }
street, house_number: string
position: number
branch_users_count: string
```

## Region

```ts
id: number
name_ru, name_uz: string
region_code: string
is_active: boolean
position: number
```

## Contract (договор лизинга) — центральная сущность

```ts
id: number
code, contract_date: string
// Реквизиты филиала
branch_region, branch_city, branch_street, branch_house: string
branch_director: string
procuration_date, procuration_number: string
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

### ContractStatusEnum
```
PENDING_TRANSFER=1  // Ожидание оплаты
DEPOSIT_PAID=2      // Ожидание выдачи техники
TECH_GIVEN=3        // Выдача техники
CANCELED=4          // Отменён
CLIENT_CHANGED=5    // Переуступка
TECH_RETURNED=6     // Возврат средств
```

## ContractApplication (заявка на договор)

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

### ContractApplicationStatusEnum
```
NEW=1               // Новое
ASSIGNED=2          // Назначен
DOCUMENT_GATHERING=3 // Сбор документов
IN_COMMISSION=4     // Комиссия
REJECTED=5          // Отказано
CONTRACT_CREATED=6  // Составлен договор
```

### ContractApplicationVotingStatusEnum
```
NEW=1         // Новое
IN_PROGRESS=2 // В процессе
APPROVED=3    // Согласовано
REJECTED=4    // Отказано
```

## PaymentOverdueNotice (уведомление о просрочке)

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

### PaymentOverdueNoticeStatusEnum
```
NEW = 'new'
DELAYED = 'delayed'
PROCESSING = 'processing'
```

## TechMonitorTaskDetail (мониторинг техники)

```ts
id: number
region, client, phone_number, created_by: string
deadline: string
status: TechMonitorTaskStatus
monitoring: MonitoringRef
completed_at: string | null
employee: string | null
```

### TechMonitorTaskStatus
```
WAITING=1         // В ожидании
DONE=2            // Выполнен
MISSED_DEADLINE=3 // Не выполнен
```

## Lessee (лизингополучатель)

```ts
id: number
profile: User
stir, company_name: string
account_number, mfo, bank_details: string
address, director_name: string
region: Region
```

## PKM

```ts
id: number
name, investor: string
top_content, bottom_content: string
is_active: boolean
created_at: string
```

## Ключевые бизнес-правила

- Договор создаётся только после того как заявка достигла статуса `CONTRACT_CREATED`
- Голосование по заявке (`Vote`) — каждый `BranchUser` голосует отдельно
- Все денежные суммы — `string`, никогда `number`
- Даты принимают `Date | string` — использовать `dateUtils.ts`
- `FileType` — единый тип для файлов во всём проекте
