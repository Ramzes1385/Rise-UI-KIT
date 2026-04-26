import type { CustomColor } from '@/shared/composables/useCustomColor'

/** Варианты отображения бейджа */
export const BADGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Пропсы компонента BaseBadge
 */
export interface BaseBadgeProps {
	/** Текст */
	label?: string
	/** Вариант отображения */
	variant?: (typeof BADGE_VARIANTS)[number]
	/** Масштаб размера (100 = 100%, 150 = 150%, 75 = 75%) */
	sizeScale?: number
	/** Кастомный цвет компонента */
	color?: CustomColor
}

/**
 * События компонента BaseBadge
 */
export interface BaseBadgeEmits {
	/** Событие клика по бейджу */
	(event: 'click'): void
}

/**
 * Слоты компонента BaseBadge
 */
export interface BaseBadgeSlots {
	/** Кастомный контент внутри бейджа (заменяет label) */
	default?: () => unknown
}
