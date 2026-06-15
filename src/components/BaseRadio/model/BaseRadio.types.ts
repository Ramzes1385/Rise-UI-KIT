import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения радиокнопки */
export const RADIO_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'bordered'] as const

/**
 * Пропсы компонента BaseRadio
 */
export interface BaseRadioOption {
	value: string | number
	label: string
	isDisabled?: boolean
}

import type { CustomClassProp } from '@composables/useCustomClass'

export interface BaseRadioProps {
	/** Выбранное значение */
	modelValue: string | number
	/** Список опций */
	options: BaseRadioOption[]
	/** Имя группы */
	name: string
	/** Заголовок группы */
	label?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Вертикальное расположение */
	isVertical?: boolean
	/** Вариант отображения */
	variant?: (typeof RADIO_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Текст ошибки */
	error?: string
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}

/**
 * События компонента BaseRadio
 */
export interface BaseRadioEmits {
	(event: 'update:modelValue', value: string | number): void
	(event: 'change', value: string | number): void
}
