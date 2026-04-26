import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения радиокнопки */
export const RADIO_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseRadio
 */
export interface BaseRadioOption {
	value: string | number
	label: string
	isDisabled?: boolean
}

export interface BaseRadioProps {
	/** Выбранное значение */
	modelValue: string | number
	/** Список опций */
	options: BaseRadioOption[]
	/** Имя группы */
	name: string
	/** Вертикальное расположение */
	isVertical?: boolean
	/** Вариант отображения */
	variant?: (typeof RADIO_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Состояние ошибки */
	hasError?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
}

/**
 * События компонента BaseRadio
 */
export interface BaseRadioEmits {
	(event: 'update:modelValue', value: string | number): void
	(event: 'change', value: string | number): void
}
