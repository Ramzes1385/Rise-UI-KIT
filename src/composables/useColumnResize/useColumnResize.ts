import { onBeforeUnmount, ref } from 'vue'
import { toHTMLElement } from '@utils/domUtils'
import type { ResizeColumn, ResizeState, UseColumnResizeParams } from './useColumnResize.types'

/**
 * Composable для изменения ширины колонок таблицы через перетаскивание.
 */
function useColumnResize<TColumn extends ResizeColumn>({
	columns,
	visibleColumns,
	minWidth,
	onColumnResize,
	onColumnsChange,
}: UseColumnResizeParams<TColumn>) {
	const resizeState = ref<ResizeState>({
		isResizing: false,
		columnKey: '',
		nextColumnKey: '',
		startX: 0,
		startWidth: 0,
		nextStartWidth: 0,
	})

	function findSiblingKey(columnKey: string): string {
		const visibleKeys = visibleColumns.value.map(column => column.key)
		const visibleIndex = visibleKeys.indexOf(columnKey)

		if (visibleIndex === visibleKeys.length - 1 && visibleIndex > 0) {
			return visibleKeys[visibleIndex - 1]
		}

		if (visibleIndex < visibleKeys.length - 1) {
			return visibleKeys[visibleIndex + 1]
		}

		return ''
	}

	function handleMouseMove(event: MouseEvent): void {
		/* istanbul ignore next -- Защитный выход без активного resize. */
		if (!resizeState.value.isResizing) return

		const diff = event.pageX - resizeState.value.startX
		const newWidth = Math.max(minWidth, resizeState.value.startWidth + diff)

		const hasSibling = resizeState.value.nextColumnKey && resizeState.value.nextStartWidth > 0
		const maxWidth = hasSibling
			? resizeState.value.startWidth + resizeState.value.nextStartWidth - minWidth
			: Infinity
		const clampedWidth = Math.min(newWidth, maxWidth)

		const columnIndex = columns.value.findIndex(column => column.key === resizeState.value.columnKey)
		/* istanbul ignore else -- Колонка может исчезнуть только при внешнем обновлении во время resize. */
		if (columnIndex !== -1) {
			columns.value[columnIndex].width = `${clampedWidth}px`
		}

		if (hasSibling) {
			const actualDiff = clampedWidth - resizeState.value.startWidth
			const siblingWidth = Math.max(minWidth, resizeState.value.nextStartWidth - actualDiff)
			const siblingIndex = columns.value.findIndex(column => column.key === resizeState.value.nextColumnKey)
			/* istanbul ignore else -- Соседняя колонка синхронизируется с видимыми колонками. */
			if (siblingIndex !== -1) {
				columns.value[siblingIndex].width = `${siblingWidth}px`
			}
		}
	}

	function stopResize(): void {
		/* istanbul ignore next -- Защитный выход при повторном завершении resize. */
		if (!resizeState.value.isResizing) return

		resizeState.value.isResizing = false
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', stopResize)
		document.body.style.cursor = ''
		document.body.style.userSelect = ''

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

		const siblingKey = findSiblingKey(columnKey)
		let siblingWidth = 0

		if (siblingKey) {
			const visibleKeys = visibleColumns.value.map(column => column.key)
			const visibleIndex = visibleKeys.indexOf(columnKey)
			const isLast = visibleIndex === visibleKeys.length - 1
			const siblingTh = isLast ? th.previousElementSibling : th.nextElementSibling
			/* istanbul ignore next -- defensive `: 0`: соседний th существует при наличии siblingKey */
			siblingWidth = siblingTh instanceof HTMLElement ? siblingTh.offsetWidth : 0
		}

		resizeState.value = {
			isResizing: true,
			columnKey,
			nextColumnKey: siblingKey,
			startX: event.pageX,
			startWidth: th.offsetWidth,
			nextStartWidth: siblingWidth,
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', stopResize)
		document.body.style.cursor = 'col-resize'
		document.body.style.userSelect = 'none'
	}

	onBeforeUnmount(() => {
		document.removeEventListener('mousemove', handleMouseMove)
		document.removeEventListener('mouseup', stopResize)
	})

	return {
		startResize,
	}
}

export { useColumnResize }
