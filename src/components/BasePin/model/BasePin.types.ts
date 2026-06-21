import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения пин-кода */
export const PIN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePin
 */

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
}

/**
 * События компонента BasePin
 */
export interface BasePinEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'complete', value: string): void
}

/**
 * Слоты компонента BasePin
 */
export interface BasePinSlots {
	default?: () => unknown
}
