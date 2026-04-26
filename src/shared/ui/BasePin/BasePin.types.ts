import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения пин-кода */
export const PIN_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BasePin
 */
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
	/** Состояние ошибки */
	hasError?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BasePin
 */
export interface BasePinEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'complete', value: string): void
}
