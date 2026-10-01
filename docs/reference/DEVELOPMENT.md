# Разработка

Как устроен репозиторий, как запустить Storybook, тесты и сборку. Ветки, коммиты, pull request и релизы — [CONTRIBUTING.md](../CONTRIBUTING.md), разделы 1–8; структура компонента, правила кода и линтеры — разделы 9–12.

---

## Стек

| Задача | Инструменты |
|---|---|
| Компоненты | Vue 3.5, TypeScript 6, Sass (SCSS), CSS-переменные `--rise-*` |
| Сборка | Vite 8 в режиме библиотеки, lightningcss, `vue-tsc` для типов |
| Разработка и документация | Storybook 10 |
| Тесты | Vitest 4 (jsdom), Playwright (e2e, скриншоты, прогон историй с axe) |
| Качество кода | ESLint, Stylelint, Prettier, knip, Husky, commitlint |
| Выпуск | Conventional Commits, semantic-release, GitHub Actions, npm Trusted Publisher |

---

## Структура пакета

```txt
src/
  components/      # UI-компоненты: index.ts, ui/, types/, model/, styles/, stories/, __tests__/
  composables/     # Vue composables: useX.ts, types/, __tests__/
  icons/           # SVG-иконки, спрайт и createIconPlugin
  locales/         # словари ru и en
  stories/         # вводная страница и Foundations в Storybook, хелперы stories
  styles/          # глобальные стили и токены
  utils/           # утилиты
  plugin/          # Vue-плагин createUiKitPlugin
  index.ts         # главный публичный API
```

Типы лежат в `types/` своей папки, тесты — в `__tests__`; тесты пакета целиком (границы входов, плагин, структура) — в `build/tests/`.

```txt
build/
  config/          # общие части Vite-конфигов: алиасы, SCSS, сборка библиотеки
  plugins/         # Vite-плагины: Vue, SVG, спрайт иконок
  utils/           # вспомогательные функции сборки
  lib/             # сборка npm-библиотеки
  storybook/       # конфигурация Storybook
  tests/           # Vitest, Playwright
  husky/           # git-хуки
  release/         # semantic-release
  commitlint/      # правила сообщений коммитов

dist/              # результат сборки библиотеки
```

---

## Установка и Storybook

```bash
npm install
npm run storybook
```

Отдельного демо-приложения нет: компоненты разрабатываются и проверяются в Storybook (порт 6006).

- **Разделы:** Introduction, Foundations (цвета, типографика, радиусы и тени, размеры, темы), Blocks (готовые экраны из компонентов: вход, регистрация, настройки), Element, Form, Data, Navigation, Layout, Overlay, Chat, Editor, Media.
- **Тема** переключается кнопкой «Тема» на панели инструментов; для ссылок и скриншотов — параметр `&globals=theme:dark`.
- **Stories каждого компонента** устроены одинаково: `Default` (песочница с рабочим v-model) → варианты, размеры, кастомный цвет → состояния → сценарии → `Keyboard`. Правила — [design/STORIES_GUIDE.md](../design/STORIES_GUIDE.md).
- Описания props из JSDoc попадают во вкладку Docs: в `build/storybook/main.ts` плагин `vite:vue` подключается раньше docgen-плагина Storybook (при обратном порядке описания молча терялись).
- Новый компонент — `npm run create:component -- InputNumber --group=Form --kind=form` (CONTRIBUTING, раздел 3.2).

---

## Проверки

| Команда | Что проверяет |
|---|---|
| `npm run lint`, `lint:styles`, `lint:unused`, `format:check` | ESLint, Stylelint, неиспользуемый код (knip), Prettier |
| `npm run typecheck` | типы исходников, тестов, stories и конфигов сборки (`vue-tsc -b`) |
| `npm run test:unit` | unit- и интеграционные тесты (Vitest, jsdom); один файл — `npm run test:unit -- src/components/BaseChat/__tests__/ChatInput.spec.ts` |
| `npm run test:components:coverage`, `test:composables:coverage`, `test:utils:coverage` | те же тесты с порогом покрытия 100% на файл |
| `node scripts/portion-scope.mjs [--base=feat/rise-v2] [--json] [BaseX \| путь …]` | состав порции — что изменилось относительно базы; разделы и id историй; команды тестов с порогом покрытия по путям (пороги и исключения — из `test:*:coverage`) |
| `npx vue-tsc -p build/lib/tsconfig.lib.json --noEmit` | типы сборки пакета — то же, что `build:lib:types`, без записи в `dist/` |
| `npm run test:slot-docs` | у каждого слота есть описание в JSDoc |
| `npm run test:stories` | все истории в светлой и тёмной теме: рендер, play-проверки, ошибки консоли, axe. Нужен Storybook на порту 6006: `npm run storybook` или собранный — `npm run build-storybook` и `node scripts/serve-storybook-static.mjs` |
| `npm run test:stories-coverage`, `test:a11y:coverage` | у каждого компонента есть обязательные истории и проверка клавиатуры |
| `npm run test:contrast` | контраст пар токенов «текст/фон» в обеих темах |
| `npm run test:e2e` | e2e в Chromium (Playwright) против Storybook; без `PLAYWRIGHT_REUSE_SERVER=true` Playwright сам запускает Storybook |
| `npm run test:visual` | скриншоты против эталонов; эталоны не обновляются автоматически — их создают после просмотра изменений (в CI — по метке `visual:update-baselines` у PR) |
| `npm run ci:validate` | базовая проверка перед push: линтеры, форматирование, типы, unit-тесты, сухая сборка пакета |

---

## Сборка

```bash
npm run build:lib   # или npm run build
npm run pack:dry    # сборка и список файлов, которые попадут в npm-пакет
```

Результат:

```txt
dist/index.js          # корень пакета: компоненты, плагин, сервисы приложения, словари
dist/components.js     # подпуть /components
dist/composables.js    # /composables
dist/utils.js          # /utils
dist/icons.js          # /icons
dist/media.js          # /media — видеоплеер
dist/chunks/           # общие части; данные эмодзи грузятся отдельным файлом при первом показе
dist/styles.css        # стили и токены: /styles и /styles.css
dist/icons.svg         # спрайт иконок: /icons.svg
dist/**/*.d.ts         # типы
```

Локальный пакет для проверки в приложении:

```bash
npm run build:lib
npm pack
# в тестовом проекте
npm install ../Rise-UI-KIT/ramzes1385-rise-ui-kit-x.y.z.tgz
```

---

## CI

`.github/workflows/ci.yml` на push и pull request в `main` и `develop`:

- **Lint & Types** — линтеры, форматирование, типы, сборка библиотеки;
- **Stories & A11y Coverage** — обязательные истории и проверки клавиатуры;
- **Stories Run** — все истории в двух темах (рендер, play, axe) и контраст токенов;
- **Unit & Integration** — тесты с порогом покрытия 100% на файл для компонентов, composables и utils;
- **E2E & Visual Regression** — e2e и скриншоты против собранного Storybook.

`deploy-storybook.yml` публикует Storybook на GitHub Pages после push в `main`, `release.yml` выпускает пакет (см. ниже).

---

## Коммиты и релизы

Версию, CHANGELOG, тег, GitHub Release и публикацию в npm делает semantic-release в CI после merge в `main` (prerelease — из `develop`), если в настройках репозитория включена переменная `ENABLE_RELEASE`. Вручную `npm version`, `git tag` и `npm publish` не выполняются. Формат коммитов и их влияние на версию — [CONTRIBUTING.md](../CONTRIBUTING.md), раздел 3.3; проверка перед push — раздел 3.4; релизы — раздел 5.
