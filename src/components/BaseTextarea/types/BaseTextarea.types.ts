import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const TEXTAREA_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части поля для пропа `ui` (БЭМ-элементы `.base-textarea__<часть>`, `root` — обёртка компонента): label, required — звёздочка,
 * field — `<textarea>`, error-text, counter — счётчик символов.
 */
export const TEXTAREA_PARTS = ['label', 'required', 'field', 'error-text', 'counter'] as const

export type BaseTextareaPart = (typeof TEXTAREA_PARTS)[number]

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
	/**
	 * Классы частей поля (`root`, `field`, `label`, `counter`… — см. `TEXTAREA_PARTS`) — добавляются к классам кита.
	 * Глобально — `defaults.BaseTextarea.ui` плагина, классы склеиваются.
	 *
	 * @example
	 * <BaseTextarea :ui="{ field: 'font-mono', counter: 'text-xs' }" />
	 */
	ui?: UiProp<BaseTextareaPart>
}

export interface BaseTextareaEmits {
	(event: 'update:modelValue', value: string): void
	(event: 'blur', e: FocusEvent): void
	(event: 'focus', e: FocusEvent): void
}

/** Слотов нет: содержимое строится из props */
export type BaseTextareaSlots = Record<never, never>

export type TextareaProps = PropsWithDefaults<BaseTextareaProps, 'modelValue' | 'isRequired' | 'isAutosize'>
