---
name: stories-vue
description: Создание Pinia-сторов в стиле Options API — плоские типы, чистые getters, async actions с try/catch/finally, простой и читаемый код. Загружай при создании или рефакторинге Pinia store в проектах где используется Pinia.
---

# Stories Vue — Pinia Options API

## Когда применять
- Создание нового Pinia store
- Рефакторинг существующего store
- Перевод setup-store в options-store
- Применимо **только** к проектам где установлен `pinia`. Текущий репозиторий `metal-art-site` — UI Kit без Pinia, skill используется для других проектов команды.

---

## Структура стора

Каждый стор — это **папка** в `src/stores/` (или `src/widgets/<x>/model/`, `src/entities/<x>/model/` для FSD-проектов).

```text
storeName/
├── storeName.store.ts      # сам стор
├── storeName.types.ts      # типы (state, параметры, ответы API)
└── index.ts                # реэкспорт
```

---

## Правила именования

| Сущность | Формат | Пример |
|----------|--------|--------|
| Папка стора | camelCase | `user/`, `productList/` |
| Файл стора | camelCase + `.store.ts` | `user.store.ts` |
| Файл типов | camelCase + `.types.ts` | `user.types.ts` |
| ID стора | kebab-case | `'user'`, `'product-list'` |
| Имя хука | `use` + PascalCase + `Store` | `useUserStore` |
| State-поля | camelCase | `items`, `isLoading`, `currentPage` |
| Getters | camelCase | `activeItems`, `totalCount` |
| Actions | camelCase, глагол первым | `fetchItems`, `removeItem`, `setFilter` |

### Ограничение длины имён
- Максимум **3 слова** в имени переменной или функции
- ✅ `fetchUserList`, `isModalOpen`, `activeItemCount`
- ❌ `fetchUserListFromServer`, `isConfirmDeleteModalOpen`

---

## Шаблон: файл типов (`storeName.types.ts`)

Типы — **плоские**. Не вкладывай интерфейсы друг в друга.

```typescript
export interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

export interface UserState {
  items: User[];
  current: User | null;
  isLoading: boolean;
  error: string;
}

export interface UserListParams {
  page: number;
  limit: number;
  search: string;
}

export interface UserCreateData {
  name: string;
  email: string;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
}
```

### Запрещено в типах

```ts
// ❌ вложенные интерфейсы
export interface UserState {
  pagination: {
    current: number;
    total: number;
    filters: { search: string; status: string };
  };
}

// ✅ плоские
export interface Pagination { current: number; total: number; }
export interface UserFilter { search: string; status: string; }
export interface UserState {
  pagination: Pagination;
  filter: UserFilter;
  items: User[];
}
```

---

## Шаблон: файл стора (`storeName.store.ts`)

```ts
import { defineStore } from 'pinia';
import type { UserState, User, UserListParams } from './user.types';
import { api } from '@/shared/api';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    items: [],
    current: null,
    isLoading: false,
    error: '',
  }),

  getters: {
    activeItems(): User[] {
      return this.items.filter((item) => item.isActive);
    },
    totalCount(): number {
      return this.items.length;
    },
    hasError(): boolean {
      return this.error !== '';
    },
  },

  actions: {
    async fetchItems(params: UserListParams): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        const data = await api.user.getList(params);
        this.items = data;
      } catch (err) {
        this.error = 'Ошибка загрузки';
      } finally {
        this.isLoading = false;
      }
    },

    async fetchById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        const data = await api.user.getById(id);
        this.current = data;
      } catch (err) {
        this.error = 'Ошибка загрузки';
      } finally {
        this.isLoading = false;
      }
    },

    async removeItem(id: number): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        await api.user.delete(id);
        this.items = this.items.filter((item) => item.id !== id);
      } catch (err) {
        this.error = 'Ошибка удаления';
      } finally {
        this.isLoading = false;
      }
    },

    resetState(): void {
      this.items = [];
      this.current = null;
      this.isLoading = false;
      this.error = '';
    },

    clearError(): void {
      this.error = '';
    },
  },
});
```

---

## Шаблон: реэкспорт `index.ts`

```ts
export { useUserStore } from './user.store';
export type {
  User,
  UserState,
  UserListParams,
  UserCreateData,
  UserUpdateData,
} from './user.types';
```

---

## Правила написания кода

### State
- Возвращай типизированный объект: `(): UserState => ({ ... })`
- Начальные значения: массив → `[]`, объект → `null`, строка → `''`, число → `0`, булево → `false`
- Не используй `undefined` как начальное значение — только `null`
- `isLoading` — всегда `boolean`
- `error` — всегда `string`, пустая строка = нет ошибки

### Getters
- Пиши как обычные функции с `this`
- Явно указывай возвращаемый тип
- Чистая функция, без побочных эффектов
- Не вызывай API в геттерах, не мутируй state

### Actions
- Каждый экшен — одна задача
- Имя начинается с глагола: `fetch`, `set`, `remove`, `reset`, `clear`, `toggle`, `update`
- Async actions: `async` + `Promise<void>`
- API-вызовы — всегда `try/catch/finally`:
  - `try` — запрос и запись результата
  - `catch` — запись в `this.error`
  - `finally` — сброс `this.isLoading`
- Не возвращай данные из экшенов — пиши в state

### Общее
- Не используй `any`, `unknown`, `as`
- Не используй `enum`, используй `type X = 'a' | 'b'`
- Не используй вычисляемые ключи и сложные дженерики
- Не используй `Object.assign`
- Не используй spread для глубокого копирования
- Не вызывай другие сторы внутри стора без крайней необходимости

---

## Паттерн: стор с пагинацией

```ts
// pagination.types.ts — переиспользуемый тип
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}
```

```ts
// product.types.ts
import type { Pagination } from '@/stores/shared/pagination.types';

export interface Product { id: number; name: string; price: number; }

export interface ProductState {
  items: Product[];
  pagination: Pagination;
  isLoading: boolean;
  error: string;
}
```

```ts
// product.store.ts
import { defineStore } from 'pinia';
import type { ProductState, Product } from './product.types';
import { api } from '@/shared/api';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const ERROR_LOAD = 'Ошибка загрузки';

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    items: [],
    pagination: { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, total: 0 },
    isLoading: false,
    error: '',
  }),

  getters: {
    hasNextPage(): boolean {
      const totalPages = Math.ceil(this.pagination.total / this.pagination.limit);
      return this.pagination.page < totalPages;
    },
  },

  actions: {
    async fetchItems(): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        const { page, limit } = this.pagination;
        const response = await api.product.getList({ page, limit });
        this.items = response.items;
        this.pagination.total = response.total;
      } catch (err) {
        this.error = ERROR_LOAD;
      } finally {
        this.isLoading = false;
      }
    },

    setPage(page: number): void {
      this.pagination.page = page;
    },

    resetState(): void {
      this.items = [];
      this.pagination.page = DEFAULT_PAGE;
      this.pagination.total = 0;
      this.isLoading = false;
      this.error = '';
    },
  },
});
```

---

## Паттерн: стор с фильтрами

```ts
// order.types.ts
export type OrderStatus = 'new' | 'active' | 'done' | 'cancelled';

export interface Order { id: number; title: string; status: OrderStatus; }

export interface OrderFilter {
  search: string;
  status: OrderStatus | '';
}

export interface OrderState {
  items: Order[];
  filter: OrderFilter;
  isLoading: boolean;
  error: string;
}
```

```ts
// order.store.ts
import { defineStore } from 'pinia';
import type { OrderState, Order, OrderFilter } from './order.types';

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    items: [],
    filter: { search: '', status: '' },
    isLoading: false,
    error: '',
  }),

  getters: {
    filteredItems(): Order[] {
      let result = this.items;
      if (this.filter.search) {
        const query = this.filter.search.toLowerCase();
        result = result.filter((item) => item.title.toLowerCase().includes(query));
      }
      if (this.filter.status) {
        result = result.filter((item) => item.status === this.filter.status);
      }
      return result;
    },
  },

  actions: {
    setFilter(filter: Partial<OrderFilter>): void {
      if (filter.search !== undefined) this.filter.search = filter.search;
      if (filter.status !== undefined) this.filter.status = filter.status;
    },

    resetFilter(): void {
      this.filter.search = '';
      this.filter.status = '';
    },
  },
});
```

---

## Порядок действий при создании стора
1. Уточни: какая сущность, какие данные, какие операции нужны
2. Создай папку `src/stores/storeName/`
3. Напиши `storeName.types.ts` — сначала плоские типы
4. Напиши `storeName.store.ts` — стор в Options API
5. Напиши `index.ts` — реэкспорт
6. Покажи пример использования в компоненте

---

## Пример использования

```vue
<template>
  <div v-if="userStore.isLoading">Загрузка...</div>
  <div v-else-if="userStore.hasError">{{ userStore.error }}</div>
  <ul v-else>
    <li v-for="user in userStore.activeItems" :key="user.id">
      {{ user.name }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
</script>
```

---

## Что НЕ делать

- Не используй Setup-стиль (`defineStore('id', () => {...})`) — только Options API
- Не пиши типы внутри файла стора — только в `.types.ts`
- Не вкладывай интерфейсы
- Не используй `any`, `unknown`, `as`, `enum`
- Не пиши функции длиннее 15 строк — разбивай на несколько экшенов
- Не именуй переменные длиннее 3 слов
- Не используй тернарники с вложенностью
- Не вызывай экшены других сторов без крайней необходимости
- Не возвращай данные из экшенов — пиши в state
- Не используй `computed` или `ref` внутри Options-стора
- Не создавай файлы вне папки стора

---

## Принципы Clean Code (Роберт Мартин) для Pinia Store

### 1. Одно действие — одна ответственность
Каждый action делает только одну задачу. Если разрастается — разбей.
- ✅ `fetchItems`, `setPage`, `clearError`
- ❌ `fetchItemsAndSetPageAndShowToast`

### 2. Говорящие имена без сокращений
- Предикаты как вопрос: `hasError`, `isLoading`, `hasNextPage`
- Никаких `arr`, `tmp`, `res`, `data2`

### 3. Один уровень абстракции на функцию
Не смешивай высокоуровневые шаги и низкоуровневые детали. Порядок: подготовка → API → запись → ошибка → завершение.

### 4. DRY — выноси повторы
Повторяющиеся блоки старта/конца загрузки → `startLoading()`, `finishLoading()`, `setError(msg)`.

### 5. Единообразные ошибки
- `'Ошибка загрузки'`, `'Ошибка удаления'`, `'Ошибка сохранения'`
- Не проглатывай ошибки молча — всегда пиши в `this.error`

### 6. Никаких магических значений
- `const DEFAULT_PAGE = 1`, `const DEFAULT_LIMIT = 20`, `const ERROR_LOAD = 'Ошибка загрузки'`

### 7. Чистые getters
Только вычисление. Без API, мутаций, логирования. Тип возврата всегда явный.

### 8. Предсказуемый state
`resetState()` восстанавливает начальное состояние полностью. Структура state стабильна.

### 9. Минимум побочных эффектов
Action меняет только свой store. Никакого DOM/router/localStorage напрямую — это в компонент или сервис.

### 10. Guard clauses
Невалидный вход — выйди сразу. Уменьшает вложенность.

---

## Чеклист перед завершением

- [ ] Все типы — в `storeName.types.ts`
- [ ] Нет `any`, `unknown`, `as`, `enum`
- [ ] Все async actions возвращают `Promise<void>`
- [ ] API-вызовы обёрнуты в `try/catch/finally`
- [ ] `isLoading` и `error` используются единообразно
- [ ] Функции до 15 строк
- [ ] Нет дублирования
- [ ] Имена до 3 слов
- [ ] `resetState()` восстанавливает начальное состояние
- [ ] Getters чистые
- [ ] Магические значения вынесены в константы
