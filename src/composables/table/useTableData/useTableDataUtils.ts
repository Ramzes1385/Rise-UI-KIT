/** Утилиты: поиск, фильтрация и множественная сортировка строк таблицы */
import { compareSortKeys, toSortKey } from '@utils/navigation/tableUtils'
import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

/** Строки, в значениях которых встречается поисковый запрос (без учёта регистра) */
function filterRowsBySearch(rows: TableRow[], searchQuery: string): TableRow[] {
	const query = searchQuery.toLowerCase()
	return rows.filter(row => {
		return Object.values(row.data).some(val => String(val).toLowerCase().includes(query))
	})
}

/** Проходит ли строка фильтр колонки */
function matchesFilter(row: TableRow, filter: ColumnFilter): boolean {
	const val = row.data[filter.key]
	if (val === undefined) return false
	const strVal = String(val).toLowerCase()
	const filterVal = filter.value.toLowerCase()

	switch (filter.operator) {
		case 'eq':
			return strVal === filterVal
		case 'ne':
			return strVal !== filterVal
		case 'contains':
			return strVal.includes(filterVal)
		case 'gt':
			return Number(val) > Number(filter.value)
		case 'lt':
			return Number(val) < Number(filter.value)
		case 'gte':
			return Number(val) >= Number(filter.value)
		case 'lte':
			return Number(val) <= Number(filter.value)
		default:
			return true
	}
}

/**
 * Множественная сортировка. Ключи нормализуются один раз на строку (а не в каждом сравнении):
 * пустые и нераспознанные значения получают ранг и уходят в конец, поэтому NaN не ломает компаратор
 */
function sortRowsByStates(rows: TableRow[], activeSorts: SortState[], columns: TableColumn[]): TableRow[] {
	const sortTypes = new Map(columns.map((column: TableColumn) => [column.key, column.sortType]))
	const keyedRows = rows.map(row => ({
		row,
		keys: activeSorts.map(sort => toSortKey(row.data[sort.key], sortTypes.get(sort.key))),
	}))

	keyedRows.sort((a, b) => {
		for (let index = 0; index < activeSorts.length; index++) {
			const cmp = compareSortKeys(a.keys[index], b.keys[index], activeSorts[index].direction)
			if (cmp !== 0) return cmp
		}
		return 0
	})
	return keyedRows.map(item => item.row)
}

export { filterRowsBySearch, matchesFilter, sortRowsByStates }
