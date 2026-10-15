# Руководство по ведению репозитория

Этот документ описывает полный рабочий цикл: от создания задачи до публикации релиза.

---

## 1. Структура веток

```
main          ← стабильные релизы (v1.3.0, v1.4.0, ...)
  ↑
develop       ← prerelease (v1.3.0-dev.1, v1.3.0-dev.2, ...)
  ↑
feat/...      ← feature-ветки
fix/...       ← исправления
refactor/...  ← рефакторинг
docs/...      ← документация
```

### Правила

| Ветка | Назначение | Прямой push |
|---|---|---|
| `main` | Стабильные релизы на npm | Запрещён. Только через PR из `develop`. |
| `develop` | Накопление изменений, prerelease | Запрещён. Только через PR из feature-веток. |
| `feat/*`, `fix/*`, `refactor/*`, `docs/*` | Работа над задачей | Разрешён. После завершения — PR в `develop`. |

### Именование веток

```
feat/sidebar-disclosure-groups
fix/sidebar-footer-collapsed-mode
refactor/sidebar-navigation-types
docs/update-contributing-guide
```

Формат: `тип/краткое-описание-через-дефис`. Без пробелов, без кириллицы, без спецсимволов.

---

## 2. Создание задач (GitHub Issues)

### Когда создавать Issue

- Новая функциональность (компонент, фича, API)
- Баг, который нужно исправить
- Рефакторинг, который затрагивает несколько файлов
- Улучшение документации или тестов

Не нужно создавать Issue для:
- Опечаток в комментариях
- Мелких правок форматирования
- Быстрых фиксов в одну строку

### Формат Issue

**Заголовок:** краткий, конкретный, начинается с глагола или существительного.

```
feat: добавить disclosure-группы в BaseSideBar
fix: footer исчезает в collapsed mode
refactor: вынести типы BaseSideBar в отдельный файл
```

**Описание:**

```markdown
## Контекст
Кратко опиши, зачем это нужно и какую проблему решает.

## Что нужно сделать
- [ ] Пункт 1
- [ ] Пункт 2
- [ ] Пункт 3

## Критерии готовности
- [ ] Компонент работает по спецификации
- [ ] Unit-тесты написаны и проходят
- [ ] E2E-тесты написаны и проходят
- [ ] Lint проходит
- [ ] Build проходит
- [ ] Storybook story добавлена

## Связанные файлы
- `src/components/BaseSideBar/ui/BaseSideBarNavigation.vue`
- `src/components/BaseSideBar/styles/BaseSideBar.style.scss`
```

### Labels

Используй labels для классификации:

| Label | Когда использовать |
|---|---|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `refactor` | Рефакторинг без изменения поведения |
| `docs` | Документация |
| `test` | Тесты |
| `chore` | Обслуживание, зависимости, конфиги |
| `breaking` | Breaking change |
| `good first issue` | Простая задача для начала |

---

## 3. Выполнение задач

### 3.1. Начало работы

```bash
# Переключись на develop и обнови
git checkout develop
git pull origin develop

# Создай feature-ветку
git checkout -b feat/sidebar-disclosure-groups
```

### 3.2. Разработка

Работай в своей ветке. Коммить часто, но осмысленно.

```bash
# Добавь файлы в staging
git add src/components/BaseSideBar

# Закоммить с conventional commit сообщением
git commit -m "feat: add disclosure groups to BaseSideBarNavigation"
```

#### Новый компонент

Заготовку создаёт скрипт: раскладывает файлы по структуре библиотеки и регистрирует компонент.

```bash
npm run create:component -- Kbd --group=Element
npm run create:component -- InputNumber --group=Form --kind=form --long
```

| Параметр | Значение |
|---|---|
| `--group` | Раздел Storybook из `storySort` в `build/storybook/preview.ts` |
| `--kind` | `display` (по умолчанию) — отображение; `interactive` — кнопкоподобный элемент с `click` и `isDisabled`; `form` — поле с подписью, v-model, `isDisabled` и `error` |
| `--variants` | Варианты оформления через запятую, по умолчанию `default,soft,outline,ghost` |
| `--loading`, `--empty`, `--long` | Включить проверку состояний Loading, Empty, LongContent и создать заготовки этих stories |
| `--dry-run` | Показать, что будет создано, ничего не записывая |

Скрипт создаёт `index.ts`, типы `types/BaseX.types.ts`, компонент и его логику `model/useBaseX.ts`, стили, stories (по файлам, как в разделе «Stories»), unit-, integration- и visual-тесты. Экспорт добавляется в `src/components/index.ts`, регистрация — в `src/plugin/registry/components.ts`, имя компонента — в наборы `scripts/check-a11y-coverage.mjs`.

Заготовка сразу проходит lint, проверку типов, тесты с покрытием 100% и прогон stories в обеих темах. Назначение, размеры и различия вариантов автор описывает сам: эти места помечены `TODO(scaffold)`, и `npm run test:a11y:coverage` не пройдёт, пока метки остаются.

### 3.3. Conventional Commits

Каждый коммит должен следовать формату (его проверяет commitlint в git-хуке `commit-msg`, правила —
`build/commitlint/commitlint.config.cjs`; описание начинается со строчной буквы):

```
тип(scope): описание

[body]

[footer]
```

#### Типы коммитов и их влияние на релиз

| Тип | Релиз | Описание |
|---|---|---|
| `feat` | **minor** (1.2.0 → 1.3.0) | Новая функциональность |
| `fix` | **patch** (1.2.0 → 1.2.1) | Исправление бага |
| `perf` | **patch** | Улучшение производительности |
| `refactor` | **patch** | Рефакторинг без изменения поведения |
| `build` | **patch** | Изменения в сборке |
| `deps` | **patch** | Обновление зависимостей |
| `docs` | без релиза | Документация |
| `test` | без релиза | Тесты |
| `chore` | без релиза | Обслуживание |
| `ci` | без релиза | CI/CD |
| `style` | без релиза | Форматирование |

#### Breaking change

Для breaking change добавь `!` после типа или `BREAKING CHANGE:` в footer:

```
feat!: redesign BaseSideBar items API

BREAKING CHANGE: items prop теперь требует обязательное поле key.
Миграция: добавь key к каждому элементу в массиве items.
```

Это вызовет **major** релиз (1.2.0 → 2.0.0).

#### Примеры хороших коммитов

```
feat: add collapsible sidebar groups
fix: sidebar footer disappears in collapsed mode
refactor: extract navigation types to separate file
test: add disclosure group unit tests
docs: update CONTRIBUTING.md with release workflow
chore: update eslint to v10
ci: add develop branch to release workflow
```

#### Примеры плохих коммитов

```
wip                          ← нет типа, непонятно что сделано
update                       ← нет типа, нет контекста
fix                          ← нет описания, что именно исправлено
feat: stuff                  ← описание не несёт смысла
feat: add component          ← какой компонент?
```

### 3.4. Локальная проверка перед push

```bash
# 1. Lint, стили, неиспользуемый код и форматирование
npm run lint
npm run lint:styles
npm run lint:unused
npm run format:check

# 2. Unit-тесты (для конкретного компонента)
npm run test:unit -- src/components/BaseSideBar

# 3. E2E-тесты
npm run test:e2e -- src/components/BaseSideBar

# 4. Build и храповики (размер пакета, исключения покрытия, предупреждения ESLint — ниже)
npm run build
npm run test:css-split
npm run test:ratchets

# 5. Базовая CI-валидация: lint, стили, неиспользуемый код, форматирование, типы, unit-тесты, сухая сборка пакета, разбиение CSS, храповики
#    (пороги покрытия, stories/a11y-гейты и e2e/visual CI запускает отдельными job)
npm run ci:validate

# 6. Сухой прогон релиза (покажет будущую версию без publish)
npm run release:dry
```

Если что-то падает — исправь **до** push. Не коммить с падающими тестами.

#### Храповики и бюджет размера

`npm run test:ratchets` (`scripts/check-ratchets.mjs`) сверяет три числа с базой `build/ratchets.json`; шаг есть в `ci:validate` и в CI (job «Lint & Types», после сборки):

| Что | Правило |
|---|---|
| Размер каждого входа пакета (`exports` в `package.json`: `index.js`, `components.js`, …, `styles.css`, `media.css`, `icons.svg`) в gzip — файл входа вместе с чанками, которые он подгружает статическими `import`; динамические `import()` не считаются | не больше бюджета (`size.<вход>.budget`); нужна свежая сборка `npm run build` |
| Число `--coverage.exclude` в каждом скрипте `test:*:coverage` | не больше базы (`coverageExcludes`); у нового скрипта база — 0 |
| Число предупреждений `eslint "src/**/*.{ts,vue}"` — то же, что `npm run lint` | не больше базы (`lintWarnings`) |

- Исключения покрытия и предупреждения ESLint — храповик: число может только уменьшаться. Убрал исключение или предупреждения — опусти базу: `npm run test:ratchets -- --update` (поднять её флаг не может) и закоммить `build/ratchets.json`.
- Размер — бюджет: текущий размер плюс запас 10% (не меньше 1 КБ). Почти каждая задача с кодом увеличивает пакет, запас это принимает. Превысил бюджет — сначала облегчи код; поднимать бюджет — осознанное решение: `npm run build && npm run test:ratchets -- --reset-size-budget` (бюджет = текущий размер + запас) и строка с причиной в журнале решений.
- `--lint-report=<файл>` — взять готовый JSON-отчёт ESLint (`--format json`) вместо своего прогона.

### 3.5. Push и создание PR

```bash
# Пуш feature-ветки
git push -u origin feat/sidebar-disclosure-groups
```

Затем через GitHub UI:

1. Открой репозиторий на GitHub
2. Нажми **Compare & pull request** (появится автоматически после push)
3. Или: **Pull requests → New pull request → feat/sidebar-disclosure-groups → develop**

---

## 4. Pull Request

### Формат PR

**Заголовок:** совпадает с главным коммитом (conventional commit).

```
feat: add collapsible sidebar groups
```

**Описание:**

```markdown
## Что сделано
- Добавлены disclosure-группы в BaseSideBarNavigation
- Группы с `to` продолжают работать как ссылки
- Collapsed mode не показывает children
- Footer не исчезает из DOM при collapsed mode

## Связанные Issue
Closes #42

## Чек-лист
- [ ] Unit-тесты добавлены и проходят
- [ ] E2E-тесты добавлены и проходят
- [ ] Lint проходит
- [ ] Build проходит
- [ ] Storybook story добавлена/обновлена
- [ ] Нет breaking changes (или описаны в описании)
```

### Merge-стратегия

| Куда мержим | Стратегия | Почему |
|---|---|---|
| feature → `develop` | **Squash merge** | Все коммиты ветки схлопываются в один чистый коммит. |
| `develop` → `main` | **Squash merge** | Один коммит на релиз. Чистая история. |

Squash merge гарантирует, что semantic-release видит один коммит с правильным conventional commit сообщением.

### После merge

- Feature-ветка удаляется автоматически (настройка `Automatically delete head branches`).
- CI запускает workflow:
  - Merge в `develop` → semantic-release публикует prerelease `v1.3.0-dev.1`
  - Merge в `main` → semantic-release публикует стабильный релиз `v1.3.0`

---

## 5. Релизы

### Как работает semantic-release

semantic-release анализирует коммиты между последним тегом и HEAD:

```
v1.2.0 ── fix: ... ── feat: ... ── docs: ... ── HEAD
                          ↑
                    определяет minor
                    → v1.3.0
```

Если все коммиты `docs:`, `test:`, `chore:` — релиз **не выпустится**.

### Настройка репозитория

Workflow `.github/workflows/release.yml` запускается при push в `main` и `develop`, но выпускает релиз, только если
в GitHub задана переменная `ENABLE_RELEASE=true`: Settings → Secrets and variables → Actions → Variables.

Публикация в npm — через npm Trusted Publisher (у workflow есть `id-token: write`, provenance включён): токен
не нужен, а `GITHUB_TOKEN` GitHub создаёт сам. Без Trusted Publisher добавьте секрет `NPM_TOKEN`
(Settings → Secrets and variables → Actions → Secrets). Реальные значения и `.env` в репозиторий не коммитятся.

### Автоматические действия при релизе

semantic-release выполняет:

1. Определяет новую версию на основе коммитов
2. Создаёт git-тег `v1.3.0`
3. Обновляет `CHANGELOG.md`
4. Обновляет `version` в `package.json`
5. Коммитит изменения: `chore(release): 1.3.0 [skip ci]`
6. Публикует пакет на npm
7. Создаёт GitHub Release с notes

### Релиз-ветки

| Ветка | Результат | npm tag |
|---|---|---|
| `main` | `v1.3.0` (стабильный) | `latest` |
| `develop` | `v1.3.0-dev.1` (prerelease) | `dev` |

### Цикл релиза

```
1. Накопление фичей в develop (каждая фича → prerelease dev.N)
2. Когда накоплено достаточно изменений для релиза:
   PR: develop → main
3. Merge → стабильный релиз v1.3.0
4. Продолжаем работу в develop
```

### Ручные действия — ЗАПРЕЩЕНЫ

```bash
# НЕ ДЕЛАЙ ЭТОГО:
npm version patch          # semantic-release управляет версиями
npm version minor          # конфликт тегов
npm version major          # сломает CI
npm publish                # semantic-release публикует автоматически
git tag v1.3.0             # дубликат тега сломает CI
git push --force origin main  # заблокировано protection rules
```

---

## 6. Полный цикл задачи — пример

### Задача: добавить disclosure-группы в BaseSideBar

```bash
# 1. Создай Issue на GitHub
#    Заголовок: feat: добавить disclosure-группы в BaseSideBar
#    Labels: feat

# 2. Начни работу
git checkout develop
git pull origin develop
git checkout -b feat/sidebar-disclosure-groups

# 3. Работай, коммить
git add src/components/BaseSideBar
git commit -m "feat: add disclosure groups to BaseSideBarNavigation"

git add src/components/BaseSideBar/__tests__
git commit -m "test: add disclosure group unit and e2e tests"

# 4. Проверь локально
npm run ci:validate
npm run release:dry

# 5. Пуш
git push -u origin feat/sidebar-disclosure-groups

# 6. Создай PR: feat/sidebar-disclosure-groups → develop
#    Заголовок: feat: add disclosure groups to BaseSideBar
#    Описание: что сделано, чек-лист, ссылка на Issue

# 7. CI проходит → Squash merge в develop
#    semantic-release: v1.3.0-dev.1 опубликован

# 8. Когда готов стабильный релиз:
#    PR: develop → main
#    Squash merge
#    semantic-release: v1.3.0 опубликован на npm
```

---

## 7. Чек-листы

### Перед созданием PR

- [ ] Все коммиты следуют Conventional Commits
- [ ] `npm run lint`, `npm run lint:styles`, `npm run lint:unused` и `npm run format:check` проходят без ошибок
- [ ] `npm run typecheck` проходит (типы исходников и тестов)
- [ ] `npm run test:unit` проходит
- [ ] `npm run test:e2e` проходит (если затронуты компоненты с e2e)
- [ ] `npm run build` проходит
- [ ] Storybook story добавлена или обновлена (если изменён компонент)
- [ ] Нет `console.log`, закомментированного кода, TODO без Issue
- [ ] `withDefaults` используется для дефолтных значений props (не `computed` fallback)
- [ ] Нет HTML `title` атрибутов (используй `BaseTooltip`)
- [ ] Нет прямого импорта `vue-router`
- [ ] UI Kit компоненты переиспользуются (`BaseIcon`, `BaseBadge`, `BaseButton`, `BaseTooltip`)

### Перед merge develop → main

- [ ] Все запланированные фичи замержены в `develop`
- [ ] `npm run release:dry` показывает ожидаемую версию
- [ ] CHANGELOG будет корректным (проверь через `release:dry`)
- [ ] Нет незавершённых PR в `develop`

### После релиза

- [ ] Проверь npm: пакет опубликован с правильной версией
- [ ] Проверь GitHub Releases: release notes созданы
- [ ] Проверь CHANGELOG.md: записи добавлены
- [ ] Обнови тестовое приложение (если есть) на новую версию

---

## 8. Горячие исправления (Hotfix)

Если в `main` найден критический баг, а в `develop` уже есть незавершённые фичи:

```bash
# 1. Создай ветку от main
git checkout main
git pull origin main
git checkout -b fix/critical-sidebar-crash

# 2. Исправь
git add .
git commit -m "fix: prevent sidebar crash on empty items"

# 3. PR: fix/critical-sidebar-crash → main
#    Squash merge → semantic-release: v1.3.1

# 4. Замержи фикс обратно в develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

---

## 9. Структура компонента

Каждый компонент в UI Kit следует структуре:

```
src/components/BaseComponent/
├── ui/
│   └── BaseComponent.vue          # Основной компонент
├── types/
│   └── BaseComponent.types.ts     # Типы и константы, из которых они выводятся
├── model/
│   └── useBaseComponent.ts        # Логика компонента
├── styles/
│   └── BaseComponent.style.scss   # Стили
├── stories/
│   ├── BaseComponent.stories.ts   # meta и список stories
│   ├── parameters.ts              # части meta; render.ts и decorators.ts — если есть
│   ├── argTypes.ts
│   ├── args.ts
│   ├── shared.ts                  # данные и хелперы нескольких stories
│   └── cases/
│       ├── Default.ts             # одна StoryObj на файл
│       └── index.ts               # реэкспорт stories
├── __tests__/
│   ├── BaseComponent.spec.ts      # Unit-тесты
│   ├── BaseComponent.e2e.spec.ts  # E2E-тесты (Playwright)
│   └── BaseComponent.test-utils.ts # Стабы и хелперы
└── index.ts                       # Публичный экспорт
```

### Подпапки

Код должен читаться не только внутри файлов, но и по структуре. Если в папке компонента (`model/`, `ui/`, `types/`,
`__tests__/`, `stories/cases/`, `styles/`) больше 7 файлов, они раскладываются по подпапкам по назначению. Названия
подпапок в разных папках по возможности совпадают: тест лежит в той же области, что и модель, которую он проверяет. В корне
остаются общие файлы: главный компонент `ui/BaseX.vue`, публичные типы `types/BaseX.types.ts`, тексты `model/messages.ts`,
история `stories/cases/Default.ts`. Правило касается всего проекта, в том числе `src/composables` и `src/utils`.
Правило проверяет `npm run test:folders` (`scripts/check-folder-size.mjs`, входит в `ci:validate` и `test:all`): в любой папке `src/**` не больше 7 файлов. Единственное исключение — `src/icons/svg` (набор значков: один файл — один значок, спрайт собирает `build/plugins/sprite.ts`); исключения добавляются в `ALLOWED` скрипта с причиной.

Пример — BaseMediaPlayer:

```
model/        core/ player/ controls/ menus/ input/ panels/ overlays/ playlist/ captions/ audio/ ads/ notices/ cast/ screen/
              preview/ sharing/
ui/           controls/ menus/ panels/ overlays/ + BaseMediaPlayer.vue
types/        playback/ controls/ menus/ panels/ content/ overlays/ + BaseMediaPlayer.types.ts
__tests__/    те же области, что в model/, + browser/ (e2e и visual) и utils/ (стабы и хелперы)
stories/      cases/{appearance,playback,content,ads,sharing}/ + Default.ts, demo/ (эмуляции для историй)
```

`src/composables` и `src/utils` разложены по областям так же (С.11); публичные входы `…/composables` и `…/utils` не
изменились — их `index.ts` реэкспортирует всё, как раньше. Внутри кита импорт идёт с областью:
`@composables/base/useDefaults`, `@utils/data/urlUtils`.

```
src/composables/  base/ (useBaseComponent, useDefaults, useVariant, useSizeScale, useCustom*, usePadding…)
                  app/ (useLocale, useIcon, useColorMode, useBreakpoint, useToast, useLayerStack, useTeleportTarget)
                  overlay/ (useOverlay, usePopup, позиционирование, useClickOutside, useEscapeKey, useFocusTrap…)
                  interaction/ (useAutoScroll, useDebounce, useListNavigation, useSwipe, useVirtualList, useLink…)
                  form/ (useFormContext, useFormField, useInputMask, useSelect, useSearchState, useColorPicker…)
                  calendar/ chat/ table/ editor/ image/ range/ navigation/ — composables своих компонентов
src/utils/        dom/ data/ media/ form/ navigation/
```

В компонентах так же: BaseTable — `ui/{body,header,toolbar}/`, `types/{body,header,toolbar}/`,
`styles/{body,panels,layout}/`; BaseChat — `model/slideover/`, `__tests__/{ui,browser}/`,
`ui/ChatMessageList/styles/message/`; BaseDatePicker — `__tests__/{ui,browser}/`. Тесты e2e и скриншотные лежат в
`__tests__/browser/`. Медиафайлы историй раскладываются по типу (`stories/media/{video,images,subtitles}/`); SVG-иконки
(`src/icons/svg/`) — единственное исключение, оно записано в `ALLOWED` скрипта `check-folder-size.mjs`.

Истории (С.12): в `stories/cases/` — `appearance/` (варианты, размеры, цвета, формы, раскладка, положение),
`states/` (disabled, readonly, загрузка, пусто, ошибки), `content/` (слоты, значки, длинное и своё содержимое) и
`behavior/` (клавиатура, режимы, формы, работа с данными). У больших компонентов области свои: BaseTable — `data/`,
BaseChat — `messages/`, BaseText — `typography/` и `overflow/`, плеер — `appearance/`, `playback/`, `content/`, `ads/`,
`sharing/`. Если в области оказалась одна история, она остаётся в корне рядом с `Default.ts`. Id историй в Storybook
берутся из экспортов `*.stories.ts` и от папок не зависят.

ESLint, покрытие и сборка понимают вложенные папки: правила действуют для `model/**`, `ui/**`, `types/**/*.types.ts`.

### Типы

Типы лежат в папке `types/` рядом с кодом: `BaseX/types/BaseX.types.ts`, `useX/types/useX.types.ts`,
`xUtils/types/xUtils.types.ts`, `src/locales/types/locales.types.ts`, `src/plugin/types/plugin.types.ts`. У составного
компонента файлов может быть несколько: `BaseChat/types/ChatSlideover.types.ts`.

- В коде (`.ts`, `.vue`) `interface`, `type` и `enum` не объявляются: ESLint требует вынести их в `types/`.
  Исключения — тесты, stories и `*.d.ts`.
- В `types/` — только типы и константы, из которых они выводятся (`X_VARIANTS` → `XVariant`) или которые их связывают
  (ключи `provide`/`inject`). Функции и остальные константы — в `model/` или в модуле, который их использует; функции
  в `types/` ESLint тоже не пропустит.
- Тест `build/tests/structure.spec.ts` проверяет, что все `*.types.ts` лежат в папках `types/`.

### Stories

В `BaseX.stories.ts` остаются `title`, `component`, части meta из соседних файлов и список stories:
`export const Default = cases.Default`. Storybook читает названия и порядок stories из этого файла статически, поэтому
каждая story в нём перечислена явно: при `export { Default } from './cases/Default'` в сайдбаре вместо «Custom Color»
появилось бы «CustomColor». Файл `cases/X.ts` содержит одну StoryObj с типом `StoryObj<typeof meta>`
(`import type meta from '../BaseX.stories'`), описание story — в `parameters.docs.description.story`. Данные и хелперы,
нужные одной story, лежат в её файле, нескольким — в `shared.ts`. Части meta типизируются через
`satisfies Meta<typeof BaseX>['args']`.

### Логика в `model/`

`<script setup>` компонента содержит только макросы (`defineProps`, `defineEmits`, `defineSlots`, `defineExpose`),
импорты для шаблона и вызов `useBaseX(props, emit)` из `model/useBaseX.ts`. Так устроены все компоненты: в
`src/components/*/ui/**/*.vue` ESLint не пропускает функции, `let`, `computed`, `watch`, хуки жизненного цикла
и composables не из `model/`.

- Пропсы после `withDefaults` описывает тип `PropsWithDefaults<BaseXProps, 'ключи со значениями по умолчанию'>`
  из `@composables/base/useDefaults`.
- Логика делится на небольшие функции по задачам (значение, клавиатура, перетаскивание), чтобы каждая проходила пороги
  «чистого кода» (раздел 11).
- Composable возвращает всё, что нужно шаблону, включая template ref и методы для `defineExpose`. Константу, нужную
  только шаблону, он возвращает в camelCase (`settingsMaxHeight`); константа для умолчаний пропсов экспортируется
  из `model/` (`DEFAULT_DURATION`).
- У вложенного компонента свой composable в `model/` рядом с его `types/`: `model/useDropdownMenuContent.ts`,
  `ui/ChatHeader/model/useChatHeader.ts`. Компоненту без логики (`BaseCalendarMonths`) модель не нужна.
- Типы composable (`NumberDraft`, `SplitterSize`) — в `types/BaseX.types.ts` вместе с типами компонента.
- Тесты — по-прежнему через компонент; покрытие `model/use*.ts` проверяет `npm run test:components:coverage`.

### Правила компонентов

- Composable, который открывает конкретный компонент (`useConfirm` → BaseConfirm), лежит в папке этого компонента
  и экспортируется из её `index.ts`. В `src/composables/` — только composables без импорта компонентов (импорт типов
  компонентов допустим): иначе вход `@ramzes1385/rise-ui-kit/composables` тянул бы за собой код компонентов.
- Тесты лежат в `__tests__` своей папки: `src/composables/<область>/useXxx/__tests__/useXxx.spec.ts`,
  `src/utils/<область>/xxxUtils/__tests__/xxxUtils.spec.ts`, `src/locales/__tests__/…`. Тесты пакета целиком (границы входов,
  `createUiKitPlugin`) и хелпер скриншотных тестов — в `build/tests/`.
- Props: `withDefaults(defineProps<BaseComponentProps>(), kitDefaults('BaseComponent', {...}))` — без inline-типов
- Emits: `defineEmits<BaseComponentEmits>()` — без inline-типов
- Defaults: через `withDefaults` и `kitDefaults` из `@composables/base/useDefaults`, не через `computed` fallback.
  `kitDefaults` превращает каждое значение в функцию, которая сначала берёт значение из настроек плагина
  (`createUiKitPlugin({ defaults })`: `defaults.BaseComponent`, затем `defaults.global`). Функции — фабрики объектов
  и массивов — остаются как есть, их настройками не переопределить. Общие умолчания (`DEFAULT_VARIANT`,
  `SIZE_SCALE_DEFAULT`) импортируются из `@composables/base/useBaseComponent`

```vue
<script setup lang="ts">
// ✅ Правильно
const props = withDefaults(
  defineProps<BaseButtonProps>(),
  kitDefaults('BaseButton', {
    variant: DEFAULT_VARIANT,
    isLoading: false,
    sizeScale: SIZE_SCALE_DEFAULT,
  }),
)

// ❌ Неправильно — избыточный computed
const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)
const isLoading = computed(() => props.isLoading ?? false)
```
- Описания пропсов, событий и слотов в `types/` — обязательны (JSDoc): их показывают Storybook и подсказки IDE
- Переиспользуй компоненты UI Kit: `BaseIcon`, `BaseBadge`, `BaseButton`, `BaseTooltip`
- Не используй HTML `title` — только `BaseTooltip`
- Не импортируй `vue-router` внутрь UI Kit

---

## 10. Файловые JSDoc-заголовки

Каждый модуль `src/`, кроме компонентов, тестов и stories, начинается с однострочного JSDoc-заголовка перед импортами.

### Composables (`src/composables/**/useXxx.ts`)

```ts
/** Composable: <краткое назначение на русском> */

import { ... } from 'vue'
```

Примеры:
```ts
/** Composable: автопрокрутка контейнера к низу */
/** Composable: управление полем формы (touched/dirty, валидация, reset) */
/** Composable: обработка кликов по дням календаря, навигация по месяцам/годам и переключение AM/PM */
```

### Utils (`src/utils/**/xxxUtils.ts`)

```ts
/** Утилиты: <краткое назначение на русском>[(содержит <сайд-эффект|недетерминизм> — <причина>)] */

import type { ... } from './types/xxxUtils.types'
```

Примеры:
```ts
/** Утилиты: преобразование цветов между форматами HEX, RGB, HSV */
/** Утилиты: работа с буфером обмена (содержит сайд-эффект — обращение к navigator.clipboard) */
/** Утилиты: генерация уникальных идентификаторов (содержит недетерминизм — Date.now + Math.random) */
```

### Константы

Общей папки для констант нет: значение живёт рядом с кодом, который его использует.

- Значение одного модуля — константа в этом модуле с комментарием, что это и в каких единицах:
  `const HOLD_INTERVAL_MS = 150` в BaseSlider.
- Значение пропа по умолчанию пишется прямо в `kitDefaults(...)`: имя пропа уже объясняет число.
- Общее для частей одного компонента — в его `model/`: `CHAT_SCALE` в `BaseChat/model/chatScale.ts`,
  `TEXT_WEIGHT` в `BaseText/model/textWeight.ts`. Массив вариантов, из которого выводится тип, — в `types/`.
- Общее для всех компонентов — в composable, который это значение толкует: `DEFAULT_VARIANT` в `useVariant`,
  `SIZE_SCALE_DEFAULT` в `useSizeScale`. Компоненты импортируют оба из `@composables/base/useBaseComponent`.

Строки интерфейса (подписи, доступные имена, сообщения) в код не пишутся: они лежат в словарях `src/locales/ru/` и `src/locales/en/`, разложенных по областям — `base` (общие подписи и доступные имена), `forms`, `media` (плеер, аудио, субтитры), `chat` (чат, редактор, Markdown, ИИ-чат, эмодзи, упоминания), `data` (таблица, канбан), `plural` (формы чисел); словари отдельных компонентов (`card`, `eventCalendar`, `mapEditor`, `presentation`) — в подпапке `components/`; `index.ts` собирает словарь. Новый раздел кладите в файл своей области, файл не длиннее 400 строк; словарь нового компонента — в `src/locales/<язык>/components/` (в папке словаря не больше 7 файлов). Компоненты читают их через разделы словаря из `src/locales/messages.ts` (`UI_TEXT`, `UI_ARIA`, `UI_CHAT_TEXT` и другие): `UI_ARIA.CLOSE` возвращает строку текущего языка. Новую строку добавляйте в оба словаря с одним ключом — тест `src/locales/__tests__/locales.spec.ts` сверяет ключи и места для значений `{name}` во всех разделах. Строку со значением собирайте через `formatMessage`, число с подписью — через `pluralize`, а не склейкой строк. Предупреждения в консоли — тоже из словаря: раздел `warnings`, вывод через `warn()` из `src/locales/warn.ts` с префиксом `[rise-ui-kit]`. Поиск без различия «е» и «ё» — `foldSearchText` из `@utils/data/textUtils`. `npm run test:l10n` (`scripts/check-l10n.mjs`) ищет в исходниках кита тексты мимо словаря: кириллицу в строках и шаблонах, латиницу в тексте шаблонов и в `aria-label`, `title`, `placeholder`, `alt`; исключения с причиной — в `ALLOWED` в самом скрипте.

### Правила

- Заголовок — **однострочный**
- Между заголовком и первым `import` — **пустая строка**
- Язык — **русский**
- Импурные функции (сайд-эффекты, недетерминизм) — **помечать явно** в заголовке файла

## 11. Стиль кода и линтеры

| Инструмент | Что проверяет | Команды |
|---|---|---|
| Prettier | Форматирование `ts`, `vue`, `js`, `scss`: табы, одинарные кавычки, без `;`, строка до 140 символов. Настройки — `package.json` → `prettier`; документы, JSON и YAML не форматируются (`.prettierignore`) | `npm run format`, проверка — `npm run format:check` |
| ESLint | Ошибки кода, порядок импортов, правила «чистого кода» | `npm run lint`, исправление — `npm run lint:fix` |
| Stylelint | SCSS по `stylelint-config-standard-scss`, классы по БЭМ, переходы только по transform и opacity, запрет `:dir()` (в сборке он превращается в `:is(:lang(…))` и `dir="rtl"` не включается — пишите `[dir='rtl'] &`; логические свойства по той же причине заменяйте физическими, подробности — DESIGN_SYSTEM, раздел стилей). Настройки — `package.json` → `stylelint` | `npm run lint:styles` |
| knip | Неиспользуемые файлы, экспорты, типы и зависимости. Настройки — `package.json` → `knip` | `npm run lint:unused` |

Все четыре проверяет CI. Git-хуки лежат в `build/husky/` (их ставит скрипт `prepare` при `npm ci` и `npm install`):

| Хук | Что запускает |
|---|---|
| `pre-commit` | `npm run lint`, `npm run lint:new`, `npm run lint:styles`, `npm run lint:unused`, `npm run format:check` — несколько минут |
| `commit-msg` | commitlint с правилами `build/commitlint/commitlint.config.cjs` (раздел 3.3) |
| `pre-push` | `npm run test:unit` |

**Неиспользуемый код не оставляем.** Переменные, функции и импорты проверяет ESLint — и в тестах со stories тоже.
Файлы, экспорты, типы и зависимости проверяет knip: экспорт, который нигде не импортируется, удаляется или перестаёт
быть экспортом. Входы пакета (`src/index.ts` и подпути) knip считает публичными. Зависимости, которых knip не видит,
перечислены в `knip.ignoreDependencies`: шрифты подключаются через `url()` в SCSS, `lightningcss` — строкой в настройках
Vite, плагины semantic-release — строками в его конфиге.

**В коде компонентов комментариев нет.** В `src/components` их запрещают ESLint (`rise/no-comments`: скрипты, шаблоны
`.vue`, тесты, stories) и Stylelint (`comment-pattern` для SCSS). Описание компонента и story пишется в stories
(`parameters.docs.description`), исключения из правил линтеров — в их настройках, а не директивами в коде. Исключение —
JSDoc в `types/*.types.ts`: описания props, событий, слотов и полей типов показывают подсказки IDE и таблица props в Docs,
поэтому `rise/no-comments` эти файлы не проверяет. Вне компонентов комментарий пишется только о том, чего не видно
из кода: почему выбрано решение, ограничение браузера или jsdom, единицы и смысл чисел; обязателен однострочный
заголовок модуля (раздел 10).

**Импорты — одной «лесенкой».** Первыми идут импорты стилей: в компоненте первая строка `<script setup>` — `import '../styles/X.style.scss'`. За ними — прочие импорты с побочным эффектом (`import '@testing-library/jest-dom/vitest'`); между собой такие импорты не переставляются. Остальные импорты — без групп: каждая следующая строка не короче предыдущей, при равной длине — по алфавиту. Порядок расставляет `npm run lint:fix`.

Стили компонента подключаются раньше дочерних компонентов, которые он импортирует. Если стили родителя переопределяют корень дочернего компонента селектором той же специфичности (`.base-header__toggle` на корне `BaseButton`), родитель сначала импортирует стили дочернего компонента: `import '@components/BaseButton/styles/BaseButton.style.scss'`, затем свои. Иначе исход зависит от порядка загрузки CSS, а он разный в библиотеке, Storybook и dev-сервере.

**«Чистый код» (Р. Мартин).**

| Правило | Порог | Уровень |
|---|---|---|
| `max-params` | 3 параметра; больше — объект с именованными полями | ошибка |
| `max-depth` | 3 уровня вложенных блоков; глубже — ранний `continue`/`return` или отдельная функция | ошибка |
| `max-nested-callbacks` | 3 уровня колбэков | ошибка |
| `no-nested-ternary` | без вложенных тернарников — функция с `if` | ошибка |
| `no-param-reassign` | параметры не переприсваиваются | ошибка |
| `no-else-return` | после `return` нет `else` | ошибка |
| `@typescript-eslint/no-unused-vars` | неиспользуемое удаляется; намеренно неиспользуемое начинается с `_` | ошибка |
| `complexity` | сложность функции до 10 | предупреждение |
| `max-statements` | до 15 операторов в функции | предупреждение |
| `max-lines-per-function` | до 50 строк без пустых и комментариев | предупреждение |
| `max-lines` | до 400 строк в файле | предупреждение |

Новый код пишется сразу в пороги: в `model/` компонентов они — ошибки, а новые файлы `src/` pre-commit проверяет без единого предупреждения (`npm run lint:new`). В старом коде это пока предупреждения, он доводится до порогов по компонентам. В тестах и stories метрики размера не проверяются.

**Stylelint.** Классы — по БЭМ в kebab-case: `base-button__icon--active`. Ключевые слова — строчными (`currentcolor`), медиа-запросы — через `min-width` и `max-width`. Правило «Движение» (`declaration-property-value-disallowed-list`: переходы только по `transform` и `opacity`, длительности — токены `--rise-duration…`) — ошибка. Отключить правило можно только для строки и с причиной:

```scss
/* stylelint-disable-next-line property-no-vendor-prefix -- псевдоэлемент только WebKit */
-webkit-appearance: none;
```

**git blame.** Переформатирование Prettier — отдельный коммит без других правок: в истории его легко отличить от изменений кода.

## 12. Зависимости

`npm audit` должен показывать 0 уязвимостей. Уязвимость в dev-зависимости исправляется так:
`npm audit fix`, а если пакет не обновляется сам — явным обновлением до исправленной версии
(`npm install -D vitest@^4.1.11 …`). После обновления собранный пакет сравнивается с прежним.

npm 11.16+ спрашивает разрешение на скрипты установки пакетов, npm 12 без разрешения их не запускает.
Решения записаны в `package.json` → `allowScripts`:

| Пакет | Решение | Почему |
|---|---|---|
| `esbuild` | разрешён | `postinstall` проверяет бинарник для платформы |
| `@parcel/watcher` | запрещён | скрипт собирает нативный модуль из исходников, а готовых бинарников достаточно; `sass` использует пакет только в режиме наблюдения |

Новый пакет со скриптом установки npm покажет в предупреждении. Решение записывает
`npm approve-scripts <пакет> --no-allow-scripts-pin` или `npm deny-scripts <пакет>`; в npm 11.20+ те же команды —
`npm install-scripts approve …` и `npm install-scripts deny …`.

