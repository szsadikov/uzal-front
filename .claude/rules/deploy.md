# Деплой и синхронизация

## GitHub Pages

Каждый push в `main` автоматически деплоится через GitHub Actions (`.github/workflows/deploy.yml`).

## Синхронизация с GitLab

Основной проект на GitLab, этот репо — зеркало для демонстрации:

```bash
git fetch gitlab
git merge gitlab/main --no-edit
git push origin main
```

## Что не коммитить

- `.env.local` и любые файлы с реальными токенами или API-ключами
- `public/mockServiceWorker.js` — генерируется автоматически, не редактировать вручную

## Переменные окружения

| Переменная | Dev | Prod |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000` | реальный API |
| `VITE_USE_MOCKS` | `true` | `false` |
