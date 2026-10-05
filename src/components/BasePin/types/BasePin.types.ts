import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const PIN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части поля кода для пропа `ui` (БЭМ-элементы `.base-pin__<часть>`, `root` — обёртка компонента): cells — ряд ячеек,
 * input — ячейка (`<input>`), error-text — текст ошибки.
 */
export const PIN_PARTS = ['cells', 'input', 'error-text'] as const

export type BasePinPart = (typeof PIN_PARTS)[number]

export interface BasePinProps extends BaseComponentProps<(typeof PIN_VARIANTS)[number], 'root' | 'cells' | 'input' | 'errorText'> {
	/** Значение */
	modelValue: string
	/** Количество цифр */
	length?: number
	/** Тип ввода */
	type?: 'text' | 'password' | 'number'
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Сообщение об ошибке. Пустая строка/undefined — ошибки нет */
	error?: string
	/**
	 * Классы частей поля кода (`root`, `cells`, `input`, `error-text` — см. `PIN_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BasePin.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BasePin :ui="{ cells: 'gap-3', input: 'font-mono' }" />
	 */
	ui?: UiProp<BasePinPart>
}

export interface BasePinEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'complete', value: string): void
}

/** Слотов нет: содержимое строится из props */
export type BasePinSlots = Record<never, never>

export type PinProps = PropsWithDefaults<BasePinProps, 'length'>
