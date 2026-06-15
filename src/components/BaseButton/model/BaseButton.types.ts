import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'
import type { PaddingProp } from '@composables/usePadding'

/** Типы кнопки */
export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/** Варианты отображения кнопки */
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseButton
 */
export interface BaseButtonProps {
	/** Тип кнопки */
	type?: (typeof BUTTON_TYPES)[number]
	/** Вариант отображения */
	variant?: (typeof BUTTON_VARIANTS)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию 10 → 10px 20px
	 */
	padding?: PaddingProp
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы (строка или объект) */
	customClass?: CustomClassProp
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
