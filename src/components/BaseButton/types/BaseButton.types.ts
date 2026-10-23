import type { UiProp } from '@composables/base/useUi'
import type { PaddingProp } from '@composables/base/usePadding'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

export const BUTTON_TYPES = ['button', 'submit', 'reset'] as const

/**
 * Варианты отображения кнопки:
 * default — заливка основным цветом (главное действие), soft — мягкий фон основного цвета,
 * tonal — нейтральная тональная заливка (вторичные действия: «Отмена», «Позже», панели инструментов),
 * outline — прозрачная с рамкой, ghost — нейтральная без фона до наведения, shadow — нейтральная с тенью.
 */
export const BUTTON_VARIANTS = ['default', 'ghost', 'outline', 'shadow', 'soft', 'tonal'] as const

/**
 * Части кнопки для пропа `ui` (БЭМ-элементы `.base-button__<часть>`, `root` — сама кнопка):
 * content — обёртка содержимого, label — текст, slot-left / slot-right — слоты по бокам, loader — индикатор загрузки.
 */
export const BUTTON_PARTS = ['content', 'label', 'slot-left', 'slot-right', 'loader'] as const

export type BaseButtonPart = (typeof BUTTON_PARTS)[number]

export interface BaseButtonProps extends BaseComponentProps<(typeof BUTTON_VARIANTS)[number], 'root'> {
	/** Тип кнопки */
	type?: (typeof BUTTON_TYPES)[number]
	/**
	 * Внутренние отступы. Число (px): Y = значение, X = значение × 2.
	 * Объект { x, y, top, right, bottom, left } задаёт оси напрямую без умножения
	 * (например { x: 25, y: 43 } → 43px сверху/снизу, 25px по бокам); стороны переопределяют оси.
	 * По умолчанию — из темы: `--rise-control-padding-y` × `--rise-control-padding-x` (7px 14px, кнопка высотой 36px).
	 */
	padding?: PaddingProp
	/** Состояние загрузки */
	isLoading?: boolean
	/** Отключенное состояние */
	isDisabled?: boolean
	/**
	 * Отключённая кнопка остаётся в фокусе и в порядке Tab: `aria-disabled="true"` вместо `disabled`,
	 * клик, Enter и Space не вызывают `click`, не отправляют форму и не всплывают.
	 * Для кнопок, которые отключаются от собственного нажатия (предел шага, исчерпанная история):
	 * фокус не уходит в `body`.
	 */
	isFocusableWhenDisabled?: boolean
	/**
	 * Классы частей кнопки (`root`, `content`, `label`, `slot-left`, `slot-right`, `loader`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseButton: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseButton :ui="{ root: 'rounded-full', label: 'tracking-wide' }">Сохранить</BaseButton>
	 */
	ui?: UiProp<BaseButtonPart>
}

export interface BaseButtonEmits {
	(event: 'click', e: MouseEvent): void
}

export interface BaseButtonSlots {
	/** Основной контент кнопки */
	default?: () => unknown
	/** Контент слева от текста (иконка) */
	left?: () => unknown
	/** Контент справа от текста (иконка) */
	right?: () => unknown
}
