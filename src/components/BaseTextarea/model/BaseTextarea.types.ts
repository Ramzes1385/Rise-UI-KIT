import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения текстового поля */
export const TEXTAREA_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseTextarea
 */
export interface BaseTextareaProps extends BaseComponentProps<(typeof TEXTAREA_VARIANTS)[number]> {
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
}

/**
 * События компонента BaseTextarea
 */
export interface BaseTextareaEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}

/**
 * Слоты компонента BaseTextarea
 */
export interface BaseTextareaSlots {
	default?: () => unknown
}
