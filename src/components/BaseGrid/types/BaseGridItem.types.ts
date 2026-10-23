import type { UiProp } from '@composables/base/useUi'
import type { GridResponsive } from './BaseGrid.types'

/** Части ячейки для пропа `ui`: root — корень (других частей нет) */
export const GRID_ITEM_PARTS = ['root'] as const

export type BaseGridItemPart = (typeof GRID_ITEM_PARTS)[number]

/** Сколько колонок занимает ячейка: число или `full` — вся строка сетки */
export type GridSpan = number | 'full'

export interface BaseGridItemProps {
	/**
	 * Сколько колонок занимает ячейка: число, `full` (от первой колонки до последней) или объект по брейкпоинтам,
	 * например `{ base: 'full', md: 6 }`. Больше колонок, чем в сетке, создаёт лишние колонки: следите за `cols`
	 */
	span?: GridResponsive<GridSpan>
	/**
	 * Колонка, с которой начинается ячейка, минус один: `offset` 2 ставит ячейку в третью колонку; число или объект по брейкпоинтам.
	 * Ячейка занимает колонку с этим номером, а не сдвигается от соседа: если место занято, она переходит на следующую строку.
	 * С `span` `full` не используется
	 */
	offset?: GridResponsive<number>
	/** Порядок показа (CSS `order`): число или объект по брейкпоинтам. Порядок для скринридера и Tab остаётся исходным */
	order?: GridResponsive<number>
	/** Тег корня: `div`, `li`, `article`… */
	tag?: string
	/**
	 * Классы корня: добавляются к БЭМ-классу кита, глобальные — `defaults.BaseGridItem.ui`.
	 *
	 * @example
	 * <BaseGridItem :span="6" :ui="{ root: 'p-4' }" />
	 */
	ui?: UiProp<BaseGridItemPart>
}

export interface BaseGridItemSlots {
	/** Содержимое ячейки */
	default?: () => unknown
}
