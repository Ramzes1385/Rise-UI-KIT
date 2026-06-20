import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения переключателя */
export const SWITCH_VARIANTS = ['default', 'outline', 'shadow'] as const

/**
 * Пропсы компонента BaseSwitch
 */
export interface BaseSwitchProps extends BaseComponentProps<(typeof SWITCH_VARIANTS)[number]> {
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
}

/**
 * События компонента BaseSwitch
 */
export interface BaseSwitchEmits {
	(event: 'update:modelValue', value: boolean): void
	(event: 'change', value: boolean): void
}

/**
 * Слоты компонента BaseSwitch
 */
export interface BaseSwitchSlots {
	/** Контент рядом с переключателем */
	default?: () => unknown
	/** Кастомный заголовок поля */
	label?: () => unknown
	/** Кастомный текст ошибки */
	error?: () => unknown
}
