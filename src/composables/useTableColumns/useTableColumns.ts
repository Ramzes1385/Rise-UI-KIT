/** Composable: управление колонками таблицы */
import { computed, ref, watch } from 'vue'
import { TABLE } from '@constants'
import { calcColumnWidths, calcTotalColumns, getColumnStyle as buildColumnStyle } from '@utils/tableUtils'
import type { UseTableColumnsOptions, UseTableColumnsReturn } from './useTableColumns.types'
import type { TableColumn, TableRow } from '@components/BaseTable/model/BaseTable.types'

/** Composable для управления колонками таблицы — видимость, ширины, стили, skeleton-строки. */
function useTableColumns(options: UseTableColumnsOptions): UseTableColumnsReturn {
	const { columns, rows, isResizable, hasRowNumber, isSelectable, pageSize, emit } = options

	const localColumns = ref<TableColumn[]>([...columns.value])

	watch(
		() => columns.value,
		newCols => {
			localColumns.value = newCols.map(column => {
				const existing = localColumns.value.find(c => c.key === column.key)
				if (existing) {
					return { ...column, width: existing.width, isHidden: existing.isHidden }
				}
				return column
			})
		},
		{ deep: true },
	)

	const visibleColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden)
	})

	const skeletonRows = computed((): number => {
		return pageSize() || TABLE.DEFAULT_SKELETON_ROWS
	})

	const filterableColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden && column.isFilterable !== false)
	})

	const hasExpandableRows = computed((): boolean => {
		return rows.value.some(row => row.isExpandable || (row.children && row.children.length > 0))
	})

	const totalCols = computed((): number => {
		return calcTotalColumns(visibleColumns.value.length, isSelectable(), hasRowNumber(), hasExpandableRows.value)
	})

	function isColumnResizable(column: TableColumn): boolean {
		return isResizable() || !!column.isResizable
	}

	const useFixedLayout = computed((): boolean => {
		return isResizable() || visibleColumns.value.some(column => column.flex || column.width)
	})

	const columnWidths = computed((): string[] => {
		return calcColumnWidths(visibleColumns.value)
	})

	function getColumnStyle(column: TableColumn): Record<string, string> {
		return buildColumnStyle({ minWidth: column.minWidth, maxWidth: column.maxWidth })
	}

	function toggleColumnVisibility(column: TableColumn): void {
		const index = localColumns.value.findIndex(c => c.key === column.key)
		/* istanbul ignore else -- Защитная ветка при рассинхронизации внешних колонок. */
		if (index !== -1) {
			localColumns.value[index].isHidden = !localColumns.value[index].isHidden
			emit('columns-change', localColumns.value)
		}
	}

	function formatCellValue(column: TableColumn, row: TableRow): string {
		const value = row.data[column.key]
		if (column.formatter) return column.formatter(value, row)
		return String(value ?? '')
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
	}
}

export { useTableColumns }
