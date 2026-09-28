import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты отображения тултипа:
 * default — инвертированный фон; soft — мягкий фон основного цвета с рамкой; outline — фон страницы с рамкой;
 * shadow — фон страницы с рамкой и тенью; ghost — приподнятый нейтральный фон без стрелки.
 */
export const TOOLTIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseTooltipProps extends BaseComponentProps<(typeof TOOLTIP_VARIANTS)[number], 'root' | 'tooltip' | 'text'> {
	/** Текст подсказки */
	text: string
	/** Позиция */
	position?: 'top' | 'bottom' | 'left' | 'right'
	/** Всегда видим */
	isAlwaysVisible?: boolean
}

export type BaseTooltipEmits = Record<string, never>

export interface BaseTooltipSlots {
	/**
	 * Триггер тултипа. Кит сам ставит `aria-describedby` на первый фокусируемый элемент в слоте;
	 * `triggerProps` нужен, если фокусируемый элемент вложен глубже
	 */
	default?: (props: { triggerProps: Record<string, string | undefined> }) => unknown
}
