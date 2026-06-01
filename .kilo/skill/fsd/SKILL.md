---
name: fsd
description: Универсальная методология Feature-Sliced Design — слои (app/pages/widgets/features/entities/shared), слайсы, сегменты, публичные API, правила импортов сверху-вниз, размещение кода по слоям. Загружай при проектировании FSD-структуры, ответе на «куда положить этот код», ревью импортов между слоями, объяснении методологии. НЕ применяй в metal-art-site (UI Kit без FSD).
---

# Feature-Sliced Design — методология

## Когда применять

- Проектирование структуры нового FSD-приложения (или раздела) с нуля.
- Решение «куда положить этот код» — какой слой, слайс, сегмент.
- Ревью PR на корректность импортов между слоями.
- Объяснение FSD-методологии заказчику или новому разработчику.

## Связь с другими skills

| Если задача про… | Загружай |
|---|---|
| Универсальные принципы FSD (слои, импорты, публичные API) | **`fsd`** (этот) |
| Конкретные TM2-стандарты (Pinia Option API, Quasar Base, `useScopeT`, `mock.config.ts`) | **`project-standards`** парно с `fsd` |
| Pinia Options API store (типы, getters, actions) | **`stories-vue`** |
| Утилиты, composables, форматтеры в `shared/lib` | **`shared-lib-standards`** |
| Простой Vue 3 компонент (общие правила без FSD) | **`component-vue`** |
| Чистый код (имена, функции, SOLID, code smells) | **`clean-code`** — всегда фоном |
| UI Kit `metal-art-site` (там НЕТ FSD) | **`ui-kit-component`**, не этот skill |

> Этот skill — **универсальная база FSD** (слои, правила, размещение). Конкретные технологические стандарты команды живут в `project-standards`.

---

## Что такое FSD

Feature-Sliced Design — архитектурная методология для фронтенд-проектов. Она делит проект на **слои**, слои на **слайсы**, слайсы на **сегменты**.

Главная цель — **предсказуемость**: любой разработчик открывает проект и понимает где что лежит.

---

## Структура проекта

```
src/
├── app/                    — инициализация приложения
│   ├── providers/          — провайдеры (router, store, i18n)
│   ├── styles/             — глобальные стили
│   ├── App.vue
│   └── index.ts
│
├── pages/                  — страницы приложения
│   ├── HomePage/
│   ├── ProductPage/
│   └── NotFoundPage/
│
├── widgets/                — самостоятельные блоки интерфейса
│   ├── Header/
│   ├── Sidebar/
│   └── ProductList/
│
├── features/               — действия пользователя
│   ├── AuthByEmail/
│   ├── AddToCart/
│   └── ToggleFavorite/
│
├── entities/               — бизнес-сущности
│   ├── User/
│   ├── Product/
│   └── Order/
│
└── shared/                 — переиспользуемый код без бизнес-логики
    ├── ui/                 — UI-kit компоненты
    ├── api/                — HTTP-клиент, инстанс axios
    ├── lib/                — утилиты, хелперы, composables
    ├── config/             — константы, env-переменные
    └── types/              — глобальные типы
```

---

## Слои — иерархия

Слои расположены **строго по иерархии**. Каждый слой знает только о слоях **ниже** себя.

```
app        ← точка входа, собирает всё вместе
  ↓
pages      ← композиция виджетов и фичей для конкретного URL
  ↓
widgets    ← самостоятельные блоки UI, комбинируют фичи и сущности
  ↓
features   ← пользовательские сценарии и действия
  ↓
entities   ← бизнес-сущности, данные, их отображение
  ↓
shared     ← общий код, не привязанный к бизнесу
```

### Правило импортов

```typescript
// ✅ Верхний слой импортирует из нижнего
// pages/ProductPage → features/AddToCart      — МОЖНО
// features/AddToCart → entities/Product       — МОЖНО
// entities/Product → shared/ui                — МОЖНО

// ❌ Нижний слой НЕ импортирует из верхнего
// entities/Product → features/AddToCart       — ЗАПРЕЩЕНО
// features/AddToCart → pages/ProductPage      — ЗАПРЕЩЕНО
// shared/ui → entities/Product                — ЗАПРЕЩЕНО

// ❌ Слайсы одного слоя НЕ импортируют друг друга
// features/AddToCart → features/AuthByEmail   — ЗАПРЕЩЕНО
// entities/User → entities/Product            — ЗАПРЕЩЕНО
```

---

## Слой `shared` — общий код

Единственный слой **без слайсов**. Делится только на **сегменты**.
Не содержит бизнес-логики. Не знает о сущностях, фичах, страницах.

```
shared/
├── ui/                     — базовые UI-компоненты
│   ├── BaseButton/
│   │   ├── BaseButton.vue
│   │   ├── BaseButton.types.ts
│   │   ├── BaseButton.style.scss
│   │   └── index.ts
│   ├── BaseInput/
│   ├── BaseModal/
│   └── index.ts            — публичный API всего ui
│
├── api/                    — HTTP-клиент
│   ├── instance.ts         — настроенный axios/fetch
│   ├── interceptors.ts     — перехватчики запросов
│   └── index.ts
│
├── lib/                    — утилиты и composables
│   ├── useDebounce.ts
│   ├── formatDate.ts
│   ├── formatPrice.ts
│   └── index.ts
│
├── config/                 — конфигурация
│   ├── routes.ts           — имена маршрутов (константы)
│   ├── env.ts              — переменные окружения
│   └── index.ts
│
└── types/                  — глобальные типы
    ├── common.types.ts     — Pagination, SortOrder и т.д.
    └── index.ts
```

### Пример: `shared/api/instance.ts`

```typescript
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { env } from '@/shared/config';

export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});
```

### Пример: `shared/api/index.ts`

```typescript
export { httpClient } from './instance';
```

### Пример: `shared/types/common.types.ts`

```typescript
export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export type SortOrder = 'asc' | 'desc';

export interface ListResponse<T> {
  items: T[];
  total: number;
}
```

> Подробнее по содержимому `shared/lib` (composables, formatters, utils, validation) — см. skill `shared-lib-standards`.

---

## Слой `entities` — бизнес-сущности

Каждый слайс — **одна сущность** предметной области. Содержит: тип данных, API-методы, store, UI для отображения.

```
entities/
├── Product/
│   ├── ui/
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.vue
│   │   │   ├── ProductCard.types.ts
│   │   │   ├── ProductCard.style.scss
│   │   │   └── index.ts
│   │   └── ProductRow/
│   │       ├── ProductRow.vue
│   │       ├── ProductRow.types.ts
│   │       ├── ProductRow.style.scss
│   │       └── index.ts
│   │
│   ├── model/
│   │   ├── product.store.ts
│   │   ├── product.types.ts
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── product.api.ts
│   │   ├── product.api.types.ts
│   │   └── index.ts
│   │
│   ├── lib/                — утилиты сущности (опционально)
│   │   ├── formatPrice.ts
│   │   └── index.ts
│   │
│   └── index.ts            — публичный API слайса
│
├── User/
│   ├── ui/
│   ├── model/
│   ├── api/
│   └── index.ts
│
└── Order/
    ├── ui/
    ├── model/
    ├── api/
    └── index.ts
```

### Пример: `entities/Product/model/product.types.ts`

```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
}

export interface ProductState {
  items: Product[];
  current: Product | null;
  isLoading: boolean;
  error: string;
}
```

### Пример: `entities/Product/api/product.api.types.ts`

```typescript
export interface ProductListParams {
  page: number;
  limit: number;
  category?: string;
}

export interface ProductCreateData {
  name: string;
  price: number;
  category: string;
}
```

### Пример: `entities/Product/api/product.api.ts`

```typescript
import { httpClient } from '@/shared/api';
import type { ListResponse } from '@/shared/types';
import type { Product } from '../model/product.types';
import type { ProductListParams, ProductCreateData } from './product.api.types';

export const productApi = {
  async getList(params: ProductListParams): Promise<ListResponse<Product>> {
    const { data } = await httpClient.get('/products', { params });
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await httpClient.get(`/products/${id}`);
    return data;
  },

  async create(payload: ProductCreateData): Promise<Product> {
    const { data } = await httpClient.post('/products', payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/products/${id}`);
  },
};
```

### Пример: `entities/Product/model/product.store.ts`

```typescript
import { defineStore } from 'pinia';
import type { ProductState, Product } from './product.types';
import type { ProductListParams } from '../api/product.api.types';
import { productApi } from '../api';

const ERROR_LOAD = 'Ошибка загрузки товаров';
const ERROR_NOT_FOUND = 'Товар не найден';

export const useProductStore = defineStore('product', {
  state: (): ProductState => ({
    items: [],
    current: null,
    isLoading: false,
    error: '',
  }),

  getters: {
    inStockItems(): Product[] {
      return this.items.filter((item) => item.inStock);
    },

    hasError(): boolean {
      return this.error !== '';
    },
  },

  actions: {
    async fetchItems(params: ProductListParams): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        const response = await productApi.getList(params);
        this.items = response.items;
      } catch (err) {
        this.error = ERROR_LOAD;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchById(id: number): Promise<void> {
      this.isLoading = true;
      this.error = '';
      try {
        this.current = await productApi.getById(id);
      } catch (err) {
        this.error = ERROR_NOT_FOUND;
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
  },
});
```

> Полные правила Pinia Options API store (типы, getters, actions, F.I.R.S.T. для тестов сторов) — см. skill `stories-vue`.

### Публичный API: `entities/Product/index.ts`

```typescript
// UI
export { default as ProductCard } from './ui/ProductCard/ProductCard.vue';
export { default as ProductRow } from './ui/ProductRow/ProductRow.vue';

// Model
export { useProductStore } from './model';
export type { Product } from './model';

// API
export { productApi } from './api';
export type { ProductListParams, ProductCreateData } from './api';
```

**Важно:** наружу экспортируется только то, что нужно другим слоям. Внутренние детали (`ProductState`, внутренние хелперы) скрыты.

---

## Слой `features` — действия пользователя

Каждый слайс — **один пользовательский сценарий**. Фича отвечает на вопрос: «Что пользователь может **сделать**?»

```
features/
├── AddToCart/
│   ├── ui/
│   │   ├── AddToCartButton/
│   │   │   ├── AddToCartButton.vue
│   │   │   ├── AddToCartButton.types.ts
│   │   │   ├── AddToCartButton.style.scss
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── model/
│   │   ├── addToCart.store.ts
│   │   ├── addToCart.types.ts
│   │   └── index.ts
│   │
│   ├── api/                — если у фичи свой endpoint
│   │   ├── addToCart.api.ts
│   │   └── index.ts
│   │
│   └── index.ts            — публичный API фичи
│
├── AuthByEmail/
│   ├── ui/
│   │   └── AuthForm/
│   ├── model/
│   ├── api/
│   └── index.ts
│
├── SearchProduct/
│   ├── ui/
│   │   └── SearchBar/
│   ├── model/
│   └── index.ts
│
└── ToggleFavorite/
    ├── ui/
    │   └── FavoriteButton/
    ├── model/
    └── index.ts
```

### Правила именования фич

Имя фичи — **действие**. Глагол + существительное.

```
✅ Понятные имена фич:
AddToCart           — добавить в корзину
AuthByEmail         — авторизация по email
SearchProduct       — поиск товаров
ToggleFavorite      — переключить избранное
FilterByCategory    — фильтрация по категории
CreateOrder         — создание заказа
EditProfile         — редактирование профиля

❌ Плохие имена — непонятно что фича ДЕЛАЕТ:
Cart                — это сущность, не действие
Products            — это сущность
Modal               — это UI-компонент
Helpers             — это shared/lib
```

### Пример: `features/AddToCart/ui/AddToCartButton/AddToCartButton.vue`

```vue
<template>
  <button
    class="add-to-cart-button"
    :class="{
      'add-to-cart-button--loading': isLoading,
      'add-to-cart-button--added': isAdded,
    }"
    :disabled="isLoading"
    type="button"
    @click="handleAdd"
  >
    <span v-if="isLoading" class="add-to-cart-button__text">Добавление...</span>
    <span v-else-if="isAdded" class="add-to-cart-button__text">✓ В корзине</span>
    <span v-else class="add-to-cart-button__text">В корзину</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { AddToCartButtonProps } from './AddToCartButton.types';
import { cartApi } from '@/entities/Cart';
import './AddToCartButton.style.scss';

const props = defineProps<AddToCartButtonProps>();

const isLoading = ref(false);
const isAdded = ref(false);

async function handleAdd(): Promise<void> {
  if (isAdded.value) return;

  isLoading.value = true;
  try {
    await cartApi.add(props.productId);
    isAdded.value = true;
  } finally {
    isLoading.value = false;
  }
}
</script>
```

### Фича может использовать сущности

```typescript
// features/AddToCart/ui/AddToCartButton/AddToCartButton.vue
import { useProductStore } from '@/entities/Product';   // ✅ фича → сущность
import { useCartStore } from '@/entities/Cart';         // ✅ фича → сущность
```

### Фича НЕ может использовать другие фичи

```typescript
// features/AddToCart → features/AuthByEmail            ❌ ЗАПРЕЩЕНО
```

---

## Слой `widgets` — составные блоки

Виджет — **самостоятельный блок интерфейса**, который комбинирует фичи и сущности. Виджет не содержит бизнес-логики — он **собирает** готовые части.

```
widgets/
├── Header/
│   ├── ui/
│   │   ├── Header.vue
│   │   ├── Header.types.ts
│   │   ├── Header.style.scss
│   │   └── index.ts
│   └── index.ts
│
├── ProductList/
│   ├── ui/
│   │   ├── ProductList.vue
│   │   ├── ProductList.types.ts
│   │   ├── ProductList.style.scss
│   │   └── index.ts
│   └── index.ts
│
└── Sidebar/
    ├── ui/
    └── index.ts
```

### Пример: `widgets/ProductList/ui/ProductList.vue`

```vue
<template>
  <section class="product-list">
    <div class="product-list__toolbar">
      <SearchBar />
      <FilterByCategory />
    </div>

    <div v-if="productStore.isLoading" class="product-list__loader">Загрузка...</div>

    <div v-else-if="productStore.hasError" class="product-list__error">
      {{ productStore.error }}
    </div>

    <ul v-else class="product-list__items">
      <li
        v-for="product in productStore.items"
        :key="product.id"
        class="product-list__item"
      >
        <ProductCard
          :name="product.name"
          :price="product.price"
          :image-url="product.imageUrl"
        >
          <template #actions>
            <AddToCartButton :product-id="product.id" />
            <FavoriteButton :product-id="product.id" />
          </template>
        </ProductCard>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { ProductCard, useProductStore } from '@/entities/Product';

import { AddToCartButton } from '@/features/AddToCart';
import { FavoriteButton } from '@/features/ToggleFavorite';
import { SearchBar } from '@/features/SearchProduct';
import { FilterByCategory } from '@/features/FilterByCategory';

import './ProductList.style.scss';

const productStore = useProductStore();

onMounted(() => {
  productStore.fetchItems({ page: 1, limit: 20 });
});
</script>
```

---

## Слой `pages` — страницы

Каждый слайс — **один маршрут**. Страница собирает виджеты. Страница **не содержит** бизнес-логику — только компоновку.

```
pages/
├── HomePage/
│   ├── ui/
│   │   ├── HomePage.vue
│   │   ├── HomePage.style.scss
│   │   └── index.ts
│   └── index.ts
│
├── ProductPage/
│   ├── ui/
│   │   ├── ProductPage.vue
│   │   ├── ProductPage.style.scss
│   │   └── index.ts
│   └── index.ts
│
└── NotFoundPage/
    ├── ui/
    └── index.ts
```

### Пример: `pages/HomePage/ui/HomePage.vue`

```vue
<template>
  <main class="home-page">
    <section class="home-page__hero">
      <HeroBanner />
    </section>

    <section class="home-page__products">
      <h2 class="home-page__title">Популярные товары</h2>
      <ProductList />
    </section>
  </main>
</template>

<script setup lang="ts">
import { HeroBanner } from '@/widgets/HeroBanner';
import { ProductList } from '@/widgets/ProductList';
import './HomePage.style.scss';
</script>
```

---

## Слой `app` — инициализация

Единственный слой без слайсов и без слоёв ниже. Отвечает за **сборку приложения**: провайдеры, роутер, глобальные стили.

```
app/
├── providers/
│   ├── RouterProvider.ts       — настройка vue-router
│   ├── StoreProvider.ts        — настройка pinia
│   └── index.ts
│
├── styles/
│   ├── variables.scss          — CSS-переменные
│   ├── reset.scss              — сброс стилей
│   └── global.scss             — глобальные стили
│
├── App.vue                     — корневой компонент
├── main.ts                     — точка входа
└── index.ts
```

---

## Публичный API — правило изоляции

**Каждый слайс общается с миром только через `index.ts`.**

### Правильный импорт

```typescript
// ✅ Импорт через публичный API
import { ProductCard, useProductStore } from '@/entities/Product';
import { AddToCartButton } from '@/features/AddToCart';
import { BaseButton } from '@/shared/ui';

// ❌ Импорт напрямую во внутренности слайса
import ProductCard from '@/entities/Product/ui/ProductCard/ProductCard.vue';
import { useProductStore } from '@/entities/Product/model/product.store';
import { productApi } from '@/entities/Product/api/product.api';
```

### Структура `index.ts` слайса

Экспортируй только то, что нужно **наружу**. Внутренние детали скрыты.

```typescript
// entities/Product/index.ts

// UI — только компоненты для отображения
export { default as ProductCard } from './ui/ProductCard/ProductCard.vue';
export { default as ProductRow } from './ui/ProductRow/ProductRow.vue';

// Model — стор и публичные типы
export { useProductStore } from './model';
export type { Product } from './model';

// API — только если другие слои вызывают напрямую
export { productApi } from './api';
export type { ProductListParams } from './api';
```

**Не экспортируй:**
- Внутренние хелперы слайса
- Типы состояния стора (`ProductState`) — это деталь реализации
- Внутренние компоненты, используемые только внутри слайса

---

## Принципы чистого кода в FSD

> Подробнее по Clean Code — skill `clean-code`. Здесь — применение к FSD.

### Единственная ответственность (SRP)

Каждый слой, слайс, сегмент, файл отвечает за **одну вещь**.

```
❌ Нарушение SRP:
entities/Product/model/product.store.ts
  → хранит товары
  → хранит корзину
  → хранит избранное
  → делает авторизацию

✅ Каждая сущность отдельно:
entities/Product/   — товары
entities/Cart/      — корзина
entities/Favorite/  — избранное
entities/User/      — пользователь и авторизация
```

### Принцип открытости/закрытости

Слайс **открыт для использования** (через `index.ts`) и **закрыт для изменения** (внутренности скрыты).

Добавление новой фичи **не требует изменения** существующих сущностей.

```
Добавляем фичу «сравнение товаров»:
  Создаём:    features/CompareProducts/
  Используем: entities/Product (через публичный API)
  Изменяем:   entities/Product → НЕТ
```

### Принцип инверсии зависимостей

Нижние слои **не знают** о верхних. Сущность не знает в какой фиче она используется.

```vue
<!-- entities/Product/ui/ProductCard.vue -->
<template>
  <article class="product-card">
    <h3 class="product-card__name">{{ name }}</h3>
    <span class="product-card__price">{{ price }} ₽</span>

    <!-- ✅ Сущность предоставляет слот — фича подставляется сверху -->
    <div class="product-card__actions">
      <slot name="actions" />
    </div>
  </article>
</template>
```

```typescript
// ❌ Сущность импортирует фичу:
// entities/Product/ui/ProductCard.vue
import { AddToCartButton } from '@/features/AddToCart';   // ЗАПРЕЩЕНО
```

### Газетная метафора

Проект читается **сверху вниз** как газета:

1. `app/` — заголовок: что это за приложение
2. `pages/` — разделы: какие страницы есть
3. `widgets/` — статьи: из чего состоят страницы
4. `features/` — абзацы: что пользователь может делать
5. `entities/` — факты: с какими данными работаем
6. `shared/` — словарь: базовые инструменты

### Имена раскрывают намерение

```
❌ Непонятные имена слайсов:
features/Modal/             — что за модалка? зачем?
features/Form/              — какая форма?
entities/Data/              — какие данные?
entities/Item/              — какой элемент?

✅ Имя объясняет назначение:
features/AuthByEmail/       — авторизация по почте
features/CreateOrder/       — создание заказа
entities/Product/           — товар
entities/DeliveryAddress/   — адрес доставки
```

### Не повторяйся (DRY)

| Повторяющийся код | Куда вынести |
|-------------------|--------------|
| UI-компонент без бизнес-логики | `shared/ui/` |
| Функция форматирования | `shared/lib/` |
| Composable (useDebounce и т.д.) | `shared/lib/` |
| Тип `Pagination`, `SortOrder` | `shared/types/` |
| API-инстанс, интерсепторы | `shared/api/` |
| Логика конкретной сущности | `entities/Name/lib/` |

### Маленькие функции, маленькие файлы

| Сущность | Лимит |
|----------|-------|
| Файл | не более **150 строк** |
| Функция | не более **20 строк** |
| Аргументов функции | не более **3** |
| Props компонента | не более **8** |
| Экспортов в `index.ts` | не более **15** (иначе слайс слишком большой — разбей) |

---

## Алгоритм размещения кода

```
Это переиспользуемый код без бизнес-логики?
  → shared/

Это бизнес-сущность (данные, API, отображение сущности)?
  → entities/

Это действие пользователя (взаимодействие, сценарий)?
  → features/

Это самостоятельный блок UI из нескольких фич/сущностей?
  → widgets/

Это целая страница (маршрут)?
  → pages/

Это инициализация, провайдеры, глобальные настройки?
  → app/
```

### Типичные ошибки размещения

```
❌ BaseButton в entities — это не бизнес-сущность
entities/BaseButton/
✅ Базовый компонент в shared
shared/ui/BaseButton/

❌ Корзина в shared — это бизнес-логика
shared/cart/
✅ Корзина — сущность
entities/Cart/

❌ Кнопка «добавить в корзину» в entities — это действие
entities/Product/ui/AddToCartButton.vue
✅ Действие — фича
features/AddToCart/

❌ Целая страница в widgets
widgets/ProductPage/
✅ Страница в pages
pages/ProductPage/
```

---

## Взаимодействие между сущностями одного слоя

Слайсы одного слоя **не могут** импортировать друг друга напрямую. Если сущности связаны — связь реализуется на **уровне выше**.

```typescript
// ❌ entities/Order импортирует entities/Product:
// entities/Order/ui/OrderItem.vue
import { ProductCard } from '@/entities/Product';   // ЗАПРЕЩЕНО

// ✅ Связь реализуется в widgets или pages:
// widgets/OrderList/ui/OrderList.vue
import { OrderItem } from '@/entities/Order';
import { ProductCard } from '@/entities/Product';
// Виджет комбинирует две сущности
```

Альтернатива — слот в компоненте сущности:

```vue
<!-- entities/Order/ui/OrderItem.vue -->
<template>
  <div class="order-item">
    <span class="order-item__info">{{ order.number }}</span>
    <slot name="product" /> <!-- сюда подставят ProductCard сверху -->
  </div>
</template>
```

---

## Порядок действий при проектировании

1. Уточни: что создаём, какой слой, какой слайс.
2. Определи слой по алгоритму размещения.
3. Проверь: не нарушаются ли правила импортов.
4. Создай структуру папок слайса: `ui/` → `model/` → `api/` → опционально `lib/`.
5. Напиши файлы по сегментам: `types` → `api` → `model` → `ui`.
6. Напиши `index.ts` — публичный API слайса.
7. Покажи пример использования из верхнего слоя.
8. Проверь: нет ли дублирования с существующими слайсами.

---

## Чек-лист FSD-готовности слайса

- [ ] Слайс лежит в правильном слое (по алгоритму размещения)
- [ ] Имя слайса раскрывает намерение (не `Modal`/`Data`/`Item`)
- [ ] Структура: `ui/` + `model/` + `api/` (+ опц. `lib/`)
- [ ] У каждого сегмента есть свой `index.ts`
- [ ] Корневой `index.ts` экспортирует только публичный API
- [ ] Внутренние типы и хелперы не экспортированы
- [ ] Слайс **не** импортирует из вышестоящего слоя
- [ ] Слайс **не** импортирует другие слайсы того же слоя напрямую
- [ ] Все импорты в слайс — через `index.ts` другого слайса
- [ ] В корневом `index.ts` ≤ 15 экспортов
- [ ] В каждом файле ≤ 150 строк
- [ ] Каждая функция ≤ 20 строк
- [ ] Props компонента ≤ 8
- [ ] Аргументов функции ≤ 3
- [ ] Связь с другими сущностями реализована через слот или виджет/страницу
- [ ] Если есть store — соблюдает правила skill `stories-vue`
- [ ] Если есть TM2-специфика (Pinia + Quasar + `useScopeT` + `mock.config`) — соблюдает `project-standards`

---

## Что НЕ делать

- ❌ Не импортируй из верхнего слоя в нижний.
- ❌ Не импортируй между слайсами одного слоя.
- ❌ Не импортируй напрямую во внутренности слайса — только через `index.ts`.
- ❌ Не клади бизнес-логику в `shared`.
- ❌ Не клади UI-kit компоненты в `entities`.
- ❌ Не клади действия пользователя в `entities` — это `features`.
- ❌ Не создавай «God-слайс», который делает всё.
- ❌ Не экспортируй внутренние детали реализации.
- ❌ Не создавай слой `processes` — он удалён в FSD v2.
- ❌ Не именуй слайсы абстрактно: `Data`, `Item`, `Modal`, `Form`.
- ❌ Не дублируй код — выноси в `shared`.
- ❌ Не создавай пустые сегменты «на будущее» (YAGNI).
