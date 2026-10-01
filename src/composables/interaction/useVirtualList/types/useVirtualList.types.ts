import type { ComputedRef, Ref } from 'vue'

/** Ключ строки: по нему хранится замеренная высота, чтобы она не терялась при сдвиге строк */
export type VirtualKey = string | number

/** Выравнивание строки при прокрутке к ней: `auto` — только если строка не видна целиком */
export type VirtualAlign = 'start' | 'center' | 'end' | 'auto'

export interface UseVirtualListOptions {
	/** Число строк */
	count: () => number
	/** Высота строки до замера, px */
	estimateSize: () => number
	/** Прокручиваемый элемент */
	scrollElement: Readonly<Ref<HTMLElement | null>>
	/** Строк сверх видимых сверху и снизу (по умолчанию 5) */
	overscan?: () => number
	/** Ключ строки по индексу (по умолчанию индекс) */
	getKey?: (index: number) => VirtualKey
	/** Строка, которая рендерится даже вне видимой области: в ней фокус */
	pinnedIndex?: () => number | undefined
}

/** Строка в отрисовке: индекс, ключ, начало и высота, px */
export interface VirtualItem {
	index: number
	key: VirtualKey
	start: number
	size: number
}

export interface UseVirtualListReturn {
	/** Строки для отрисовки: видимые, запас и закреплённая */
	items: ComputedRef<VirtualItem[]>
	/** Полная высота всех строк, px */
	totalSize: ComputedRef<number>
	/** Отрисованный диапазон видимых строк с запасом: [start, end) */
	range: ComputedRef<{ start: number; end: number }>
	/** Высота строк до диапазона и после него, px — для распорок */
	paddingStart: ComputedRef<number>
	paddingEnd: ComputedRef<number>
	/** Записать замеренную высоту строки */
	measure: (index: number, size: number) => void
	/** Замерять высоту элемента строки сейчас и при каждом изменении размера (для :ref) */
	measureElement: (element: unknown, index: number) => void
	/** Прокрутить к строке */
	scrollToIndex: (index: number, align?: VirtualAlign) => void
	/** Перечитать прокрутку и высоту области */
	update: () => void
	/** Прокрутка области, px */
	scrollTop: Ref<number>
	/** Высота области, px */
	viewportSize: Ref<number>
}

/** Диапазон строк или границы одной строки: `start` включительно, `end` — не включая */
export interface VirtualRange {
	start: number
	end: number
}

/** Высоты строк виртуального списка (внутреннее устройство useVirtualList) */
export interface VirtualSizes {
	/** Начало каждой строки; последний элемент — полная высота */
	offsets: ComputedRef<number[]>
	/** Ключ строки: getKey или индекс */
	keyOf: (index: number) => VirtualKey
	/** Запомнить замеренную высоту строки */
	measure: (index: number, size: number) => void
}

/** Замер элементов строк через ResizeObserver */
export interface VirtualItemObserver {
	measureElement: (element: unknown, index: number) => void
	/** Отключить наблюдатель при размонтировании */
	disconnect: () => void
}

/** Прокрутка и высота прокручиваемой области */
export interface VirtualScrollState {
	scrollTop: Ref<number>
	viewportSize: Ref<number>
	/** Прочитать прокрутку и высоту из элемента */
	update: () => void
}
