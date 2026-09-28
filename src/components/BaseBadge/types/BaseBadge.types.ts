import type { BaseComponentProps } from '@composables/useBaseComponent'

/**
 * Варианты отображения бейджа (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без фона, shadow — нейтральный с тенью.
 */
export const BADGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseBadge
 */
export interface BaseBadgeProps extends BaseComponentProps<(typeof BADGE_VARIANTS)[number], 'root' | 'text'> {
	/** Текст */
	label?: string
}

/**
 * События компонента BaseBadge
 */
export interface BaseBadgeEmits {
	/** Событие клика по бейджу */
	(event: 'click', e: MouseEvent): void
}

/**
 * Слоты компонента BaseBadge
 */
export interface BaseBadgeSlots {
	/** Кастомный контент внутри бейджа (заменяет label) */
	default?: () => unknown
}
