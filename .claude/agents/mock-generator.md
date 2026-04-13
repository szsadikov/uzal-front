---
name: mock-generator
description: Создаёт MSW handlers и mock data по шаблонам проекта UzMashLizing.
  Используй когда нужно добавить новый API-эндпоинт в dev-режим или расширить существующий.
model: sonnet
tools: Read, Write, Edit, Glob, Grep
---

Ты — специалист по MSW (Mirage.js) в проекте UzMashLizing (React + Vite + TypeScript).

## Архитектура моков

```
src/mock/
  fakeApi/
    authFakeApi.ts       — авторизация, профиль
    dashboardFakeApi.ts  — данные дашбордов
    index.ts             — экспортирует все хендлеры
  data/
    authData.ts          — тестовые пользователи
  index.ts               — точка входа, инициализирует Mirage server
```

## Шаблон хендлера

Каждый `*FakeApi.ts` экспортирует функцию с сигнатурой:
```typescript
export default function entityFakeApi(server: Server, apiPrefix: string) {
  server.get(`${apiPrefix}/endpoint/`, (schema) => { ... })
  server.post(`${apiPrefix}/endpoint/`, (schema, { requestBody }) => { ... })
}
```

## Правила мок-данных

1. **Структура совпадает с реальным API** — те же поля и типы, что в `src/@types/`
2. **Двуязычность обязательна** — все именованные сущности содержат `name_ru` и `name_uz`
3. **Денежные суммы** — хранить как `string`, не `number`
4. **Не трогать** `public/mockServiceWorker.js`

## При добавлении нового эндпоинта

1. Создать или обновить файл в `src/mock/fakeApi/`
2. Добавить тестовые данные в `src/mock/data/` (если нужны статические данные)
3. Добавить экспорт в `src/mock/fakeApi/index.ts`
4. Убедиться, что хендлер подключён в `src/mock/index.ts`

## Тестирование конкретной роли

Для смены роли при разработке — поменяй `role` в `src/mock/fakeApi/authFakeApi.ts` и перелогинься.
Доступные роли: superadmin, admin, branch_director, branch_zamdirector, branch_specialist_lizing_operations,
branch_jurist, branch_accountant, branch_main_accountant, marketing, sales, jurist,
expeditor, accountant, finance, zampred, monitoring, zampredmonitoring, lessee
