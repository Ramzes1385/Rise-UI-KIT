/** Composable: изменение ширины колонок таблицы указателем (мышь, касание, перо) */
import { useResizeDrag } from './useResizeDrag'
import { toHTMLElement } from '@utils/dom/domUtils'
import { createKeyboardResize } from './createKeyboardResize'
import { getCurrentInstance, onBeforeUnmount, ref } from 'vue'
import type { ResizeColumn, ResizeState, UseColumnResizeParams } from './types/useColumnResize.types'
import { applyResizeWidths, createIdleResizeState, findSiblingKey, measureSiblingWidth, snapshotWidths } from './useColumnResizeUtils'

function useColumnResize<TColumn extends ResizeColumn>({
	columns,
	visibleColumns,
	minWidth,
	onColumnResize,
	onColumnsChange,
}: UseColumnResizeParams<TColumn>) {
	const resizeState = ref<ResizeState>(createIdleResizeState())
	let restoreWidths: () => void = () => undefined
	const resizeBy = createKeyboardResize({ columns, visibleColumns, minWidth, onColumnResize, onColumnsChange })

	const drag = useResizeDrag({ onMove: handleMove, onEnd: stopResize })

	function handleMove(event: PointerEvent): void {
		/* istanbul ignore next -- Защитный выход без активного resize. */
		if (!resizeState.value.isResizing) return
		applyResizeWidths({ columns: columns.value, state: resizeState.value, minWidth, pageX: event.pageX })
	}

	function stopResize(isCancelled: boolean): void {
		/* istanbul ignore next -- Защитный выход при повторном завершении resize. */
		if (!resizeState.value.isResizing) return

		cancelResize()
		if (isCancelled) return restoreWidths()
		const column = columns.value.find(item => item.key === resizeState.value.columnKey)
		/* istanbul ignore else -- Колонка существует для пользовательского resize. */
		if (column) {
			onColumnResize(column.key, parseInt(column.width || '0'))
			onColumnsChange(columns.value)
		}
	}

	function cancelResize(): void {
		resizeState.value.isResizing = false
		drag.release()
	}

	function startResize(event: PointerEvent, columnKey: string): void {
		if (event.button > 0 || event.isPrimary === false) return
		const target = toHTMLElement(event.target)
		const th = target?.closest('th') ?? null
		/* istanbul ignore next -- defensive: resize-handle всегда внутри th */
		if (!th) return

		const siblingKey = findSiblingKey(visibleColumns.value, columnKey)
		const siblingWidth = siblingKey ? measureSiblingWidth(th, visibleColumns.value, columnKey) : 0
		restoreWidths = snapshotWidths(columns.value, [columnKey, siblingKey])
		resizeState.value = {
			isResizing: true,
			columnKey,
			nextColumnKey: siblingKey,
			startX: event.pageX,
			startWidth: th.offsetWidth,
			nextStartWidth: siblingWidth,
		}

		drag.attach(event)
	}

	// Размонтирование посреди перетаскивания: pointerup уже не дойдёт до stopResize, поэтому
	// освобождаем здесь — иначе выделение текста и курсор останутся сломанными во всём приложении
	if (getCurrentInstance()) onBeforeUnmount(cancelResize)

	return { startResize, resizeBy }
}

export { useColumnResize }
