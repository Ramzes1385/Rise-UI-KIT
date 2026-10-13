/** Утилиты: поиск, фильтрация и множественная сортировка строк таблицы */
import { matchesFilterByKind } from './useTableFilterMatch'
import { compareSortKeys, toSortKey } from '@utils/navigation/tableUtils'
import type { ColumnFilter, SortState, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

/** «ё» и «е» в поиске не различаются: кодами, а не буквами — это не текст интерфейса */
const CYRILLIC_YO = String.fromCharCode(0x451)
const CYRILLIC_IE = String.fromCharCode(0x435)

/** Строки, у которых в видимых колонках встречается запрос: значение или текст formatter, без учёта регистра и «ё»/«е» */
function filterRowsBySearch(rows: TableRow[], searchQuery: string, columns: TableColumn[]): TableRow[] {
	const query = normalizeSearchText(searchQuery.trim())
	if (!query) return rows
	const searchable = columns.filter(column => !column.isHidden)
	return rows.filter(row => searchable.some(column => getSearchTexts(column, row).some(text => text.includes(query))))
}

/** Текст для поиска: без учёта регистра и разницы «ё»/«е» */
function normalizeSearchText(text: string): string {
	return text.toLowerCase().replaceAll(CYRILLIC_YO, CYRILLIC_IE)
}

/** Что ищется в ячейке: исходное значение и то, что показывает formatter; пустые значения не ищутся */
function getSearchTexts(column: TableColumn, row: TableRow): string[] {
	const value = row.data[column.key]
	if (value === null || value === undefined) return []
	const texts = [String(value)]
	if (column.formatter) texts.push(column.formatter(value, row))
	return texts.map(normalizeSearchText)
}

/** Проходит ли строка фильтр колонки: операторы работают по типу колонки (см. `matchesFilterByKind`) */
function matchesFilter(row: TableRow, filter: ColumnFilter, column?: TableColumn): boolean {
	return matchesFilterByKind(row, filter, column)
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
