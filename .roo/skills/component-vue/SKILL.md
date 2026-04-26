---
name: component-vue
description: >-
  Создание Vue 3 компонентов — чистый, типизированный код по методологии БЭМ и
  принципам Clean Code
modeSlugs:
  - vue-component
  - debug
  - code
  - architect
---

# Component Vue

## Instructions

Ты создаёшь Vue 3 компоненты. Каждый компонент — это **отдельная папка** с набором файлов.
Язык общения — русский. Комментарии в коде — на русском.
Ты следуешь принципам книги «Чистый код» Роберта Мартина.

---

## Структура компонента

```
ComponentName/
├── ComponentName.vue           — шаблон + логика
├── ComponentName.types.ts      — типы (props, emits, slots, интерфейсы)
├── ComponentName.style.scss    — стили по БЭМ
└── index.ts                    — реэкспорт
```

---

## Принцип единственной ответственности (SRP)

Каждый компонент отвечает **за одну вещь** и имеет **одну причину для изменения**.

```
// ❌ Компонент делает слишком много
UserDashboard.vue → показывает профиль, список заказов, настройки, уведомления

// ✅ Разбит на компоненты с одной ответственностью
UserProfile.vue      → отображение профиля
UserOrderList.vue    → список заказов
UserSettings.vue     → форма настроек
NotificationList.vue → список уведомлений
```

Перед созданием задай вопрос: **«Если я опишу компонент одним предложением без союза „и", получится?»**

- ✅ «Карточка товара с ценой и кнопкой покупки» — одна сущность
- ❌ «Карточка товара и форма отзыва» — два компонента

---

## Правила именования

### Имена раскрывают намерение

Имя должно отвечать на три вопроса: **зачем существует, что делает, как используется**.

```
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

```
// ❌ Имя врёт о содержимом
const userList = ref({});          // это объект, а не список
const isActive = ref('yes');       // это строка, а не boolean
const getUsers = () => { ... };    // функция меняет state, а не просто получает

// ✅ Имя соответствует содержимому
const userMap = ref({});
const isActive = ref(true);
const fetchUsers = async () => { ... };
```

### Используй произносимые имена

```
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

### Используй имена удобные для поиска

Однобуквенные и короткие имена невозможно найти поиском по проекту.

```
// ❌ Невозможно найти поиском
const e = ref(0);
const t = 'active';
items.filter((x) => x.s === 1);

// ✅ Легко ищутся
const errorCount = ref(0);
const activeStatus = 'active';
items.filter((item) => item.status === STATUS_ACTIVE);
```

### Таблица именования

| Сущность            | Формат                     | Пример                          |
| ------------------- | -------------------------- | ------------------------------- |
| Папка компонента    | PascalCase                 | `UserCard/`                     |
| Vue-файл            | PascalCase                 | `UserCard.vue`                  |
| Файл типов          | PascalCase + `.types.ts`   | `UserCard.types.ts`             |
| Файл стилей         | PascalCase + `.style.scss` | `UserCard.style.scss`           |
| Реэкспорт           | `index.ts`                 | `index.ts`                      |
| Пропсы              | camelCase                  | `userName`, `isActive`          |
| События             | kebab-case                 | `@update-value`, `@close`       |
| Функции-обработчики | `handle` + Действие        | `handleClick`, `handleSubmit`   |
| Булевы переменные   | `is/has/can/should`        | `isOpen`, `hasError`, `canEdit` |
| Ошибка валидации    | `error: string`            | `error: 'Обязательное поле'`    |
| Массивы             | множественное число        | `items`, `users`, `selectedIds` |
| БЭМ-блок            | kebab-case                 | `user-card`                     |
| БЭМ-элемент         | `__`                       | `user-card__title`              |
| БЭМ-модификатор     | `--`                       | `user-card--active`             |

### Максимум 3 слова в имени

```
// ❌ Слишком длинное
const isConfirmDeleteModalOpen = ref(false);
function handleUserProfileFormSubmit() {}

// ✅ Коротко и ясно
const isConfirmOpen = ref(false);
function submitProfile() {}
```

---

## Правила функций

### Функция должна быть маленькой

**Максимум 20 строк.** Если больше — разбивай.

```typescript
// ❌ Большая функция
function submitForm(): void {
	if (!name.value) {
		error.value = 'Введите имя'
		return
	}
	if (!email.value) {
		error.value = 'Введите email'
		return
	}
	if (!email.value.includes('@')) {
		error.value = 'Неверный email'
		return
	}
	isLoading.value = true
	try {
		const response = await api.create({ name: name.value, email: email.value })
		items.value.push(response)
		name.value = ''
		email.value = ''
		emit('created', response)
	} catch (err) {
		error.value = 'Ошибка сохранения'
	} finally {
		isLoading.value = false
	}
}

// ✅ Разбито на маленькие функции с одной задачей
function validate(): boolean {
	if (!name.value) {
		error.value = 'Введите имя'
		return false
	}
	if (!email.value.includes('@')) {
		error.value = 'Неверный email'
		return false
	}
	return true
}

function resetForm(): void {
	name.value = ''
	email.value = ''
}

async function submitForm(): Promise<void> {
	if (!validate()) return

	isLoading.value = true
	error.value = ''

	try {
		const created = await api.create({ name: name.value, email: email.value })
		items.value.push(created)
		resetForm()
		emit('created', created)
	} catch (err) {
		error.value = 'Ошибка сохранения'
	} finally {
		isLoading.value = false
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
	const response = await fetch('/api/users?page=1&limit=20')
	const json = await response.json()
	users.value = json.data.map((u: any) => ({ id: u.id, name: u.first_name + ' ' + u.last_name }))
	document.title = `Пользователи (${users.value.length})`
}

// ✅ Каждый уровень абстракции отдельно
async function initPage(): Promise<void> {
	await fetchUsers()
	updatePageTitle()
}

async function fetchUsers(): Promise<void> {
	const data = await api.user.getList({ page: 1, limit: 20 })
	users.value = data
}

function updatePageTitle(): void {
	document.title = `Пользователи (${users.value.length})`
}
```

### Минимум аргументов

Идеально: **0–2 аргумента**. Три — только в крайнем случае. Больше трёх — **оберни в объект**.

```typescript
// ❌ Слишком много аргументов
function createUser(name: string, email: string, role: string, age: number, isActive: boolean): void {}

// ✅ Объект с типом
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

### Функция без побочных эффектов

Функция не должна делать скрытых действий которых не ожидаешь по имени.

```typescript
// ❌ Скрытый побочный эффект — функция проверки сбрасывает данные
function validateForm(): boolean {
	if (!name.value) {
		formData.value = {} // побочный эффект!
		return false
	}
	return true
}

// ✅ Функция делает только то что обещает имя
function validateForm(): boolean {
	return name.value !== ''
}
```

---

## Правила комментариев

### Хорошие комментарии

```typescript
/** Пропсы компонента UserCard */
export interface UserCardProps {
	/** Имя пользователя для отображения в заголовке */
	name: string
	/** Роль определяет цвет бейджа: admin — красный, user — серый */
	role: UserRole
}

// TODO: заменить на useIntersectionObserver после обновления VueUse
function handleScroll(): void {}

// Регулярка проверяет email по RFC 5322 (упрощённый вариант)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Плохие комментарии — НЕ ПИШИ ИХ

```typescript
// ❌ Комментарий повторяет код
// Устанавливаем isLoading в true
isLoading.value = true;

// ❌ Шумовой комментарий
// Конструктор
// Деструктор
// Геттер для name

// ❌ Закомментированный код — удаляй, не оставляй
// const oldValue = ref('');
// function deprecatedMethod() {}

// ❌ Позиционные маркеры без смысла
# // ============ МЕТОДЫ ============
# // ============ КОНЕЦ МЕТОДОВ ============

// ❌ Комментарий вместо хорошего имени
// Проверяем, может ли пользователь редактировать
const flag = computed(() => user.role === 'admin');

// ✅ Хорошее имя не требует комментария
const canEdit = computed(() => user.role === 'admin');
```

### Правило: если нужен комментарий — сначала попробуй улучшить имя

---

## Форматирование

### Вертикальное форматирование — газетная метафора

Файл читается **сверху вниз**. Наверху — самое важное и общее, ниже — детали.

Порядок в `<script setup>`:

```typescript
// 1. Импорт типов
import type { UserCardProps, UserCardEmits } from './UserCard.types'

// 2. Импорт стилей
import './UserCard.style.scss'

// 3. Импорт зависимостей (composables, утилиты)
import { useBreakpoint } from '@/composables/useBreakpoint'
import { formatDate } from '@/utils/format'

// 4. Props и Emits
const props = withDefaults(defineProps<UserCardProps>(), {
	isActive: false,
})
const emit = defineEmits<UserCardEmits>()

// 5. Внешние зависимости (store, router, composables)
const userStore = useUserStore()
const { isMobile } = useBreakpoint()

// 6. Реактивное состояние
const isOpen = ref(false)
const searchQuery = ref('')

// 7. Вычисляемые свойства
const fullName = computed(() => `${props.firstName} ${props.lastName}`)
const isValid = computed(() => searchQuery.value.length >= 3)

// 8. Наблюдатели
watch(
	() => props.userId,
	newId => {
		fetchUserData(newId)
	},
)

// 9. Функции (от высокого уровня к низкому)
function handleSubmit(): void {
	if (!validate()) return
	saveData()
}

function validate(): boolean {
	return isValid.value
}

async function saveData(): Promise<void> {
	// ...
}

// 10. Хуки жизненного цикла
onMounted(() => {
	fetchUserData(props.userId)
})
```

### Вертикальная близость

Связанные вещи — **рядом**. Несвязанные — **разделены пустой строкой**.

```typescript
// ❌ Связанные вещи разбросаны по файлу
const isOpen = ref(false)
const userName = ref('')
const items = ref([])
const isLoading = ref(false)

function toggleOpen(): void {
	isOpen.value = !isOpen.value
}

function fetchItems(): void {
	isLoading.value = true
}

function closeModal(): void {
	isOpen.value = false
}

// ✅ Связанные вещи сгруппированы
const isOpen = ref(false)

function toggleOpen(): void {
	isOpen.value = !isOpen.value
}

function closeModal(): void {
	isOpen.value = false
}

const items = ref([])
const isLoading = ref(false)

async function fetchItems(): Promise<void> {
	isLoading.value = true
	// ...
}
```

### Горизонтальное форматирование

- Максимум **100 символов** в строке
- Если атрибутов в теге больше **двух** — каждый на новой строке

```vue
<!-- ❌ Длинная строка -->
<UserCard
	:name="user.name"
	:email="user.email"
	:role="user.role"
	:is-active="user.isActive"
	@click="handleClick"
	@delete="handleDelete" />

<!-- ✅ Многострочный формат -->
<UserCard
	:name="user.name"
	:email="user.email"
	:role="user.role"
	:is-active="user.isActive"
	@click="handleClick"
	@delete="handleDelete" />
```

---

## Обработка ошибок

### Не игнорируй ошибки

```typescript
// ❌ Ошибка проглочена
try {
	await api.save(data)
} catch (err) {
	// пусто
}

// ❌ Только console.log
try {
	await api.save(data)
} catch (err) {
	console.log(err)
}

// ✅ Ошибка обработана — пользователь видит обратную связь
try {
	await api.save(data)
} catch (err) {
	error.value = 'Не удалось сохранить данные'
}
```

### Не возвращай null, используй пустые значения

```typescript
// ❌ Проверки на null по всему коду
const user = getUser()
if (user !== null) {
	if (user.name !== null) {
		// ...
	}
}

// ✅ Пустые значения по умолчанию
const user = ref<User>({ id: 0, name: '', email: '' })
const items = ref<Product[]>([])
const error = ref('')
```

---

## Границы — чистые интерфейсы компонента

Компонент общается с внешним миром **только через props, emits и slots**. Это его границы.

### Props — входной контракт

```typescript
// ❌ Компонент принимает всё подряд
export interface CardProps {
	data: any
	options: Record<string, unknown>
}

// ✅ Точный контракт — понятно что нужно
export interface ProductCardProps {
	/** Название товара */
	title: string
	/** Цена в рублях */
	price: number
	/** URL изображения */
	imageUrl: string
	/** Доступен ли товар */
	inStock?: boolean
}
```

### Ошибка валидации — `error: string`, не `hasError: boolean`

Для полей ввода (BaseInput, BaseTextarea, BaseSelect и т.д.) ошибка передаётся как **текст**, а не как флаг. Это позволяет одновременно показывать состояние ошибки и текст сообщения.

```typescript
// ❌ Только флаг — непонятно какую ошибку показать
export interface FieldProps {
	hasError?: boolean
}

// ✅ Текст ошибки — и состояние, и сообщение
export interface FieldProps {
	error?: string
}
```

В шаблоне: класс `--error` вешается на корневой div при `!!error`, а текст выводится через `<BaseText class="__error-text">`:

```vue
<div class="base-input" :class="{ 'base-input--error': error }">
	<input class="base-input__field" ... />
	<BaseText v-if="error" tag="span" class="base-input__error-text">{{ error }}</BaseText>
</div>
```

### Emits — выходной контракт

```typescript
// ❌ Строковое событие без типизации
emit('event', someData)

// ✅ Типизированное событие
export interface ProductCardEmits {
	(event: 'add-to-cart', productId: number): void
	(event: 'toggle-favorite', productId: number): void
}
```

### Не лезь наружу изнутри компонента

```typescript
// ❌ Компонент напрямую меняет стор, роутер, DOM
function handleClick(): void {
	store.items.push(newItem)
	router.push('/success')
	document.body.classList.add('modal-open')
}

// ✅ Компонент сообщает наружу через emit
function handleClick(): void {
	emit('add-item', newItem)
}
```

---

## Принцип DRY — не повторяйся

Если одна и та же логика встречается в **двух и более** местах — вынеси в:

- **composable** — для реактивной логики
- **утилиту** — для чистых функций
- **базовый компонент** — для повторяющейся разметки

```typescript
// ❌ Копипаста в каждом компоненте
const isLoading = ref(false)
const error = ref('')

async function fetchData(): Promise<void> {
	isLoading.value = true
	error.value = ''
	try {
		// ...
	} catch (err) {
		error.value = 'Ошибка'
	} finally {
		isLoading.value = false
	}
}

// ✅ Вынесено в composable (подскажи пользователю)
// useAsyncAction.ts
function useAsyncAction() {
	const isLoading = ref(false)
	const error = ref('')

	async function run(fn: () => Promise<void>): Promise<void> {
		isLoading.value = true
		error.value = ''
		try {
			await fn()
		} catch (err) {
			error.value = 'Ошибка'
		} finally {
			isLoading.value = false
		}
	}

	return { isLoading, error, run }
}
```

---

## Принцип само-переиспользования компонентов

Компоненты UI Kit обязаны **переиспользовать друг друга вплоть до текста**. Любой визуальный элемент внутри компонента должен быть реализован через другой компонент UI Kit, а не через сырой HTML.

### Зачем

- **Единообразие темизации** — `BaseText` автоматически подхватывает CSS-переменные темы, сырой `<span>` — нет
- **Масштабирование** — `BaseText` поддерживает `sizeScale`, обычный текст — нет
- **Кастомизация цветов** — `BaseText` поддерживает `color` prop, сырой HTML — нет
- **Консистентность** — одинаковые элементы выглядят одинаково во всём проекте

### Правило

| Элемент | Используй | Вместо |
|---------|-----------|--------|
| Текст (заголовок, подпись, описание) | `BaseText` | `<span>`, `<p>`, `<h1>`–`<h6>` |
| Иконка | `BaseIcon` | `<svg>`, `<img src="*.svg">` |
| Изображение | `BaseImage` | `<img>` |
| Кнопка | `BaseButton` | `<button>` |
| Разделитель | `BaseSeparator` | `<hr>`, `<div class="divider">` |
| Загрузка | `BaseLoader` | кастомный спиннер |
| Бейдж | `BaseBadge` | `<span class="badge">` |
| Аватар | `BaseAvatar` | `<img class="avatar">` |
| Анимация | `BaseAnimation` | `<Transition>` |
| Подсказка | `BaseTooltip` | кастомный tooltip |
| Карточка | `BaseCard` | `<div class="card">` |

### Примеры

```vue
<!-- ❌ Сырой HTML внутри компонента -->
<template>
	<div class="user-card">
		<h3 class="user-card__name">{{ name }}</h3>
		<p class="user-card__role">{{ role }}</p>
		<img class="user-card__avatar" :src="avatar" :alt="name" />
		<button class="user-card__button" @click="handleClick">Написать</button>
	</div>
</template>

<!-- ✅ Переиспользование компонентов UI Kit -->
<template>
	<div class="user-card">
		<BaseText class="user-card__name" tag="h3" size="lg">{{ name }}</BaseText>
		<BaseText class="user-card__role" size="sm">{{ role }}</BaseText>
		<BaseAvatar class="user-card__avatar" :src="avatar" :name="name" />
		<BaseButton class="user-card__button" @click="handleClick">Написать</BaseButton>
	</div>
</template>
```

```vue
<!-- ❌ Кастомный разделитель и загрузка -->
<template>
	<div class="chat">
		<div class="chat__divider"></div>
		<div class="chat__spinner"></div>
	</div>
</template>

<!-- ✅ Через компоненты UI Kit -->
<template>
	<div class="chat">
		<BaseSeparator class="chat__divider" />
		<BaseLoader class="chat__loader" variant="dots" />
	</div>
</template>
```

### Исключения

Сырой HTML допустим **только** когда:
- Элемент является корневым контейнером-обёрткой (`<div class="component-name">`)
- Нет подходящего компонента в UI Kit для данного элемента
- Элемент не имеет визуального представления (скрытый контейнер для позиционирования)

---

## Правило бойскаута

> «Оставь код чище, чем он был до тебя.»

Если при создании нового компонента видишь рядом:

- неиспользуемый импорт — **упомяни в ответе**
- дублирование которое можно устранить — **предложи рефакторинг**
- непонятное имя — **предложи переименование**

Но **не меняй чужой код** без запроса пользователя. Только сообщай.

---

## Размеры — ограничения

| Сущность                    | Лимит                                   |
| --------------------------- | --------------------------------------- |
| Строк в `<template>`        | не более **50**                         |
| Строк в `<script setup>`    | не более **100**                        |
| Строк в одной функции       | не более **20**                         |
| Аргументов функции          | не более **3** (иначе объект)           |
| Props у компонента          | не более **8** (иначе разбей компонент) |
| Вложенность `v-if/v-for`    | не более **2 уровней**                  |
| Тернарных операторов подряд | **0** вложенных                         |

Если лимит превышен — **разбивай** на подкомпоненты, composables или утилиты.

---

## Шаблон: файл типов (`ComponentName.types.ts`)

```typescript
/**
 * Пропсы компонента ComponentName
 */
export interface ComponentNameProps {
	/** Заголовок карточки */
	title: string
	/** Активное состояние */
	isActive?: boolean
}

/**
 * События компонента ComponentName
 */
export interface ComponentNameEmits {
	(event: 'update', value: string): void
	(event: 'close'): void
}

/**
 * Слоты компонента ComponentName (если есть)
 */
export interface ComponentNameSlots {
	default?: () => unknown
	header?: (props: { title: string }) => unknown
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
		}">
		<div class="component-name__header">
			<h3 class="component-name__title">{{ title }}</h3>
		</div>

		<div class="component-name__body">
			<slot />
		</div>

		<div class="component-name__footer">
			<button class="component-name__button" type="button" @click="handleClick">Действие</button>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { ComponentNameProps, ComponentNameEmits } from './ComponentName.types'
import './ComponentName.style.scss'

const props = withDefaults(defineProps<ComponentNameProps>(), {
	isActive: false,
})

const emit = defineEmits<ComponentNameEmits>()

/** Обработка клика по кнопке */
function handleClick(): void {
	emit('update', props.title)
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

---

## Шаблон: реэкспорт (`index.ts`)

```typescript
export { default as ComponentName } from './ComponentName.vue'
export type { ComponentNameProps, ComponentNameEmits, ComponentNameSlots } from './ComponentName.types'
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
- Импорт стилей: `import './ComponentName.style.scss'`
- `defineProps` с дженериком: `defineProps<Props>()`
- `defineEmits` с дженериком: `defineEmits<Emits>()`
- Для значений по умолчанию: `withDefaults(defineProps<Props>(), {...})`
- Функции через `function`, не через `const fn = () =>`
- Каждую публичную функцию сопровождай JSDoc

### Стили

- Чистый БЭМ: блок, элементы через `&__`, модификаторы через `&--`
- **Запрещено** вкладывать элементы: `&__header { &__title {} }`
- Все элементы на **одном уровне** вложенности внутри блока
- CSS-переменные для цветов и размеров
- Не используй `#id` селекторы
- Не используй `!important`
- **Обязательно** добавляй плавные переходы (`@include transition(...)`) для состояний `:hover`, `:active`, `:focus-visible`
- Для `:focus-visible` используй заметное выделение (например, `box-shadow` или `outline`)

### Типы

- Каждый проп документируй через JSDoc `/** описание */`
- Обязательные пропсы без `?`, опциональные с `?`
- Не используй `any`
- Перечисления через `type Union = 'a' | 'b'`, не через `enum`

---

## Порядок действий при создании компонента

1. Уточни: название, назначение, пропсы, события
2. Проверь SRP: компонент отвечает за одну вещь?
3. Создай `ComponentName.types.ts` — типы
4. Создай `ComponentName.vue` — шаблон и логика
5. Создай `ComponentName.style.scss` — стили
6. Создай `index.ts` — реэкспорт
7. Покажи пример использования
8. Проверь: нет ли дублирования с существующими компонентами (правило бойскаута)

---

## Пример использования (показывай после создания)

```vue
<template>
	<ComponentName title="Заголовок" :is-active="true" @update="onUpdate" @close="onClose">
		<p>Контент слота</p>
	</ComponentName>
</template>
```

---

## Доступные composables

При создании компонентов используй готовые composables из `@/shared/composables/`. Не создавай дубликаты.

### Обязательные (в каждом компоненте UI Kit)

| Composable | Импорт | Назначение |
|------------|--------|------------|
| `useSizeScale` | `@/shared/composables/useSizeScale` | Проп `sizeScale` (вместо `size`). Масштабирование через `--size-scale`. По умолчанию `100` |
| `useCustomColor` | `@/shared/composables/useCustomColor` | Проп `color` (тип `CustomColor`). Кастомный цвет фона и текста с состояниями. По умолчанию установлен для всех компонентов |
| `useVariant` | `@/shared/composables/useVariant` | Проп `variant`. БЭМ-модификатор + CSS-переменная `--variant` для рекурсивного наследования варианта дочерними компонентами |

> **Важно:** Используй `sizeScale` вместо `size`. Проп `sizeScale` — это число (100 = 100%, 150 = 150%, 75 = 75%), а не union-перечисление вроде `'sm' | 'md' | 'lg'`. Проп `color` имеет значение по умолчанию во всех компонентах — его не обязательно передавать явно. Проп `variant` устанавливает БЭМ-модификатор (например `base-accordion--ghost`) и CSS-переменную `--variant`, которая наследуется дочерними элементами — позволяет рекурсивно применять стили варианта внутри вложенных компонентов.

> **Исключения из обязательных composables:**
> - `BaseText` — не использует `useVariant` (текст не имеет визуальных вариантов, только начертание через `weight`).
> - `BaseSkeleton` — не использует `useVariant` и `useCustomColor` (скелетон — неинтерактивный элемент-заглушка, цвет фона задаётся строкой через проп `color` вместо `CustomColor`).

> **Паттерн SCSS для variant='default':** `useVariant` пропускает значение `'default'` — не добавляет БЭМ-модификатор и CSS-переменную. Поэтому стили варианта `default` (box-shadow, hover-shadow и т.д.) должны быть в базовом блоке `.component-name`, а не в `&--default`. Модификаторы `&--ghost`, `&--outline` и т.д. переопределяют базовые стили.

### Поведение

| Composable | Импорт | Назначение |
|------------|--------|------------|
| `useAutoScroll` | `@/shared/composables/useAutoScroll` | Автопрокрутка контейнера к низу |
| `useClickOutside` | `@/shared/composables/useClickOutside` | Клик вне элемента |
| `useDebounce` / `useDebounceFn` | `@/shared/composables/useDebounce` | Дебаунс ref-значения или функции |
| `useEscapeKey` | `@/shared/composables/useEscapeKey` | Закрытие по Escape |
| `useListNavigation` | `@/shared/composables/useListNavigation` | Навигация по списку клавишами |
| `usePopup` | `@/shared/composables/usePopup` | Паттерн popup (оверлей + Escape + scroll lock) |
| `useScrollLock` | `@/shared/composables/useScrollLock` | Блокировка скролла body |
| `useSwipe` | `@/shared/composables/useSwipe` | Свайп и перетаскивание (touch + mouse) |

### Позиционирование

| Composable | Импорт | Назначение |
|------------|--------|------------|
| `useDropdownPosition` | `@/shared/composables/useDropdownPosition` | Позиционирование выпадающей панели (12 позиций) |
| `useImageZoom` | `@/shared/composables/useImageZoom` | Зум изображения (масштаб, поворот, перетаскивание, мини-карта) |

### Ввод данных

| Composable | Импорт | Назначение |
|------------|--------|------------|
| `useInputMask` | `@/shared/composables/useInputMask` | Маска ввода (токены #, @, *, N, A, X) |

### Данные

| Composable | Импорт | Назначение |
|------------|--------|------------|
| `useTableData` | `@/shared/composables/useTableData` | Сортировка, фильтрация, пагинация, поиск, инкрементальная подгрузка таблицы |
| `useIcon` | `@/shared/composables/useIcon` | SVG-иконки из спрайта |

---

## Доступные утилиты (utils)

Чистые функции из `@/shared/utils/`. Используй вместо написания собственной логики.

### dateUtils

```ts
import { isSameDay, toDateOnly, daysInMonth, getWeekday, getWeekNumber, buildDateWithTime, isToday, isDateInRange } from '@/shared/utils/dateUtils'
```

| Функция | Описание |
|---------|----------|
| `isSameDay(a, b)` | Сравнить две даты без учёта времени |
| `toDateOnly(d)` | Дата без времени |
| `daysInMonth(year, month)` | Количество дней в месяце |
| `getWeekday(date)` | День недели (0 = воскресенье) |
| `getWeekNumber(date)` | Номер недели по ISO 8601 |
| `buildDateWithTime(options)` | Собрать дату с указанным временем |
| `isToday(date)` | Является ли дата сегодняшней |
| `isDateInRange(date, start, end)` | Дата в диапазоне (исключая границы) |

### fileUtils

```ts
import { getExtension, formatFileSize, getFileIcon, validateFile, formatAcceptHint, createImagePreview } from '@/shared/utils/fileUtils'
```

| Функция | Описание |
|---------|----------|
| `getExtension(name)` | Расширение файла из имени |
| `formatFileSize(bytes)` | Форматирование размера (Б/КБ/МБ) |
| `getFileIcon(extension)` | Эмодзи-иконка по расширению |
| `validateFile(file, options)` | Валидация файла по размеру и типу |
| `formatAcceptHint(accept)` | Подсказка по допустимым форматам |
| `createImagePreview(file)` | Превью изображения через FileReader |

### formatUtils

```ts
import { formatMessageStatus, formatUrl, formatDateLong, formatCellValue } from '@/shared/utils/formatUtils'
```

| Функция | Описание |
|---------|----------|
| `formatMessageStatus(status)` | Иконка статуса доставки сообщения |
| `formatUrl(url)` | URL для отображения (только hostname) |
| `formatDateLong(date, locale)` | Дата для popover-подсказки |
| `formatCellValue(value, formatter?)` | Значение ячейки таблицы |

### imageUtils

```ts
import { isExternalImage, replaceExtension, buildOptimizedSrc, buildSrcset } from '@/shared/utils/imageUtils'
```

| Функция | Описание |
|---------|----------|
| `isExternalImage(src)` | Проверить, является ли URL внешним |
| `replaceExtension(src, newExt)` | Заменить расширение файла, сохраняя query |
| `buildOptimizedSrc(src, srcWidth?)` | Оптимизированный src с параметром ширины |
| `buildSrcset(src, srcWidth?)` | Srcset для адаптивных изображений |

### navigationUtils

```ts
import { openExternalUrl, resolveNavigation } from '@/shared/utils/navigationUtils'
```

| Функция | Описание |
|---------|----------|
| `openExternalUrl(url, target?)` | Открыть внешнюю ссылку безопасно (noopener) |
| `resolveNavigation(options)` | Определить тип навигации (internal/external/none) |

### paginationUtils

```ts
import { calcTotalPages, calcVisiblePages, calcPageInfo } from '@/shared/utils/paginationUtils'
```

| Функция | Описание |
|---------|----------|
| `calcTotalPages(total, pageSize)` | Общее количество страниц |
| `calcVisiblePages(options)` | Массив видимых номеров страниц |
| `calcPageInfo(options)` | Строка информации о странице («1–10 из 100») |

### rangeUtils

```ts
import { toPercent, snapToStep, calcFillStyle, calcThumbStyle } from '@/shared/utils/rangeUtils'
```

| Функция | Описание |
|---------|----------|
| `toPercent(options)` | Процент значения на шкале (0–100) |
| `snapToStep(options)` | Привязать значение к ближайшему шагу |
| `calcFillStyle(first, second?)` | CSS-стиль заливки трека |
| `calcThumbStyle(percent)` | CSS-стиль позиции ползунка |

### schemaUtils

```ts
import { buildBreadcrumbsSchema } from '@/shared/utils/schemaUtils'
```

| Функция | Описание |
|---------|----------|
| `buildBreadcrumbsSchema(items)` | Schema.org JSON-LD для BreadcrumbList |

### tableUtils

```ts
import { calcRowNumber, getColumnStyle, calcTotalColumns, calcColumnWidths } from '@/shared/utils/tableUtils'
```

| Функция | Описание |
|---------|----------|
| `calcRowNumber(options)` | Номер строки с учётом пагинации |
| `getColumnStyle(options)` | CSS-стиль колонки (min/max width) |
| `calcTotalColumns(...)` | Общее количество колонок |
| `calcColumnWidths(columns)` | Ширины колонок для colgroup |

### tooltipUtils

```ts
import { calcTooltipPosition, getTooltipTransition } from '@/shared/utils/tooltipUtils'
```

| Функция | Описание |
|---------|----------|
| `calcTooltipPosition(options)` | CSS-координаты тултипа относительно триггера |
| `getTooltipTransition(position)` | Имя CSS-перехода по позиции тултипа |

---

## Что НЕ делать

- Не создавай файлы вне папки компонента
- Не пиши стили внутри `.vue` файла
- Не пиши типы внутри `.vue` файла
- Не используй Options API
- Не используй `any`
- Не используй вложенные БЭМ-элементы
- Не создавай компонент без типов
- Не забывай реэкспорт через `index.ts`
- Не пиши функции длиннее 20 строк
- Не передавай больше 3 аргументов
- Не используй флаги-аргументы
- Не игнорируй ошибки в catch
- Не оставляй закомментированный код
- Не пиши комментарии дублирующие код
- Не смешивай уровни абстракции в одной функции
- Не дублируй логику — предложи composable
