# 🚀 Гайд: Локальная разработка фронтенда с мок-данными → GitHub Pages

## Обзор процесса

```
GitLab (основной проект)
        ↓  git clone
 Локальная папка (только фронт)
        ↓  мок-данные вместо API
 GitHub репозиторий
        ↓  GitHub Actions (автодеплой)
 GitHub Pages (демо для команды)
```

---

## Шаг 1 — Клонировать репозиторий

```bash
# Клонировать из GitLab
git clone https://gitlab.com/YOUR_ORG/frontend.git frontend-demo
cd frontend-demo

# Переименовать origin, чтобы не путать
git remote rename origin gitlab

# Добавить новый GitHub репозиторий
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/frontend-demo.git

# Запушить на GitHub
git push -u origin main
```

> Теперь у вас два remote:
> - `gitlab` — оригинальный проект
> - `origin` — ваш GitHub-форк для демо

---

## Шаг 2 — Разобраться со стеком

В вашем репо есть `eas.json` — это конфиг Expo.
Определите точный тип проекта:

```bash
# Смотрим package.json
cat package.json | grep -E '"react|"expo|"vite|"next|scripts'
```

**Если Expo Web:**
```bash
npx expo install
npx expo start --web
```

**Если Vite/CRA:**
```bash
npm install
npm run dev
```

---

## Шаг 3 — Установить MSW для мок-данных

[MSW (Mock Service Worker)](https://mswjs.io/) — лучший инструмент для мока API.
Перехватывает реальные fetch/axios запросы на уровне браузера.

```bash
npm install msw --save-dev
npx msw init public/ --save
```

### Создать структуру мок-файлов

```
src/
  mocks/
    handlers/
      auth.ts        ← эндпоинты авторизации
      users.ts       ← эндпоинты пользователей
      contracts.ts   ← ваши бизнес-сущности
    data/
      users.json     ← статические данные
      contracts.json
    browser.ts       ← запуск MSW в браузере
    index.ts         ← точка входа
```

### `src/mocks/browser.ts`
```ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
```

### `src/mocks/handlers/index.ts`
```ts
import { authHandlers } from './auth'
import { usersHandlers } from './users'

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
]
```

### Пример хендлера `src/mocks/handlers/users.ts`
```ts
import { http, HttpResponse } from 'msw'
import usersData from '../data/users.json'

export const usersHandlers = [
  http.get('/api/users', () => {
    return HttpResponse.json(usersData)
  }),

  http.get('/api/users/:id', ({ params }) => {
    const user = usersData.find(u => u.id === params.id)
    if (!user) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(user)
  }),

  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: Date.now(), ...body }, { status: 201 })
  }),
]
```

### Подключить MSW в точке входа (main.tsx / index.tsx)
```ts
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') return
  const { worker } = await import('./mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass', // реальные запросы пропускаются
  })
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <App />
  )
})
```

---

## Шаг 4 — Переменные окружения

Создайте два файла:

### `.env.development` (локально с моками)
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCKS=true
```

### `.env.production` (GitHub Pages — только статика)
```env
VITE_API_URL=https://api.yourproject.com
VITE_USE_MOCKS=false
```

> **Если Expo:** используйте `APP_ENV=development` в `eas.json` и `process.env.EXPO_PUBLIC_*`

---

## Шаг 5 — Настроить сборку для GitHub Pages

### Для Vite — `vite.config.ts`
```ts
export default defineConfig({
  base: '/frontend-demo/', // имя вашего GitHub репозитория
  // ...
})
```

### Для CRA — `package.json`
```json
{
  "homepage": "https://YOUR_USERNAME.github.io/frontend-demo"
}
```

### Для Expo Web — `app.json`
```json
{
  "expo": {
    "web": {
      "output": "static",
      "bundler": "metro"
    }
  }
}
```

---

## Шаг 6 — GitHub Actions (автодеплой)

Файл `.github/workflows/deploy.yml` уже создан в этом пакете.

Как активировать GitHub Pages:
1. Зайти в репо на GitHub → **Settings → Pages**
2. Source: **GitHub Actions**
3. Запушить любой коммит в `main` → автодеплой сработает

---

## Шаг 7 — Настроить Claude Code

Файл `CLAUDE.md` уже создан в этом пакете — положите его в корень проекта.

Claude Code будет понимать:
- структуру проекта
- где находятся моки
- как запускать и деплоить

---

## Рабочий процесс с командой

```
1. Вы разрабатываете фичу локально (с моками)
2. Пушите в ветку: git push origin feature/new-screen
3. Открываете PR на GitHub
4. После merge в main — автодеплой на GitHub Pages
5. Команда смотрит демо: https://USERNAME.github.io/frontend-demo
6. Периодически тянете изменения из GitLab:
   git fetch gitlab && git merge gitlab/main
```

---

## Полезные команды

```bash
# Запуск с моками
npm run dev

# Сборка для GitHub Pages
npm run build

# Проверить сборку локально
npm run preview

# Синхронизация с GitLab
git fetch gitlab
git merge gitlab/main --no-edit
```
