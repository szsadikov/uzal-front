---
paths:
  - "src/components/route/**/*.tsx"
  - "src/utils/hooks/**/*.ts"
  - "src/configs/navigation.config/**/*.ts"
  - "src/configs/routes.config/**/*.ts"
  - "src/constants/**/*.ts"
---

# Роли и права доступа

## UserRoleEnum (числовые значения)

```
SUPERADMIN=1, ADMIN=2, MARKETING=3, SALES=4, MONITORING=5,
JURIST=6, ACCOUNTANT=7, FINANCE=8, UZMASHLIZING=9, ZAMPRED=10,
ZAMPREDMONITORING=11, EXPEDITOR=12, BRANCH_ACCOUNTANT=13,
BRANCH_MAIN_ACCOUNTANT=14, BRANCH_DIRECTOR=15, BRANCH_ZAMDIRECTOR=16,
BRANCH_SPECIALIST_LIZING_OPERATIONS=17, BRANCH_JURIST=18, LESSEE=19
```

## Группы ролей

| Группа | Роли |
|--------|------|
| **Администраторы** | SUPERADMIN, ADMIN |
| **Головной офис** | MARKETING, SALES, JURIST, EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED, MONITORING |
| **Филиальные сотрудники** | BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS, BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT |
| **Мониторинг** | ZAMPREDMONITORING |
| **Лизингополучатель** | LESSEE |
| **Гость** | GHOST |

## Доступ к разделам

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

## useAuthority

```ts
useAuthority(userAuthority: string[], authority: string[], emptyCheck = false)
```

- `authority = []` → `true` (доступно всем авторизованным)
- `authority = []` + `emptyCheck = true` → `false`
- Совпадение через `Array.some` — достаточно одной совпадающей роли
- `userAuthority` пуст → возвращает `!emptyCheck`

```tsx
const canEdit = useAuthority(currentUser.role, [ADMIN, SUPERADMIN])
```

## AuthorityCheck vs AuthorityGuard

- `AuthorityCheck` — **скрывает UI** (кнопки, колонки, блоки формы). Возвращает `null` если нет доступа.
- `AuthorityGuard` — **защищает маршруты**. Редиректит на `/access-denied` если нет доступа.

```tsx
// Скрыть кнопку для ограниченных ролей
<AuthorityCheck userAuthority={currentUser.role} authority={[ADMIN, SUPERADMIN]}>
  <button>Удалить</button>
</AuthorityCheck>
```
