import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'

/**
 * Части разделителя для пропа `ui` (БЭМ-элементы `.base-separator__<часть>`, `root` — корень с `role="separator"`):
 * line — линия (с подписью их две), content — подпись или содержимое слота между линиями.
 */
export const SEPARATOR_PARTS = ['line', 'content'] as const

export type BaseSeparatorPart = (typeof SEPARATOR_PARTS)[number]

export type SeparatorOrientation = 'horizontal' | 'vertical'

export interface BaseSeparatorProps extends BaseComponentProps<string, 'root' | 'line' | 'content'> {
	/** Ориентация: `horizontal` — линия во всю ширину, `vertical` — во всю высоту ряда. */
	orientation?: SeparatorOrientation
	/** Подпись между линиями. Она же — доступное имя разделителя (`aria-labelledby`). */
	label?: string
	/** Толщина линии (px), больше 0. По умолчанию 1; NaN, 0 и меньше заменяются на 1 с предупреждением в консоли. */
	thickness?: number
	/** Пунктирная линия. */
	isDashed?: boolean
	/**
	 * Отступы (px), не меньше 0. С подписью — вокруг неё: вдоль линии — значение × 2, поперёк — значение
	 * (10 → 20px и 10px). Без подписи — поперёк линии с обеих сторон: сверху и снизу у горизонтальной, слева и справа
	 * у вертикальной. Без пропа — из стилей: 12px вдоль линии вокруг подписи, 0 поперёк. Отрицательное и NaN не применяются.
	 */
	spacing?: number
	/**
	 * Классы частей разделителя (`root`, `line`, `content`) — добавляются к классам кита; `line` получают обе линии.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseSeparator: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseSeparator label="или" :ui="{ content: 'uppercase tracking-wide' }" />
	 */
	ui?: UiProp<BaseSeparatorPart>
}

/**
 * События компонента BaseSeparator (компонент не эмитит событий)
 */
export type BaseSeparatorEmits = Record<string, never>

export interface BaseSeparatorSlots {
	/** Контент между линиями (текст, иконка, кастомный декоратор) */
	default?: () => unknown
}

export type SeparatorProps = PropsWithDefaults<BaseSeparatorProps, 'sizeScale'>
