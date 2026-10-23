/** Composable: управление колонками таблицы */
import { ref, toRaw, watch } from 'vue'
import { useTableColumnsDerived } from './useTableColumnsDerived'
import type { TableColumn } from '@components/BaseTable/types/BaseTable.types'
import { getColumnStyle as buildColumnStyle } from '@utils/navigation/tableUtils'
import { formatCellValue, mergePropColumns, readPropState } from './useTableColumnsUtils'
import type { UseTableColumnsOptions, UseTableColumnsReturn } from './types/useTableColumns.types'

/** Composable для управления колонками таблицы — видимость, ширины, стили, skeleton-строки. */
function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
	const { columns, rows, isResizable, hasRowNumber, isSelectable, pageSize, emit } = options

	// Внутреннее состояние хранится в копиях: скрытие и ресайз не должны мутировать объекты из props
	// (общие конфиги колонок, модульные константы), а toolbar и таблица читают один источник
	const localColumns = ref<TableColumn[]>(columns.value.map(column => ({ ...column })))

	/** isHidden/width из последних props: отличает «родитель изменил значение» от «пересоздал те же колонки» */
	let lastPropState = readPropState(columns.value)

	watch(
		() => columns.value,
		newCols => {
			localColumns.value = mergePropColumns(newCols, localColumns.value, lastPropState)
			lastPropState = readPropState(newCols)
		},
		{ deep: true },
	)

	/** Копия текущих колонок для эмитов: внешний код не должен получать внутренние объекты */
	function snapshotColumns(): TableColumn[] {
		return localColumns.value.map(column => ({ ...toRaw(column) }))
	}

	const { visibleColumns, skeletonRows, filterableColumns, hasExpandableRows, totalCols, useFixedLayout, columnWidths } =
		useTableColumnsDerived({ localColumns, rows, isResizable, hasRowNumber, isSelectable, pageSize })

	function isColumnResizable(column: TableColumn): boolean {
		return isResizable() || !!column.isResizable
	}

	function getColumnStyle(column: TableColumn): Record<string, string> {
		return buildColumnStyle({ minWidth: column.minWidth, maxWidth: column.maxWidth })
	}

	function toggleColumnVisibility(column: TableColumn): void {
		const index = localColumns.value.findIndex(c => c.key === column.key)
		/* istanbul ignore else -- Защитная ветка при рассинхронизации внешних колонок. */
		if (index !== -1) {
			localColumns.value[index].isHidden = !localColumns.value[index].isHidden
			emit('columns-change', snapshotColumns())
		}
	}

	return {
		localColumns,
		visibleColumns,
		columnWidths,
		useFixedLayout,
		totalCols,
		filterableColumns,
		hasExpandableRows,
		skeletonRows,
		isColumnResizable,
		getColumnStyle,
		toggleColumnVisibility,
		formatCellValue,
		snapshotColumns,
	}
}

export { useTableColumns }
