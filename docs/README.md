# Документация Rise UI Kit

Эта папка содержит документацию по разработке и ведению проекта.

## Содержание

| Документ | Описание |
|---|---|
| [reference/COMPONENTS.md](./reference/COMPONENTS.md) | Справочник компонентов: назначение, основные props и события, примеры |
| [reference/COMPOSABLES.md](./reference/COMPOSABLES.md) | Composables кита и примеры |
| [reference/UTILS.md](./reference/UTILS.md) | Утилиты кита и примеры |
| [reference/MAP3D.md](./reference/MAP3D.md) | 3D-карта этажей, вход `/map3d`: установка `three`, данные, модели GLB, доступность, фолбэк |
| [reference/DEVELOPMENT.md](./reference/DEVELOPMENT.md) | Разработка: стек, структура, Storybook, проверки, сборка, CI |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Полное руководство по ведению репозитория: ветки, задачи, коммиты, PR, релизы, заготовка нового компонента |
| [v2/PLAN.md](./v2/PLAN.md) | План версии 2.0: порции работы, решения, статус |
| [v2/MIGRATION.md](./v2/MIGRATION.md) | Переход на 2.0: что меняется для приложения (пополняется по порциям) |
| [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) | Дизайн-система: токены `--rise-*`, темы, размеры, правила и рецепты стилей компонентов |
| [design/DESIGN_TOKENS.md](./design/DESIGN_TOKENS.md) | Токены в формате W3C Design Tokens: файлы, имена, значения, Figma (Tokens Studio) и Style Dictionary |
| [design/STORIES_GUIDE.md](./design/STORIES_GUIDE.md) | Как писать stories: структура, argTypes, v-model, play-проверки, visual/e2e |
| [design/VISUAL_CHANGES.md](./design/VISUAL_CHANGES.md) | Визуальные изменения редизайна по компонентам (объяснение нового baseline) |
| [design/CHANGES_FOR_APPS.md](./design/CHANGES_FOR_APPS.md) | Что заметит приложение после редизайна: значения по умолчанию, DOM, доступность, токены |
| [design/FOLLOW_UPS.md](./design/FOLLOW_UPS.md) | Что осталось после редизайна: открытые задачи с типом изменения и объёмом |
| [design/contrast.md](./design/contrast.md) | Контраст пар токенов в обеих темах (генерируется `npm run test:contrast -- --markdown …`) |
| [audit/REPORT.md](./audit/REPORT.md) | Отчёт аудита UI Kit: подтверждённые проблемы, исправления, открытые вопросы, проверки |
| [audit/COMPONENT_MATRIX.md](./audit/COMPONENT_MATRIX.md) | Матрица компонентов: API, состояния, доступность, тесты, Storybook |
| [audit/ROADMAP.md](./audit/ROADMAP.md) | План развития по итогам аудита |
| [audit/MEDIA_PLAYER_PLAN.md](./audit/MEDIA_PLAYER_PLAN.md) | Архитектура собственного аудио/видеоплеера |

## Быстрый старт

```bash
# Установка зависимостей по package-lock.json
npm ci

# Разработка: Storybook (отдельного демо-приложения нет)
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
│   ├── icons/            # Иконки
│   ├── styles/           # Дизайн-токены (_tokens.scss), миксины, функция sz()
│   └── stories/          # Storybook: Introduction, Foundations, хелперы stories
├── build/                # Конфигурация сборки и инструментов
│   ├── commitlint/       # правила сообщений коммитов
│   ├── config/           # общие части Vite-конфигов: алиасы, SCSS, сборка библиотеки
│   ├── husky/            # git-хуки
│   ├── lib/              # Vite конфиг для библиотеки
│   ├── packages/         # заготовки отдельных пакетов: плеер, карты, редактор
│   ├── plugins/          # Vite-плагины: Vue, SVG, спрайт иконок
│   ├── release/          # semantic-release конфиги
│   ├── storybook/        # конфигурация Storybook
│   ├── tests/            # Vitest и Playwright конфиги, тесты пакета целиком
│   └── utils/            # вспомогательные функции сборки
├── docs/                 # Документация (эта папка)
├── scripts/              # Вспомогательные скрипты
└── .github/workflows/    # GitHub Actions
```

## Полезные команды

| Команда | Описание |
|---|---|
| `npm run lint` | Проверка ESLint |
| `npm run typecheck` | Проверка типов исходников и тестов (vue-tsc) |
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
