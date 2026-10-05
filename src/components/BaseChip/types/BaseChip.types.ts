import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Варианты отображения индикатора (как у кнопки):
 * default — заливка основным цветом, soft — мягкий фон основного цвета,
 * outline — нейтральный с рамкой, ghost — нейтральный без рамки, shadow — нейтральный с тенью.
 */
export const CHIP_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft'] as const

/**
 * Части индикатора для пропа `ui` (БЭМ-элементы `.base-chip__<часть>`, `root` — обёртка):
 * badge — индикатор в углу, value — его значение (меняется с анимацией по ключу).
 */
export const CHIP_PARTS = ['badge', 'value'] as const

export type BaseChipPart = (typeof CHIP_PARTS)[number]

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
	/**
	 * Классы частей (`root`, `badge`, `value`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseChip: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseChip :content="3" :ui="{ badge: 'ring-2' }"><BaseIcon name="inbox" /></BaseChip>
	 */
	ui?: UiProp<BaseChipPart>
}

export interface BaseChipEmits {
	/**
	 * Клик по индикатору. С обработчиком индикатор работает как кнопка: `role="button"`, фокус с Tab,
	 * Enter и Space; имя — «Индикатор: 5» из словаря (`UI_ARIA.CHIP_BADGE`)
	 */
	(event: 'click-badge'): void
}

export interface BaseChipSlots {
	/** Элемент, над углом которого стоит индикатор: кнопка, аватар, иконка */
	default?: () => unknown
}

export type ChipProps = PropsWithDefaults<BaseChipProps, 'maxValue'>
