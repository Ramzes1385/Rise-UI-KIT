import type { BaseComponentProps } from '../../../types/base.types'

/**
 * Варианты отображения тултипа:
 * default — инвертированный фон; soft — мягкий фон основного цвета с рамкой; outline — фон страницы с рамкой;
 * shadow — фон страницы с рамкой и тенью; ghost — приподнятый нейтральный фон без стрелки.
 */
export const TOOLTIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseTooltip
 */
export interface BaseTooltipProps extends BaseComponentProps<(typeof TOOLTIP_VARIANTS)[number], 'root' | 'tooltip' | 'text'> {
	/** Текст подсказки */
	text: string
	/** Позиция */
	position?: 'top' | 'bottom' | 'left' | 'right'
	/** Всегда видим */
	isAlwaysVisible?: boolean
}

/**
 * События компонента BaseTooltip
 */
export type BaseTooltipEmits = Record<string, never>

/**
 * Слоты компонента BaseTooltip
 */
export interface BaseTooltipSlots {
	/** Триггер тултипа */
	default?: () => unknown
}
