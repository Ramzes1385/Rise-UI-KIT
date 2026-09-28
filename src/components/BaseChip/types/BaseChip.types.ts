import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты отображения индикатора (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без рамки, shadow — нейтральный с тенью.
 */
export const CHIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseChip
 */
export interface BaseChipProps extends BaseComponentProps<(typeof CHIP_VARIANTS)[number], 'root' | 'badge'> {
	/** Содержимое индикатора (число или текст) */
	content?: number | string
	/** Позиция индикатора */
	placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
	/** Скрыть индикатор если content = 0 */
	isHiddenOnZero?: boolean
	/** Показывать '+' рядом с числом */
	hasOverflow?: boolean
	/** Максимальное число (если больше — показывается max+) */
	maxValue?: number
}

/**
 * События компонента BaseChip
 */
export interface BaseChipEmits {
	(event: 'click-badge'): void
}

/**
 * Слоты компонента BaseChip
 */
export interface BaseChipSlots {
	/** Элемент, над углом которого стоит индикатор: кнопка, аватар, иконка */
	default?: () => unknown
}
