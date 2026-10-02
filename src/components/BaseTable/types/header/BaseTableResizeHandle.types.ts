import type { TableColumn } from '../BaseTable.types'

export interface BaseTableResizeHandleProps {
	/** Колонка, ширину которой меняет ручка: подпись и текущая ширина для скринридера */
	column: TableColumn
}

/**
 * События BaseTableResizeHandle.
 */
export interface BaseTableResizeHandleEmits {
	(event: 'resize-start', value: MouseEvent): void
	/** Стрелка на ручке: изменить ширину на delta px */
	(event: 'resize-by', handle: HTMLElement, delta: number): void
}
