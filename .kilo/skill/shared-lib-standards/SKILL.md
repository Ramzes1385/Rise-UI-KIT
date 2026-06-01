---
name: shared-lib-standards
description: Стандарты для src/shared (composables, formatters, utils, validation schemas, storage, типизация). Загружай при создании или изменении любого файла в src/shared, любых переиспользуемых утилит, composables или Yup-схем.
---

# Стандарты shared/lib — Переиспользуемые утилиты и composables

## Когда применять
Этот skill загружается при создании или изменении любого файла в `src/shared/`.

---

## Структура `src/shared/`

```
src/shared/
├── api/                        ← HTTP-клиент, interceptors
├── assets/
│   └── icons/                  ← SVG-иконки как строки
├── config/
│   └── mock.config.ts          ← переключение мок/реальный API
├── lib/
│   ├── index.ts                ← публичный API всего shared/lib
│   ├── composables/            ← Vue composables (use*.ts)
│   │   ├── index.ts
│   │   ├── use-scope-t/
│   │   │   ├── useScopeT.ts
│   │   │   └── index.ts
│   │   └── use-performance/
│   │       ├── usePerformance.ts
│   │       └── index.ts
│   ├── formatters/             ← чистые функции форматирования
│   │   ├── index.ts
│   │   └── date.ts
│   ├── utils/                  ← вспомогательные чистые функции
│   │   ├── index.ts
│   │   └── calendar.ts
│   ├── validation/             ← переиспользуемые Yup-схемы
│   │   ├── index.ts
│   │   └── schemas/
│   │       ├── index.ts
│   │       └── common.schema.ts
│   ├── i18n/                   ← локализация
│   │   ├── index.ts
│   │   └── locales/
│   │       ├── ru/
│   │       └── en/
│   └── storage/                ← localStorage/sessionStorage обёртки
│       └── index.ts
├── types/                      ← глобальные TypeScript-типы
│   ├── index.ts
│   └── ui.types.ts
└── ui/                         ← Base-компоненты
    └── index.ts
```

---

## Правила для любого файла в `src/shared/`

### 1. Только чистый, независимый код
`shared` не импортирует ничего из `entities`, `features`, `widgets`, `pages`.
Если нужна зависимость от бизнес-слоёв — код не принадлежит `shared`.

### 2. Явные возвращаемые типы для экспортируемых функций
```typescript
// ✅
export function formatDate(date: string | null | undefined): string { ... }
export function useDebounce<T extends (...args: unknown[]) => unknown>(fn: T, delay?: number): UseDebounceReturn { ... }

// ❌
export function formatDate(date) { ... }
export function useDebounce(fn, delay) { ... }
```

### 3. Полные именованные импорты, абсолютные пути
```typescript
// ✅
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

// ❌
import * as vue from 'vue';
```

### 4. Экспорт типов отдельно через `export type`
```typescript
// ✅
export type { UseDebounceReturn } from './usePerformance';
export { useDebounce } from './usePerformance';
```

### 5. Каждая единица — отдельная папка со своим `index.ts`
```
use-debounce/
├── useDebounce.ts
└── index.ts      ← export { useDebounce } from './useDebounce';
```

---

## Шаблон Composable (`use*.ts`)

Composable — функция, начинающаяся с `use`, использующая Vue Reactivity API.

```typescript
// src/shared/lib/composables/use-debounce/useDebounce.ts
import { onUnmounted, ref } from 'vue';

export interface UseDebounceOptions {
  delay?: number;
}

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: UseDebounceOptions = {}
): UseDebounceReturn<T> {
  const delay = options.delay ?? 300;
  const timer = ref<ReturnType<typeof setTimeout> | null>(null);

  const run = (...args: Parameters<T>): void => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = setTimeout(() => fn(...args), delay);
  };

  const cancel = (): void => {
    if (timer.value) clearTimeout(timer.value);
    timer.value = null;
  };

  onUnmounted(cancel);

  return { run, cancel };
}

export interface UseDebounceReturn<T extends (...args: unknown[]) => unknown> {
  run: (...args: Parameters<T>) => void;
  cancel: () => void;
}
```

```typescript
// src/shared/lib/composables/use-debounce/index.ts
export { useDebounce } from './useDebounce';
export type { UseDebounceOptions, UseDebounceReturn } from './useDebounce';
```

### Правила для composables
- Имя файла: `use{Name}.ts` → `useDebounce.ts`
- Имя функции: `use{Name}` → `useDebounce`
- Экспортируемый тип возврата: `Use{Name}Return`
- Очищать side-эффекты через `onUnmounted`
- Принимать опции через объект `options`, не через позиционные аргументы (кроме главного значения)

---

## Шаблон Formatter (чистая функция)

Форматтеры — чистые функции без состояния, только трансформация данных.

```typescript
// src/shared/lib/formatters/date.ts
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
```

### Правила для форматтеров
- Всегда принимают `value: T | null | undefined` — nullable-типы
- Всегда возвращают безопасное значение (не бросают исключения)
- Нет побочных эффектов, нет обращения к store, router, window
- Группировать по теме: `date.ts`, `number.ts`, `string.ts`

---

## Шаблон Utility (вспомогательная функция)

Утилиты — чистые функции общего назначения.

```typescript
// src/shared/lib/utils/object.ts
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

export function isNonEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== '';
}
```

### Правила для утилит
- Чистые функции без побочных эффектов
- Принимают и возвращают только данные
- Группировать по теме: `object.ts`, `array.ts`, `string.ts`
- Избегать зависимостей от сторонних библиотек (кроме очень обоснованных случаев)

---

## Шаблон Validation Schema

```typescript
// src/shared/lib/validation/schemas/warehouse.schema.ts
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';

export const warehouseSchema = toTypedSchema(
  yup.object({
    name: yup.string().min(2).max(100).required(),
    code: yup.string().max(50).required(),
    address: yup.string().max(200).optional(),
  })
);

export type WarehouseFormValues = yup.InferType<typeof yup.object({
  name: yup.StringSchema;
  code: yup.StringSchema;
  address: yup.StringSchema | undefined;
})>;
```

Более короткий вариант без дублирования типа:
```typescript
const warehouseShape = {
  name: yup.string().min(2).max(100).required(),
  code: yup.string().max(50).required(),
  address: yup.string().max(200).optional(),
};

export const warehouseSchema = toTypedSchema(yup.object(warehouseShape));
```

### Правила для схем валидации
- Один файл = один доменный контекст (`warehouse.schema.ts`, `user.schema.ts`)
- Схемы в `shared/lib/validation/schemas/` — общие для нескольких фич
- Схемы в `widgets/my-feature/ui/MyDialog/validation.ts` — специфичные для одной формы
- Все схемы оборачиваются в `toTypedSchema`

---

## Шаблон Storage utility

```typescript
// src/shared/lib/storage/typed-storage.ts
export function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silent fail
  }
}

export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // silent fail
  }
}
```

---

## Публичный API `src/shared/lib/index.ts`

Любая новая сущность в `shared/lib` обязательно реэкспортируется через `index.ts`:

```typescript
// src/shared/lib/index.ts
export { formatDate, formatDateTime, formatCertificateDate } from './formatters/date';
export { useDebounce, useThrottle } from './composables/use-performance/usePerformance';
export { useScopeT } from './composables/use-scope-t/useScopeT';
export { useLocale } from './composables/use-locale/useLocale';
// ...

// Экспорт типов
export type { UseDebounceReturn } from './composables/use-performance/usePerformance';
export type { UseScopeTReturn } from './composables/use-scope-t/useScopeT';
```

---

## Типизация: обязательные практики

### Никаких `any`
```typescript
// ❌
function process(data: any): any { ... }

// ✅
function process<T>(data: T): ProcessedResult<T> { ... }
// или если тип действительно неизвестен:
function process(data: unknown): string { ... }
```

### `unknown` вместо `any` для входных данных
```typescript
// ✅
export function safeJsonParse(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'string') return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}
```

### Не использовать `!` non-null assertion без крайней необходимости
```typescript
// ❌
const el = document.getElementById('app')!;

// ✅
const el = document.getElementById('app');
if (!el) throw new Error('Element #app not found');
```

### Предпочитать `interface` для объектных типов, `type` для алиасов
```typescript
// форма данных → interface
export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

// объединение, пересечение, примитив → type
export type UserId = number;
export type ApiMode = 'mock' | 'real' | 'auto';
export type WithLoading<T> = T & { loading: boolean };
```

---

## Форматирование (Prettier)

Конфиг `.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

- **Точки с запятой**: всегда (`semi: true`)
- **Кавычки**: одинарные (`singleQuote: true`)
- **Запятые**: только там где ES5 допускает (`trailingComma: "es5"`)
- **Ширина строки**: 120 символов
- **Отступы**: 2 пробела, не табы
- **Конец строки**: LF (Unix)

---

## ESLint: ключевые правила (уже настроены)

| Правило | Уровень | Описание |
|---------|---------|----------|
| `@typescript-eslint/no-explicit-any` | error | Запрет `any` |
| `@typescript-eslint/no-unused-vars` | error | Неиспользуемые переменные |
| `@typescript-eslint/consistent-type-imports` | error | `import type` для типов |
| `@typescript-eslint/no-non-null-assertion` | warn | Осторожно с `!` |
| `@typescript-eslint/no-namespace` | error | Запрет `namespace` |
| `no-restricted-syntax[ImportNamespaceSpecifier]` | error | Запрет `import * as` |
| `no-restricted-syntax[/../import]` | error | Запрет `../` импортов |
| `vue/component-api-style` | error | Только `<script setup>` |
| `vue/block-order` | error | Порядок: template → script |
| `no-debugger` | error | Запрет `debugger` |
| `no-console` | warn | Предупреждение о `console.*` |

### Исключения для тестов (`*.test.ts`, `*.stories.ts`)
В тест-файлах `no-restricted-syntax`, `@typescript-eslint/no-explicit-any` и `no-console` — отключены.

---

## Чеклист при добавлении в shared/lib

- [ ] Функция/composable не зависит от `entities`, `features`, `widgets`
- [ ] Явный возвращаемый тип для экспортируемых функций
- [ ] Нет `any` — используется `unknown` или generics
- [ ] Реэкспорт через `index.ts` папки и через `src/shared/lib/index.ts`
- [ ] Нет побочных эффектов в форматтерах и утилитах
- [ ] Composable очищает side-эффекты в `onUnmounted`
- [ ] Типы экспортируются отдельно через `export type`
- [ ] Именование: `useX` для composables, глаголы/существительные для утилит
