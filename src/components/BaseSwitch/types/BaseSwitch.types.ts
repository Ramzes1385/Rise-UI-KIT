import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { FieldInputAttrs } from '@composables/form/useFormContext'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const SWITCH_VARIANTS = ['default', 'outline', 'shadow'] as const

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
}

export interface BaseSwitchEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

export interface BaseSwitchSlots {
	/**
	 * Описание рядом с подписью: связано с переключателем через `aria-describedby`, клик по нему переключает.
	 * Без `label` и слота `label` содержимое становится подписью
	 */
	default?: () => unknown
	/** Кастомный заголовок поля */
	label?: () => unknown
	/** Кастомный текст ошибки */
	error?: () => unknown
}

export type SwitchProps = PropsWithDefaults<BaseSwitchProps, 'isRequired'>
