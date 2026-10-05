import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const CHECKBOX_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части флажка для пропа `ui` (БЭМ-элементы `.base-checkbox__<часть>`, `root` — корень):
 * label-wrapper — `<label>` вокруг флажка и подписи, wrapper — обёртка поля, input — нативный `<input>`,
 * box — квадрат флажка, icon — галочка или черта, label — подпись, error — область ошибки, error-text — текст ошибки.
 */
export const CHECKBOX_PARTS = ['label-wrapper', 'wrapper', 'input', 'box', 'icon', 'label', 'error', 'error-text'] as const

export type BaseCheckboxPart = (typeof CHECKBOX_PARTS)[number]

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
	/**
	 * Классы частей флажка (`root`, `box`, `icon`, `label`… — см. `CHECKBOX_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseCheckbox: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseCheckbox v-model="isAgreed" label="Согласен" :ui="{ box: 'rounded-full', label: 'font-semibold' }" />
	 */
	ui?: UiProp<BaseCheckboxPart>
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
