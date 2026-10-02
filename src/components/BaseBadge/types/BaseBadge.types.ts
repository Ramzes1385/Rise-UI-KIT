import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения бейджа (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без фона, shadow — нейтральный с тенью.
 */
export const BADGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

export interface BaseBadgeProps extends BaseComponentProps<(typeof BADGE_VARIANTS)[number], 'root' | 'text'> {
	/** Текст */
	label?: string
	/** Выключенный бейдж: `click` не приходит; с обработчиком `@click` — `aria-disabled="true"` и без фокуса */
	isDisabled?: boolean
}

export interface BaseBadgeEmits {
	/**
	 * Клик по бейджу. С обработчиком бейдж работает как кнопка: `role="button"`, фокус с Tab,
	 * Enter и Space вызывают тот же `click`
	 */
	(event: 'click', e: MouseEvent): void
}

export interface BaseBadgeSlots {
	/** Кастомный контент внутри бейджа (заменяет label) */
	default?: () => unknown
}
