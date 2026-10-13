/** Утилиты: поиск, фильтрация и множественная сортировка строк таблицы */
import { matchesFilterByKind } from './useTableFilterMatch'
import type { TableSortKey } from '@utils/navigation/tableUtils'
import { createSortComparator, toSortKey } from '@utils/navigation/tableUtils'
import type { FilterScope, SortContext } from './types/useTableDataUtils.types'
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
function matchesFilter(row: TableRow, filter: ColumnFilter, scope: FilterScope = {}): boolean {
	return matchesFilterByKind(row, filter, scope)
}

/** Ключ-заглушка для колонок со своей функцией сравнения: значение для них берётся из строки */
const EMPTY_KEY: TableSortKey = { rank: 2, value: '' }

/** Результат `sortCompare` с учётом направления; не число и NaN считаются равенством */
function compareByColumn(
	sortCompare: NonNullable<TableColumn['sortCompare']>,
	[rowA, rowB]: [TableRow, TableRow],
	sort: SortState,
): number {
	const result = sortCompare(rowA.data[sort.key], rowB.data[sort.key], { a: rowA, b: rowB })
	if (typeof result !== 'number' || Number.isNaN(result)) return 0
	return sort.direction === 'desc' ? -result : result
}

/**
 * Множественная сортировка. Ключи нормализуются один раз на строку (а не в каждом сравнении):
 * пустые и нераспознанные значения получают ранг и уходят в конец, поэтому NaN не ломает компаратор.
 * Значение для сортировки колонки — `sortAccessor(row)`, а без него `row.data[key]`; строки сравниваются по языку `locale`.
 * Колонка с `sortCompare` сравнивается своей функцией (`sortAccessor` и `sortType` не учитываются)
 */
function sortRowsByStates(rows: TableRow[], activeSorts: SortState[], context: SortContext): TableRow[] {
	const columns = new Map(context.columns.map((column: TableColumn) => [column.key, column]))
	const compare = createSortComparator(context.locale)
	const plans = activeSorts.map(sort => ({ sort, column: columns.get(sort.key) }))
	const keyedRows = rows.map(row => ({
		row,
		keys: plans.map(({ sort, column }) =>
			column?.sortCompare
				? EMPTY_KEY
				: toSortKey(column?.sortAccessor ? column.sortAccessor(row) : row.data[sort.key], column?.sortType),
		),
	}))

	keyedRows.sort((a, b) => {
		for (const [index, { sort, column }] of plans.entries()) {
			const cmp = column?.sortCompare
				? compareByColumn(column.sortCompare, [a.row, b.row], sort)
				: compare(a.keys[index], b.keys[index], sort.direction)
			if (cmp !== 0) return cmp
		}
		return 0
	})
	return keyedRows.map(item => item.row)
}

export { filterRowsBySearch, matchesFilter, sortRowsByStates }
