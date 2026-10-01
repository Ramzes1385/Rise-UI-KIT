/** Composable: изменение ширины колонок таблицы через перетаскивание */
import { onBeforeUnmount, ref } from 'vue'
import { useResizeDrag } from './useResizeDrag'
import { toHTMLElement } from '@utils/dom/domUtils'
import type { ResizeColumn, ResizeState, UseColumnResizeParams } from './types/useColumnResize.types'
import { applyResizeWidths, createIdleResizeState, findSiblingKey, measureSiblingWidth } from './useColumnResizeUtils'

function useColumnResize<TColumn extends ResizeColumn>({
	columns,
	visibleColumns,
	minWidth,
	onColumnResize,
	onColumnsChange,
}: UseColumnResizeParams<TColumn>) {
	const resizeState = ref<ResizeState>(createIdleResizeState())

	const drag = useResizeDrag({ onMove: handleMouseMove, onEnd: stopResize })

	function handleMouseMove(event: MouseEvent): void {
		/* istanbul ignore next -- Защитный выход без активного resize. */
		if (!resizeState.value.isResizing) return

		applyResizeWidths({ columns: columns.value, state: resizeState.value, minWidth, pageX: event.pageX })
	}

	function stopResize(): void {
		/* istanbul ignore next -- Защитный выход при повторном завершении resize. */
		if (!resizeState.value.isResizing) return

		resizeState.value.isResizing = false
		drag.release()

		const column = columns.value.find(item => item.key === resizeState.value.columnKey)
		/* istanbul ignore else -- Колонка существует для пользовательского resize. */
		if (column) {
			onColumnResize(column.key, parseInt(column.width || '0'))
			onColumnsChange(columns.value)
		}
	}

	function startResize(event: MouseEvent, columnKey: string): void {
		const target = toHTMLElement(event.target)
		const th = target?.closest('th') ?? null
		/* istanbul ignore next -- defensive: resize-handle всегда внутри th */
		if (!th) return

		const siblingKey = findSiblingKey(visibleColumns.value, columnKey)
		let siblingWidth = 0

		if (siblingKey) {
			siblingWidth = measureSiblingWidth(th, visibleColumns.value, columnKey)
		}

		resizeState.value = {
			isResizing: true,
			columnKey,
			nextColumnKey: siblingKey,
			startX: event.pageX,
			startWidth: th.offsetWidth,
			nextStartWidth: siblingWidth,
		}

		drag.attach()
	}

	// Размонтирование посреди перетаскивания: mouseup уже не дойдёт до stopResize, поэтому
	// освобождаем здесь — иначе выделение текста и курсор останутся сломанными во всём приложении
	onBeforeUnmount(() => {
		resizeState.value.isResizing = false
		drag.release()
	})

	return {
		startResize,
	}
}

export { useColumnResize }
