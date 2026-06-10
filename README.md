# Rise UI KIT

`@ramzes1385/rise-ui-kit` — UI-kit библиотека компонентов для Vue 3.

Библиотека содержит готовые переиспользуемые компоненты интерфейса, composables, utils, иконки, глобальные стили и Vue plugin для быстрой интеграции в приложение.

Пакет подходит для использования в Vue 3 проектах, дизайн-системах, админ-панелях, личных кабинетах, внутренних корпоративных интерфейсах и frontend-шаблонах.

---

## Возможности

- Vue 3 компоненты;
- TypeScript типизация;
- готовый npm package;
- поддержка глобальной регистрации компонентов через plugin;
- поддержка прямого импорта компонентов;
- готовые стили библиотеки;
- composables для повторного использования логики;
- utils для работы с датами, файлами, цветами, таблицами и навигацией;
- набор базовых компонентов для построения сложных интерфейсов;
- Storybook/dev-окружение для разработки компонентов;
- unit/integration тесты;
- автоматический release через `semantic-release`;
- npm publish через CI/CD.

---

## Стек

Основной стек проекта:

```txt
Vue 3
TypeScript
Vite
SCSS
Vitest
Storybook
ESLint
Prettier
Husky
Commitlint
semantic-release
```

Дополнительно используются:

```txt
Vite library mode
vue-tsc
Conventional Commits
GitHub Actions
npm Trusted Publisher / NPM_TOKEN
```

---

## Установка

```bash
npm install @ramzes1385/rise-ui-kit
```

или:

```bash
yarn add @ramzes1385/rise-ui-kit
```

или:

```bash
pnpm add @ramzes1385/rise-ui-kit
```

---

## Подключение стилей

Стили библиотеки нужно подключить один раз в точке входа приложения.

Например, в `main.ts`:

```ts
import '@ramzes1385/rise-ui-kit/styles'
```

---

## Быстрый старт

### Подключение через Vue plugin

Этот способ удобен, если нужно зарегистрировать компоненты глобально.

```ts
import { createApp } from 'vue'
import App from './App.vue'

import { createUiKitPlugin } from '@ramzes1385/rise-ui-kit'
import '@ramzes1385/rise-ui-kit/styles'

const app = createApp(App)

app.use(createUiKitPlugin())

app.mount('#app')
```

После этого компоненты можно использовать в шаблонах без локального импорта, если они зарегистрированы plugin API.

```vue
<template>
	<BaseButton label="Сохранить" />
</template>
```

---

### Прямой импорт компонентов

Этот способ предпочтителен, если нужно контролировать используемые компоненты явно.

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton label="Сохранить" />
</template>
```

---

## Публичный API

Все внешние импорты должны идти через главный публичный API пакета:

```ts
import { BaseButton, BaseInput, BaseModal, BaseTable, useDebounce, formatFileSize } from '@ramzes1385/rise-ui-kit'

import '@ramzes1385/rise-ui-kit/styles'
```

Не рекомендуется импортировать внутренние файлы из `dist` напрямую:

```ts
// Не использовать
import BaseButton from '@ramzes1385/rise-ui-kit/dist/components/BaseButton/BaseButton.vue'
```

Правильно:

```ts
import { BaseButton } from '@ramzes1385/rise-ui-kit'
```

---

## Структура пакета

```txt
src/
  components/      # UI-компоненты
  composables/     # Vue composables
  icons/           # иконки и icon registry
  styles/          # глобальные стили
  utils/           # утилиты
  plugin.ts        # Vue plugin
  index.ts         # главный публичный API

build/
  config/          # общие Vite-конфиги
  plugins/         # Vite plugins
  lib/             # npm library build
  tests/           # Vitest config
  release/         # semantic-release config
  ci/              # CI/CD конфиги и env examples
  commitlint/      # commitlint config

dist/              # результат сборки библиотеки
```

---

# Компоненты

Ниже приведён список основных компонентов библиотеки.

---

## BaseButton

Базовая кнопка.

Подходит для действий, форм, тулбаров, модальных окон и карточек.

### Пример

```vue
<script setup lang="ts">
import { BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseButton label="Сохранить" />

	<BaseButton variant="ghost" label="Отмена" />

	<BaseButton :disabled="true" label="Недоступно" />
</template>
```

---

## BaseInput

Базовое поле ввода.

### Пример

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseInput } from '@ramzes1385/rise-ui-kit'

const value = ref('')
</script>

<template>
	<BaseInput v-model="value" placeholder="Введите текст" />
</template>
```

---

## BaseTextarea

Многострочное поле ввода.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTextarea } from '@ramzes1385/rise-ui-kit'

const description = ref('')
</script>

<template>
	<BaseTextarea v-model="description" placeholder="Описание" />
</template>
```

---

## BaseSelect

Компонент выбора значения из списка.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSelect } from '@ramzes1385/rise-ui-kit'

const selected = ref(null)

const options = [
	{ label: 'Активен', value: 'active' },
	{ label: 'Неактивен', value: 'inactive' },
]
</script>

<template>
	<BaseSelect v-model="selected" :options="options" placeholder="Выберите статус" />
</template>
```

---

## BaseCheckbox

Чекбокс.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseCheckbox } from '@ramzes1385/rise-ui-kit'

const checked = ref(false)
</script>

<template>
	<BaseCheckbox v-model="checked" label="Согласен с условиями" />
</template>
```

---

## BaseRadio

Radio button.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRadio } from '@ramzes1385/rise-ui-kit'

const value = ref('email')
</script>

<template>
	<BaseRadio v-model="value" value="email" label="Email" />

	<BaseRadio v-model="value" value="phone" label="Телефон" />
</template>
```

---

## BaseSwitch

Переключатель.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSwitch } from '@ramzes1385/rise-ui-kit'

const enabled = ref(false)
</script>

<template>
	<BaseSwitch v-model="enabled" label="Включить уведомления" />
</template>
```

---

## BaseForm

Контейнер формы.

```vue
<script setup lang="ts">
import { BaseForm, BaseInput, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseForm>
		<BaseInput placeholder="Email" />
		<BaseButton label="Отправить" />
	</BaseForm>
</template>
```

---

## BaseFormField

Обёртка для поля формы.

Обычно используется для label, ошибок и вспомогательного текста.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseFormField, BaseInput } from '@ramzes1385/rise-ui-kit'

const email = ref('')
</script>

<template>
	<BaseFormField label="Email" error="Некорректный email">
		<BaseInput v-model="email" placeholder="example@mail.com" />
	</BaseFormField>
</template>
```

---

## BaseModal

Модальное окно.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseModal, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton label="Открыть" @click="isOpen = true" />

	<BaseModal v-model="isOpen" title="Подтверждение">
		<p>Вы уверены?</p>
	</BaseModal>
</template>
```

---

## BaseSlideover

Выезжающая панель.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSlideover, BaseButton } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(false)
</script>

<template>
	<BaseButton label="Открыть панель" @click="isOpen = true" />

	<BaseSlideover v-model="isOpen"> Содержимое панели </BaseSlideover>
</template>
```

---

## BaseDropdown

Выпадающее меню.

```vue
<script setup lang="ts">
import { BaseDropdown, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseDropdown>
		<template #trigger>
			<BaseButton label="Меню" />
		</template>

		<div>Пункт меню</div>
	</BaseDropdown>
</template>
```

---

## BasePopover

Popover-компонент.

```vue
<script setup lang="ts">
import { BasePopover, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BasePopover>
		<template #trigger>
			<BaseButton label="Открыть popover" />
		</template>

		<div>Контент popover</div>
	</BasePopover>
</template>
```

---

## BaseTooltip

Tooltip для подсказок.

```vue
<script setup lang="ts">
import { BaseTooltip, BaseButton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseTooltip content="Подсказка">
		<BaseButton label="Наведи на меня" />
	</BaseTooltip>
</template>
```

---

## BaseTable

Таблица данных.

```vue
<script setup lang="ts">
import { BaseTable } from '@ramzes1385/rise-ui-kit'

const columns = [
	{ key: 'name', label: 'Название' },
	{ key: 'status', label: 'Статус' },
]

const rows = [
	{ id: 1, name: 'Задача 1', status: 'Активна' },
	{ id: 2, name: 'Задача 2', status: 'Завершена' },
]
</script>

<template>
	<BaseTable :columns="columns" :rows="rows" />
</template>
```

---

## BasePagination

Пагинация.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BasePagination } from '@ramzes1385/rise-ui-kit'

const page = ref(1)
</script>

<template>
	<BasePagination v-model="page" :total="100" :page-size="10" />
</template>
```

---

## BaseTabs

Табы.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTabs } from '@ramzes1385/rise-ui-kit'

const activeTab = ref('main')

const tabs = [
	{ label: 'Основное', value: 'main' },
	{ label: 'Настройки', value: 'settings' },
]
</script>

<template>
	<BaseTabs v-model="activeTab" :items="tabs" />
</template>
```

---

## BaseAccordion

Аккордеон.

```vue
<script setup lang="ts">
import { BaseAccordion } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAccordion title="Подробнее"> Контент аккордеона </BaseAccordion>
</template>
```

---

## BaseCard

Карточка.

```vue
<script setup lang="ts">
import { BaseCard } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCard>
		<h3>Заголовок</h3>
		<p>Описание карточки</p>
	</BaseCard>
</template>
```

---

## BaseAlert

Alert-сообщение.

```vue
<script setup lang="ts">
import { BaseAlert } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAlert type="success" title="Успешно" description="Данные сохранены" />
</template>
```

---

## BaseNotification

Уведомление.

```vue
<script setup lang="ts">
import { BaseNotification } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseNotification title="Новое уведомление" description="Данные обновлены" />
</template>
```

---

## BaseBadge

Badge-компонент.

```vue
<script setup lang="ts">
import { BaseBadge } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseBadge label="New" />
</template>
```

---

## BaseChip

Chip-компонент.

```vue
<script setup lang="ts">
import { BaseChip } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseChip label="Vue" />
</template>
```

---

## BaseAvatar

Аватар пользователя.

```vue
<script setup lang="ts">
import { BaseAvatar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAvatar name="Иван Иванов" src="/avatar.png" />
</template>
```

---

## BaseImage

Компонент изображения.

```vue
<script setup lang="ts">
import { BaseImage } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseImage src="/image.jpg" alt="Описание изображения" />
</template>
```

---

## BaseIcon

Компонент иконки.

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
</template>
```

---

## BaseLoader

Loader.

```vue
<script setup lang="ts">
import { BaseLoader } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseLoader />
</template>
```

---

## BaseSkeleton

Skeleton-заглушка.

```vue
<script setup lang="ts">
import { BaseSkeleton } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSkeleton />
</template>
```

---

## BaseEmpty

Empty state.

```vue
<script setup lang="ts">
import { BaseEmpty } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseEmpty title="Нет данных" description="Попробуйте изменить фильтры" />
</template>
```

---

## BaseProgress

Progress bar.

```vue
<script setup lang="ts">
import { BaseProgress } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseProgress :value="65" />
</template>
```

---

## BaseRange

Range input.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRange } from '@ramzes1385/rise-ui-kit'

const value = ref(50)
</script>

<template>
	<BaseRange v-model="value" :min="0" :max="100" />
</template>
```

---

## BaseSlider

Slider/carousel.

```vue
<script setup lang="ts">
import { BaseSlider } from '@ramzes1385/rise-ui-kit'

const slides = [
	{ id: 1, title: 'Слайд 1' },
	{ id: 2, title: 'Слайд 2' },
]
</script>

<template>
	<BaseSlider :items="slides" />
</template>
```

---

## BaseRating

Рейтинг.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseRating } from '@ramzes1385/rise-ui-kit'

const rating = ref(4)
</script>

<template>
	<BaseRating v-model="rating" />
</template>
```

---

## BaseSearch

Поиск.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseSearch } from '@ramzes1385/rise-ui-kit'

const query = ref('')
</script>

<template>
	<BaseSearch v-model="query" placeholder="Поиск" />
</template>
```

---

## BaseDatePicker

Выбор даты.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseDatePicker } from '@ramzes1385/rise-ui-kit'

const date = ref(null)
</script>

<template>
	<BaseDatePicker v-model="date" />
</template>
```

---

## BaseCalendar

Календарь.

```vue
<script setup lang="ts">
import { BaseCalendar } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseCalendar />
</template>
```

---

## BaseColorPicker

Выбор цвета.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseColorPicker } from '@ramzes1385/rise-ui-kit'

const color = ref('#42b883')
</script>

<template>
	<BaseColorPicker v-model="color" />
</template>
```

---

## BaseFileUpload

Загрузка файлов.

```vue
<script setup lang="ts">
import { BaseFileUpload } from '@ramzes1385/rise-ui-kit'

function handleFiles(files: FileList): void {
	console.log(files)
}
</script>

<template>
	<BaseFileUpload @change="handleFiles" />
</template>
```

---

## BaseEditor

Редактор текста.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseEditor } from '@ramzes1385/rise-ui-kit'

const content = ref('')
</script>

<template>
	<BaseEditor v-model="content" />
</template>
```

---

## BaseChat

Компонент чата.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseChat } from '@ramzes1385/rise-ui-kit'

const messages = ref([
	{
		id: '1',
		text: 'Привет',
		senderName: 'Анна',
		createdAt: new Date().toISOString(),
	},
])

function handleSend(payload: { text: string }): void {
	messages.value.push({
		id: String(Date.now()),
		text: payload.text,
		senderName: 'Вы',
		createdAt: new Date().toISOString(),
	})
}
</script>

<template>
	<BaseChat :messages="messages" @send="handleSend" />
</template>
```

---

## BaseTree

Дерево данных.

```vue
<script setup lang="ts">
import { BaseTree } from '@ramzes1385/rise-ui-kit'

const nodes = [
	{
		id: '1',
		label: 'Родитель',
		children: [{ id: '1-1', label: 'Дочерний элемент' }],
	},
]
</script>

<template>
	<BaseTree :nodes="nodes" />
</template>
```

---

## BaseMegaMenu

Многоуровневое меню.

```vue
<script setup lang="ts">
import { BaseMegaMenu } from '@ramzes1385/rise-ui-kit'

const items = [
	{
		label: 'Раздел',
		children: [{ label: 'Подраздел', to: '/section' }],
	},
]
</script>

<template>
	<BaseMegaMenu :items="items" />
</template>
```

---

## BaseMenu

Меню.

```vue
<script setup lang="ts">
import { BaseMenu } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Профиль', value: 'profile' },
	{ label: 'Выход', value: 'logout' },
]
</script>

<template>
	<BaseMenu :items="items" />
</template>
```

---

## BaseSideBar

Боковая панель навигации.

```vue
<script setup lang="ts">
import { BaseSideBar } from '@ramzes1385/rise-ui-kit'

const items = [
	{ label: 'Главная', to: '/' },
	{ label: 'Настройки', to: '/settings' },
]
</script>

<template>
	<BaseSideBar :items="items" />
</template>
```

---

## BaseBreadcrumbs

Хлебные крошки.

```vue
<script setup lang="ts">
import { BaseBreadcrumbs } from '@ramzes1385/rise-ui-kit'

const items = [{ label: 'Главная', to: '/' }, { label: 'Пользователи', to: '/users' }, { label: 'Профиль' }]
</script>

<template>
	<BaseBreadcrumbs :items="items" />
</template>
```

---

## BaseStepper

Stepper.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseStepper } from '@ramzes1385/rise-ui-kit'

const step = ref(1)

const steps = [{ label: 'Данные' }, { label: 'Проверка' }, { label: 'Готово' }]
</script>

<template>
	<BaseStepper v-model="step" :steps="steps" />
</template>
```

---

## BaseTour

Компонент пользовательского тура по интерфейсу.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { BaseTour } from '@ramzes1385/rise-ui-kit'

const isOpen = ref(true)

const steps = [
	{
		target: '#first-step',
		title: 'Первый шаг',
		content: 'Описание первого шага',
	},
]
</script>

<template>
	<BaseTour v-model:is-open="isOpen" :steps="steps" />
</template>
```

---

## BaseText

Компонент текста.

```vue
<script setup lang="ts">
import { BaseText } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseText tag="p" :weight="600"> Текст </BaseText>
</template>
```

---

## BaseSeparator

Разделитель.

```vue
<script setup lang="ts">
import { BaseSeparator } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseSeparator />
</template>
```

---

## BasePin

Pin/закреплённый элемент.

```vue
<script setup lang="ts">
import { BasePin } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BasePin />
</template>
```

---

## BaseAnimation

Компонент анимации.

```vue
<script setup lang="ts">
import { BaseAnimation } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseAnimation>
		<div>Анимированный контент</div>
	</BaseAnimation>
</template>
```

---

# Список компонентов

```txt
BaseAccordion
BaseAlert
BaseAnimation
BaseAvatar
BaseBadge
BaseBreadcrumbs
BaseButton
BaseCalendar
BaseCard
BaseChat
BaseCheckbox
BaseChip
BaseColorPicker
BaseDatePicker
BaseDropdown
BaseEditor
BaseEmpty
BaseFileUpload
BaseForm
BaseFormField
BaseIcon
BaseImage
BaseInput
BaseLoader
BaseMegaMenu
BaseMenu
BaseModal
BaseNotification
BasePagination
BasePin
BasePopover
BaseProgress
BaseRadio
BaseRange
BaseRating
BaseSearch
BaseSelect
BaseSeparator
BaseSideBar
BaseSkeleton
BaseSlideover
BaseSlider
BaseStepper
BaseSwitch
BaseTable
BaseTabs
BaseText
BaseTextarea
BaseTooltip
BaseTour
BaseTree
```

---

# Composables

Библиотека также экспортирует composables.

## useDebounce

Используется для отложенного вызова функции или реакции на изменение значения.

```ts
import { useDebounce } from '@ramzes1385/rise-ui-kit'

const debouncedSearch = useDebounce((value: string) => {
	console.log(value)
}, 300)
```

---

## useClickOutside

Отслеживает клик вне элемента.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useClickOutside } from '@ramzes1385/rise-ui-kit'

const rootRef = ref<HTMLElement | null>(null)

useClickOutside(rootRef, () => {
	console.log('Клик вне блока')
})
</script>

<template>
	<div ref="rootRef">Контент</div>
</template>
```

---

## useEscapeKey

Обработка Escape.

```ts
import { useEscapeKey } from '@ramzes1385/rise-ui-kit'

useEscapeKey(() => {
	console.log('Escape pressed')
})
```

---

## useScrollLock

Блокировка прокрутки страницы.

```ts
import { useScrollLock } from '@ramzes1385/rise-ui-kit'

const { lock, unlock } = useScrollLock()

lock()
unlock()
```

---

## useBreakpoint

Работа с breakpoint значениями.

```ts
import { useBreakpoint } from '@ramzes1385/rise-ui-kit'

const { isMobile, isTablet, isDesktop } = useBreakpoint()
```

---

## useTableData

Помощник для работы с табличными данными.

```ts
import { useTableData } from '@ramzes1385/rise-ui-kit'

const table = useTableData({
	rows: [],
	columns: [],
})
```

---

## Список composables

```txt
useAutoScroll
useBreakpoint
useCalendar
useClickOutside
useColorPicker
useCustomClass
useCustomColor
useCustomStyle
useDebounce
useDropdownPosition
useEditorToolbar
useEscapeKey
useFlyoutPosition
useIcon
useImageZoom
useInputMask
useListNavigation
useMegaMenuTree
usePadding
usePasswordVisibility
usePopup
useScrollLock
useSizeScale
useSlider
useSwipe
useTableData
useVariant
```

---

# Utils

Библиотека экспортирует набор утилит.

## fileUtils

Утилиты для работы с файлами.

```ts
import { formatFileSize } from '@ramzes1385/rise-ui-kit'

const size = formatFileSize(1024)
```

---

## dateUtils

Утилиты для работы с датами.

```ts
import { formatDate } from '@ramzes1385/rise-ui-kit'

const date = formatDate(new Date())
```

---

## colorUtils

Утилиты для работы с цветами.

```ts
import { isValidColor } from '@ramzes1385/rise-ui-kit'

const valid = isValidColor('#42b883')
```

---

## Список utils

```txt
assertUtils
colorUtils
dateUtils
editorDomInspect
fileUtils
formatUtils
imageUtils
navigationUtils
paginationUtils
rangeUtils
schemaUtils
tableUtils
tooltipUtils
```

---

# Иконки

Иконки используются через `BaseIcon`.

```vue
<script setup lang="ts">
import { BaseIcon } from '@ramzes1385/rise-ui-kit'
</script>

<template>
	<BaseIcon name="search" />
	<BaseIcon name="close" />
	<BaseIcon name="send" />
</template>
```

---

# Разработка проекта

## Установка зависимостей

```bash
npm install
```

## Запуск dev-режима

```bash
npm run dev
```

## Storybook

```bash
npm run storybook
```

---

# Тестирование

## Все unit/integration тесты

```bash
npm run test:unit
```

## Один тестовый файл

```bash
npm run test:unit -- src/components/BaseChat/ChatInput/ChatInput.spec.ts
```

---

# Сборка

## Сборка npm-библиотеки

```bash
npm run build:lib
```

Результат:

```txt
dist/index.js
dist/index.d.ts
dist/plugin.d.ts
dist/styles.css
dist/icons.svg
```

## App/demo сборка

```bash
npm run build:app
```

---

# Проверка npm-пакета

```bash
npm run pack:dry
```

Команда собирает библиотеку и показывает, какие файлы попадут в npm package.

---

# Локальная установка `.tgz`

Создать локальный пакет:

```bash
rm -rf dist
rm -f *.tgz

npm run build:lib
npm pack
```

Установить в тестовый проект:

```bash
npm install "D:/IT/IT/Портфолио/Rise-UI-KIT/ramzes1385-rise-ui-kit-x.y.z.tgz"
```

---

# CI/CD

Для локальной проверки перед push:

```bash
npm run ci:validate
```

Команда должна выполнять:

```txt
lint
unit tests
npm package dry-run
```

---

# Release

Релизы управляются через `semantic-release`.

Локальная проверка:

```bash
npm run release:dry
```

Реальный релиз запускается только в CI/CD после push в `main`.

---

## Conventional Commits

Примеры:

```txt
fix: preserve chat autocomplete enter submit
feat: add base timeline component
docs: update readme
ci: configure semantic release
```

Правила релиза:

```txt
fix      -> patch
perf     -> patch
refactor -> patch
build    -> patch
deps     -> patch
feat     -> minor

docs     -> без релиза
test     -> без релиза
chore    -> без релиза
ci       -> без релиза
style    -> без релиза
```

---

## Нельзя делать вручную

После подключения `semantic-release` не нужно вручную выполнять:

```bash
npm version patch
npm version minor
npm version major
git tag v...
npm publish
```

За версии, changelog, теги, GitHub Release и npm publish отвечает `semantic-release`.

---

# Проверка перед push

```bash
npm run lint
npm run test:unit
npm run build:lib
npm run pack:dry
npm run release:dry
```

После проверки:

```bash
git status
git add .
git commit -m "docs: update readme"
git push origin main
```
