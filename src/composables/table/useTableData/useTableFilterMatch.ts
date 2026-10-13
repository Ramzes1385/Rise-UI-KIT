/** Утилиты: проверка строки таблицы по фильтру колонки — текст, числа, даты, выбор из списка */
import { toSortKey } from '@utils/navigation/tableUtils'
import type { FilterCheck, FilterSpan } from './types/useTableFilterMatch.types'
import type { FilterKind } from '@composables/table/useTableFilter/types/useTableFilter.types'
import type { ColumnFilter, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'
import { getFilterKind, getFilterValues } from '@composables/table/useTableFilter/useTableFilterUtils'

const MS_IN_DAY = 86_400_000

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

function startOfDay(timestamp: number): number {
	return Math.floor(timestamp / MS_IN_DAY) * MS_IN_DAY
}

/** Число или момент времени (мс) для сравнения; `null` — значение не распознано */
function toComparable(value: unknown, kind: FilterKind): number | null {
	const key = toSortKey(value, kind === 'date' ? 'date' : 'number')
	return key.rank === 0 && typeof key.value === 'number' ? key.value : null
}

function toSpan(value: number | null, kind: FilterKind, unbounded: FilterSpan): FilterSpan {
	if (value === null) return unbounded
	return kind === 'date' ? [startOfDay(value), startOfDay(value) + MS_IN_DAY - 1] : [value, value]
}

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || (typeof value === 'string' && value.trim() === '')
}

function matchesText(text: string, filter: ColumnFilter): boolean {
	const value = filter.value.toLowerCase()
	if (filter.operator === 'eq') return text === value
	if (filter.operator === 'ne') return text !== value
	return filter.operator === 'contains' ? text.includes(value) : true
}

function matchesOrdered(cell: unknown, filter: ColumnFilter, kind: FilterKind): boolean {
	const check = CHECKS[filter.operator]
	if (!check) return true
	const value = toComparable(cell, kind)
	if (value === null) return filter.operator === 'ne'
	const bound = toComparable(filter.value, kind)
	const upper = filter.valueTo ? toComparable(filter.valueTo, kind) : null
	const isOpenBound = bound === null && (filter.operator !== 'between' || upper === null)
	if (isOpenBound) return true
	return check(value, toSpan(bound, kind, UNBOUNDED_FROM), toSpan(upper, kind, UNBOUNDED_TO))
}

/**
 * Проходит ли строка фильтр колонки. Операторы работают по типу колонки (`filterConfig.type`, иначе `sortType`): текст
 * сравнивается без учёта регистра, числа — как числа, даты (ISO-строки, `Date`, timestamp) — по дням. Пустое значение
 * проходит только `ne`; фильтр с нераспознанной границей ничего не отсекает; `gt`, `gte`, `lt`, `lte`, `between` у текстовой
 * колонки сравнивают значения как числа
 */
function matchesFilterByKind(row: TableRow, filter: ColumnFilter, column?: TableColumn): boolean {
	const cell = row.data[filter.key]
	if (isEmpty(cell)) return filter.operator === 'ne'
	const text = String(cell).toLowerCase()
	if (filter.operator === 'in') return getFilterValues(filter).some(item => item.toLowerCase() === text)
	const kind = getFilterKind(column)
	const isNumeric = kind === 'number' || kind === 'date'
	if (ORDERED_OPERATORS.has(filter.operator)) return matchesOrdered(cell, filter, isNumeric ? kind : 'number')
	return isNumeric && filter.operator !== 'contains' ? matchesOrdered(cell, filter, kind) : matchesText(text, filter)
}

export { matchesFilterByKind }
