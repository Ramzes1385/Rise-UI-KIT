import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const SWITCH_VARIANTS = ['default', 'outline', 'shadow'] as const

/**
 * Части переключателя для пропа `ui` (БЭМ-элементы `.base-switch__<часть>`, `root` — корень):
 * row — строка переключателя и подписи, wrapper — обёртка поля, input — нативный `<input role="switch">`,
 * slider — дорожка, handle — бегунок, content — колонка подписи и описания, caption — `<label>` подписи,
 * label — подпись из пропа, required — звёздочка, description — описание, error — область ошибки, error-text — текст ошибки.
 */
export const SWITCH_PARTS = [
	'row',
	'wrapper',
	'input',
	'slider',
	'handle',
	'content',
	'caption',
	'label',
	'required',
	'description',
	'error',
	'error-text',
] as const

export type BaseSwitchPart = (typeof SWITCH_PARTS)[number]

export interface BaseSwitchProps extends BaseComponentProps<
	(typeof SWITCH_VARIANTS)[number],
	'root' | 'row' | 'wrapper' | 'input' | 'slider' | 'handle' | 'content' | 'caption' | 'label' | 'required' | 'description' | 'errorText'
> {
	/** Состояние */
	modelValue?: boolean
	/** Заголовок поля */
	label?: string
	/** Текст ошибки */
	error?: string
	/** Обязательное поле */
	isRequired?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Обратный порядок (контент слева, переключатель справа) */
	reverse?: boolean
	/** Имя переключателя без видимой подписи (`aria-label`) */
	ariaLabel?: string
	/** Атрибуты нативного `<input>`: `name`, `value`, `aria-*`, `data-*`; `id` — свой id переключателя */
	inputAttrs?: FieldInputAttrs
	/**
	 * Классы частей переключателя (`root`, `slider`, `handle`, `label`… — см. `SWITCH_PARTS`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSwitch: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSwitch v-model="isOn" label="Уведомления" :ui="{ slider: 'shadow-inner', handle: 'shadow-lg' }" />
	 */
	ui?: UiProp<BaseSwitchPart>
}

export interface BaseSwitchEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

export interface BaseSwitchSlots {
	/**
	 * Описание под подписью: связано с переключателем через `aria-describedby`, клик по нему переключает.
	 * Без `label` и слота `label` содержимое становится подписью
	 */
	default?: () => unknown
	/** Кастомный заголовок поля */
	label?: () => unknown
	/** Кастомный текст ошибки */
	error?: () => unknown
}

export type SwitchProps = PropsWithDefaults<BaseSwitchProps, 'isRequired'>
