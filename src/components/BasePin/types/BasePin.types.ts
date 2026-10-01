import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const PIN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

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

export interface BasePinEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'complete', value: string): void
}

/** Слотов нет: содержимое строится из props */
export type BasePinSlots = Record<never, never>

export type PinProps = PropsWithDefaults<BasePinProps, 'length'>
