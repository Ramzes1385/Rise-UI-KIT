/** Утилиты: синхронизация внутренних копий колонок таблицы с props и форматирование значений ячеек */

import type { ColumnPropState } from './types/useTableColumns.types'
import type { TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

/** Снять значения isHidden/width, пришедшие из props, по ключу колонки */
function readPropState(columns: TableColumn[]): Map<string, ColumnPropState> {
	return new Map(columns.map(column => [column.key, { isHidden: column.isHidden, width: column.width }]))
}

/** Собрать новые внутренние копии колонок из props, сохранив выбор пользователя там, где родитель значение не менял */
function mergePropColumns(newCols: TableColumn[], localColumns: TableColumn[], lastPropState: Map<string, ColumnPropState>): TableColumn[] {
	const localByKey = new Map(localColumns.map(column => [column.key, column]))
	return newCols.map(column => {
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
}

/** Текст ячейки: через formatter колонки или строковое значение (null/undefined — пустая строка) */
function formatCellValue(column: TableColumn, row: TableRow): string {
	const value = row.data[column.key]
	if (column.formatter) return column.formatter(value, row)
	return String(value ?? '')
}

export { formatCellValue, mergePropColumns, readPropState }
