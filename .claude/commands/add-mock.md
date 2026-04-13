Добавь новый мок-эндпоинт в проект UzMashLizing (MSW через Mirage.js).

Описание эндпоинта: $ARGUMENTS

## Шаги

1. **Определи или создай файл хендлера**
   - Если эндпоинт относится к существующей сущности — добавь в соответствующий `*FakeApi.ts`
   - Если новая сущность — создай `src/mock/fakeApi/<entity>FakeApi.ts` по шаблону:
   ```typescript
   import { Server } from 'miragejs'

   export default function entityFakeApi(server: Server, apiPrefix: string) {
     server.get(`${apiPrefix}/<endpoint>/`, (schema) => {
       return schema.db.<entityData>.all()
     })
   }
   ```

2. **Добавь тестовые данные в `src/mock/data/`**
   - Файл: `src/mock/data/<entity>Data.ts`
   - Данные должны отражать реальную структуру API (те же поля, что в `src/@types/`)
   - Обязательно: `name_ru` и `name_uz` для именованных сущностей
   - Денежные суммы как `string`, не `number`

3. **Подключи в `src/mock/fakeApi/index.ts`**
   ```typescript
   export { default as <entity>FakeApi } from './<entity>FakeApi'
   ```

4. **Убедись, что хендлер вызывается в `src/mock/index.ts`**

## Правила
- Не трогать `public/mockServiceWorker.js`
- Мок должен возвращать структуру идентичную реальному API
- Для списков — минимум 3-5 тестовых объекта
- Для пагинации — добавить поля `count`, `next`, `previous` если API их использует
