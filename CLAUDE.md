# Frontend Demo — Claude Code Context

## Проект

Фронтенд-часть платформы управления лизингом сельхозтехники UzMashLizing (Узбекистан).
Выделена из основного монорепо для независимой разработки с мок-данными.
Основной проект на GitLab, этот репозиторий публикуется на GitHub Pages для демонстрации.

## Стек

- **React** + **Vite** + **TypeScript** (строгий режим)
- **Tailwind CSS** + twSafelistGenerator
- **Redux Toolkit** + RTK Query
- **MSW** (Mock Service Worker) — мок-данные в dev-режиме
- **GitHub Actions** — автодеплой на GitHub Pages

## Структура проекта

```
src/
  @types/       ← TypeScript типы и интерфейсы
  assets/       ← статические ресурсы, стили
  components/
    shared/     ← переиспользуемые компоненты (AuthorityCheck, DataTable и др.)
    template/   ← компоненты шаблона (навигация, хедер и др.)
    route/      ← компоненты маршрутизации (AuthorityGuard и др.)
    ui/         ← базовые UI-компоненты
  configs/
    navigation.config/  ← конфиг навигации с правами доступа
    routes.config/      ← конфиг маршрутов
  constants/    ← константы (роли, навигация и др.)
  locales/      ← переводы (i18n)
  mock/
    data/       ← статические тестовые данные
    fakeApi/    ← MSW хендлеры эндпоинтов
  services/     ← API-запросы
  store/        ← Redux store и слайсы
  utils/
    hooks/      ← кастомные хуки (useAuthority, useAuth и др.)
  views/        ← экраны / страницы приложения
public/
  mockServiceWorker.js  ← НЕ ТРОГАТЬ, генерируется автоматически
```

## Ключевые команды

```bash
npm run dev        # Запуск с моками (MSW активен)
npm run build      # Сборка для GitHub Pages
npm run preview    # Проверить сборку локально
npm run lint       # Линтер
npm run type-check # Проверка типов
```

## Правила и контекст (подробные файлы)

| Файл | Содержимое | Path-binding |
|------|-----------|--------------|
| `.claude/rules/typescript.md` | TS-правила, типы данных, двуязычность | глобально |
| `.claude/rules/business-entities.md` | Все доменные сущности и enum | `@types/`, `services/`, `store/` |
| `.claude/rules/roles-and-access.md` | Роли, useAuthority, AuthorityCheck | `route/`, `hooks/`, `*.config/` |
| `.claude/rules/dashboards.md` | Архитектура дашбордов по ролям | `views/home/`, `routes.config/` |
| `.claude/rules/mock-data.md` | Правила мок-данных MSW | `src/mock/` |
| `.claude/rules/deploy.md` | Деплой, GitLab-синхронизация | глобально |
