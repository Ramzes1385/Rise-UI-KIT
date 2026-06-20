import type { BaseComponentProps } from '../../../types/base.types'
import type { PaddingProp } from '@composables/usePadding'

/** Типы кнопки */
export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/** Варианты отображения кнопки */
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseButton
 */
export interface BaseButtonProps extends BaseComponentProps<(typeof BUTTON_VARIANTS)[number]> {
	/** Тип кнопки */
	type?: (typeof BUTTON_TYPES)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию 10 → 10px 20px
	 */
	padding?: PaddingProp
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
}

/**
 * События компонента BaseButton
 */
export interface BaseButtonEmits {
	(event: 'click', e: MouseEvent): void
}

/**
 * Слоты компонента BaseButton
 */
export interface BaseButtonSlots {
	/** Основной контент кнопки */
	default?: () => unknown
	/** Контент слева от текста (иконка) */
	left?: () => unknown
	/** Контент справа от текста (иконка) */
	right?: () => unknown
}

/**
 * Публичный контракт BaseButton (defineExpose)
 */
export interface BaseButtonExpose {
	/** Корневой DOM-элемент кнопки */
	buttonRef: HTMLButtonElement | null
	/** Устанавливает фокус на кнопку */
	focus: () => void
	/** Снимает фокус с кнопки */
	blur: () => void
}
