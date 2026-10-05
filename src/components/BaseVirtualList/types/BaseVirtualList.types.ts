import type { UiProp } from '@composables/base/useUi'
import type { PropsWithDefaults } from '@composables/base/useDefaults'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { VirtualAlign, VirtualKey } from '@composables/interaction/useVirtualList'

/** У списка одно оформление: строки рисует слот */
export const VIRTUAL_LIST_VARIANTS = ['default'] as const

/**
 * Части списка для пропа `ui` (БЭМ-элементы `.base-virtual-list__<часть>`, `root` — прокручиваемая область `role="list"`):
 * inner — внутренний блок высотой всего списка; item — строка (`role="listitem"`), её содержимое рисует слот.
 */
export const VIRTUAL_LIST_PARTS = ['inner', 'item'] as const

export type BaseVirtualListPart = (typeof VIRTUAL_LIST_PARTS)[number]

export interface BaseVirtualListProps<T = unknown> extends BaseComponentProps<(typeof VIRTUAL_LIST_VARIANTS)[number], 'root' | 'item'> {
	/** Элементы списка */
	items: T[]
	/** Высота строки до замера, px: строки замеряются после отрисовки, разная высота допустима */
	itemSize?: number
	/** Ключ строки: имя поля или функция; по умолчанию поле `id`, без него — индекс */
	itemKey?: string | ((item: T, index: number) => VirtualKey)
	/** Строк сверх видимых сверху и снизу */
	overscan?: number
	/** Высота области: число — в пикселях, строка — любая CSS-длина */
	height?: number | string
	/** Имя списка для скринридера */
	ariaLabel?: string
	/**
	 * Классы частей списка (`root`, `inner`, `item`) — добавляются к классам кита.
	 * Глобально — `createUiKitPlugin({ defaults: { BaseVirtualList: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseVirtualList :items="items" :ui="{ root: 'rounded-lg border', item: 'border-b' }" />
	 */
	ui?: UiProp<BaseVirtualListPart>
}

export interface BaseVirtualListSlots<T = unknown> {
	/** Строка списка */
	default?: (props: { item: T; index: number }) => unknown
}

export interface BaseVirtualListExpose {
	/** Прокрутить к строке: `auto` — к ближнему краю, только если строка не видна */
	scrollToIndex: (index: number, align?: VirtualAlign) => void
	/** Прокручиваемый элемент */
	getViewport: () => HTMLElement | null
}

export type VirtualListProps<T> = PropsWithDefaults<BaseVirtualListProps<T>, 'itemSize' | 'overscan'>
