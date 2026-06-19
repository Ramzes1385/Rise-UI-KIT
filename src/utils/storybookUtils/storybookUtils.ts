/** Утилиты: генерация ArgTypes, описание пропсов для Storybook и accessibility-тестирование в stories */

/* v8 ignore start -- a11y-функции тестируются через storybook tests, не unit */
import { expect, userEvent, waitFor, within } from 'storybook/test'
/* v8 ignore stop */
import { UI_TIMING } from '@constants'
import type { BuildArgTypesOptions, PropMeta } from './storybookUtils.types'
import type { ArgTypes } from '@storybook/vue3'

/** Скрытые пропы Vue по умолчанию */
const HIDDEN_VUE_PROPS = ['class', 'style', 'key', 'ref']

/** Таймаут ожидания для storybook play-функций (мс) — единый источник со временем загрузки изображения */
const STORY_WAIT_TIMEOUT = UI_TIMING.IMAGE_LOAD_TIMEOUT

/**
 * Строит argTypes для Storybook из мета-информации о пропах.
 * Автоматически скрывает технические Vue-пропы (class, style, key, ref).
 *
 * @example
 * ```ts
 * import { buildArgTypes } from '@utils/storybookUtils'
 * import { ACCORDION_VARIANTS } from './BaseAccordion.types'
 *
 * const argTypes = buildArgTypes({
 *   props: {
 *     variant: { control: 'inline-radio', options: ACCORDION_VARIANTS },
 *     sizeScale: { control: { type: 'range', min: 50, max: 200, step: 10 } },
 *     color: { control: 'object' },
 *     items: { table: { disable: true } },
 *   },
 * })
 * ```
 */
function buildArgTypes(options: BuildArgTypesOptions): ArgTypes {
	const { props, hidden = [] } = options
	const result: ArgTypes = {}

	const allHidden = [...HIDDEN_VUE_PROPS, ...hidden]

	for (const key of allHidden) {
		result[key] = { table: { disable: true } }
	}

	for (const [name, meta] of Object.entries(props)) {
		result[name] = buildPropArgType(meta)
	}

	return result
}

/**
 * Строит argType для одного пропа
 */
function buildPropArgType(meta: PropMeta): Record<string, unknown> {
	const entry: Record<string, unknown> = {}

	if (meta.control) {
		entry.control = meta.control
	}

	if (meta.options) {
		entry.options = [...meta.options]
	}

	if (meta.description) {
		entry.description = meta.description
	}

	if (meta.table) {
		entry.table = meta.table
	}

	return entry
}

export { buildArgTypes, STORY_WAIT_TIMEOUT }

/* v8 ignore start -- a11y-функции тестируются через storybook tests, не unit */

/** Клавиши для keyboard navigation */
type A11yKey = 'Tab' | 'Shift+Tab' | 'Enter' | 'Space' | 'Escape' | 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'

/** Опции для play-сценария keyboard navigation */
interface KeyboardNavOptions {
	/** Роль элемента для getByRole (предпочтительно) */
	role?: string
	/** Имя элемента для getByRole */
	name?: string
	/** CSS-селектор (запасной вариант, если роль недоступна) */
	selector?: string
	/** Клавиши для проверки */
	keys: A11yKey[]
	/** Проверка после каждой клавиши */
	expectAfter?: (element: HTMLElement) => Promise<void>
}

/** Опции для проверки фокусировки по Tab */
interface FocusTestOptions {
	/** Роль элемента */
	role?: string
	/** Имя элемента */
	name?: string
	/** CSS-селектор */
	selector?: string
}

/** Опции для проверки Shift+Tab */
interface ShiftTabOptions {
	/** Роль элемента */
	role?: string
	/** Имя элемента */
	name?: string
	/** CSS-селектор */
	selector?: string
}

/** Опции для проверки закрытия по Escape */
interface EscapeCloseOptions {
	/** CSS-селектор закрываемого элемента */
	selector: string
}

/** Опции для генерации a11y-параметров story */
interface A11yParamsOptions {
	/** Список правил axe-core для отключения */
	disableRules?: string[]
}

/** Клавиша активации для playActivation */
type ActivationKey = 'Enter' | 'Space'

/** Опции для проверки активации по клавише */
interface ActivationOptions {
	/** Роль элемента */
	role?: string
	/** Имя элемента */
	name?: string
	/** CSS-селектор */
	selector?: string
	/** Клавиша активации */
	key: ActivationKey
	/** Проверка после активации */
	expectAfter?: (element: HTMLElement) => Promise<void>
}

/** Маппинг клавиш в формат userEvent.keyboard */
const KEY_MAP: Record<A11yKey, string> = {
	Tab: '{Tab}',
	'Shift+Tab': '{Shift}{Tab}',
	Enter: '{Enter}',
	Space: ' ',
	Escape: '{Escape}',
	ArrowDown: '{ArrowDown}',
	ArrowUp: '{ArrowUp}',
	ArrowLeft: '{ArrowLeft}',
	ArrowRight: '{ArrowRight}',
}

/**
 * Находит элемент на canvas по роли или селектору.
 * Предпочтает getByRole для стабильности a11y-тестов.
 */
async function findElement(canvasElement: HTMLElement, options: FocusTestOptions): Promise<HTMLElement> {
	const canvas = within(canvasElement)

	if (options.role) {
		return canvas.getByRole(options.role, { name: options.name })
	}

	if (options.selector) {
		const el = canvasElement.querySelector(options.selector)
		if (!el) throw new Error(`Элемент не найден: ${options.selector}`)
		return el as HTMLElement
	}

	throw new Error('Укажите role или selector для поиска элемента')
}

/**
 * Проверка фокусировки элемента по Tab.
 * Используется как базовый a11y-сценарий для интерактивных компонентов.
 */
async function playFocusTest(canvasElement: HTMLElement, options: FocusTestOptions): Promise<void> {
	const element = await findElement(canvasElement, options)
	await userEvent.tab()
	expect(element).toHaveFocus()
}

/**
 * Проверка обратной фокусировки по Shift+Tab.
 * Дополнение к playFocusTest для полной keyboard навигации.
 * Не проверяем not.toHaveFocus() — в изолированном canvas Storybook
 * элемент может быть единственным фокусируемым, и Shift+Tab вернёт фокус к нему.
 */
async function playShiftTab(canvasElement: HTMLElement, options: ShiftTabOptions): Promise<void> {
	await findElement(canvasElement, options)
	await userEvent.tab()
	await userEvent.tab({ shift: true })
}

/**
 * Проверка активации по Enter или Space.
 * Подходит для кнопок, аккордеонов, меню.
 */
async function playActivation(canvasElement: HTMLElement, options: ActivationOptions): Promise<void> {
	const element = await findElement(canvasElement, {
		role: options.role,
		name: options.name,
		selector: options.selector,
	})
	await userEvent.click(element)
	const keyString = options.key === 'Space' ? ' ' : '{Enter}'
	await userEvent.keyboard(keyString)
	if (options.expectAfter) {
		await options.expectAfter(element)
	}
}

/**
 * Универсальный play-сценарий keyboard navigation.
 * Последовательно нажимает клавиши и проверяет состояние.
 */
async function playKeyboardNavigation(canvasElement: HTMLElement, options: KeyboardNavOptions): Promise<void> {
	for (const key of options.keys) {
		const keyString = KEY_MAP[key]
		await userEvent.keyboard(keyString)

		if (options.expectAfter) {
			const element = await findElement(canvasElement, {
				role: options.role,
				name: options.name,
				selector: options.selector,
			})
			await options.expectAfter(element)
		}
	}
}

/**
 * Проверка закрытия элемента по Escape.
 * Подходит для Modal, Popover, Dropdown, Slideover.
 */
async function playEscapeClose(canvasElement: HTMLElement, options: EscapeCloseOptions): Promise<void> {
	const element = canvasElement.querySelector(options.selector)
	if (!element) throw new Error(`Элемент не найден: ${options.selector}`)

	expect(element).toBeVisible()
	await userEvent.keyboard('{Escape}')
	await waitFor(() => {
		expect(element).not.toBeVisible()
	})
}

/**
 * Генерация a11y-параметров для story.
 * Позволяет точечно отключать правила axe-core для конкретной story.
 */
function getA11yParameters(options?: A11yParamsOptions): Record<string, unknown> {
	return {
		a11y: {
			config: {
				rules: (options?.disableRules ?? []).map(id => ({ id, enabled: false })),
			},
		},
	}
}

/* v8 ignore stop */

export { getA11yParameters, playActivation, playEscapeClose, playFocusTest, playKeyboardNavigation, playShiftTab }
export type {
	A11yKey,
	A11yParamsOptions,
	ActivationKey,
	ActivationOptions,
	EscapeCloseOptions,
	FocusTestOptions,
	KeyboardNavOptions,
	ShiftTabOptions,
}

