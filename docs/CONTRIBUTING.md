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

### 3.3. Conventional Commits

Каждый коммит должен следовать формату:

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
# 1. Lint
npm run lint

# 2. Unit-тесты (для конкретного компонента)
npm run test:unit -- src/components/BaseSideBar

# 3. E2E-тесты
npm run test:e2e -- src/components/BaseSideBar

# 4. Build
npm run build

# 5. Полная CI-валидация (то же, что делает CI)
npm run ci:validate

# 6. Сухой прогон релиза (покажет будущую версию без publish)
npm run release:dry
```

Если что-то падает — исправь **до** push. Не коммить с падающими тестами.

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
- [ ] `npm run lint` проходит без ошибок
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
├── model/
│   └── BaseComponent.types.ts     # Типы, интерфейсы, константы
├── styles/
│   └── BaseComponent.style.scss   # Стили
├── stories/
│   └── BaseComponent.stories.ts   # Storybook stories
├── __tests__/
│   ├── BaseComponent.spec.ts      # Unit-тесты
│   ├── BaseComponent.e2e.spec.ts  # E2E-тесты (Playwright)
│   └── BaseComponent.test-utils.ts # Стабы и хелперы
└── index.ts                       # Публичный экспорт
```

### Правила компонентов

- Props: `withDefaults(defineProps<BaseComponentProps>(), {...})` — без inline-типов
- Emits: `defineEmits<BaseComponentEmits>()` — без inline-типов
- Defaults: через `withDefaults`, не через `computed` fallback

```vue
<script setup lang="ts">
// ✅ Правильно
const props = withDefaults(defineProps<BaseButtonProps>(), {
  variant: 'default',
  sizeScale: 100,
  isLoading: false,
})

// ❌ Неправильно — избыточный computed
const variant = computed(() => props.variant ?? 'default')
const sizeScale = computed(() => props.sizeScale ?? 100)
const isLoading = computed(() => props.isLoading ?? false)
```
- Комментарии в `.types.ts` — обязательны (JSDoc)
- Переиспользуй компоненты UI Kit: `BaseIcon`, `BaseBadge`, `BaseButton`, `BaseTooltip`
- Не используй HTML `title` — только `BaseTooltip`
- Не импортируй `vue-router` внутрь UI Kit

---

## 10. Файловые JSDoc-заголовки

Каждый файл-модуль обязан иметь однострочный JSDoc-заголовок в первой строке, перед импортами.

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

import type { ... } from './xxxUtils.types'
```

Примеры:
```ts
/** Утилиты: преобразование цветов между форматами HEX, RGB, HSV */
/** Утилиты: работа с буфером обмена (содержит сайд-эффект — обращение к navigator.clipboard) */
/** Утилиты: генерация уникальных идентификаторов (содержит недетерминизм — Date.now + Math.random) */
```

### Constants (`src/constants/*.ts`)

```ts
/**
 * <Назначение>.
 * Группированы в объект <NAME> для удобного доступа.
 */
```

### Правила

- Заголовок — **однострочный** (для utils/composables) или многострочный (для constants)
- Между заголовком и первым `import` — **пустая строка**
- Язык — **русский**
- Импурные функции (сайд-эффекты, недетерминизм) — **помечать явно** в заголовке файла
