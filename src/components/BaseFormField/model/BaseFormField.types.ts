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
	/** Обязательное поле: показывает звёздочку; пустоту значения проверяет вложенный контрол (у обёртки нет значения) */
	isRequired?: boolean
	/**
	 * id поля внутри обёртки: подпись связывается с ним атрибутом `for` (клик по подписи фокусирует поле, подпись — имя поля).
	 * Без `for` содержимое помечается группой (`role="group"`) с именем из подписи и описанием из `description`/`error`.
	 */
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
