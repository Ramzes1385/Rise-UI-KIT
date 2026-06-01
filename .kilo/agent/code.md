---
description: Основной режим написания и рефакторинга кода Vue 3 — UI Kit `metal-art-site` (Base-компоненты, Storybook, Vitest, Playwright) и FSD-проекты команды (Pinia, Quasar, i18n). Используй при любом написании, изменении, рефакторинге production-кода в src/.
mode: primary
---

# Code Mode

Основной режим написания и рефакторинга кода. В этом репозитории два типа задач:

## Какой репозиторий перед тобой?

**Этот репозиторий — `metal-art-site`, UI Kit-библиотека** (Vue 3 + Vite + TypeScript, Storybook + Vitest + Playwright). Никакого FSD, Pinia, vue-router, vue-i18n, API-слоёв, mocks. Структура `src/`: `components/`, `composables/`, `utils/`, `icons/`, `styles/`, `playground/`.

→ **Для работы в этом репозитории — обязательно грузи skill `ui-kit-component`** перед любой работой с компонентом.

Skills из набора `project-standards` / `shared-lib-standards` / `stories-vue` — это шаблоны для **других проектов команды** (TM2 Frontend, FSD-приложения). В `metal-art-site` они не применяются: там нет ни `src/widgets`, ни `src/entities`, ни `pinia`, ни `useScopeT`.

## Какой skill грузить когда

| Задача | Skill |
|---|---|
| Любая работа с компонентом в `src/components/Base*/` | `ui-kit-component` |
| Composable в `src/composables/useX/` | `ui-kit-component` (см. раздел Composables) |
| Утилита в `src/utils/xUtils/` | `ui-kit-component` (см. раздел Utilities) |
| Любой код (имена, функции, ошибки, SOLID) | `clean-code` — **всегда** |
| Тесты: теория, дизайн test cases, F.I.R.S.T. | `testing-standards` — **всегда** при работе с тестами |
| Тесты: практика — настройка стека, шаблоны Vitest/Playwright/Storybook, screenshot | `testing-ui-kit` — при настройке инфраструктуры или новом visual/e2e тесте |
| Работа с `vite.config.ts`, `build/*`, плагинами Vite, оптимизацией bundle | `vite-bundle-config` |
| Решение «можно ли менять параметр X в build/», ревью чужих правок Vite | `vite-bundle-customization-guide` (парно с `vite-bundle-config`) |
| FSD-методология: куда положить код, правила импортов, публичные API (для любого FSD-проекта) | `fsd` |
| Работа в FSD-приложении TM2 (Pinia + Quasar + i18n) | `fsd` + `project-standards` + `shared-lib-standards` |
| Pinia store в FSD-проекте | `stories-vue` |
| Создание любого Vue 3 компонента (база — имена, типы, BEM, лимиты) | `component-vue` — **всегда** при работе с Vue-компонентом |
| Vue-компонент в FSD-проекте (entities/features/widgets/shared/ui) | `component-vue` + `fsd` |
| Vue-компонент в UI Kit `metal-art-site` | `component-vue` + `ui-kit-component` |

## Базовое правило
Перед написанием нетривиального кода — загрузи `clean-code`. Перед написанием/правкой теста — загрузи `testing-standards`. Перед работой с компонентом в этом репо — `ui-kit-component`. Без этого не пиши.

---

## Раздел ниже — для FSD-проектов команды (не для этого репо)

В `metal-art-site` ничего из перечисленного ниже не применяется. Используй только при работе в TM2 Frontend / другом FSD-приложении.

---

## Структура FSD-слоёв

### `pages` — только UI, папка `model/` запрещена
```
src/pages/my-page/
├── index.ts
└── ui/
    ├── MyPage.vue    ← только компоновка виджетов
    └── MyPage.scss
```
Запрещено: папка `model/`, store, API-вызовы, бизнес-логика внутри `pages`.

### `features` — переиспользуемое действие
```
src/features/my-domain/my-action/
├── index.ts
├── api/        ← API-вызовы действия
├── lib/        ← вспомогательные функции
├── model/      ← store (состояние модалки/формы) + types
└── ui/         ← Vue-компоненты (модальные окна, формы)
```
Группировать по домену: `features/warehouse/manage-warehouse/`.

### `entities` — бизнес-сущность
```
src/entities/my-entity/
├── index.ts
├── api/          ← HTTP-вызовы + MOCK_* константы
├── constants/    ← маппинги статусов, дефолты (НЕ внутри model/)
├── model/        ← store + types
└── testing/      ← моки только для тестов
```
`constants/` — **отдельная папка**, не внутри `model/`. Entity импортирует только из `shared`.

---

## Стек проекта
- **Framework**: Vue 3 (`<script setup lang="ts">`)
- **Архитектура**: FSD (Feature-Sliced Design) — строгое соблюдение
- **State Management**: Pinia — **строго Option API** (`state` / `getters` / `actions`)
- **UI**: Quasar Framework — только через `Base`-компоненты из `@/shared/ui`
- **Валидация**: Yup + Vee-Validate → схема в `validation.ts`
- **Стили**: SCSS в отдельных файлах, импорт только в `<script setup>`
- **Локализация**: `useScopeT` из `@/shared/lib` для модульных ключей

---

## Команды
- `npm run dev` — запуск dev-сервера
- `npm run build` — production-сборка
- `npm run lint` — ESLint
- `npm run test:unit` — Vitest

---

## Обязательные правила

### 1. Логика — только в store.ts
Компоненты вызывают actions и читают getters. Никакого API, вычислений или бизнес-логики в компонентах.

### 2. Без комментариев
Никаких `//`, `/* */`, JSDoc. Код должен быть самодокументируемым.

### 3. Переключение мок / реальный API
Каждый новый модуль обязательно добавляется в:
- `src/shared/config/mock.config.ts` → интерфейс `ApiModesConfig` + объект `API_MODES`
- `src/shared/lib/i18n/locales/ru/settings.ts` и `en/settings.ts` → ключ `modules.myFeature`

В API-файле использовать `isMockMode('myFeature')` из `@/shared/config/mock.config`.

### 4. Максимальное разбиение по файлам
- Файл > 150 строк → декомпозировать
- Колонки таблицы → `columns.ts`
- Схема валидации → `validation.ts`
- Типы → `types.ts`
- Мок-данные → константа `MOCK_*` внутри `api.ts`
- Каждый подкомпонент — отдельная папка со своим `index.ts`

### 5. Именование
- Store: `use{Name}Store`
- Actions: глаголы — `init`, `fetch`, `setPage`, `setQuery`, `open`, `close`, `submit`
- Getters: существительные — `rows`, `total`, `loading`, `hasItems`, `pagination`
- Компоненты: `{FeatureName}{Role}` — `MyFeatureToolbar`, `MyFeatureTable`

### 6. Валидация форм
```typescript
// validation.ts
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';

export const mySchema = toTypedSchema(
  yup.object({ name: yup.string().required(), count: yup.number().min(1).required() })
);
```
В компоненте: `useForm({ validationSchema: mySchema })` + `useField`.

### 7. Стили только в script setup
```vue
<script setup lang="ts">
import './MyComponent.scss'; // всегда так
</script>
```
Запрещено: `<style>`, `<style scoped>`, `<style src="...">`.

### 8. Единый стиль
- Блоки: `<template>` → `<script setup lang="ts">` (без `<style>`)
- Порядок импортов: сторонние → `@/entities` → `@/features` → `@/shared` → локальные `./`
- Импорт стилей — последним среди локальных

### 9. Читаемость
- Плоская структура логики, нет вложенных функций
- Одна функция = одна задача
- Имя файла = имя экспортируемой сущности

### 10. Строгое соблюдение FSD
```
app → pages → widgets → features → entities → shared
```
- Импортировать только из публичного API слайса (`index.ts`)
- Нельзя импортировать из вышестоящего или того же слоя
- `entities` импортирует только из `shared`

### 11. SCSS в отдельном файле, BEM
```scss
.my-feature-toolbar {
  &__left { }
  &__search { }
}
```

### 12. Отчёты — один файл, без бесконечной прокрутки
Один компонент с обычной пагинацией. Никаких `IntersectionObserver`.

### 13. Только Base-компоненты из @/shared/ui
```typescript
import { BaseButton, BaseCard, BaseInput, BaseSelect, BaseTable, BasePagination, BaseModal, BaseFormField } from '@/shared/ui';
```
Запрещено: `<q-input>`, `<q-btn>`, `<q-select>` напрямую.
`BaseSelect` с поиском → проп `show-search`. Не использовать `use-input` / `fill-input`.

### 14. Store — строго Option API
```typescript
import { defineStore } from 'pinia';
import type { MyItem } from './types';

export const useMyStore = defineStore('myStore', {
  state: () => ({
    items: [] as MyItem[],
    loading: false,
    total: 0,
    page: 1,
    query: '',
  }),
  getters: {
    hasItems: (state): boolean => state.items.length > 0,
    pagination: (state) => ({ rowsPerPage: 0, page: state.page, rowsNumber: state.total }),
  },
  actions: {
    async init(): Promise<void> { await this.fetch(); },
    async fetch(): Promise<void> { /* ... */ },
    setQuery(query: string): void { this.query = query; this.page = 1; this.fetch(); },
    setPage(page: number): void { this.page = page; this.fetch(); },
  },
});
```
Запрещено: `defineStore('id', () => { const x = ref() })` — Composition API в store.

### 15. Полные именованные импорты, абсолютные пути
```typescript
// ✅
import { defineStore } from 'pinia';
import { useMyStore } from '@/widgets/my-feature/model/store';
// ❌
import * as pinia from 'pinia';
import { useMyStore } from '../../../model/store';
```
Алиас `@/` обязателен. Относительные пути `../` запрещены.

### 16. Локализация через useScopeT
```typescript
import { useScopeT } from '@/shared/lib';
import { useLocale } from '@/shared/lib';

const { scopeT } = useScopeT('myFeature'); // scopeT('title') → 'myFeature.title'
const { t } = useLocale();                 // t('common.cancel')
```

### 17. Типы строго в types.ts
Все интерфейсы и типы слайса объявляются только в `types.ts`. Запрещено объявлять типы в store.ts, компонентах или api.ts.

### 18. Функции принимают готовые значения
```typescript
// ✅ store action — примитивы
submit(name: string, count: number): void { }
setPage(page: number): void { }

// ❌ запрещено
onInput(event: Event) { }
save(payload: { meta: { form: { values: unknown } } }) { }
```

---

## Структура нового виджета
```
src/widgets/my-feature/
├── index.ts
├── model/
│   ├── index.ts
│   ├── store.ts       ← Option API
│   ├── types.ts       ← все типы
│   └── columns.ts     ← если есть таблица
└── ui/
    ├── MyFeatureWidget.vue
    ├── MyFeatureWidget.scss
    ├── MyFeatureToolbar/
    │   ├── index.ts
    │   ├── MyFeatureToolbar.vue
    │   └── MyFeatureToolbar.scss
    ├── MyFeatureTable/
    │   ├── index.ts
    │   ├── MyFeatureTable.vue
    │   └── MyFeatureTable.scss
    └── MyFeatureDialog/
        ├── index.ts
        ├── MyFeatureDialog.vue
        ├── MyFeatureDialog.scss
        └── validation.ts
```

## Публичный API слайса (index.ts)
```typescript
export { default as MyFeatureWidget } from './ui/MyFeatureWidget.vue';
export { useMyFeatureStore } from './model/store';
export type { MyItem } from './model/types';
```

## index.ts для подкомпонента
```typescript
export { default as MyFeatureToolbar } from './MyFeatureToolbar.vue';
```
