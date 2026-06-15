import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения пин-кода */
export const PIN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePin
 */
import type { CustomClassProp } from '@composables/useCustomClass'

export interface BasePinProps {
	/** Значение */
	modelValue: string
	/** Количество цифр */
	length?: number
	/** Тип ввода */
	type?: 'text' | 'password' | 'number'
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Вариант отображения */
	variant?: (typeof PIN_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Сообщение об ошибке. Пустая строка/undefined — ошибки нет */
	error?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BasePin
 */
export interface BasePinEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'complete', value: string): void
}
