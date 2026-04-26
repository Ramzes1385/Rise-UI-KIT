---
name: stories-vue
description: >-
  Создание Pinia-сторов в стиле Options API — простой, типизированный, читаемый
  код
modeSlugs:
  - code
  - debug
  - vue-store
  - architect
---

# Stories Vue

## Instructions

Ты создаёшь Pinia-сторы в стиле **Options API**.  
Код должен быть **простым** — любой джуниор должен разобраться за минуту.  
Язык общения — **русский**. Комментарии в коде — **на русском**.

---

## Структура стора

Каждый стор — это **папка** в `src/stores/`.

```text
storeName/
├── storeName.store.ts      # сам стор
├── storeName.types.ts      # типы (state, параметры, ответы API)
└── index.ts                # реэкспорт
```

---

## Правила именования

| Сущность    | Формат                       | Пример                                  |
| ----------- | ---------------------------- | --------------------------------------- |
| Папка стора | camelCase                    | `user/`, `productList/`                 |
| Файл стора  | camelCase + `.store.ts`      | `user.store.ts`                         |
| Файл типов  | camelCase + `.types.ts`      | `user.types.ts`                         |
| ID стора    | kebab-case                   | `'user'`, `'product-list'`              |
| Имя хука    | `use` + PascalCase + `Store` | `useUserStore`                          |
| State-поля  | camelCase                    | `items`, `isLoading`, `currentPage`     |
| Getters     | camelCase                    | `activeItems`, `totalCount`             |
| Actions     | camelCase, глагол первым     | `fetchItems`, `removeItem`, `setFilter` |

### Ограничение длины имён

- Максимум **3 слова** в имени переменной или функции
- ✅ `fetchUserList`, `isModalOpen`, `activeItemCount`
- ❌ `fetchUserListFromServer`, `isConfirmDeleteModalOpen`

---

## Шаблон: файл типов (`storeName.types.ts`)

Типы — **плоские**. Не вкладывай интерфейсы друг в друга.

```typescript
/** Пользователь */
export interface User {
	id: number
	name: string
	email: string
	isActive: boolean
}

/** Состояние стора user */
export interface UserState {
	items: User[]
	current: User | null
	isLoading: boolean
	error: string
}

/** Параметры запроса списка */
export interface UserListParams {
	page: number
	limit: number
	search: string
}

/** Данные для создания */
export interface UserCreateData {
	name: string
	email: string
}

/** Данные для обновления */
export interface UserUpdateData {
	name?: string
	email?: string
}
```

## Запрещено в типах

```ts
// ❌ Вложенные типы
export interface UserState {
	pagination: {
		current: number
		total: number
		filters: {
			search: string
			status: string
		}
	}
}

// ✅ Плоские типы
export interface Pagination {
	current: number
	total: number
}

export interface UserFilter {
	search: string
	status: string
}

export interface UserState {
	pagination: Pagination
	filter: UserFilter
	items: User[]
}
```

### Шаблон: файл стора ( storeName.store.ts )

```ts
import { defineStore } from 'pinia'
import type { UserState, User, UserListParams } from './user.types'
import { api } from '@/shared/api'

export const useUserStore = defineStore('user', {
	state: (): UserState => ({
		items: [],
		current: null,
		isLoading: false,
		error: '',
	}),

	getters: {
		/** Активные пользователи */
		activeItems(): User[] {
			return this.items.filter(item => item.isActive)
		},

		/** Количество элементов */
		totalCount(): number {
			return this.items.length
		},

		/** Есть ли ошибка */
		hasError(): boolean {
			return this.error !== ''
		},
	},

	actions: {
		/** Загрузить список */
		async fetchItems(params: UserListParams): Promise<void> {
			this.isLoading = true
			this.error = ''

			try {
				const data = await api.user.getList(params)
				this.items = data
			} catch (err) {
				this.error = 'Ошибка загрузки'
			} finally {
				this.isLoading = false
			}
		},

		/** Загрузить по ID */
		async fetchById(id: number): Promise<void> {
			this.isLoading = true
			this.error = ''

			try {
				const data = await api.user.getById(id)
				this.current = data
			} catch (err) {
				this.error = 'Ошибка загрузки'
			} finally {
				this.isLoading = false
			}
		},

		/** Удалить элемент */
		async removeItem(id: number): Promise<void> {
			this.isLoading = true
			this.error = ''

			try {
				await api.user.delete(id)
				this.items = this.items.filter(item => item.id !== id)
			} catch (err) {
				this.error = 'Ошибка удаления'
			} finally {
				this.isLoading = false
			}
		},

		/** Сбросить состояние */
		resetState(): void {
			this.items = []
			this.current = null
			this.isLoading = false
			this.error = ''
		},

		/** Очистить ошибку */
		clearError(): void {
			this.error = ''
		},
	},
})
```

### Шаблон: реэкспорт (index.ts)

```ts
export { useUserStore } from './user.store'
export type { User, UserState, UserListParams, UserCreateData, UserUpdateData } from './user.types'
```

## Правила написания кода

### State

- Возвращай из `state` типизированный объект: `(): UserState => ({ ... })`
- Начальные значения:
  - массивы — `[]`
  - объекты — `null`
  - строки — `''`
  - числа — `0`
  - булевы — `false`
- Не используй `undefined` как начальное значение — только `null`
- Поле `isLoading` — всегда `boolean`
- Поле `error` — всегда `string`, пустая строка = нет ошибки

### Getters

- Пиши как обычные функции с `this`
- Явно указывай возвращаемый тип
- Геттер — чистая функция, без побочных эффектов
- Не вызывай API в геттерах
- Не мутируй state в геттерах

### Actions

- Каждый экшен — одна задача
- Имя начинается с глагола: `fetch`, `set`, `remove`, `reset`, `clear`, `toggle`, `update`
- Асинхронные экшены: `async` + `Promise<void>`
- Всегда оборачивай API-вызовы в `try/catch/finally`
  - `try` — запрос и запись результата
  - `catch` — запись ошибки в `this.error`
  - `finally` — сброс `this.isLoading`
- Не возвращай данные из экшенов — записывай в state

### Общее

- Не используй `any`
- Не используй `enum`, используй `type Union = 'a' | 'b'`
- Не используй вычисляемые ключи и сложные дженерики
- Не используй `Object.assign`
- Не используй spread для глубокого копирования
- Не вызывай другие сторы внутри стора без крайней необходимости

---

## Паттерн: стор с пагинацией

```ts
// pagination.types.ts — переиспользуемый тип
export interface Pagination {
	page: number
	limit: number
	total: number
}
```

```ts
// product.types.ts
import type { Pagination } from '@/stores/shared/pagination.types'

export interface Product {
	id: number
	name: string
	price: number
}

export interface ProductState {
	items: Product[]
	pagination: Pagination
	isLoading: boolean
	error: string
}
```

```ts
// product.store.ts
import { defineStore } from 'pinia'
import type { ProductState, Product } from './product.types'
import { api } from '@/shared/api'

export const useProductStore = defineStore('product', {
	state: (): ProductState => ({
		items: [],
		pagination: {
			page: 1,
			limit: 20,
			total: 0,
		},
		isLoading: false,
		error: '',
	}),

	getters: {
		/** Есть ли ещё страницы */
		hasNextPage(): boolean {
			const totalPages = Math.ceil(this.pagination.total / this.pagination.limit)
			return this.pagination.page < totalPages
		},
	},

	actions: {
		/** Загрузить страницу */
		async fetchItems(): Promise<void> {
			this.isLoading = true
			this.error = ''

			try {
				const { page, limit } = this.pagination
				const response = await api.product.getList({ page, limit })

				this.items = response.items
				this.pagination.total = response.total
			} catch (err) {
				this.error = 'Ошибка загрузки'
			} finally {
				this.isLoading = false
			}
		},

		/** Перейти на страницу */
		setPage(page: number): void {
			this.pagination.page = page
		},

		/** Сбросить состояние */
		resetState(): void {
			this.items = []
			this.pagination.page = 1
			this.pagination.total = 0
			this.isLoading = false
			this.error = ''
		},
	},
})
```

```ts
// order.types.ts
export type OrderStatus = 'new' | 'active' | 'done' | 'cancelled'

export interface Order {
	id: number
	title: string
	status: OrderStatus
}

export interface OrderFilter {
	search: string
	status: OrderStatus | ''
}

export interface OrderState {
	items: Order[]
	filter: OrderFilter
	isLoading: boolean
	error: string
}
```

```ts
// order.store.ts
import { defineStore } from 'pinia'
import type { OrderState, Order, OrderFilter } from './order.types'

export const useOrderStore = defineStore('order', {
	state: (): OrderState => ({
		items: [],
		filter: {
			search: '',
			status: '',
		},
		isLoading: false,
		error: '',
	}),

	getters: {
		/** Отфильтрованные элементы */
		filteredItems(): Order[] {
			let result = this.items

			if (this.filter.search) {
				const query = this.filter.search.toLowerCase()
				result = result.filter(item => item.title.toLowerCase().includes(query))
			}

			if (this.filter.status) {
				result = result.filter(item => item.status === this.filter.status)
			}

			return result
		},
	},

	actions: {
		/** Установить фильтр */
		setFilter(filter: Partial<OrderFilter>): void {
			if (filter.search !== undefined) {
				this.filter.search = filter.search
			}

			if (filter.status !== undefined) {
				this.filter.status = filter.status
			}
		},

		/** Сбросить фильтры */
		resetFilter(): void {
			this.filter.search = ''
			this.filter.status = ''
		},
	},
})
```

## Порядок действий при создании стора

1. Уточни у пользователя: какая сущность, какие данные, какие операции нужны
2. Создай папку `src/stores/storeName/`
3. Напиши `storeName.types.ts` — сначала плоские типы
4. Напиши `storeName.store.ts` — стор в Options API
5. Напиши `index.ts` — реэкспорт
6. Покажи пользователю пример использования в компоненте

---

## Пример использования (показывай после создания)

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
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>
```

## Что НЕ делать

- Не используй Setup-стиль (`defineStore('id', () => {...})`) — только Options API
- Не пиши типы внутри файла стора — только в `.types.ts`
- Не вкладывай интерфейсы друг в друга
- Не используй `any`, `unknown`, `as`
- Не используй `enum`
- Не пиши функции длиннее 15 строк — разбивай на несколько экшенов
- Не именуй переменные длиннее 3 слов
- Не используй тернарники с вложенностью
- Не вызывай экшены других сторов без крайней необходимости
- Не возвращай данные из экшенов — пиши в state
- Не используй `computed` или `ref` внутри Options-стора
- Не создавай файлы вне папки стора

## Дополнения по «Чистому коду» (Роберт Мартин) для Pinia Store

### 1) Одно действие — одна ответственность

- Каждый action делает **только одну задачу**
- Если action вырос — разбей на несколько коротких action
- Не смешивай в одном action:
  - загрузку данных
  - преобразование данных
  - работу с UI-флагами
  - уведомления

✅ Хорошо:

- `fetchItems`
- `setPage`
- `clearError`

❌ Плохо:

- `fetchItemsAndSetPageAndShowToast`

---

### 2) Говорящие имена без сокращений

- Имена должны объяснять намерение, а не реализацию
- Не используй непонятные сокращения (`arr`, `tmp`, `res`)
- Предикаты называй как вопрос:
  - `hasError`
  - `isLoading`
  - `hasNextPage`

---

### 3) Минимум уровней абстракции в одной функции

- В одном action не смешивай «высокоуровневые» шаги и «низкоуровневые» детали
- Лучше вынести повторяющиеся куски в маленькие внутренние методы (actions)

Порядок шагов:

1. Подготовить состояние
2. Вызвать API
3. Записать результат
4. Обработать ошибку
5. Завершить загрузку

---

### 4) Избегай дублирования (DRY)

Повторяющиеся блоки инициализации/завершения загрузки выноси в короткие actions:

- `startLoading()`
- `finishLoading()`
- `setError(message: string)`

---

### 5) Явные и единообразные ошибки

- Используй одинаковый стиль ошибок:
  - `'Ошибка загрузки'`
  - `'Ошибка удаления'`
  - `'Ошибка сохранения'`
- Не проглатывай ошибку молча — всегда записывай в `this.error`

---

### 6) Никаких «магических значений»

- Повторяющиеся значения выноси в константы:
  - `const DEFAULT_PAGE = 1`
  - `const DEFAULT_LIMIT = 20`
  - `const ERROR_LOAD = 'Ошибка загрузки'`

---

### 7) Чистые getters

- Getter — только вычисление
- Без API, без мутаций, без логирования
- Тип результата всегда явный

---

### 8) Предсказуемый state

- Структура state стабильна
- `resetState()` полностью возвращает начальное состояние
- Инициализация в `state` и `resetState` согласованы

---

### 9) Минимум побочных эффектов

- Action меняет только свой store
- Не работай напрямую с DOM/роутером/localStorage в store (если это не оговорено явно)
- Внешние эффекты — в компонент или сервис

---

### 10) Проверки в начале (guard clauses)

- Невалидные входные данные отсекай сразу
- Уменьшай вложенность
- Пример: если `id <= 0` — запиши ошибку и выйди

---

### Мини-чеклист перед завершением store

- [ ] Все типы лежат в `storeName.types.ts`
- [ ] Нет `any`, `unknown`, `as`, `enum`
- [ ] Все async actions возвращают `Promise<void>`
- [ ] Для API есть `try/catch/finally`
- [ ] `isLoading` и `error` используются единообразно
- [ ] Нет длинных функций (до 15 строк)
- [ ] Нет дублирования очевидных блоков
- [ ] Имена простые, понятные, до 3 слов
- [ ] `resetState()` полностью восстанавливает начальное состояние
- [ ] Getters чистые, без побочных эффектов
