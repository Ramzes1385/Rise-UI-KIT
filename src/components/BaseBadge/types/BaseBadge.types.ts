import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения бейджа (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без фона, shadow — нейтральный с тенью.
 */
export const BADGE_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Палитра бейджа: primary — основной цвет (по умолчанию), neutral — нейтральный, info, success, warning, error — роли темы.
 * Цвета берутся из токенов `--rise-<роль>`, `--rise-<роль>-soft`, `--rise-<роль>-text`; `color` перекрывает палитру.
 */
export const BADGE_STATUSES = ['primary', 'neutral', 'info', 'success', 'warning', 'error'] as const

/**
 * Части бейджа для пропа `ui` (БЭМ-элементы `.base-badge__<часть>`, `root` — сам бейдж): text — текст из `label`,
 * remove — кнопка удаления при `isRemovable`.
 */
export const BADGE_PARTS = ['text', 'remove'] as const

export type BadgeStatus = (typeof BADGE_STATUSES)[number]

export type BaseBadgePart = (typeof BADGE_PARTS)[number]

export interface BaseBadgeProps extends BaseComponentProps<(typeof BADGE_VARIANTS)[number], 'root' | 'text' | 'remove'> {
	/**
	 * Текст. Новое значение (счётчик, статус) появляется с коротким «pop» — масштаб и прозрачность на токенах движения;
	 * при выключенном движении сменяется сразу
	 */
	label?: string
	/** Палитра: `primary` (по умолчанию), `neutral`, `info`, `success`, `warning`, `error`. Работает с вариантами `default`, `soft`, `outline` и `ghost` */
	status?: BadgeStatus
	/** Точка: маленький круг без текста (статус, непрочитанное). Если задан `label`, он становится `aria-label` (`role="img"`), иначе точка скрыта от скринридеров */
	isDot?: boolean
	/** Круглый счётчик: минимальная ширина равна высоте, полностью скруглённые края — для чисел и коротких меток */
	isRound?: boolean
	/**
	 * Бейдж с кнопкой удаления (крестик справа): клик по ней вызывает `remove`. Кнопка — настоящая `button` размером под бейдж,
	 * сам бейдж и его `click` не затрагиваются
	 */
	isRemovable?: boolean
	/** Доступное имя кнопки удаления. По умолчанию «Удалить {label}» или «Удалить», если `label` не задан */
	removeLabel?: string
	/** Кнопка удаления в порядке Tab (по умолчанию `true`); `false` — `tabindex="-1"`, когда фокусом управляет родитель (теги в поле, список выбора) */
	isRemoveFocusable?: boolean
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
	/** Нажата кнопка удаления (`isRemovable`); `click` бейджа при этом не приходит */
	(event: 'remove', e: MouseEvent): void
}

export interface BaseBadgeSlots {
	/** Кастомный контент внутри бейджа (заменяет label) */
	default?: () => unknown
}
