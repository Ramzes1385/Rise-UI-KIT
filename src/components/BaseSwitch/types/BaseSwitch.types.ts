import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const SWITCH_VARIANTS = ['default', 'outline', 'shadow'] as const

export interface BaseSwitchProps extends BaseComponentProps<
	(typeof SWITCH_VARIANTS)[number],
	'root' | 'row' | 'wrapper' | 'input' | 'slider' | 'handle' | 'content' | 'label' | 'required' | 'errorText'
> {
	/** Состояние */
	modelValue?: boolean
	/** Заголовок поля */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обратный порядок (контент слева, переключатель справа) */
	reverse?: boolean
}

export interface BaseSwitchEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

export interface BaseSwitchSlots {
	/** Контент рядом с переключателем */
	default?: () => unknown
	/** Кастомный заголовок поля */
	label?: () => unknown
	/** Кастомный текст ошибки */
	error?: () => unknown
}

export type SwitchProps = PropsWithDefaults<BaseSwitchProps, 'isRequired'>
