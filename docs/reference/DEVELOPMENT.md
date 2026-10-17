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
- **Ключ Яндекс Карт для историй BaseMap:** скопируйте `.env.example` в `.env.local` (файл в `.gitignore`), впишите `STORYBOOK_YANDEX_MAPS_API_KEY=<ключ>` и перезапустите `npm run storybook` — истории BaseMap покажут живую карту (Default на холсте и в рамке на странице Docs; Variants, Sizes, Providers, Seo, Navigation, ClickToAdd, Theming, Heights, Language, OfficeList — на холсте; Markers и прочие интерактивные без ключа работают на демо-поставщике). Без ключа — заглушка с подсказкой. В кабинете разработчика Яндекса у ключа должно быть заполнено «Ограничение по HTTP Referer» (для Storybook — `localhost`, без порта и схемы): JS API 3.0 работает только с такими ключами, иначе у продукта JavaScript API статус «Не настроен» и история показывает «Карта не загрузилась»; изменения в кабинете применяются через 15–60 минут. Ключ читает только dev-сервер: в статическую сборку (`build-storybook`), скриншот-тесты и `check-stories` он не попадает. Подробности — [design/STORIES_GUIDE.md](../design/STORIES_GUIDE.md), «Задача storybook-yandex-key».
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
| `npm run test:fuzz -- --iterations=50000` | долгий фаззинг XSS (`build/tests/fuzz`): `sanitizeHtml`, Markdown, адреса, SVG, JSON-LD и компоненты с пользовательским текстом; флаги `--seed`, `--target`, `--only=<цель>:<номер>` (повтор одной итерации), `--report=<файл>`. В CI и по расписанию не запускается (обычный `test:unit` гоняет те же файлы с малым числом итераций, до 10 секунд); запускайте перед релизом и после правок `htmlUtils`, `urlUtils`, Markdown, редактора |
| `npm run test:slot-docs` | у каждого слота есть описание в JSDoc |
| `npm run test:stories` | все истории в светлой и тёмной теме: рендер, play-проверки, ошибки консоли, axe. Нужен Storybook на порту 6006: `npm run storybook` или собранный — `npm run build-storybook` и `node scripts/serve-storybook-static.mjs` |
| `npm run test:stories-coverage`, `test:a11y:coverage` | у каждого компонента есть обязательные истории и проверка клавиатуры |
| `npm run test:contrast` | контраст пар токенов «текст/фон» в обеих темах |
| `npm run test:e2e` | e2e в Chromium (Playwright) против Storybook; без `PLAYWRIGHT_REUSE_SERVER=true` Playwright сам запускает Storybook |
| `npm run test:visual` | скриншоты против эталонов; эталоны не обновляются автоматически — их создают после просмотра изменений (в CI — по метке `visual:update-baselines` у PR) |
| `npm run test:subpaths` | точечная установка: exports подпутей совпадают со списком компонентов (`npm run generate:subpath-exports` их переписывает), приложение Vite из `npm pack` с BaseButton / BaseSelect с подпути получает только их JS и CSS, снимки совпадают с импортом из корня (`--no-screenshot` — без Chromium); резолвер, `global.d.ts` и модуль Nuxt из tarball совпадают с exports. Нужна сборка |
| `npm run test:autoimport` | автоимпорт на пакете из `npm pack` с пакетами из реестра npm (сеть, ≈2,5 мин; не в `ci:validate`): Vite + `unplugin-vue-components` с `RiseUiResolver`, `vue-tsc` (опечатка в пропе), Nuxt (SSR, токены, тема), Playwright. Флаги `--no-nuxt`, `--no-screenshot`, `--keep`. Нужна сборка |
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
dist/resolver.js       # /resolver — RiseUiResolver для unplugin-vue-components (без кода компонентов)
dist/nuxt.js           # /nuxt — модуль Nuxt; рядом nuxt-plugin.js — его runtime-плагин (в exports нет)
dist/global.d.ts       # /global — GlobalComponents для шаблонов (пишет основной проход сборки)
dist/chunks/           # общие части (по набору входов, которым они нужны); данные эмодзи грузятся отдельным файлом при первом показе
dist/components/<Имя>/index.js   # подпуть /<Имя>: импорт CSS компонента и того, что он использует, и реэкспорт из chunks/
dist/components/<Имя>/style.css  # собственные стили папки компонента, без токенов
dist/tokens.css        # токены, темы, движение, база шрифта — для подпутей: /tokens.css
dist/tokens.layer.css  # то же в слое rise: /tokens.layer.css
dist/styles.css        # стили и токены: /styles и /styles.css
dist/styles.layer.css  # то же в слое rise: /styles.layer.css
dist/media.css         # стили видеоплеера без токенов: /media.css (подключается после styles.css)
dist/media.layer.css   # то же в слое rise: /media.layer.css
dist/icons.svg         # спрайт иконок: /icons.svg
dist/tokens.json       # токены в формате W3C Design Tokens: /tokens.json
dist/tokens/<тема>.<режим>.json   # темы rise, corporate, playful, minimal в светлом и тёмном режиме: /tokens/*.json
dist/**/*.d.ts         # типы
```

Сборка JS и CSS — четыре прохода Vite и пятый шаг (`build:lib:js`; шаг `build:lib:tokens` пишет `dist/tokens.json` и `dist/tokens/*.json`: `scripts/build-tokens.mjs`, `build/tokens/`, [DESIGN_TOKENS.md](../design/DESIGN_TOKENS.md)); проходы Vite: основной `build/lib/vite.lib.config.ts` (JS всех входов и подпутей, спрайт; обычный ESM — код по чанкам делит rolldown по набору входов), `vite.styles-css.config.ts` (`styles.css` — граф входов и группы `lazy-*` как до подпутей, поэтому порядок правил прежний), `vite.media-css.config.ts` (`media.css`) и `vite.subpath-css.config.ts` (`components/<Имя>/style.css` и `tokens.css`: токены, которые prelude кладёт в каждый стиль, отрезаются по метке, `build/plugins/subpathCss.ts`). Вход подпути импортирует CSS папок компонентов, которые он использует, в порядке выполнения модулей (`build/plugins/subpaths.ts`); список подпутей — реэкспорты `src/components/index.ts` (`build/config/subpaths.ts`). `npm run test:css-split` сверяет: правила `tokens.css` + всех `style.css` — ровно правила `styles.css` (кроме 3D-карты, у неё нет подпути).

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
