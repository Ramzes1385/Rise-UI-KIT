---
name: project-standards
description: Стандарты разработки TM2 Frontend и других FSD-приложений команды — FSD-слои (pages/widgets/features/entities/shared), Pinia Option API, Quasar Base-компоненты, Yup+Vee-Validate, SCSS-импорт в script setup, useScopeT локализация, mock.config для переключения мок/реальный API. Загружай при работе в FSD-приложении команды (НЕ в metal-art-site UI Kit) — создание модуля, виджета, store, API-файла, page, рефакторинг существующего слайса.
---

# Стандарты разработки — TM2 Frontend (FSD-приложения)

## Когда применять
Этот skill — для **FSD-приложений команды** (TM2 Frontend и аналоги). В `metal-art-site` (UI Kit) не применять — там нет FSD, Pinia, Quasar, vue-router, vue-i18n. Для `metal-art-site` используй skill `ui-kit-component`.

Все правила ниже обязательны и не имеют исключений для FSD-проектов.

---

## Структура FSD-слоёв (эталон)

### Page — только UI, без бизнес-логики
```
src/pages/my-page/
├── index.ts              ← реэкспорт только компонента страницы
└── ui/
    ├── MyPage.vue        ← только компоновка виджетов, никакой логики
    └── MyPage.scss
```

**Запрещено в `pages`:**
- Папка `model/` — страница не хранит состояние и не имеет store
- Прямые вызовы API
- Бизнес-логика, вычисления, computed с логикой

```vue
<template>
  <div class="my-page">
    <MyFeatureWidget />
  </div>
</template>

<script setup lang="ts">
import { MyFeatureWidget } from '@/widgets/my-feature';
import './MyPage.scss';
</script>
```

---

### Widget — самодостаточный UI-блок со своим store
```
src/widgets/my-feature/
├── index.ts
├── model/
│   ├── index.ts
│   ├── store.ts          ← Pinia Option API
│   ├── types.ts          ← ВСЕ типы слайса
│   └── columns.ts        ← колонки таблиц (если есть)
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

---

### Feature — переиспользуемое действие (модальное окно, операция)
```
src/features/my-domain/my-action/
├── index.ts
├── api/                  ← API-вызовы этого действия
│   ├── index.ts
│   └── my-action.api.ts
├── lib/                  ← вспомогательные функции (трансформации, валидация)
│   ├── index.ts
│   └── utils.ts
├── model/
│   ├── index.ts
│   ├── store.ts          ← Pinia Option API (состояние модалки/формы)
│   └── types.ts
└── ui/
    ├── MyActionModal.vue
    └── MyActionModal.scss
```

**Правила для `features`:**
- Группировать по домену: `features/warehouse/manage-warehouse/`
- Каждая feature — одно действие (`manage-warehouse`, `delete-user`, `sign-document`)
- `lib/` — только вспомогательные функции для этого конкретного действия
- Store хранит только UI-состояние: открыто/закрыто, loading, поля формы

---

### Entity — бизнес-сущность
```
src/entities/my-entity/
├── index.ts
├── api/
│   ├── index.ts
│   ├── my-entity.api.ts        ← реальные вызовы + MOCK_* константы
│   └── my-entity-mock.api.ts   ← опционально: отдельный файл моков
├── constants/                  ← константы: маппинги статусов, дефолты
│   └── index.ts
├── model/
│   ├── index.ts
│   ├── store.ts                ← Pinia Option API
│   └── types.ts
└── testing/                    ← моковые данные только для тестов
    └── my-entity.mock.ts
```

**Правила для `entities`:**
- `constants/` — **отдельная папка**, константы не кладутся внутрь `model/`
- `testing/` — только для юнит-тестов, нельзя импортировать в продакшн-код
- Entity импортирует только из `shared`
- Пример констант: `STATUS_LABEL_MAP`, `DEFAULT_PAGINATION`, enum-значения

---

## Правило 1 — Логика только в store.ts

Компоненты **вызывают** действия store и **читают** геттеры. Никакой логики, API-вызовов или вычислений в компонентах.

```vue
<template>
  <BaseCard :no-padding="true" class="my-feature-widget">
    <MyFeatureToolbar />
    <MyFeatureTable />
    <BasePagination
      :current-page="store.currentPage"
      :total="store.total"
      :page-size="store.pageSize"
      @update:current-page="store.setPage"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { BaseCard, BasePagination } from '@/shared/ui';
import { onMounted } from 'vue';
import { useMyFeatureStore } from '../model/store';
import { MyFeatureTable } from './MyFeatureTable';
import { MyFeatureToolbar } from './MyFeatureToolbar';
import './MyFeatureWidget.scss';

const store = useMyFeatureStore();

onMounted(() => store.init());
</script>
```

---

## Правило 2 — Комментарии не пишутся

Ни `//`, ни `/* */`, ни JSDoc. Имена функций и переменных должны сами объяснять смысл.

---

## Правило 3 — Переключение мок / реальный API

### Шаг 1 — `src/shared/config/mock.config.ts`

Добавить ключ в интерфейс `ApiModesConfig`:
```typescript
export interface ApiModesConfig {
  myFeature: ApiMode;
}
```

Добавить значение в `API_MODES`:
```typescript
export const API_MODES: ApiModesConfig = {
  myFeature: getApiMode(import.meta.env.VITE_MY_FEATURE_MODE, 'mock'),
};
```

### Шаг 2 — Переводы для настроек

`src/shared/lib/i18n/locales/ru/settings.ts`:
```typescript
modules: {
  myFeature: 'Мой модуль',
}
```

`src/shared/lib/i18n/locales/en/settings.ts`:
```typescript
modules: {
  myFeature: 'My Feature',
}
```

### Шаг 3 — Использование `isMockMode` в API-файле

```typescript
import { isMockMode } from '@/shared/config/mock.config';

export async function fetchItems(filters: MyFilters): Promise<MyItem[]> {
  if (isMockMode('myFeature')) {
    return MOCK_ITEMS;
  }
  const params = buildParams(filters);
  const response = await http.get<MyItem[]>('/api/my-feature', { params });
  return response.data;
}
```

---

## Правило 4 — Максимальное разбиение по файлам

- Файл > 150 строк → декомпозировать
- Колонки таблицы → `columns.ts`
- Схема валидации → `validation.ts`
- Типы → `types.ts`
- Мок-данные → внутри `api.ts` как константа `MOCK_*`
- Каждый подкомпонент — отдельная папка со своим `index.ts`

---

## Правило 5 — Именование

| Что | Паттерн | Пример |
|-----|---------|--------|
| Store | `use{Name}Store` | `useMyFeatureStore` |
| Геттер | существительное | `rows`, `total`, `loading`, `hasRows` |
| Action | глагол | `init`, `fetch`, `setPage`, `setQuery`, `open`, `close`, `submit` |
| Компонент | `{Widget}{Role}` | `MyFeatureToolbar`, `MyFeatureTable` |
| Переменная состояния | кратко | `page`, `query`, `loading`, `items` |

**Запрещено:** `getData`, `handleClick`, `doSomething`, `temp`, `info`, `data2`

---

## Правило 6 — Валидация форм (Yup + Vee-Validate)

### `validation.ts` рядом с диалогом:
```typescript
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';

export const myFormSchema = toTypedSchema(
  yup.object({
    name: yup.string().required(),
    count: yup.number().min(1).required(),
    date: yup.string().required(),
  })
);
```

### Компонент формы:
```vue
<template>
  <BaseModal :model-value="store.showDialog" @update:model-value="!$event && store.closeDialog()">
    <BaseFormField name="name" :label="scopeT('fields.name')">
      <template #default="{ inputId }">
        <BaseInput :id="inputId" v-model="name" />
      </template>
    </BaseFormField>

    <template #footer>
      <BaseButton variant="ghost" :label="t('common.cancel')" @click="store.closeDialog" />
      <BaseButton variant="primary" :label="t('common.save')" @click="onSubmit" />
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useMyFeatureStore } from '@/widgets/my-feature/model/store';
import { useScopeT, useLocale } from '@/shared/lib';
import { BaseButton, BaseFormField, BaseInput, BaseModal } from '@/shared/ui';
import { useField, useForm } from 'vee-validate';
import './MyFeatureDialog.scss';
import { myFormSchema } from './validation';

const { scopeT } = useScopeT('myFeature');
const { t } = useLocale();
const store = useMyFeatureStore();

const { handleSubmit } = useForm({ validationSchema: myFormSchema });
const { value: name } = useField<string>('name');

const onSubmit = handleSubmit((values) => {
  store.submit(values.name, values.count, values.date);
});
</script>
```

---

## Правило 7 — Стили подключаются только в script setup

```vue
<script setup lang="ts">
import './MyComponent.scss';
</script>
```

**Запрещено:**
```vue
<style src="./MyComponent.scss" />
<style lang="scss"> ... </style>
<style scoped> ... </style>
```

---

## Правило 8 — Единый стиль во всём проекте

- Блоки: `<template>` → `<script setup lang="ts">` (без `<style>`)
- Порядок импортов в `<script setup>`: сторонние, затем `@/entities`, `@/features`, `@/shared`, затем локальные `./`
- Импорт стилей — последний в блоке локальных импортов
- Все компоненты используют `<script setup lang="ts">`
- Во всех store — Option API

---

## Правило 9 — Читаемость для любого разработчика

- Плоская логика: нет вложенных функций
- Одна функция = одна задача
- Нет «умных» однострочников без необходимости
- Имя файла = имя экспортируемой сущности

---

## Правило 10 — Строгое соблюдение FSD

```
app → pages → widgets → features → entities → shared
```

| Слой | Может импортировать из |
|------|------------------------------------------------------------------|
| `pages` | `widgets`, `features`, `entities`, `shared` |
| `widgets` | `features`, `entities`, `shared` |
| `features` | `entities`, `shared` |
| `entities` | только `shared` |
| `shared` | ничего из проекта |

Импорт только через **публичный API слайса** (`index.ts`):
```typescript
// ✅
import { useMyStore } from '@/entities/my-entity';

// ❌
import { useMyStore } from '@/entities/my-entity/model/store';
```

---

## Правило 11 — SCSS в отдельном файле, BEM

```scss
.my-feature-toolbar {
  display: flex;
  justify-content: space-between;

  &__left { display: flex; gap: 8px; }
  &__right { display: flex; gap: 8px; }
  &__search { width: 240px; }
  &__btn { }
}
```

---

## Правило 12 — Отчёты: один файл, без бесконечной прокрутки

Отчёт — один компонент с простой пагинацией. Никаких `IntersectionObserver`, `useInfiniteScroll`, `onScroll`.

---

## Правило 13 — Только Base-компоненты из `@/shared/ui`

```typescript
import {
  BaseButton, BaseCard, BaseCheckbox, BaseDate, BaseDialog,
  BaseExpansionItem, BaseFormField, BaseIconButton, BaseInput,
  BaseModal, BasePagination, BaseSelect, BaseSwitch, BaseTable, Loader,
} from '@/shared/ui';
```

**Запрещено:** `<q-input>`, `<q-btn>`, `<q-select>` напрямую.

**Про `BaseSelect`:** кастомный поиск — через проп `show-search`. Не использовать `use-input` / `fill-input` (вызывает дублирование текста).

---

## Правило 14 — Store: строго Option API

```typescript
import { defineStore } from 'pinia';
import { myApi } from '../api/my-entity.api';
import type { MyItem, MyFilters } from './types';

export const useMyFeatureStore = defineStore('myFeature', {
  state: () => ({
    items: [] as MyItem[],
    loading: false,
    total: 0,
    page: 1,
    pageSize: 15,
    query: '',
    selectedItem: null as MyItem | null,
    showDialog: false,
  }),

  getters: {
    hasItems: (state): boolean => state.items.length > 0,
    pagination: (state) => ({
      rowsPerPage: 0,
      page: state.page,
      rowsNumber: state.total,
    }),
    currentPage: (state): number => state.page,
  },

  actions: {
    async init(): Promise<void> {
      await this.fetch();
    },

    async fetch(): Promise<void> {
      this.loading = true;
      try {
        const result = await myApi.fetchItems({
          page: this.page,
          pageSize: this.pageSize,
          query: this.query || undefined,
        });
        this.items = result.items;
        this.total = result.total;
      } finally {
        this.loading = false;
      }
    },

    setQuery(query: string): void {
      this.query = query;
      this.page = 1;
      this.fetch();
    },

    setPage(page: number): void {
      this.page = page;
      this.fetch();
    },

    openDialog(item: MyItem): void {
      this.selectedItem = item;
      this.showDialog = true;
    },

    closeDialog(): void {
      this.showDialog = false;
      this.selectedItem = null;
    },

    async submit(name: string, count: number, date: string): Promise<void> {
      this.loading = true;
      try {
        await myApi.create(name, count, date);
        this.closeDialog();
        await this.fetch();
      } finally {
        this.loading = false;
      }
    },
  },
});
```

**Запрещено** Composition API внутри defineStore:
```typescript
// ❌
export const useStore = defineStore('id', () => {
  const items = ref([]);
  return { items };
});
```

---

## Правило 15 — Полные именованные импорты, абсолютные пути

```typescript
// ✅
import { defineStore } from 'pinia';
import { useMyFeatureStore } from '@/widgets/my-feature/model/store';
import { BaseInput, BaseButton } from '@/shared/ui';

// ❌
import * as pinia from 'pinia';
import { useStore } from '../../../model/store';
```

Алиас `@/` — обязателен. Относительные пути `../` — запрещены.

---

## Правило 16 — Локализация через `useScopeT`

```typescript
import { useScopeT, useLocale } from '@/shared/lib';

const { scopeT } = useScopeT('myFeature');
const { t } = useLocale();

scopeT('title')           // → 'myFeature.title'
scopeT('errors.load')     // → 'myFeature.errors.load'

t('common.cancel')
t('common.save')
```

Файл перевода `src/shared/lib/i18n/locales/ru/myFeature.ts`:
```typescript
export default {
  title: 'Мой модуль',
  search: 'Поиск по модулю',
  columns: { name: 'Название', date: 'Дата', status: 'Статус' },
  fields: { name: 'Наименование', count: 'Количество' },
  create: { button: 'Создать', title: 'Создание записи' },
  edit: { title: 'Редактирование' },
  errors: { load: 'Ошибка загрузки', save: 'Ошибка сохранения' },
  notifications: { saved: 'Успешно сохранено', deleted: 'Успешно удалено' },
};
```

---

## Правило 17 — Типы строго в `types.ts`

```typescript
// types.ts
export interface MyItem {
  id: number;
  guid: string;
  name: string;
  date: string;
  status: MyStatus;
  organisationGuid: string;
}

export interface MyFilters {
  page: number;
  pageSize: number;
  query?: string;
  status?: MyStatus;
}

export type MyStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
```

**Запрещено:** объявлять типы внутри `store.ts`, компонентов или API-файлов.

---

## Правило 18 — Функции принимают готовые значения

Action принимает примитивы, не события DOM и не глубоко вложенные объекты.

```typescript
// ✅
submit(name: string, count: number, status: string): void { ... }
openDialog(id: number): void { ... }
setQuery(query: string): void { ... }
setPage(page: number): void { ... }
```

```typescript
// ❌
onInput(event: Event) { ... }
save(payload: { meta: { form: { values: unknown } } }) { ... }
```

---

## Шаблон публичного API слайса (index.ts)

```typescript
// widgets/my-feature/index.ts
export { MyFeatureWidget } from './ui/MyFeatureWidget/MyFeatureWidget.vue';
export { useMyFeatureStore } from './model/store';
export type { MyItem, MyStatus } from './model/types';
```

---

## Шаблон API-файла

```typescript
import { isMockMode } from '@/shared/config/mock.config';
import { http } from '@/shared/api';
import type { MyItem, MyFilters } from '../model/types';

const MOCK_ITEMS: MyItem[] = [
  { id: 1, guid: 'mock-001', name: 'Тест 1', date: '2025-01-01', status: 'DRAFT', organisationGuid: 'org-001' },
];

function buildParams(filters: MyFilters): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page: filters.page,
    page_size: filters.pageSize,
  };
  if (filters.query) params.query = filters.query;
  if (filters.status) params.status = filters.status;
  return params;
}

export async function fetchItems(filters: MyFilters): Promise<{ items: MyItem[]; total: number }> {
  if (isMockMode('myFeature')) {
    return { items: MOCK_ITEMS, total: MOCK_ITEMS.length };
  }
  const params = buildParams(filters);
  const response = await http.get<{ items: MyItem[]; total: number }>('/api/my-feature', { params });
  return response.data;
}

export async function createItem(name: string, count: number, date: string): Promise<MyItem> {
  if (isMockMode('myFeature')) {
    return { id: Date.now(), guid: `mock-${Date.now()}`, name, date, status: 'DRAFT', organisationGuid: '' };
  }
  const response = await http.post<MyItem>('/api/my-feature', { name, count, date });
  return response.data;
}

export async function deleteItem(guid: string): Promise<void> {
  if (isMockMode('myFeature')) return;
  await http.delete(`/api/my-feature/${guid}`);
}
```

---

## Чеклист перед коммитом

- [ ] Вся логика в `store.ts` — компоненты только вызывают store
- [ ] Нет комментариев в коде
- [ ] Новый модуль добавлен в `mock.config.ts` + переводы
- [ ] Файлы декомпозированы, ни один не > 150 строк без необходимости
- [ ] Имена кратки, без `handle/do/get`-антипаттернов
- [ ] Валидация работает через `vee-validate` + `yup` → `validation.ts`
- [ ] Стиль импортирован в `<script setup>`, лежит в `.scss` файле
- [ ] Используются только `Base`-компоненты из `@/shared/ui`
- [ ] Store написан в **Option API**
- [ ] Импорты — именованные, абсолютные через `@/`, без `../`
- [ ] Локализация через `useScopeT` + `useLocale`
- [ ] Все типы объявлены в `types.ts`
- [ ] Actions принимают примитивы, не DOM-события
- [ ] Соблюдена иерархия FSD-слоёв
- [ ] Публичный API слайса экспортируется через `index.ts`
