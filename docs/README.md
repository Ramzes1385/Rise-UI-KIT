# Документация Rise UI Kit

Эта папка содержит документацию по разработке и ведению проекта.

## Содержание

| Документ | Описание |
|---|---|
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Полное руководство по ведению репозитория: ветки, задачи, коммиты, PR, релизы |

## Быстрый старт

```bash
# Установка зависимостей
npm install

# Локальная разработка
npm run dev

# Storybook
npm run storybook

# Тесты
npm run test:unit
npm run test:e2e

# Сборка
npm run build

# Полная проверка перед push
npm run ci:validate
```

## Структура проекта

```
Rise-UI-KIT/
├── src/
│   ├── components/       # UI компоненты
│   ├── composables/      # Переиспользуемая логика
│   ├── utils/            # Утилиты
│   └── icons/            # Иконки
├── build/                # Конфигурация сборки
│   ├── release/          # semantic-release конфиги
│   ├── ci/               # CI/CD настройки
│   ├── lib/              # Vite конфиг для библиотеки
│   └── tests/            # Vitest и Playwright конфиги
├── docs/                 # Документация (эта папка)
├── scripts/              # Вспомогательные скрипты
└── .github/workflows/    # GitHub Actions
```

## Полезные команды

| Команда | Описание |
|---|---|
| `npm run lint` | Проверка ESLint |
| `npm run lint:fix` | Автоисправление ESLint |
| `npm run test:unit` | Unit-тесты (Vitest) |
| `npm run test:e2e` | E2E-тесты (Playwright) |
| `npm run test:visual` | Визуальные snapshot-тесты |
| `npm run build` | Сборка библиотеки |
| `npm run pack:dry` | Сухой прогон npm pack |
| `npm run release:dry` | Сухой прогон релиза |
| `npm run ci:validate` | Полная CI-валидация |

## Ссылки

- [README проекта](../README.md) — описание библиотеки и использование
- [CHANGELOG](../CHANGELOG.md) — история изменений
- [npm package](https://www.npmjs.com/package/@ramzes1385/rise-ui-kit)
- [GitHub](https://github.com/Ramzes1385/Rise-UI-KIT)
