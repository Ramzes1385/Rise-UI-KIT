/** Composable: действия таблицы — выбор строк, подгрузка, infinite scroll и ресайз колонок */
import { toHTMLElement } from '@utils/dom/domUtils'
import { useColumnResize } from '@composables/table/useColumnResize'
import type { UseTableCompositionOptions } from './types/useTableComposition.types'
import type { TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { UseTableCompositionActionsParts } from './types/useTableCompositionActions.types'

/** Наименьшая ширина колонки при изменении размера, px */
const MIN_COL_WIDTH = 50

function useTableCompositionActions(options: UseTableCompositionOptions, parts: UseTableCompositionActionsParts) {
	const { loadMode, isLoading, infiniteScrollThreshold, emit } = options
	const { localColumns, visibleColumns, snapshotColumns } = parts.tableColumns
	const { hasMoreRows, loadMore } = parts.data
	const { toggleRow: toggleRowSelection, toggleAll: toggleAllRows } = parts.selection

	function toggleRow(row: TableRow): void {
		toggleRowSelection(row)
	}

	function toggleAll(): void {
		toggleAllRows()
	}

	function handleLoadMore(): void {
		loadMore()
		emit('load-more')
	}

	function canLoadMore(): boolean {
		return loadMode.value === 'infinite' && hasMoreRows.value && !isLoading.value
	}

	function handleReach(): void {
		if (canLoadMore()) handleLoadMore()
	}

	function handleScroll(e: Event): void {
		if (!canLoadMore()) return

		const target = toHTMLElement(e.target)
		if (!target) return
		const { scrollTop, scrollHeight, clientHeight } = target

		if (scrollHeight - scrollTop - clientHeight < infiniteScrollThreshold) {
			handleLoadMore()
		}
	}

	const { startResize: startColumnResize, resizeBy } = useColumnResize({
		columns: localColumns,
		visibleColumns,
		minWidth: MIN_COL_WIDTH,
		onColumnResize: (key, width) => emit('column-resize', key, width),
		// Копия, а не внутренний массив: если родитель вернёт payload в props, таблица не должна мутировать его объекты
		onColumnsChange: () => emit('columns-change', snapshotColumns()),
	})

	function startResize(event: PointerEvent, column: TableColumn): void {
		startColumnResize(event, column.key)
	}

	function resizeColumnBy(handle: HTMLElement, column: TableColumn, delta: number): void {
		resizeBy(handle.closest('th') as HTMLElement, column.key, delta)
	}

	return { toggleRow, toggleAll, handleLoadMore, handleReach, handleScroll, startResize, resizeColumnBy }
}

export { useTableCompositionActions }
