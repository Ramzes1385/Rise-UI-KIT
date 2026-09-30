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
	/** Что импортировать из пакета кита: компоненты и константы шаблона */
	imports: readonly string[]
	/** Переменные `v-model` шаблона: имя → аргумент Storybook. В коде — `const phone = ref(значение из Controls)` */
	models?: Readonly<Record<string, string>>
	/** Строки `<script setup>` после импортов: данные и обработчики, которые использует шаблон */
	script?: string
	/** Аргументы, которые шаблон задаёт сам и которых нет в `v-bind="args"` */
	omit?: readonly string[]
}

/** Часть контекста истории, из которой собирается код */
export interface StorySourceContext {
	args: Record<string, unknown>
	argTypes?: Record<string, { table?: { category?: string } } | undefined>
	component?: unknown
}
