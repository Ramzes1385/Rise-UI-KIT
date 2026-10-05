import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения бейджа (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без фона, shadow — нейтральный с тенью.
 */
export const BADGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/** Части бейджа для пропа `ui` (БЭМ-элементы `.base-badge__<часть>`, `root` — сам бейдж): text — текст из `label`. */
export const BADGE_PARTS = ['text'] as const

export type BaseBadgePart = (typeof BADGE_PARTS)[number]

export interface BaseBadgeProps extends BaseComponentProps<(typeof BADGE_VARIANTS)[number], 'root' | 'text'> {
	/**
	 * Текст. Новое значение (счётчик, статус) появляется с коротким «pop» — масштаб и прозрачность на токенах движения;
	 * при выключенном движении сменяется сразу
	 */
	label?: string
	/** Выключенный бейдж: `click` не приходит; с обработчиком `@click` — `aria-disabled="true"` и без фокуса */
	isDisabled?: boolean
	/**
	 * Классы частей бейджа (`root`, `text`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseBadge: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseBadge label="Новое" :ui="{ root: 'rounded-full', text: 'uppercase' }" />
	 */
	ui?: UiProp<BaseBadgePart>
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
