import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения чекбокса */
export const CHECKBOX_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseCheckbox
 */
export interface BaseCheckboxProps {
	/** Состояние */
	modelValue: boolean
	/** Заголовок */
	label?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Вариант отображения */
	variant?: (typeof CHECKBOX_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Состояние ошибки */
	hasError?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseCheckbox
 */
export interface BaseCheckboxEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}
