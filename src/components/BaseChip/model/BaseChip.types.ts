import type { BaseComponentProps } from '../../../types/base.types'

/** Варианты отображения чипа */
export const CHIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseChip
 */
export interface BaseChipProps extends BaseComponentProps<(typeof CHIP_VARIANTS)[number]> {
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
	default?: () => unknown
}
