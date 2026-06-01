import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

/** Варианты отображения тултипа */
export const TOOLTIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseTooltip
 */
export interface BaseTooltipProps {
	/** Текст подсказки */
	text: string
	/** Позиция */
	position?: 'top' | 'bottom' | 'left' | 'right'
	/** Вариант отображения */
	variant?: (typeof TOOLTIP_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Всегда видим */
	isAlwaysVisible?: boolean
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомные классы */
	customClass?: CustomClassProp
}
