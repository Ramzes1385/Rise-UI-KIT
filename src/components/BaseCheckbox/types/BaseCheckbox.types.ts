import type { PropsWithDefaults } from '@composables/useDefaults'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const CHECKBOX_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseCheckboxProps extends BaseComponentProps<
	(typeof CHECKBOX_VARIANTS)[number],
	'root' | 'labelWrapper' | 'wrapper' | 'input' | 'box' | 'icon' | 'label' | 'errorText'
> {
	/** Состояние */
	modelValue?: boolean
	/** Заголовок */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/**
	 * Частичный выбор (например, «Выбрать все», когда выбрана часть): флажок с чертой, скринридер слышит
	 * «частично отмечен». Клик отмечает флажок; снимать частичный выбор — задача родителя
	 */
	isIndeterminate?: boolean
}

export interface BaseCheckboxEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

export interface BaseCheckboxSlots {
	/** Кастомный текст ошибки */
	error?: () => unknown
}

export type CheckboxProps = PropsWithDefaults<BaseCheckboxProps, 'isIndeterminate'>
