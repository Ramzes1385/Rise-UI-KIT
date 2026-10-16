# Rise UI Kit — правила для Claude Code и агентов

Библиотека Vue-компонентов `@ramzes1385/rise-ui-kit`: Vue 3.5 + TypeScript, SCSS на токенах `--rise-*`, Storybook 10, Vitest 4, Playwright. Здесь — сжатые правила и команды; подробности — в `docs/` по ссылкам. Правила конкретной машины (пути, перенос кода) — в `CLAUDE.local.md` (не в git).

## Работа с владельцем

- Отчёты, документы, описания историй и тексты коммитов в теле — по-русски.
- Отчёт об итогах этапа или задачи начинается с того, что нужно от владельца (или «от тебя ничего»): это он читает первым. Дальше — сроки (оценка и факт), что сделано, коммит, проверки (команда — результат), визуальные изменения и снимки «было / стало», решения и почему. Не удалось подтвердить — так и пиши и называй, где смотрел.
- Сроки — по часам владельца (UTC+3). Первое сообщение задачи — оценка каждого этапа и всей задачи; после каждого этапа — сколько сделано, потрачено, осталось и когда будет готово; оценка выросла больше чем на 15 минут — сразу и с причиной. Работа идёт короткими порциями (45–90 мин), один коммит на порцию (docs/v2/PLAN.md, «Правила порции»).
- Решения принимай сам — лучшим вариантом для пользователей кита и приложений; трудный выбор — агенту `rise-researcher`. Каждое заметное решение (API, поведение, вид) — в отчёт с причиной.
- Работай до конца задачи без остановок: после этапа — сразу следующий, не жди слова «продолжай». Служебные сообщения (сжатие контекста, хуки, напоминания) — не повод останавливаться; остановиться — когда задача сдана или владелец сам написал «стоп».
- Не заявляй, что проверка прошла, если она не запускалась. Не называй аудит полным, если часть компонентов или направлений не проверена.
- Push, публикация пакета, deployment и `release*` — только по отдельному указанию владельца.
- Без новых зависимостей, monorepo и лишних слоёв без конкретной нужды (docs/CONTRIBUTING.md, раздел 12).

## Структура

```
src/components/<BaseX>/  ui/ model/ types/ styles/ stories/ __tests__/ index.ts
src/composables/<область>/useX/   base/ app/ overlay/ interaction/ form/ calendar/ chat/ table/ …
src/utils/<область>/xUtils/       dom/ data/ media/ form/ navigation/
src/locales/     ru/ en/ по областям, messages.ts, state.ts (formatMessage, pluralize), warn.ts
src/styles/      _tokens.scss, _mixins.scss, _functions.scss (sz())
src/stories/     Introduction.mdx, foundations/, blocks/, helpers/ (storySource, useStorySetup, play)
src/plugin/      createUiKitPlugin, registry/
build/           commitlint/ config/ husky/ lib/ media-package/ plugins/ release/ storybook/ tests/ (vitest, playwright, visual.ts) utils/
scripts/         проверки (check-*.mjs), create-component, lint-new-files, serve-storybook-static, portion-scope
docs/            CONTRIBUTING, reference/, design/, v2/, audit/
```

Подробно: docs/CONTRIBUTING.md, раздел 9. Импорт внутри кита — через алиасы с областью: `@composables/base/useDefaults`, `@utils/data/urlUtils`, `@components/BaseButton/...`.

## Ветки

- `main` — стабильные релизы, `develop` — prerelease; прямой push в обе запрещён. Рабочие ветки `feat/…`, `fix/…`, `refactor/…`, `docs/…` (CONTRIBUTING, раздел 1).
- Версия 2.0 — ветка `feat/rise-v2`, план и статус — docs/v2/PLAN.md.

## Правила кода

Источник правды — `eslint.config.js`, `package.json` → `stylelint`, `prettier`, `knip`; описание — CONTRIBUTING, раздел 11.

- **Типы** (`interface`, `type`, `enum`) — только в `types/**/*.types.ts` (кроме тестов, stories, `*.d.ts`). В `types/` нет функций и классов — только типы и константы, из которых они выводятся (`X_VARIANTS` → `XVariant`). JSDoc в types — источник описаний props/событий/слотов в Docs Storybook, он обязателен.
- **`rise/no-comments`**: в `src/components/**` (скрипты, шаблоны `.vue`, тесты, stories) комментариев нет; исключение — `types/*.types.ts`. В SCSS компонентов то же проверяет stylelint (`comment-pattern`). Описания историй — в `parameters.docs.description`.
- **`ui/**/*.vue`**: в `<script setup>` только макросы (`defineProps`, `defineEmits`, `defineSlots`, `defineExpose`), импорты и вызов composable из `model/` (`useBaseX(props, emit)`). ESLint запрещает там функции, `let`, `computed`/`ref`/`watch`/хуки и `use*` не из `model/`.
- **Пороги «чистого кода»**: `max-params` 3, `max-depth` 3, `max-nested-callbacks` 3, без вложенных тернарников, без переприсваивания параметров, без `else` после `return` — ошибки везде. `complexity` 10, `max-statements` 15, `max-lines-per-function` 50, `max-lines` 400 — ошибки в `src/components/**/model/**`, в остальном коде предупреждения; в тестах и stories размер не проверяется.
- **Новые файлы** `src/**/*.{ts,vue}` — без единого предупреждения: `npm run lint:new` (eslint `--max-warnings=0` по добавленным в индекс файлам).
- **Импорты** — «лесенкой» `perfectionist/sort-imports`: сначала стили (`import '../styles/X.style.scss'` — первая строка `<script setup>`), затем прочие side-effect, затем остальные по длине строки, при равной — по алфавиту. Расставляет `npx eslint --fix <файлы>` / `npm run lint:fix`.
- **Prettier**: табы (ширина 4), одинарные кавычки, без `;`, строка до 140, `trailingComma: all`. Документы, JSON и YAML не форматируются (`.prettierignore`).
- **Stylelint**: `stylelint-config-standard-scss`; классы по БЭМ в kebab-case (`base-button__icon--active`); ключевые слова строчными; медиа-запросы в prefix-нотации (`min-width`/`max-width`); сокращённые свойства вместо пар (`overflow`, а не `overflow-x` + `overflow-y`). Отключение — только на строку и с причиной.
- **knip** (`npm run lint:unused`): неиспользуемые файлы, экспорты, типы и зависимости удаляются.
- **Папка больше 7 файлов** — раскладывается по подпапкам по назначению (CONTRIBUTING, «Подпапки»); правило и для `src/composables`, `src/utils`.
- **Значения по умолчанию**: `withDefaults(defineProps<BaseXProps>(), kitDefaults('BaseX', { … }))` из `@composables/base/useDefaults` — каждое значение можно переопределить настройками плагина (`defaults.BaseX`, затем `defaults.global`). Пропсы после `withDefaults` описывает `PropsWithDefaults<…>`.
- **Размер**: проп `sizeScale` в процентах (по умолчанию `SIZE_SCALE_DEFAULT = 100`); `useSizeScale` ставит `--size-scale` на корень, в SCSS размеры пишутся через `sz(...)` (`src/styles/_functions.scss`).
- **Стили**: цвета, радиусы, тени, длительности — только токены `var(--rise-…)` (docs/design/DESIGN_SYSTEM.md). Миксины — `src/styles/_mixins.scss`: `transition`, `transition-colors`, `focus-ring`, `field-*`, `menu-item` и др. Анимации — внутри `@include motion-safe`, упрощение — `motion-reduce`; при `prefers-reduced-motion: reduce` токены `--rise-duration*` становятся `0.01ms`. В JS-анимациях учитывай `prefers-reduced-motion` сам.
- **Тексты интерфейса** — только из словарей `src/locales/ru/` и `src/locales/en/` (одинаковые ключи в обоих; файл до 400 строк; словарь отдельного компонента — в `src/locales/<язык>/components/`), через разделы `UI_TEXT`, `UI_ARIA`, `UI_CHAT_TEXT`… из `src/locales/messages.ts`. Подстановки — `formatMessage`, числа с подписью — `pluralize` (формы — раздел `plural`), предупреждения — `warn()` из `src/locales/warn.ts`. `npm run test:l10n` ищет тексты мимо словаря; исключения с причиной — `ALLOWED` в `scripts/check-l10n.mjs`.
- **Компоненты кита переиспользуются**: `BaseIcon`, `BaseButton`, `BaseTooltip` (HTML `title` не используется), `BaseBadge`. `vue-router` внутрь кита не импортируется. Composable, который открывает компонент (`useConfirm`), лежит в папке компонента.
- **JSDoc-заголовок модуля**: каждый модуль `src/` вне компонентов, тестов и stories начинается с однострочного `/** Composable: … */` или `/** Утилиты: … */` (CONTRIBUTING, раздел 10).
- **Новый компонент** — только `npm run create:component -- <Name> --group=<Раздел> [--kind=display|interactive|form] [--loading --empty --long] [--dry-run]`: создаёт файлы, экспорт, регистрацию в плагине и в `check-a11y-coverage`. Места `TODO(scaffold)` заполняются вручную.

## Истории Storybook

Правила — docs/design/STORIES_GUIDE.md. Коротко:

- Структура `stories/`: `BaseX.stories.ts` (meta и явный список `export const X = cases.X`), `parameters.ts`, `argTypes.ts`, `args.ts`, `shared.ts`, `cases/` — одна StoryObj на файл, по областям `appearance/ states/ content/ behavior/`.
- **«Show code» — ровно код превью** (раздел 8). У истории со своим `render` шаблон — константа, общая для `render` и `parameters.docs.source: storySource({ template, imports, models, state, types, script, vue, importsFrom })`; история без Controls — `staticStorySource(...)`; `setup` — `useStorySetup(args, { models, state, data, slots, setup })`.
- **v-model** — через `models` в `useStorySetup` (раздел 4): страница Docs не перерисовывает историю после `updateArgs`, значение меняется сразу и лишь потом уходит в Controls.
- **Состояние шаблона** — `state` (тип для кода — `types`), не `ref` в константе модуля.
- `resetAllMocksLoader` после `updateArgs` стирает вызовы шпионов `fn()`: история, которая проверяет шпионов после ввода, держит значение в `state` (docs/design/FOLLOW_UPS.md, сноска 2).
- **Остановленные часы**: `openStory` в скриншот-тестах вызывает `page.clock.setFixedTime`, и Vue пропускает обработчики на родителе. Play историй из `*.visual.spec.ts` не кликает по триггерам меню и выпадающих списков (FOLLOW_UPS № 56).
- Детерминированность: `placeholderImage()`/`STORY_IMAGES`, `STORY_TODAY`/`storyDate()`, без `Math.random()`, внешних URL, `try/catch`, inline-цветов (раздел 7).
- Проверки: `npm run test:story-source -- --group=<Раздел>`, `npm run test:stories-coverage`, `npm run test:a11y:coverage` (обязательные истории `Default`, `Disabled`, `WithError`, `Loading`, `Empty`, `LongContent`, play с клавиатурой).

## Проверки

| Что | Команда |
|---|---|
| Состав порции и команды по нему | `node scripts/portion-scope.mjs [--base=feat/rise-v2] [BaseX \| путь …]` — разделы, id историй, тесты с порогом покрытия |
| Тесты (unit и integration, jsdom) | `npx vitest run --config build/tests/vitest.config.ts --project unit-integration <пути>`; всё — `npm run test:unit` |
| Покрытие composables — 100% на файл | `npm run test:composables:coverage` (исключения — `--coverage.exclude` в самом скрипте) |
| Покрытие компонентов — 100% строк, функций и операторов на файл | `npm run test:components:coverage` (тяжёлые компоненты исключены, для них `test:components-heavy:coverage` без порога) |
| Покрытие утилит | `npm run test:utils:coverage` |
| Типы | `npx vue-tsc -b` (`npm run typecheck`) |
| Типы сборки пакета (~20 с, без записи в `dist/`) | `npx vue-tsc -p build/lib/tsconfig.lib.json --noEmit` — то же, что `build:lib:types` в `npm run build` |
| Линтеры | `npm run lint`, `npm run -s lint:new`, `npm run lint:styles`, `npm run lint:unused`, `npx prettier --check .` |
| Локали, истории, доступность | `npm run test:l10n`, `npm run test:stories-coverage`, `npm run test:a11y:coverage`, `npm run test:story-source`, `npm run test:slot-docs` |
| Контраст токенов (WCAG 2.2 AA) | `npm run test:contrast` — при правке токенов и цветов тем |
| Сборка Storybook (3–4 мин) | `npx storybook build --config-dir build/storybook -o storybook-static --quiet` |
| Прогон историй (play, axe, обе темы) | `node scripts/serve-storybook-static.mjs` (порт 6006), затем `node scripts/check-stories.mjs --url=http://localhost:6006 --filter='<regex id>' --concurrency=2` |
| E2E | `npm run test:e2e` |
| Скриншот-тесты | `npx playwright test --config build/tests/playwright.config.ts --project=visual-chromium --update-snapshots=none` |
| Сборка пакета (четыре прохода Vite: JS всех входов и подпутей, `styles.css`, `media.css` плеера, CSS подпутей и `tokens.css` — docs/reference/DEVELOPMENT.md, «Сборка») | `npm run build`, `npm run pack:dry`, затем `npm run test:css-split` — в `styles.css` нет стилей плеера, в `media.css` и `style.css` компонентов нет токенов, правила CSS подпутей = правила `styles.css`; `npm run test:subpaths` — приложение из `npm pack` с компонентом с подпути (подпуть нового компонента в exports добавляет `create:component`, вручную — `npm run generate:subpath-exports`) |
| Как в CI | `npm run ci:validate` |

- Скриншот-тесты — только с `--update-snapshots=none`. Эталоны не создаются и не обновляются (`test:visual:update` не запускать): их делает владелец. Каждое ожидаемое визуальное изменение описывается в docs/design/VISUAL_CHANGES.md.
- Для визуальных правок: собрать Storybook до изменений, снять затронутые истории дважды (отсеять недетерминированные), после — ещё раз и сравнить попиксельно; скриншоты «было / стало» — в отчёт.
- Id истории: `<раздел>-<компонент>--<история>` в kebab-case (`element-basebutton--variants`).

## Коммиты

- Conventional Commits, `build/commitlint/commitlint.config.cjs`: типы `feat fix docs style refactor perf test build ci chore revert deps`, заголовок до 100 символов, область в скобках (`feat(chat): …`). Тип определяет версию релиза (CONTRIBUTING, 3.3).
- Хуки `build/husky/`: pre-commit — `lint`, `lint:new`, `lint:styles`, `lint:unused`, `format:check` (несколько минут; в агентной среде запускай коммит в фоне и жди); commit-msg — commitlint; pre-push — `test:unit`.
- Один коммит на порцию. Переформатирование Prettier — отдельным коммитом без других правок.

## Документы — что где и когда обновлять

| Документ | Что | Когда обновлять |
|---|---|---|
| docs/v2/PLAN.md | План 2.0: порции, решения, статус | Ведёт владелец или координирующая сессия; в параллельных ветках не править |
| docs/v2/MIGRATION.md | Изменения API и поведения для приложений | При любом изменении API, DOM или поведения |
| docs/design/VISUAL_CHANGES.md | Ожидаемые визуальные изменения по компонентам | При любом изменении вида истории или снимка |
| docs/design/STORIES_GUIDE.md | Правила историй | При изменении правил историй или их помощников |
| docs/design/DESIGN_SYSTEM.md | Токены, темы, размеры, рецепты стилей | При новых токенах и правилах стилей |
| docs/design/FOLLOW_UPS.md | Открытые задачи редизайна и ограничения среды | Найденное и отложенное |
| docs/design/CHANGES_FOR_APPS.md | Что заметит приложение после редизайна | Изменения умолчаний, DOM, доступности, токенов |
| docs/CONTRIBUTING.md | Ветки, задачи, коммиты, релизы, структура, стиль кода | При изменении процесса или правил линтеров |
| docs/reference/* | Справочник компонентов, composables, утилит; DEVELOPMENT — стек и CI | Новые компоненты, composables, утилиты |
| docs/audit/* | Отчёт аудита, матрица компонентов, roadmap, план плеера | По итогам аудитов |

Дописывая MIGRATION и VISUAL_CHANGES в параллельной ветке, добавляй раздел в конец под своим заголовком — меньше конфликтов при слиянии.

## Код: подводные камни

Эти ошибки прошли линтеры и тесты, их чинили отдельными `fix`-коммитами. Разработчик проверяет их сам, ревьюер — по диффу. Новый такой случай — допиши сюда строкой.

- `npx vue-tsc -b` не проверяет сборку типов пакета: у `build/lib/tsconfig.lib.json` свои `lib` и `types`, и `.at()` (нет в `lib`) и `process` (нет типов Node) дважды ломали `build:lib:types` — после того как `vue-tsc -b` прошёл. Проверка — `npx vue-tsc -p build/lib/tsconfig.lib.json --noEmit`.
- Объект из пропсов, положенный в глубокий `ref`, становится proxy, и `===` с исходным элементом даёт `false` (BaseMegaMenu не раскрывал уровни при обычном массиве `items`). Ссылки на элементы — в `shallowRef`; в тестах — обычный массив и `markRaw`, не только `reactive`.
- Кнопка, которая отключается от собственного нажатия (предел шага: «Вперёд» на последней странице, «+» на максимуме масштаба; исчерпанная история; пустой выбор), с нативным `disabled` теряет фокус — он уходит в `body`. Такой кнопке — BaseButton `isFocusableWhenDisabled` (`aria-disabled`), нативной `<button>` — `aria-disabled` и проверка предела в обработчике. Отключение всего компонента (`isDisabled`) — нативный `disabled`.
- `aria-controls` и любая другая ссылка по id указывают только на элемент, который сейчас есть в DOM: у свёрнутого списка ссылки нет.
- Live-регион (`aria-live`, `role="status"`) озвучивает изменение, а не начальный текст: текст ставится после монтирования.
- Переход, который ждёт `transitionend`: при `prefers-reduced-motion` или нулевой длительности события не будет — сразу конечное состояние, без ожидания; при обычной анимации — страховочный таймер на случай, если событие не придёт. Всплывший `transitionend` потомка переход не завершает.
- `withDefaults` без `kitDefaults` молча отключает `defaults` из плагина: нужен тест с `createUiKitPlugin({ defaults })`.
- `:dir(rtl)` и логические свойства (`inset-inline-end`, `border-start-end-radius`…) lightningcss при цели сборки es2020 превращает в `:lang(...)`, и `dir="rtl"` их не включает: в собранном пакете такие RTL-правила мертвы, хотя в dev и тестах работают. Только `[dir='rtl'] &` и физические свойства; `:dir(` запрещён stylelint, проверка — нет `:lang(` в `dist/styles.css` и `dist/media.css` после `npm run build`.
- Больше 22 перегрузок в `defineEmits` — vue-tsc теряет типы событий (`on${Capitalize<any>}` в `$props`, ломается `Partial<$props>` в тестах). Новые события — в существующие сигнатуры с union (`'pin-message' | 'unpin-message'`), как в BaseChat.
- `findLast` и `findLastIndex`, как и `.at()`, нет в `lib` сборки пакета: в коде кита — `filter().pop()` или цикл; ловит `npx vue-tsc -p build/lib/tsconfig.lib.json --noEmit`.
- Проп-функция без значения по умолчанию не перечисляется в `kitDefaults`: `source: undefined` там превращал `props.source` в функцию-значение (умолчание пропа типа Function Vue не вызывает как фабрику) — BaseSearch, поймали тесты.
- BaseEditor: DOM области редактора меняется только в составе записанной правки (`applyEdit` или `beforeinput` после `history.capture()`). Правка мимо истории отмены (снятие заполнителей на `selectionchange`, очистка на `copy`/`cut`) даёт «пустой» Ctrl+Z, который ничего видимого не отменяет; буфер обмена — через `clipboardData`.
- `import.meta.env.DEV` при сборке кита становится `false` навсегда: предупреждения для разработчиков приложений — под `process.env.NODE_ENV !== 'production'`.
- Лишний слот в шаблоне (`<template #x>` у компонента без слота `x`) vue-tsc не ловит даже со `strictTemplates`: слоты сверяет `npm run test:slot-docs` и ревью.
- jest-dom `toHaveClass` падает на элементе из другого документа (iframe): в таких тестах — `element.classList.contains(...)`.
- `output.strictExecutionOrder` в сборке пакета заворачивает модули в обёртки инициализации, и приложение на Vite 8 при `sideEffects` пакета выбрасывает их вызов: импортированный компонент — `undefined`, хотя тесты кита и Storybook (они на исходниках) зелёные. Ловит только сборка приложения из пакета — `npm run test:subpaths` (компонент должен отрисоваться).

## Окружение: подводные камни

- Установка зависимостей — `npm ci` (по `package-lock.json`, как в CI).
- Концы строк — LF на любой машине (`.gitattributes`): с CRLF `format:check` и pre-commit падают на каждом файле. `format` и `format:check` учитывают ещё и `.git/info/exclude`, поэтому служебные папки машины в проверку не попадают.
- `npm ci` и `npm install` запускают `prepare` → husky ставит хуки из `build/husky`.
- Node `>=22.19.0` (`.nvmrc` — 22), npm `>=10.9.2`. Скрипты установки пакетов разрешаются в `package.json` → `allowScripts` (CONTRIBUTING, раздел 12).
- E2E и скриншот-тесты сами поднимают dev-сервер Storybook (`npm run storybook -- --ci`); с `PLAYWRIGHT_REUSE_SERVER=true` используют уже запущенный (`build/tests/playwright.config.ts`).
- Скрипты покрытия задают `NODE_OPTIONS=--max-old-space-size=16384`: на машине с меньшей памятью запускай тесты по путям.
- `git stash` общий для всех worktree репозитория: `stash pop` в одной папке забирает запись другой. В worktree stash не используется; сравнение с базой — временная папка `git worktree add --detach <путь> <хеш>` или `git diff > <файл>` и `git apply`.
- `docs/` попадает под правило `.gitignore`, хотя файлы отслеживаются: `git add docs` отказывает с подсказкой про `-f` — добавляй изменённые документы поимённо (`git add docs/v2/MIGRATION.md …`).

## Агенты Claude Code

Всё для Claude Code, запущенного в папке репозитория, — в `.claude/`: агенты — `agents/`, навыки (команды `/…`) — `skills/`, правила по путям — `rules/`, стиль отчётов — `output-styles/`, разрешения — `settings.json`. `.claude/` и этот файл в git не входят (`.gitignore`): bundle их не несёт, облачной сессии их нужно передавать отдельно. Поиск по коду — встроенный Explore: его чтения не занимают контекст сессии.

| Агент | Когда | Модель |
|---|---|---|
| `rise-component-dev` | основной код по задаче порции, когда понятно, что делать | как у сессии |
| `rise-test-writer` | тесты к готовому коду, покрытие 100% на файл; код и истории не меняет | как у сессии |
| `rise-storybook` | истории, «Show code», play, доступность в историях, визуальные изменения; код и unit-тесты не меняет | как у сессии |
| `rise-checker` | конец порции и перед коммитом: проверки затронутого, отчёт без логов | sonnet |
| `rise-reviewer` | после OK от `rise-checker`: независимое ревью диффа, ничего не правит | как у сессии, effort high |
| `rise-docs` | документация, сверенная с кодом; код не меняет | как у сессии, effort medium |
| `rise-researcher` | трудный выбор: лучшее решение по стандартам и практикам других библиотек, с источниками и поручением; код не меняет | как у сессии, effort high |

| Навык | Что делает |
|---|---|
| `/portion <задача>` | порция конвейером: код → тесты и истории параллельно → проверки → ревью → один коммит, со сроками |
| `/new-component <Name> <Раздел> [вид]` | заготовка `create:component` и её заполнение тем же конвейером |
| `/check [состав]` | проверки агентом `rise-checker` |
| `/review [база]` | ревью агентом `rise-reviewer` |
| `/orchestra` | сводка облачной оркестровки на компьютере владельца: сессии, сроки, вопросы |

- Правила по путям: `rules/tests.md` — для тестов, `rules/orchestration.md` — служебные папки оркестровки. Стиль отчётов — `/output-style Rise`.
- Модель и effort агента подбираются под цену ошибки. Прогон проверок и чтение логов — sonnet: ошибку там видно сразу. Ревью и исследование — модель сессии с effort high: там скрытые крайние случаи. Разработчик, тесты и истории — effort сессии, его владелец ставит `/effort` под сложность задачи.

- Задача из многих независимых частей — по субагенту на часть, доказательства проверять, итог одной таблицей.
- Агент не видит историю чата: в задаче — ЦЕЛЬ, КОНТЕКСТ (порция плана), ФАЙЛЫ или компоненты, БАЗА (ветка), ГОТОВО КОГДА.
- FAIL от `rise-checker` — исправить и запустить снова; после двух кругов — разобрать причину с `rise-researcher` и записать решение в отчёт.
- Сессия не видит этих агентов (репозиторий склонирован в подпапку после её старта) — запусти `general-purpose`: текст файла агента после шапки плюс задача, модель — из поля `model`.
