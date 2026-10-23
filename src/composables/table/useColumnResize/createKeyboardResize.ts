/** Composable: изменение ширины колонки с клавиатуры — шаг стрелкой по ручке ресайза */
import { applyResizeWidths, findSiblingKey, measureSiblingWidth } from './useColumnResizeUtils'
import type { ResizeColumn, ResizeState, UseColumnResizeParams } from './types/useColumnResize.types'

function createKeyboardResize<TColumn extends ResizeColumn>(params: UseColumnResizeParams<TColumn>) {
	const { columns, visibleColumns, minWidth, onColumnResize, onColumnsChange } = params

	/**
	 * Изменить ширину колонки на delta px с клавиатуры: как при перетаскивании, от ширины ячейки на экране
	 * (`th.offsetWidth`, а не `column.width`: проценты, `rem` и растянутые раскладкой колонки), сосед меняется так же
	 */
	function resizeBy(th: HTMLElement, columnKey: string, delta: number): void {
		const column = columns.value.find(item => item.key === columnKey)
		/* istanbul ignore next -- defensive: ручка есть только у существующей колонки */
		if (!column) return
		const siblingKey = findSiblingKey(visibleColumns.value, columnKey)
		const state: ResizeState = {
			isResizing: false,
			columnKey,
			nextColumnKey: siblingKey,
			startX: 0,
			startWidth: th.offsetWidth,
			nextStartWidth: siblingKey ? measureSiblingWidth(th, visibleColumns.value, columnKey) : 0,
		}
		applyResizeWidths({ columns: columns.value, state, minWidth, pageX: delta })
		onColumnResize(column.key, parseInt(column.width as string))
		onColumnsChange(columns.value)
	}

	return resizeBy
}

export { createKeyboardResize }
