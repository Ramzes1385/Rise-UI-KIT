import type { BaseComponentProps } from '@composables/useBaseComponent'

export const RADIO_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'bordered'] as const

export interface BaseRadioOption {
	value: string | number
	label: string
	isDisabled?: boolean
}

export interface BaseRadioProps extends BaseComponentProps<
	(typeof RADIO_VARIANTS)[number],
	'root' | 'label' | 'options' | 'radio' | 'wrapper' | 'input' | 'circle' | 'dot' | 'optionLabel' | 'errorText'
> {
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

export interface BaseRadioEmits {
	(event: 'update:modelValue', value: string | number): void
	(event: 'change', value: string | number): void
}

export interface BaseRadioSlots {
	default?: () => unknown
	/** Кастомная подпись опции. Нативный radio и индикатор рендерит компонент, поэтому выбор, клавиатура и роль radio сохраняются */
	option?: (props: { option: BaseRadioOption; isChecked: boolean }) => unknown
}
