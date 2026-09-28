/** Composable: управление колонками таблицы */
import { computed, ref, toRaw, watch } from 'vue'
import type { TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'
import { calcColumnWidths, calcTotalColumns, getColumnStyle as buildColumnStyle } from '@utils/tableUtils'
import type { ColumnPropState, UseTableColumnsOptions, UseTableColumnsReturn } from './types/useTableColumns.types'

/** Строк скелетона, когда размер страницы не задан */
const DEFAULT_SKELETON_ROWS = 5

/** Снять значения isHidden/width, пришедшие из props, по ключу колонки */
function readPropState(columns: TableColumn[]): Map<string, ColumnPropState> {
	return new Map(columns.map(column => [column.key, { isHidden: column.isHidden, width: column.width }]))
}

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
			const localByKey = new Map(localColumns.value.map(column => [column.key, column]))
			localColumns.value = newCols.map(column => {
				const local = localByKey.get(column.key)
				const previous = lastPropState.get(column.key)
				if (!local || !previous) return { ...column }
				// Значение из props побеждает, только если родитель его действительно изменил;
				// иначе сохраняем выбор пользователя (скрытие/ширину) при пересоздании колонок
				return {
					...column,
					isHidden: previous.isHidden === column.isHidden ? local.isHidden : column.isHidden,
					width: previous.width === column.width ? local.width : column.width,
				}
			})
			lastPropState = readPropState(newCols)
		},
		{ deep: true },
	)

	/** Копия текущих колонок для эмитов: внешний код не должен получать внутренние объекты */
	function snapshotColumns(): TableColumn[] {
		return localColumns.value.map(column => ({ ...toRaw(column) }))
	}

	const visibleColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden)
	})

	const skeletonRows = computed((): number => {
		return pageSize() || DEFAULT_SKELETON_ROWS
	})

	const filterableColumns = computed((): TableColumn[] => {
		return localColumns.value.filter(column => !column.isHidden && column.isFilterable !== false)
	})

	const hasExpandableRows = computed((): boolean => {
		return rows.value.some(row => row.isExpandable || (row.children && row.children.length > 0))
	})

	const totalCols = computed((): number => {
		return calcTotalColumns(visibleColumns.value.length, {
			isSelectable: isSelectable(),
			hasRowNumber: hasRowNumber(),
			hasExpandableRows: hasExpandableRows.value,
		})
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
			emit('columns-change', snapshotColumns())
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
		snapshotColumns,
	}
}

export { useTableColumns }
