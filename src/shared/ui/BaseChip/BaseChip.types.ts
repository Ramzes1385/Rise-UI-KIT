import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения чипа */
export const CHIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseChip
 */
export interface BaseChipProps {
	/** Содержимое индикатора (число или текст) */
	content?: number | string
	/** Позиция индикатора */
	placement?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
	/** Вариант отображения */
	variant?: (typeof CHIP_VARIANTS)[number]
	/** Кастомный цвет компонента */
	color?: CustomColor
	/** Скрыть индикатор если content = 0 */
	isHiddenOnZero?: boolean
	/** Показывать '+' рядом с числом */
	hasOverflow?: boolean
	/** Максимальное число (если больше — показывается max+) */
	maxValue?: number
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
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
