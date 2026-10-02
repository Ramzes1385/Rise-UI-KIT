import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

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
	/** Имя флажка без видимой подписи (`aria-label`) */
	ariaLabel?: string
	/** Атрибуты нативного `<input>`: `name`, `value`, `aria-*`, `data-*`; `id` — свой id флажка */
	inputAttrs?: FieldInputAttrs
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
