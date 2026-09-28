import type { BaseComponentProps } from '@composables/useBaseComponent'

/** Варианты отображения поля формы */
export const FORM_FIELD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseFormField
 */
export interface BaseFormFieldProps extends BaseComponentProps<
	(typeof FORM_FIELD_VARIANTS)[number],
	'root' | 'header' | 'label' | 'required' | 'content' | 'description' | 'animation' | 'error'
> {
	/** Заголовок поля */
	label?: string
	/** Описание поля */
	description?: string
	/** Текст ошибки */
	error?: string
	/** Обязательное поле: звёздочка и `aria-required` у контрола кита внутри; пустоту значения проверяет сам контрол */
	isRequired?: boolean
	/**
	 * id поля внутри обёртки: подпись связывается с ним атрибутом `for` (клик по подписи фокусирует поле, подпись — имя поля).
	 * Контролу кита (BaseInput, BaseTextarea, BaseSelect…) `for` не нужен: он сам сообщает обёртке свой id и берёт
	 * описание и ошибку. Без контрола кита и без `for` содержимое — группа (`role="group"`) с именем из подписи.
	 */
	for?: string
	/** Имя поля в данных BaseForm (путь через точку: `address.city`): ошибка проверки по схеме показывается здесь */
	name?: string
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
