---
description: Режим объяснений и консультаций по коду — отвечает на вопросы о паттернах, архитектуре, стеке, тестировании, Clean Code. Используй когда пользователь спрашивает «как», «почему», «где», но не просит писать или менять код.
mode: primary
---

# Ask Mode

Режим объяснений и консультаций. При ответах опирайся на skills:

## Какой skill грузить когда
| Вопрос пользователя про... | Skill |
|---|---|
| Компоненты UI Kit, plugin.ts, alias, регистрация | `ui-kit-component` |
| Тесты: теория, F.I.R.S.T., coverage, equivalence partitioning | `testing-standards` |
| Тесты: настройка Vitest/Playwright/Storybook, screenshot, конфиги | `testing-ui-kit` |
| Vite config, build/*, чанки, плагины, оптимизация bundle, PageSpeed | `vite-bundle-config` |
| «Можно ли менять X в Vite-конфиге, что будет если…» | `vite-bundle-customization-guide` |
| Clean Code, SOLID, code smells, рефакторинг, имена | `clean-code` |
| FSD-методология: что такое слои/слайсы/сегменты, куда положить код | `fsd` |
| TM2-стандарты: Pinia store, api, mocks, i18n | `fsd` + `project-standards` + `shared-lib-standards` |
| Pinia Options API | `stories-vue` |
| Базовые правила Vue 3 компонента (имена, типы, BEM, SRP, лимиты) | `component-vue` |

## Этот репозиторий
**`metal-art-site` — UI Kit-библиотека** (Vue 3 + Vite + TypeScript + Storybook + Vitest + Playwright).

- `src/components/Base*/` — 48 Base-компонентов, у каждого `.vue`, `.types.ts`, `.style.scss`, `.stories.ts`, `.spec.ts`, `.integration.spec.ts`, `.visual.spec.ts`, `index.ts`. Heavy — ещё `.e2e.spec.ts`.
- `src/composables/useX/` — 22 composables
- `src/utils/xUtils/` — 13 утилит
- `src/icons/svg/` — 82 SVG, спрайт собирается автоматически
- `src/styles/` — `_variables.scss` (CSS-переменные на `:root`), `_mixins`, `_functions`, `index.scss`
- `src/plugin.ts` — `createUiKitPlugin()` регистрирует все компоненты глобально

Чего **нет** в этом репо: FSD, Pinia, vue-router, vue-i18n, API-слой, MSW, mock.config, ESLint, Prettier.

## Базовые ответы

### «Как добавить компонент?»
Папка `src/components/BaseX/` с 8 файлами, регистрация в `src/components/index.ts` + `src/plugin.ts`, если экспортируется наружу — в `src/index.ts`. Детали — skill `ui-kit-component`.

### «Какие команды для тестов?»
- `npm run test:unit` — unit + integration в jsdom
- `npm run test:storybook` + `:coverage` — storybook tests
- `npm run test:a11y` — accessibility
- `npm run test:visual` / `test:visual:update` — Playwright VRT
- `npm run test:e2e` — Playwright e2e
- `npm run test:components:coverage` — 100% per-file для `src/components/**/*.vue`
- `npm run test:all` — всё подряд

### «Какие CSS-переменные доступны?»
См. `src/styles/_variables.scss`. Основные: `--color-primary`, `--color-accent` (#f97316), `--color-text`, `--color-bg`, `--color-surface`, `--font-family-base` (Inter), `--transition-base`, `--border-radius-base`, `--shadow-md`. Тёмная тема — `[data-theme='dark']`.

### «Почему `@use 'variables'` ошибка?»
Глобальный SCSS (`variables/mixins/functions`) автоинжектится через `additionalData` в `build/config/css.ts`, `build/storybook/main.ts` и `build/tests/vitest.config.ts`. Повторно его подключать не надо.

---

## Раздел ниже — для FSD-проектов команды (не для этого репо)

---

## Стек проекта
- **Framework**: Vue 3 (`<script setup lang="ts">`)
- **Архитектура**: FSD (Feature-Sliced Design)
- **State Management**: Pinia — только Option API (`state` / `getters` / `actions`)
- **UI**: Quasar Framework — только через `Base`-компоненты из `@/shared/ui`
- **Валидация**: Yup + Vee-Validate
- **Стили**: SCSS, импорт в `<script setup>`
- **Локализация**: `useScopeT` из `@/shared/lib`

---

## Команды
- `npm run dev` — запуск dev-сервера
- `npm run build` — production-сборка
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest

---

## Ключевые паттерны проекта

### FSD-иерархия
```
app → pages → widgets → features → entities → shared
```
Каждый слой импортирует только из нижестоящих. Импорт только через `index.ts` слайса.

### Store — Option API
```typescript
export const useMyStore = defineStore('myStore', {
  state: () => ({ items: [], loading: false, total: 0, page: 1, query: '' }),
  getters: { hasItems: (state) => state.items.length > 0 },
  actions: {
    async fetch() { ... },
    setPage(page: number) { this.page = page; this.fetch(); },
  },
});
```
Composition API внутри `defineStore` — запрещён.

### Переключение мок/реальный API
- `src/shared/config/mock.config.ts` → `ApiModesConfig` + `API_MODES`
- В API-файле: `isMockMode('featureName')` из `@/shared/config/mock.config`
- Переводы модулей: `locales/ru/settings.ts` и `en/settings.ts` → `modules.*`

### Локализация
```typescript
import { useScopeT } from '@/shared/lib';
import { useLocale } from '@/shared/lib';

const { scopeT } = useScopeT('myFeature'); // scopeT('title') → 'myFeature.title'
const { t } = useLocale();                 // t('common.cancel')
```

### Типы
Все типы слайса — только в `types.ts`. Нигде больше.

### Импорты
Только именованные, только абсолютные через `@/`. Запрещены `import * as` и `../`.

### Компоненты
Только `Base`-компоненты из `@/shared/ui`. Прямое использование Quasar (`<q-input>`, `<q-btn>`) — запрещено.

### Валидация форм
`validation.ts` рядом с формой: `toTypedSchema(yup.object({...}))`. В компоненте: `useForm` + `useField`.

### Стили
SCSS в отдельном файле, импорт в `<script setup>`. Блок `<style>` запрещён.

### Gotchas
- `BaseSelect` с поиском — проп `show-search`. Не использовать `use-input` / `fill-input`
- Отчёты — один файл с обычной пагинацией, без бесконечного скролла
- Функции в store принимают примитивы, не DOM-события и не вложенные объекты
- Файл > 150 строк — сигнал к декомпозиции
