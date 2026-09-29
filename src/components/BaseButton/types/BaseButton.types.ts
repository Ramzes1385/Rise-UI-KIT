import type { PaddingProp } from '@composables/base/usePadding'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/**
 * Варианты отображения кнопки:
 * default — заливка основным цветом (главное действие), soft — мягкий фон основного цвета,
 * outline — нейтральная с рамкой, ghost — нейтральная без фона, shadow — нейтральная с тенью.
 */
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseButtonProps extends BaseComponentProps<(typeof BUTTON_VARIANTS)[number], 'root'> {
	/** Тип кнопки */
	type?: (typeof BUTTON_TYPES)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию — из темы: `--rise-control-padding-y` × `--rise-control-padding-x` (5px 10px, кнопка высотой 32px).
	 */
	padding?: PaddingProp
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
}

export interface BaseButtonEmits {
	(event: 'click', e: MouseEvent): void
}

export interface BaseButtonSlots {
	/** Основной контент кнопки */
	default?: () => unknown
	/** Контент слева от текста (иконка) */
	left?: () => unknown
	/** Контент справа от текста (иконка) */
	right?: () => unknown
}
