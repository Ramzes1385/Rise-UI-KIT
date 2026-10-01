/** Утилиты: расчёт ширин колонок и соседней колонки при перетаскивании границы */
import type { ResizeColumn, ResizeState } from './types/useColumnResize.types'
import type { ApplyResizeWidthsParams } from './types/useColumnResizeUtils.types'

/** Начальное состояние: перетаскивания нет */
function createIdleResizeState(): ResizeState {
	return {
		isResizing: false,
		columnKey: '',
		nextColumnKey: '',
		startX: 0,
		startWidth: 0,
		nextStartWidth: 0,
	}
}

function findSiblingKey(visibleColumns: ResizeColumn[], columnKey: string): string {
	const visibleKeys = visibleColumns.map(column => column.key)
	const visibleIndex = visibleKeys.indexOf(columnKey)

	if (visibleIndex === visibleKeys.length - 1 && visibleIndex > 0) {
		return visibleKeys[visibleIndex - 1]
	}

	if (visibleIndex < visibleKeys.length - 1) {
		return visibleKeys[visibleIndex + 1]
	}

	return ''
}

/** Ширина th соседней колонки: для последней видимой — предыдущий th, иначе следующий */
function measureSiblingWidth(th: Element, visibleColumns: ResizeColumn[], columnKey: string): number {
	const visibleKeys = visibleColumns.map(column => column.key)
	const visibleIndex = visibleKeys.indexOf(columnKey)
	const isLast = visibleIndex === visibleKeys.length - 1
	const siblingTh = isLast ? th.previousElementSibling : th.nextElementSibling
	/* istanbul ignore next -- defensive `: 0`: соседний th существует при наличии siblingKey */
	return siblingTh instanceof HTMLElement ? siblingTh.offsetWidth : 0
}

/** Записать новые ширины колонки и её соседа по текущей позиции указателя */
function applyResizeWidths({ columns, state, minWidth, pageX }: ApplyResizeWidthsParams): void {
	const diff = pageX - state.startX
	const newWidth = Math.max(minWidth, state.startWidth + diff)

	const hasSibling = state.nextColumnKey && state.nextStartWidth > 0
	const maxWidth = hasSibling ? state.startWidth + state.nextStartWidth - minWidth : Infinity
	const clampedWidth = Math.min(newWidth, maxWidth)

	const columnIndex = columns.findIndex(column => column.key === state.columnKey)
	/* istanbul ignore else -- Колонка может исчезнуть только при внешнем обновлении во время resize. */
	if (columnIndex !== -1) {
		columns[columnIndex].width = `${clampedWidth}px`
	}

	if (hasSibling) {
		const actualDiff = clampedWidth - state.startWidth
		const siblingWidth = Math.max(minWidth, state.nextStartWidth - actualDiff)
		const siblingIndex = columns.findIndex(column => column.key === state.nextColumnKey)
		/* istanbul ignore else -- Соседняя колонка синхронизируется с видимыми колонками. */
		if (siblingIndex !== -1) {
			columns[siblingIndex].width = `${siblingWidth}px`
		}
	}
}

export { applyResizeWidths, createIdleResizeState, findSiblingKey, measureSiblingWidth }
