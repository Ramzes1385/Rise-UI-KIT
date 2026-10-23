import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const FORM_FIELD_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части обёртки поля для пропа `ui` (корень — `root`): header — шапка с подписью, label — подпись,
 * required — звёздочка обязательности, content — поле, description — описание, error — текст ошибки.
 */
export const FORM_FIELD_PARTS = ['header', 'label', 'required', 'content', 'description', 'error'] as const

export type BaseFormFieldPart = (typeof FORM_FIELD_PARTS)[number]

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
	/**
	 * Классы частей обёртки (`root`, `header`, `label`, `required`, `content`, `description`, `error`) —
	 * добавляются к классам кита. Глобально — `defaults.BaseFormField.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseFormField label="Имя" :ui="{ label: 'uppercase', error: 'font-semibold' }"><BaseInput v-model="name" /></BaseFormField>
	 */
	ui?: UiProp<BaseFormFieldPart>
}

export type BaseFormFieldEmits = Record<string, never>

export interface BaseFormFieldSlots {
	/** Поле: контрол кита или свой `input`; обёртка связывает с ним подпись, описание и ошибку */
	default?: () => unknown
}

export type FormFieldProps = PropsWithDefaults<BaseFormFieldProps, 'isRequired'>

/** Контрол кита внутри обёртки: как получить id его элемента и можно ли назвать его через `for` */
export interface FormFieldControl {
	getId: () => string
	isLabelable: boolean
}
