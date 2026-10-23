import type { Component } from 'vue'
import type { ARG_GROUP } from '../controls/argTypes'
import type { ThemePresetName } from '@utils/theme/themeUtils'
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
	/** Типы переменных `state` и `models` для кода: `{ values: 'Record<string, string>' }` → `ref<Record<string, string>>({})` */
	types?: Readonly<Record<string, string>>
	/**
	 * Свои компоненты примера — отдельные файлы Vue: имя → их шаблон и код. Нужны, когда логика должна жить внутри
	 * `<BaseApp>` (`useToast()`, `useConfirm()` находят ближайший `BaseApp` через inject). В коде основной файл
	 * импортирует `import Name from './Name.vue'`, а сами файлы идут следом под комментарием `<!-- Name.vue -->`.
	 */
	components?: Readonly<Record<string, StorySourceOptions>>
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

/** Настройки `motionPresetsStory` — истории «Анимации» с колонками пресетов движения */
export interface MotionPresetsStoryOptions {
	/**
	 * Разметка одной колонки — повторяется в каждой колонке пресета. Перезапуск — `:key="replay"` (кнопка «Повторить»
	 * делает `replay++`) или своё состояние через `action`. В разметке нет `id`: колонок четыре. `%preset%` заменяется
	 * именем пресета колонки — для имён, которые должны различаться (`aria-label` областей, `id` слоя)
	 */
	item: string
	/** Компоненты шаблона, обязательно с `BaseButton` для кнопки «Повторить» */
	components: Readonly<Record<string, Component>>
	/** Что импортировать из пакета кита для «Show code» (`BaseButton` добавляется сам) */
	imports: readonly string[]
	/**
	 * Подписи шагов многошаговой истории: кнопка «Следующий шаг: <подпись>» переводит `step` (в `item` — индекс шага, с 0)
	 * на следующий, после последнего шага она «Повторить» и возвращает `step` в 0. `steps` лежит в состоянии шаблона.
	 * Без параметра — одна кнопка (`action`, `trigger`, по умолчанию `replay++`)
	 */
	steps?: readonly string[]
	/** Состояние шаблона сверх `replay` (`step` и `steps` при `steps`), например `{ isOpen: false }` */
	state?: Readonly<Record<string, unknown>>
	/** Выражение кнопки одношаговой истории, по умолчанию `replay++`; при `steps` не используется */
	action?: string
	/** Подпись кнопки одношаговой истории, по умолчанию «Повторить»; при `steps` не используется */
	trigger?: string
	/** Аргументы, которые шаблон задаёт сам, — как `omit` у `storySource` */
	omit?: readonly string[]
	/** Аргументы-слоты — как `slots` у `useStorySetup` */
	slots?: readonly string[]
}

/** Бренд историй — глобал Storybook `brand`: пресет `THEME_PRESETS` или `custom` — тема из «Foundations/Конструктор темы» */
export type StoryBrand = ThemePresetName | 'custom'

/** Что `scriptImports` добавляет к импортам модуля: компоненты шаблона и пути, которых в модуле нет */
export interface ScriptImportsExtra {
	/** Имена из пакета кита */
	imports?: readonly string[]
	/** Имена из прочих путей */
	importsFrom?: Readonly<Record<string, readonly string[]>>
	/** Имена из `vue`, которых нет в модуле */
	vue?: readonly string[]
}

/** Результат `scriptImports`: готовые `imports` и `importsFrom` для `storySource` */
export interface ScriptImports {
	/** Имена из пакета кита (`type X` для типов) */
	imports: string[]
	/** Имена из `vue` (`ref`, `computed`, …) — значение `vue` у `storySource` */
	vue: string[]
	/** Имена из подпутей пакета и соседних файлов */
	importsFrom: Record<string, string[]>
}
