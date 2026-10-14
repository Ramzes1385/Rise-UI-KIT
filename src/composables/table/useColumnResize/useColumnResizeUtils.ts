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

/** Пикселы из строки `'120px'`; `rem`, проценты и пустое значение — `null` (границу не накладываем) */
function toPixels(value: string | undefined): number | null {
	const match = /^\s*(\d+(?:\.\d+)?)px\s*$/.exec(value ?? '')
	return match ? Number(match[1]) : null
}

/** Допустимая ширина колонки: не меньше общего предела `minWidth` и в границах `column.minWidth`/`column.maxWidth` */
function getWidthBounds(column: ResizeColumn | undefined, minWidth: number): { min: number; max: number } {
	return { min: Math.max(minWidth, toPixels(column?.minWidth) ?? 0), max: toPixels(column?.maxWidth) ?? Infinity }
}

/**
 * Записать новые ширины колонки и её соседа по текущей позиции указателя: ширина каждой не выходит за `minWidth` и
 * `maxWidth` колонки, а вместе они занимают столько же места, сколько до сдвига
 */
function applyResizeWidths({ columns, state, minWidth, pageX }: ApplyResizeWidthsParams): void {
	const column = columns.find(item => item.key === state.columnKey)
	/* istanbul ignore next -- Колонка может исчезнуть только при внешнем обновлении во время resize. */
	if (!column) return
	const sibling = state.nextColumnKey && state.nextStartWidth > 0 ? columns.find(item => item.key === state.nextColumnKey) : undefined
	const own = getWidthBounds(column, minWidth)
	const total = state.startWidth + state.nextStartWidth
	const other = getWidthBounds(sibling, minWidth)
	const from = sibling ? Math.max(own.min, total - other.max) : own.min
	const to = sibling ? Math.min(own.max, total - other.min) : own.max
	const desired = state.startWidth + pageX - state.startX
	const width = from > to ? state.startWidth : Math.min(Math.max(desired, from), to)

	column.width = `${width}px`
	if (sibling) sibling.width = `${total - width}px`
}

/** Запомнить ширины колонок с указанными ключами; возвращённая функция возвращает их (откат жеста по `pointercancel`) */
function snapshotWidths(columns: ResizeColumn[], keys: string[]): () => void {
	const saved = columns.filter(column => keys.includes(column.key)).map(column => ({ column, width: column.width }))
	return () => {
		for (const { column, width } of saved) column.width = width
	}
}

export { applyResizeWidths, createIdleResizeState, findSiblingKey, getWidthBounds, measureSiblingWidth, snapshotWidths }
