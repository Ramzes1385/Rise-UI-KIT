import type { PropsWithDefaults } from '@composables/useDefaults'
import type { FieldInputAttrs } from '@composables/useFormContext'
import type { BaseComponentProps } from '@composables/useBaseComponent'

export const TEXTAREA_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseTextareaProps extends BaseComponentProps<
	(typeof TEXTAREA_VARIANTS)[number],
	'root' | 'label' | 'required' | 'field' | 'errorText'
> {
	/** Значение поля */
	modelValue?: string
	/** Плейсхолдер */
	placeholder?: string
	/** Количество строк */
	rows?: number
	/** Максимальное количество символов */
	maxlength?: number
	/** Заголовок поля */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обязательное поле */
	isRequired?: boolean
	/** Только для чтения */
	isReadonly?: boolean
	/** Автоматическое изменение высоты */
	isAutosize?: boolean
	/** Имя поля для формы */
	name?: string
	/** Имя поля без видимой подписи (`aria-label`) */
	ariaLabel?: string
	/** Атрибуты нативного `<textarea>`: `autocomplete`, `aria-*`, `data-*`; `id` — свой id поля */
	inputAttrs?: FieldInputAttrs
}

export interface BaseTextareaEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}

export interface BaseTextareaSlots {
	default?: () => unknown
}

export type TextareaProps = PropsWithDefaults<BaseTextareaProps, 'modelValue' | 'isRequired' | 'isAutosize'>
