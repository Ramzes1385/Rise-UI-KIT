import type { BaseComponentProps } from '@/types/base.types'

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


export interface BaseRadioProps extends BaseComponentProps<(typeof RADIO_VARIANTS)[number]> {
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
	/** Текст ошибки */
	error?: string
}

/**
 * События компонента BaseRadio
 */
export interface BaseRadioEmits {
	(event: 'update:modelValue', value: string | number): void
	(event: 'change', value: string | number): void
}
