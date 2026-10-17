import type { ResizeColumn, ResizeState } from './useColumnResize.types'

export interface ApplyResizeWidthsParams {
	columns: ResizeColumn[]
	state: ResizeState
	minWidth: number
	pageX: number
}

/** Данные начатого перетаскивания границы колонки */
export interface ActiveResizeInit {
	/** Ключ перетаскиваемой колонки */
	columnKey: string
	/** Ключ соседней колонки, которая отдаёт или берёт ширину; пустая строка — соседа нет */
	siblingKey: string
	/** Событие нажатия на границу */
	event: PointerEvent
	/** Ячейка заголовка колонки */
	th: HTMLElement
	/** Ширина соседней колонки, px */
	siblingWidth: number
}
