import type { CustomClassProp } from '@composables/useCustomClass'
import type { CustomColor } from '@composables/useCustomColor'

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
	/**
	 * Кастомные классы. Строка применяется к корню, либо объект с ключами элементов:
	 * `root`, `text`.
	 */
	customClass?: CustomClassProp
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
