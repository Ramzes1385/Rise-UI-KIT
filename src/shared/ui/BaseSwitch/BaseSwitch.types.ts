import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения переключателя */
export const SWITCH_VARIANTS = ['default', 'outline', 'shadow'] as const

/**
 * Пропсы компонента BaseSwitch
 */
export interface BaseSwitchProps {
	/** Состояние */
	modelValue: boolean
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
	/** Вариант отображения */
	variant?: (typeof SWITCH_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
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
