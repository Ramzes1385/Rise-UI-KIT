import { foldSearchText } from '@utils/data/textUtils'
/** Утилиты: проверка строки таблицы по фильтру колонки — текст, числа, даты, выбор из списка */
import type { FilterScope } from './types/useTableDataUtils.types'
import { toCalendarDay, toSortKey } from '@utils/navigation/tableUtils'
import type { ColumnFilter, TableRow } from '@components/BaseTable/types/BaseTable.types'
import type { FilterCheck, FilterSpan, OrderedMode } from './types/useTableFilterMatch.types'
import type { FilterKind } from '@composables/table/useTableFilter/types/useTableFilter.types'
import { getFilterKind, getFilterValues } from '@composables/table/useTableFilter/useTableFilterUtils'

const CHECKS: Partial<Record<ColumnFilter['operator'], FilterCheck>> = {
	eq: (value, [from, to]) => value >= from && value <= to,
	ne: (value, [from, to]) => value < from || value > to,
	gt: (value, [, to]) => value > to,
	gte: (value, [from]) => value >= from,
	lt: (value, [from]) => value < from,
	lte: (value, [, to]) => value <= to,
	between: (value, [from], [, to]) => value >= from && value <= to,
}

const ORDERED_OPERATORS = new Set<ColumnFilter['operator']>(['gt', 'gte', 'lt', 'lte', 'between'])
const UNBOUNDED_FROM: FilterSpan = [-Infinity, -Infinity]
const UNBOUNDED_TO: FilterSpan = [Infinity, Infinity]

/** Число или сутки (для дат) для сравнения; `null` — значение не распознано */
function toComparable(value: unknown, kind: FilterKind, timeZone?: string): number | null {
	if (kind === 'date') return toCalendarDay(value, timeZone)
	const key = toSortKey(value, 'number')
	return key.rank === 0 && typeof key.value === 'number' ? key.value : null
}

function toSpan(value: number | null, unbounded: FilterSpan): FilterSpan {
	return value === null ? unbounded : [value, value]
}

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function matchesText(text: string, filter: ColumnFilter): boolean {
	const value = foldSearchText(filter.value)
	if (filter.operator === 'eq') return text === value
	if (filter.operator === 'ne') return text !== value
	return filter.operator === 'contains' ? text.includes(value) : true
}

function matchesOrdered(cell: unknown, filter: ColumnFilter, mode: OrderedMode): boolean {
	const { kind, timeZone } = mode
	const check = CHECKS[filter.operator]
	if (!check) return true
	const value = toComparable(cell, kind, timeZone)
	if (value === null) return filter.operator === 'ne'
	const bound = toComparable(filter.value, kind, timeZone)
	const upper = filter.valueTo ? toComparable(filter.valueTo, kind, timeZone) : null
	const isOpenBound = bound === null && (filter.operator !== 'between' || upper === null)
	if (isOpenBound) return true
	return check(value, toSpan(bound, UNBOUNDED_FROM), toSpan(upper, UNBOUNDED_TO))
}

function matchesByKind(target: { cell: unknown; text: string; filter: ColumnFilter }, scope: FilterScope): boolean {
	const { cell, text, filter } = target
	const kind = getFilterKind(scope.column)
	const timeZone = scope.column?.filterConfig?.timeZone ?? scope.timeZone
	const isNumeric = kind === 'number' || kind === 'date'
	if (ORDERED_OPERATORS.has(filter.operator)) return matchesOrdered(cell, filter, { kind: isNumeric ? kind : 'number', timeZone })
	return isNumeric && filter.operator !== 'contains' ? matchesOrdered(cell, filter, { kind, timeZone }) : matchesText(text, filter)
}

/**
 * Проходит ли строка фильтр колонки. Операторы работают по типу колонки (`filterConfig.type`, иначе `sortType`): текст
 * сравнивается без учёта регистра, числа — как числа, даты (ISO-строки, `Date`, timestamp) — по календарным суткам в поясе
 * `timeZone` (пояс пользователя, если он не задан; дата без пояса — сутки как написано, см. `toCalendarDay`). Пустое значение
 * проходит только `ne`; фильтр с нераспознанной границей ничего не отсекает; `gt`, `gte`, `lt`, `lte`, `between` у текстовой
 * колонки сравнивают значения как числа
 */
function matchesFilterByKind(row: TableRow, filter: ColumnFilter, scope: FilterScope): boolean {
	const cell = row.data[filter.key]
	if (isEmpty(cell)) return filter.operator === 'ne'
	const text = foldSearchText(String(cell))
	if (filter.operator === 'in') return getFilterValues(filter).some(item => foldSearchText(item) === text)
	return matchesByKind({ cell, text, filter }, scope)
}

export { matchesFilterByKind }
