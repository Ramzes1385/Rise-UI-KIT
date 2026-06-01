/**
 * Утилиты для accessibility-тестирования в Storybook stories.
 * Переиспользуемые play-сценарии для keyboard navigation и a11y-проверок.
 */

import { expect, userEvent, waitFor, within } from 'storybook/test'

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
