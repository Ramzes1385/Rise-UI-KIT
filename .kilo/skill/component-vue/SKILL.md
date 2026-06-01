---
name: component-vue
description: Создание Vue 3 компонентов — чистый типизированный код, БЭМ, SRP, DRY. Универсальные правила Vue 3 компонента (структура папки, типы, шаблон, стили, лимиты). Загружай при создании нового Vue компонента в любом проекте. Для UI Kit `metal-art-site` — парно с `ui-kit-component` (там структура BaseX/ строже). Для FSD-приложения — парно с `fsd`.
---

# Component Vue — универсальные правила

## Когда применять

- Создание нового Vue 3 компонента в любом проекте.
- Рефакторинг существующего компонента к чистому стилю.
- Ревью PR с новым компонентом.

## Связь с другими skills

| Контекст задачи | Парный skill |
|---|---|
| UI Kit `metal-art-site` — компонент в `src/components/BaseX/` | **`ui-kit-component`** (там структура с 8 файлами, регистрация в `plugin.ts`, CSS-переменные `:root`) |
| FSD-приложение — компонент в `entities/`/`features/`/`widgets/`/`shared/ui/` | **`fsd`** + **`project-standards`** |
| Pinia Options API store рядом с компонентом | **`stories-vue`** |
| Принципы Чистого Кода (имена, функции, SOLID, code smells) | **`clean-code`** — всегда фоном |
| Тесты для компонента | **`testing-standards`** + **`testing-ui-kit`** |

> Этот skill — **универсальная база**: применима к любому Vue 3 компоненту. Контекстные правила (структура папки, регистрация, специфические CSS-токены) — в парном skill соответствующего проекта.

---

## Структура компонента (универсальная)

```
ComponentName/
├── ComponentName.vue           — шаблон + логика
├── ComponentName.types.ts      — типы (props, emits, slots)
├── ComponentName.style.scss    — стили по БЭМ
└── index.ts                    — реэкспорт
```

В `metal-art-site` добавляются файлы тестов (см. `ui-kit-component`):
```
ComponentName/
├── ComponentName.vue
├── ComponentName.types.ts
├── ComponentName.style.scss
├── ComponentName.stories.ts
├── ComponentName.spec.ts
├── ComponentName.integration.spec.ts
├── ComponentName.visual.spec.ts
├── ComponentName.e2e.spec.ts     ← только для heavy
└── index.ts
```

---

## Принцип единственной ответственности (SRP)

Каждый компонент отвечает **за одну вещь** и имеет **одну причину для изменения**.

```
❌ Компонент делает слишком много:
UserDashboard.vue → показывает профиль, список заказов, настройки, уведомления

✅ Разбит на компоненты с одной ответственностью:
UserProfile.vue      — отображение профиля
UserOrderList.vue    — список заказов
UserSettings.vue     — форма настроек
NotificationList.vue — список уведомлений
```

Перед созданием задай вопрос: **«Если я опишу компонент одним предложением без союза „и", получится?»**
- ✅ «Карточка товара с ценой и кнопкой покупки» — одна сущность
- ❌ «Карточка товара и форма отзыва» — два компонента

> Подробнее по SRP, OCP, LSP, ISP, DIP — см. `clean-code` §9.

---

## Правила именования

> Подробное обоснование каждого правила — `clean-code` §1 «Осмысленные имена».

### Имена раскрывают намерение

Имя должно отвечать на три вопроса: **зачем существует, что делает, как используется**.

```typescript
// ❌ Непонятные имена
const d = ref(0);
const flag = ref(false);
const data = ref([]);
const list = ref([]);
const info = ref(null);
function handle() {}
function process() {}
function doIt() {}

// ✅ Имя раскрывает намерение
const daysSinceUpdate = ref(0);
const isMenuOpen = ref(false);
const activeUsers = ref([]);
const cartItems = ref([]);
const selectedProduct = ref(null);
function submitOrder() {}
function closeModal() {}
function toggleFavorite() {}
```

### Не дезинформируй

```typescript
// ❌ Имя врёт о содержимом
const userList = ref({});          // это объект, а не список
const isActive = ref('yes');       // это строка, а не boolean
const getUsers = () => { ... };    // функция меняет state, а не просто получает

// ✅ Имя соответствует содержимому
const userMap = ref({});
const isActive = ref(true);
const fetchUsers = async () => { ... };
```

### Произносимые имена

```typescript
// ❌ Аббревиатуры и сокращения
const usrNm = ref('');
const btnClkHndlr = () => {};
const modDlgVsbl = ref(false);
const prdLst = ref([]);

// ✅ Полные произносимые слова
const userName = ref('');
const handleButtonClick = () => {};
const isDialogVisible = ref(false);
const productList = ref([]);
```

### Имена удобные для поиска

Однобуквенные и короткие имена невозможно найти grep-ом по проекту.

```typescript
// ❌ Невозможно найти поиском
const e = ref(0);
const t = 'active';
items.filter((x) => x.s === 1);

// ✅ Легко ищутся
const errorCount = ref(0);
const ACTIVE_STATUS = 'active';
items.filter((item) => item.status === ACTIVE_STATUS);
```

### Таблица именования

| Сущность | Формат | Пример |
|----------|--------|--------|
| Папка компонента | PascalCase | `UserCard/`, `BaseButton/` |
| Vue-файл | PascalCase | `UserCard.vue` |
| Файл типов | PascalCase + `.types.ts` | `UserCard.types.ts` |
| Файл стилей | PascalCase + `.style.scss` | `UserCard.style.scss` |
| Реэкспорт | `index.ts` | `index.ts` |
| Пропсы | camelCase | `userName`, `isActive` |
| События | kebab-case в `@listener`, camelCase в типе | `@update-value`, `(event: 'update-value', ...)` |
| Функции-обработчики | `handle` + Действие | `handleClick`, `handleSubmit` |
| Булевы переменные | `is/has/can/should` | `isOpen`, `hasError`, `canEdit` |
| Массивы | множественное число | `items`, `users`, `selectedIds` |
| Константы (магические значения) | UPPER_SNAKE | `MAX_ITEMS`, `DEFAULT_PAGE_SIZE` |
| БЭМ-блок | kebab-case | `user-card` |
| БЭМ-элемент | `__` | `user-card__title` |
| БЭМ-модификатор | `--` | `user-card--active` |

### Максимум 3 слова в имени переменной/функции

```typescript
// ❌ Слишком длинное
const isConfirmDeleteModalOpen = ref(false);
function handleUserProfileFormSubmit() {}

// ✅ Коротко и ясно
const isConfirmOpen = ref(false);
function submitProfile() {}
```

---

## Правила функций

> Подробное обоснование — `clean-code` §2 «Функции».

### Функция должна быть маленькой — до 20 строк

```typescript
// ❌ Большая функция
async function submitForm(): Promise<void> {
  if (!name.value) {
    error.value = 'Введите имя';
    return;
  }
  if (!email.value) {
    error.value = 'Введите email';
    return;
  }
  if (!email.value.includes('@')) {
    error.value = 'Неверный email';
    return;
  }
  isLoading.value = true;
  try {
    const response = await api.create({ name: name.value, email: email.value });
    items.value.push(response);
    name.value = '';
    email.value = '';
    emit('created', response);
  } catch (err) {
    error.value = 'Ошибка сохранения';
  } finally {
    isLoading.value = false;
  }
}

// ✅ Разбито на маленькие функции с одной задачей
function validate(): boolean {
  if (!name.value) {
    error.value = 'Введите имя';
    return false;
  }
  if (!email.value.includes('@')) {
    error.value = 'Неверный email';
    return false;
  }
  return true;
}

function resetForm(): void {
  name.value = '';
  email.value = '';
}

async function submitForm(): Promise<void> {
  if (!validate()) return;

  isLoading.value = true;
  error.value = '';

  try {
    const created = await api.create({ name: name.value, email: email.value });
    items.value.push(created);
    resetForm();
    emit('created', created);
  } catch (err) {
    error.value = 'Ошибка сохранения';
  } finally {
    isLoading.value = false;
  }
}
```

### Функция делает одну вещь

**Одна функция = одно действие.** Если можешь извлечь из неё другую функцию с отдельным именем — извлекай.

### Один уровень абстракции в функции

Не смешивай высокоуровневую логику с низкоуровневыми деталями.

```typescript
// ❌ Смешаны уровни абстракции
async function initPage(): Promise<void> {
  const response = await fetch('/api/users?page=1&limit=20');
  const json = await response.json();
  users.value = json.data.map((u: unknown) => ({
    id: (u as { id: number }).id,
    name: (u as { first_name: string }).first_name,
  }));
  document.title = `Пользователи (${users.value.length})`;
}

// ✅ Каждый уровень абстракции отдельно
async function initPage(): Promise<void> {
  await fetchUsers();
  updatePageTitle();
}

async function fetchUsers(): Promise<void> {
  users.value = await api.user.getList({ page: 1, limit: 20 });
}

function updatePageTitle(): void {
  document.title = `Пользователи (${users.value.length})`;
}
```

### Минимум аргументов

Идеально: **0–2**. Три — только в крайнем случае. Больше трёх — оберни в объект.

```typescript
// ❌ Слишком много аргументов
function createUser(
  name: string,
  email: string,
  role: string,
  age: number,
  isActive: boolean,
): void {}

// ✅ Объект с типом
interface UserCreateData {
  name: string;
  email: string;
  role: string;
  age: number;
  isActive: boolean;
}

function createUser(data: UserCreateData): void {}
```

### Не используй флаги-аргументы

Булев аргумент означает что функция делает **две вещи**. Разбей на две функции.

```typescript
// ❌ Флаг меняет поведение
function renderList(withPagination: boolean): void {
  if (withPagination) {
    // одна логика
  } else {
    // другая логика
  }
}

// ✅ Две отдельные функции
function renderList(): void {}
function renderPaginatedList(): void {}
```

### Функция без скрытых побочных эффектов

```typescript
// ❌ Скрытый побочный эффект — функция проверки сбрасывает данные
function validateForm(): boolean {
  if (!name.value) {
    formData.value = {} as FormData;  // побочный эффект!
    return false;
  }
  return true;
}

// ✅ Функция делает только то что обещает имя
function validateForm(): boolean {
  return name.value !== '';
}
```

---

## Правила комментариев

> Полные правила — `clean-code` §3.

### Хорошие комментарии

```typescript
/** Пропсы компонента UserCard */
export interface UserCardProps {
  /** Имя пользователя для отображения в заголовке */
  name: string;
  /** Роль определяет цвет бейджа: admin — красный, user — серый */
  role: UserRole;
}

// TODO(@ivan, #1234): заменить на useIntersectionObserver после обновления VueUse
function handleScroll(): void {}

// Регулярка проверяет email по RFC 5322 (упрощённый вариант)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Плохие комментарии — НЕ ПИШИ ИХ

```typescript
// ❌ Комментарий повторяет код
// Устанавливаем isLoading в true
isLoading.value = true;

// ❌ Шумовой комментарий — журнал, маркер секции
// Author: Ivan
// 2024-03-12 added X
// =============== МЕТОДЫ ===============

// ❌ Закомментированный код — удаляй, git помнит
// const oldValue = ref('');
// function deprecatedMethod() {}

// ❌ Комментарий вместо хорошего имени
// Проверяем может ли пользователь редактировать
const flag = computed(() => user.role === 'admin');

// ✅ Хорошее имя не требует комментария
const canEdit = computed(() => user.role === 'admin');
```

**Правило:** если нужен комментарий — сначала попробуй улучшить имя.

---

## Форматирование

### Вертикальная газетная метафора

Файл читается **сверху вниз**. Наверху — самое важное и общее, ниже — детали.

Порядок в `<script setup>`:

```typescript
// 1. Импорт типов
import type { UserCardProps, UserCardEmits } from './UserCard.types';

// 2. Импорт стилей (последний из локальных)
import './UserCard.style.scss';

// 3. Импорт зависимостей (composables, утилиты)
import { useBreakpoint } from '@/composables/useBreakpoint';
import { formatDate } from '@/utils/format';

// 4. Props и Emits
const props = withDefaults(defineProps<UserCardProps>(), {
  isActive: false,
});
const emit = defineEmits<UserCardEmits>();

// 5. Внешние зависимости (store, router, composables)
const userStore = useUserStore();
const { isMobile } = useBreakpoint();

// 6. Реактивное состояние
const isOpen = ref(false);
const searchQuery = ref('');

// 7. Вычисляемые свойства
const fullName = computed(() => `${props.firstName} ${props.lastName}`);
const isValid = computed(() => searchQuery.value.length >= 3);

// 8. Наблюдатели
watch(
  () => props.userId,
  (newId) => {
    fetchUserData(newId);
  },
);

// 9. Функции (от высокого уровня к низкому)
async function handleSubmit(): Promise<void> {
  if (!validate()) return;
  await saveData();
}

function validate(): boolean {
  return isValid.value;
}

async function saveData(): Promise<void> {
  // ...
}

// 10. Хуки жизненного цикла
onMounted(() => {
  fetchUserData(props.userId);
});
```

### Вертикальная близость

Связанные вещи — **рядом**. Несвязанные — **разделены пустой строкой**.

```typescript
// ❌ Связанные вещи разбросаны по файлу
const isOpen = ref(false);
const userName = ref('');
const items = ref<Item[]>([]);
const isLoading = ref(false);

function toggleOpen(): void {
  isOpen.value = !isOpen.value;
}

async function fetchItems(): Promise<void> {
  isLoading.value = true;
}

function closeModal(): void {
  isOpen.value = false;
}

// ✅ Связанные вещи сгруппированы
const isOpen = ref(false);

function toggleOpen(): void {
  isOpen.value = !isOpen.value;
}

function closeModal(): void {
  isOpen.value = false;
}

const items = ref<Item[]>([]);
const isLoading = ref(false);

async function fetchItems(): Promise<void> {
  isLoading.value = true;
  // ...
}
```

### Горизонтальное форматирование

- Максимум **100 символов** в строке (если в проекте Prettier настроен на 120 — используй его).
- Если атрибутов в теге больше **двух** — каждый на новой строке.

```vue
<!-- ❌ Длинная строка -->
<UserCard :name="user.name" :email="user.email" :role="user.role" :is-active="user.isActive" @click="handleClick" @delete="handleDelete" />

<!-- ✅ Многострочный формат -->
<UserCard
  :name="user.name"
  :email="user.email"
  :role="user.role"
  :is-active="user.isActive"
  @click="handleClick"
  @delete="handleDelete"
/>
```

---

## Обработка ошибок

> Подробнее — `clean-code` §6.

### Не игнорируй ошибки

```typescript
// ❌ Ошибка проглочена
try {
  await api.save(data);
} catch (err) {
  // пусто
}

// ❌ Только console.log
try {
  await api.save(data);
} catch (err) {
  console.log(err);
}

// ✅ Ошибка обработана — пользователь видит обратную связь
try {
  await api.save(data);
} catch (err) {
  error.value = 'Не удалось сохранить данные';
}
```

### Не возвращай `null`, используй пустые значения

```typescript
// ❌ Проверки на null по всему коду
const user = getUser();
if (user !== null) {
  if (user.name !== null) {
    // ...
  }
}

// ✅ Пустые значения по умолчанию
const user = ref<User>({ id: 0, name: '', email: '' });
const items = ref<Product[]>([]);
const error = ref('');
```

---

## Границы — чистые интерфейсы компонента

Компонент общается с внешним миром **только через props, emits и slots**. Это его границы.

### Props — входной контракт

```typescript
// ❌ Компонент принимает всё подряд
export interface CardProps {
  data: unknown;
  options: Record<string, unknown>;
}

// ✅ Точный контракт
export interface ProductCardProps {
  /** Название товара */
  title: string;
  /** Цена в рублях */
  price: number;
  /** URL изображения */
  imageUrl: string;
  /** Доступен ли товар */
  inStock?: boolean;
}
```

### Emits — выходной контракт

```typescript
// ❌ Строковое событие без типизации
emit('event', someData);

// ✅ Типизированное событие
export interface ProductCardEmits {
  (event: 'add-to-cart', productId: number): void;
  (event: 'toggle-favorite', productId: number): void;
}
```

### Не лезь наружу изнутри компонента

```typescript
// ❌ Компонент напрямую меняет store, router, DOM
function handleClick(): void {
  store.items.push(newItem);
  router.push('/success');
  document.body.classList.add('modal-open');
}

// ✅ Компонент сообщает наружу через emit
function handleClick(): void {
  emit('add-item', newItem);
}
```

> Принцип инверсии зависимостей (DIP) — нижние слои не знают о верхних. См. `fsd` для FSD-контекста.

---

## DRY — не повторяйся

Если одна и та же логика встречается в **двух и более** местах — вынеси в:
- **composable** — для реактивной логики (`useX`)
- **утилиту** — для чистых функций
- **базовый компонент** — для повторяющейся разметки

```typescript
// ❌ Копипаста в каждом компоненте
const isLoading = ref(false);
const error = ref('');

async function fetchData(): Promise<void> {
  isLoading.value = true;
  error.value = '';
  try {
    // ...
  } catch (err) {
    error.value = 'Ошибка';
  } finally {
    isLoading.value = false;
  }
}

// ✅ Вынесено в composable
// useAsyncAction.ts
export function useAsyncAction() {
  const isLoading = ref(false);
  const error = ref('');

  async function run(fn: () => Promise<void>): Promise<void> {
    isLoading.value = true;
    error.value = '';
    try {
      await fn();
    } catch (err) {
      error.value = 'Ошибка';
    } finally {
      isLoading.value = false;
    }
  }

  return { isLoading, error, run };
}
```

---

## Правило бойскаута

> «Оставь код чище, чем он был до тебя.»

Если при создании нового компонента видишь рядом:
- неиспользуемый импорт — **упомяни в ответе**
- дублирование которое можно устранить — **предложи рефакторинг**
- непонятное имя — **предложи переименование**

Но **не меняй чужой код** без запроса пользователя. Только сообщай.

---

## Лимиты

| Сущность | Лимит |
|----------|-------|
| Строк в `<template>` | не более **50** |
| Строк в `<script setup>` | не более **100** |
| Строк в одной функции | не более **20** |
| Аргументов функции | не более **3** (иначе объект) |
| Props у компонента | не более **8** (иначе разбей компонент) |
| Вложенность `v-if/v-for` | не более **2 уровней** |
| Тернарных операторов подряд | **0 вложенных** |

Если лимит превышен — **разбивай** на подкомпоненты, composables или утилиты.

---

## Шаблон: файл типов (`ComponentName.types.ts`)

```typescript
/**
 * Пропсы компонента ComponentName
 */
export interface ComponentNameProps {
  /** Заголовок карточки */
  title: string;
  /** Активное состояние */
  isActive?: boolean;
}

/**
 * События компонента ComponentName
 */
export interface ComponentNameEmits {
  (event: 'update', value: string): void;
  (event: 'close'): void;
}

/**
 * Слоты компонента ComponentName (если есть)
 */
export interface ComponentNameSlots {
  default?: () => unknown;
  header?: (props: { title: string }) => unknown;
}
```

### Варианты пропсов как `as const` tuple + union

> Это специфика UI Kit (`ui-kit-component`), но универсально полезно — не используй `enum`.

```typescript
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export interface ButtonProps {
  variant?: ButtonVariant;
}
```

---

## Шаблон: Vue-файл (`ComponentName.vue`)

```vue
<template>
  <div
    class="component-name"
    :class="{
      'component-name--active': isActive,
    }"
  >
    <div class="component-name__header">
      <h3 class="component-name__title">{{ title }}</h3>
    </div>

    <div class="component-name__body">
      <slot />
    </div>

    <div class="component-name__footer">
      <button
        class="component-name__button"
        type="button"
        @click="handleClick"
      >
        Действие
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComponentNameProps, ComponentNameEmits } from './ComponentName.types';
import './ComponentName.style.scss';

const props = withDefaults(defineProps<ComponentNameProps>(), {
  isActive: false,
});

const emit = defineEmits<ComponentNameEmits>();

/** Обработка клика по кнопке */
function handleClick(): void {
  emit('update', props.title);
}
</script>
```

---

## Шаблон: стили (`ComponentName.style.scss`)

```scss
.component-name {
  display: flex;
  flex-direction: column;

  &--active {
    border-color: var(--color-primary);
  }

  &__header {
    display: flex;
    align-items: center;
  }

  &__title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }

  &__body {
    flex: 1;
  }

  &__footer {
    display: flex;
    justify-content: flex-end;
  }

  &__button {
    cursor: pointer;
    border: none;
    background: transparent;
  }
}
```

> **Важно для `metal-art-site`:** глобальные SCSS-utility (`variables/mixins/functions`) автоинжектятся через `additionalData` в `build/config/css.ts`. **Не пиши** `@use "@styles/variables"` в файле — будет ошибка дублирования. См. `ui-kit-component` раздел стилей и `vite-bundle-config` про `additionalData`.

---

## Шаблон: реэкспорт (`index.ts`)

```typescript
export { default as ComponentName } from './ComponentName.vue';
export type {
  ComponentNameProps,
  ComponentNameEmits,
  ComponentNameSlots,
} from './ComponentName.types';
```

---

## Правила написания кода

### Template

- Корневой элемент — **один**, с классом БЭМ-блока
- Модификаторы через `:class="{ 'block--mod': condition }"`
- Атрибуты в многострочном формате если их больше двух
- Порядок атрибутов: `class` → `:class` → `v-if/v-for` → `v-model` → бинды → события
- Используй `<slot>` для гибкости
- **Никогда** не пиши `<style>` внутри `.vue`
- Не пиши сложную логику в шаблоне — вынеси в computed

```vue
<!-- ❌ Логика в шаблоне -->
<span>{{ items.filter(i => i.active).map(i => i.name).join(', ') }}</span>

<!-- ✅ Вынесено в computed -->
<span>{{ activeNames }}</span>
```

### Script

- Только `<script setup lang="ts">`
- Импорты типов через `import type { ... }`
- Импорт стилей: `import './ComponentName.style.scss'` — последним среди локальных
- `defineProps` с дженериком: `defineProps<Props>()`
- `defineEmits` с дженериком: `defineEmits<Emits>()`
- Для значений по умолчанию: `withDefaults(defineProps<Props>(), {...})`
- Функции через `function`, не через `const fn = () =>` (function hoisting + читаемость газетной метафоры)
- Публичные функции — с JSDoc

### Стили

- Чистый БЭМ: блок, элементы через `&__`, модификаторы через `&--`
- **Запрещено** вкладывать элементы: `&__header { &__title {} }`
- Все элементы на **одном уровне** вложенности внутри блока
- CSS-переменные для цветов и размеров
- Не используй `#id` селекторы
- Не используй `!important` без крайней нужды и без комментария

### Типы

- Каждый prop с JSDoc `/** описание */`
- Обязательные пропсы без `?`, опциональные с `?`
- Не используй `any` (используй `unknown` + narrowing — см. `clean-code`)
- Перечисления через `as const` tuple + union, не через `enum`

---

## Порядок действий при создании компонента

1. Уточни: название, назначение, пропсы, события, слоты.
2. Проверь SRP: компонент отвечает за одну вещь? Описывается без «и»?
3. Определи контекст: UI Kit (`ui-kit-component`) / FSD-проект (`fsd`) / простой компонент.
4. Создай `ComponentName.types.ts` — типы.
5. Создай `ComponentName.vue` — шаблон и логика.
6. Создай `ComponentName.style.scss` — стили.
7. Создай `index.ts` — реэкспорт.
8. Для UI Kit `metal-art-site` — добавь `.stories.ts`, `.spec.ts`, `.integration.spec.ts`, `.visual.spec.ts` + регистрация в `plugin.ts` (см. `ui-kit-component`).
9. Покажи пример использования.
10. Правило бойскаута: проверь окружение — нет ли дублирования, плохих имён, неиспользуемого.

---

## Пример использования

```vue
<template>
  <ComponentName
    title="Заголовок"
    :is-active="true"
    @update="onUpdate"
    @close="onClose"
  >
    <p>Контент слота</p>
  </ComponentName>
</template>

<script setup lang="ts">
import { ComponentName } from '@/components/ComponentName';

function onUpdate(value: string): void {
  // ...
}

function onClose(): void {
  // ...
}
</script>
```

---

## Что НЕ делать

- ❌ Не создавай файлы вне папки компонента
- ❌ Не пиши `<style>` внутри `.vue` файла
- ❌ Не пиши типы внутри `.vue` файла
- ❌ Не используй Options API в компонентах (Options API только для Pinia store — см. `stories-vue`)
- ❌ Не используй `any` (используй `unknown` + narrowing)
- ❌ Не используй `enum` (используй `as const` tuple + union)
- ❌ Не используй вложенные БЭМ-элементы (`&__a { &__b {} }`)
- ❌ Не создавай компонент без типов в `.types.ts`
- ❌ Не забывай реэкспорт через `index.ts`
- ❌ Не пиши функции длиннее 20 строк
- ❌ Не передавай больше 3 аргументов
- ❌ Не используй флаги-аргументы (boolean меняющий поведение)
- ❌ Не игнорируй ошибки в `catch` (пользователь должен видеть `error.value`)
- ❌ Не оставляй закомментированный код (git помнит)
- ❌ Не пиши комментарии дублирующие код
- ❌ Не смешивай уровни абстракции в одной функции
- ❌ Не дублируй логику — выноси в composable / utility / базовый компонент
- ❌ Не пиши `@use "@styles/variables"` в `metal-art-site` (автоинжект через `additionalData`)
- ❌ Не лезь наружу из компонента напрямую в store/router/DOM (только через `emit`)

---

## Чек-лист готовности компонента

- [ ] Папка с именем компонента в PascalCase
- [ ] Файлы: `.vue` + `.types.ts` + `.style.scss` + `index.ts` (+ тесты для UI Kit)
- [ ] SRP соблюдён — описывается одним предложением без «и»
- [ ] Имена раскрывают намерение, до 3 слов, произносимые, поисковые
- [ ] Все props/emits/slots типизированы в `.types.ts` с JSDoc
- [ ] Только `<script setup lang="ts">`, никакого `<style>` в `.vue`
- [ ] Импорт стилей внутри `<script setup>`
- [ ] Функции через `function`, до 20 строк, одна задача, ≤ 3 аргументов, без флагов
- [ ] Один уровень абстракции на функцию
- [ ] Ошибки обрабатываются (пишутся в `error.value`), не глотаются
- [ ] БЭМ: блок + элементы через `&__` + модификаторы через `&--`, без вложений элементов
- [ ] Лимиты: `<template>` ≤ 50, `<script>` ≤ 100, props ≤ 8, вложенность ≤ 2
- [ ] Внешнее общение только через props/emits/slots
- [ ] `index.ts` экспортирует компонент + типы
- [ ] Никаких `any`, `enum`, флаг-аргументов, закомментированного кода
