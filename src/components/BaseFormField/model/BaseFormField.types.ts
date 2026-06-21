import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения поля формы */
export const FORM_FIELD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseFormField
 */
export interface BaseFormFieldProps extends BaseComponentProps<(typeof FORM_FIELD_VARIANTS)[number], 'root' | 'header' | 'label' | 'required' | 'content' | 'description' | 'animation' | 'error'> {
	/** Заголовок поля */
	label?: string
	/** Описание поля */
	description?: string
	/** Текст ошибки */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** ID для связки label и input */
	for?: string
}

/**
 * События компонента BaseFormField
 */
export type BaseFormFieldEmits = Record<string, never>

/**
 * Слоты компонента BaseFormField
 */
export interface BaseFormFieldSlots {
	default?: () => unknown
}
