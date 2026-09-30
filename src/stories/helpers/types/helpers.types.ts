import type { ARG_GROUP } from '../controls/argTypes'
import type { userEvent as defaultUserEvent } from 'storybook/test'

export type ArgGroup = (typeof ARG_GROUP)[keyof typeof ARG_GROUP]

export interface BaseArgTypesOptions {
	/** Допустимые варианты оформления (константа `<X>_VARIANTS`). Без них контрол variant не создаётся. */
	variants?: readonly string[]
}

export interface PlaceholderOptions {
	width?: number
	height?: number
	/** Оттенок HSL 0–360: задаёт палитру иллюстрации. */
	hue?: number
}

export type UserEvent = Pick<typeof defaultUserEvent, 'tab'>

/** Код для «Show code» истории со своим шаблоном */
export interface StorySourceOptions {
	/** Шаблон истории — тот же, что в render. `v-bind="args"` в коде раскрывается в пропсы из Controls */
	template: string
	/** Что импортировать из пакета кита: компоненты, константы шаблона и типы строк `script` (`'type AutocompleteOption'`) */
	imports: readonly string[]
	/** Переменные `v-model` шаблона: имя → аргумент Storybook. В коде — `const phone = ref(значение из Controls)` */
	models?: Readonly<Record<string, string>>
	/** Строки `<script setup>` после импортов: данные и обработчики, которые использует шаблон */
	script?: string
	/** Аргументы, которые шаблон задаёт сам и которых нет в `v-bind="args"` */
	omit?: readonly string[]
	/** Что импортировать из vue для строк `script`: `ref`, `computed`, `onMounted`… (`ref` для `models` добавляется сам) */
	vue?: readonly string[]
	/** Импорты из других входов пакета: `{ '@ramzes1385/rise-ui-kit/composables': ['createColorMode'] }` */
	importsFrom?: Readonly<Record<string, readonly string[]>>
	/** Состояние шаблона: имя → начальное значение. В коде — `const isOpen = ref(false)`; в `useStorySetup` — те же `state` */
	state?: Readonly<Record<string, unknown>>
	/** Типы переменных `state` для кода: `{ values: 'Record<string, string>' }` → `ref<Record<string, string>>({})` */
	types?: Readonly<Record<string, string>>
}

/** Настройки `useStorySetup` — те же `models` и `state`, что у `storySource` */
export interface StorySetupOptions {
	/** Переменные `v-model` шаблона: имя → аргумент Storybook */
	models?: Readonly<Record<string, string>>
	/** Состояние шаблона: имя → начальное значение; у каждого показа истории — свой `ref` с копией значения */
	state?: Readonly<Record<string, unknown>>
	/** Данные и обработчики шаблона, которые не меняются */
	data?: Readonly<Record<string, unknown>>
	/** Аргументы-слоты: в `v-bind="args"` не попадают, их тексты — в `slots` */
	slots?: readonly string[]
	/** Логика шаблона — то же, что строки `script` в `storySource`: вызывается у каждого показа, её значения — в шаблоне */
	setup?: () => Record<string, unknown>
}

/** Пропс из Controls для кода: имя атрибута и сам атрибут */
export interface ShownAttribute {
	/** Имя атрибута в kebab-case: `title`, `size-scale` */
	name: string
	/** Атрибут целиком: `title="Отчёт"`, `:size-scale="125"` */
	code: string
	/** Константа `<script setup>` для длинного значения: `const items = [...]` */
	hoist?: string
}

/** Часть контекста истории, из которой собирается код */
export interface StorySourceContext {
	args: Record<string, unknown>
	argTypes?: Record<string, { table?: { category?: string }; mapping?: Record<string, unknown> } | undefined>
	component?: unknown
}
