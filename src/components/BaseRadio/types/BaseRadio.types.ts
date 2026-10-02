import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

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
	/** Имя группы без видимого заголовка (`aria-label`) */
	ariaLabel?: string
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
	/** Кастомная подпись опции. Нативный radio и индикатор рендерит компонент, поэтому выбор, клавиатура и роль radio сохраняются */
	option?: (props: { option: BaseRadioOption; isChecked: boolean }) => unknown
}

export type RadioProps = PropsWithDefaults<BaseRadioProps, 'isRequired'>
