Проверь права доступа для раздела/компонента в проекте UzMashLizing.

Раздел для проверки: $ARGUMENTS

## Что нужно проверить

1. **В `src/configs/routes.config/routes.config.ts`**
   - Найди маршрут по ключу или пути
   - Выведи: path, key, список ролей в `authority: []`

2. **В `src/configs/navigation.config/index.ts`**
   - Найди пункт навигации по ключу или заголовку
   - Выведи: список ролей в `authority: []`
   - Проверь соответствие с маршрутом — роли должны совпадать

3. **В компонентах раздела** (`src/views/<section>/`)
   - Найди использование `<AuthorityCheck>` или `useAuthority`
   - Выведи какие роли используются внутри компонента

4. **Итог — таблица прав:**

| Роль | Маршрут | Навигация | Компонент |
|------|---------|-----------|-----------|
| SUPERADMIN | ✅/❌ | ✅/❌ | ✅/❌ |
| ADMIN | ... | ... | ... |
| ...  | ... | ... | ... |

5. **Выяви несоответствия:**
   - Роли есть в маршруте, но не в навигации (пользователь может попасть по URL, но не видит пункт меню)
   - Роли есть в навигации, но не в маршруте (пункт виден, но маршрут заблокирован)
   - Прямые проверки `role === '...'` вместо `<AuthorityCheck>` (нарушение паттерна)

## Справка по ролям проекта
SUPERADMIN, ADMIN, BRANCH_DIRECTOR, BRANCH_ZAMDIRECTOR, BRANCH_SPECIALIST_LIZING_OPERATIONS,
BRANCH_JURIST, BRANCH_ACCOUNTANT, BRANCH_MAIN_ACCOUNTANT, MARKETING, SALES, JURIST,
EXPEDITOR, ACCOUNTANT, FINANCE, ZAMPRED, MONITORING, ZAMPREDMONITORING, LESSEE, GHOST
