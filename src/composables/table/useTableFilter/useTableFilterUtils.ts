/** Утилиты: операторы фильтра по типу колонки, подписи операторов и фильтров */
import { UI_FILTER } from '@/locales/messages'
import type { FilterKind } from './types/useTableFilter.types'
import type { FilterOperatorOption } from '@composables/table/useTableToolbar/types/useTableToolbar.types'
import type { ColumnFilter, ColumnFilterType, FilterOperator, TableColumn } from '@components/BaseTable/types/BaseTable.types'

const KIND_OPERATORS: Record<FilterKind, FilterOperator[]> = {
	text: ['contains', 'eq', 'ne'],
	number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'],
	date: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'],
	select: ['eq', 'ne'],
	'multi-select': ['in'],
}

const SYMBOLS: Record<FilterOperator, string> = {
	eq: '=',
	ne: '≠',
	contains: '∋',
	gt: '>',
	gte: '≥',
	lt: '<',
	lte: '≤',
	between: '↔',
	in: '∈',
}

const VALUE_SEPARATOR = ', '
const RANGE_SEPARATOR = ' – '

/** Тип поля фильтра по `filterConfig.type`; `range` — число или дата по `sortType` */
const CONFIG_KINDS: Record<ColumnFilterType, (column: TableColumn) => FilterKind> = {
	text: () => 'text',
	select: () => 'select',
	'multi-select': () => 'multi-select',
	date: () => 'date',
	range: column => (column.sortType === 'date' ? 'date' : 'number'),
}

/** Тип поля фильтра колонки: из `filterConfig.type`, иначе из `sortType` */
function getFilterKind(column?: TableColumn): FilterKind {
	if (!column) return 'text'
	if (column.filterConfig) return CONFIG_KINDS[column.filterConfig.type](column)
	return column.sortType === 'number' || column.sortType === 'date' ? column.sortType : 'text'
}

/** Оператор по умолчанию: для `range` — диапазон, иначе первый из списка типа */
function getDefaultFilterOperator(column?: TableColumn): FilterOperator {
	return column?.filterConfig?.type === 'range' ? 'between' : KIND_OPERATORS[getFilterKind(column)][0]
}

/** Подписи операторов на текущем языке: у дат — слова («Раньше», «Позже»), у остальных — знаки сравнения */
function getFilterOperatorOptions(kind: FilterKind): FilterOperatorOption[] {
	const isDate = kind === 'date'
	const labels: Record<FilterOperator, string> = {
		contains: UI_FILTER.CONTAINS,
		eq: SYMBOLS.eq,
		ne: SYMBOLS.ne,
		gt: isDate ? UI_FILTER.AFTER : SYMBOLS.gt,
		gte: isDate ? UI_FILTER.ON_OR_AFTER : SYMBOLS.gte,
		lt: isDate ? UI_FILTER.BEFORE : SYMBOLS.lt,
		lte: isDate ? UI_FILTER.ON_OR_BEFORE : SYMBOLS.lte,
		between: UI_FILTER.BETWEEN,
		in: UI_FILTER.IN,
	}
	return KIND_OPERATORS[kind].map(operator => ({ value: operator, label: labels[operator] }))
}

/** Значения фильтра `in`: массив `values`, а без него — строка `value`, разделённая запятыми */
function getFilterValues(filter: ColumnFilter): string[] {
	if (filter.values) return filter.values
	return filter.value
		.split(',')
		.map(item => item.trim())
		.filter(Boolean)
}

/** Метка варианта выбора: `label` из `filterConfig.options`, а без него — само значение */
function getOptionLabel(column: TableColumn | undefined, value: string): string {
	return column?.filterConfig?.options?.find(option => option.value === value)?.label ?? value
}

/** Оператор в метке фильтра: у дат слово строчными («позже»), у остальных знак */
function getOperatorText(filter: ColumnFilter, column?: TableColumn): string {
	const symbol = SYMBOLS[filter.operator] ?? filter.operator
	const kind = getFilterKind(column)
	if (kind !== 'date') return symbol
	return (
		getFilterOperatorOptions(kind)
			.find(item => item.value === filter.operator)
			?.label.toLowerCase() ?? symbol
	)
}

/** Метка активного фильтра: «Сумма ≥ 100», «Сумма: 100 – 200», «Статус ∈ Новый, Закрыт» */
function formatFilterLabel(filter: ColumnFilter, column?: TableColumn): string {
	const name = column?.label || filter.key
	if (filter.operator === 'between') return `${name}: ${filter.value}${RANGE_SEPARATOR}${filter.valueTo ?? ''}`
	if (filter.operator === 'in') {
		const values = getFilterValues(filter).map(value => getOptionLabel(column, value))
		return `${name} ${SYMBOLS.in} ${values.join(VALUE_SEPARATOR)}`
	}
	return `${name} ${getOperatorText(filter, column)} ${getOptionLabel(column, filter.value)}`
}

/** Достаточно ли введённого для фильтра: `between` — обе границы, `in` — хотя бы одно значение, остальные — значение */
function isFilterComplete(filter: ColumnFilter): boolean {
	if (filter.operator === 'in') return getFilterValues(filter).length > 0
	if (filter.operator === 'between') return Boolean(filter.value) && Boolean(filter.valueTo)
	return Boolean(filter.value)
}

export {
	formatFilterLabel,
	getDefaultFilterOperator,
	getFilterKind,
	getFilterOperatorOptions,
	getFilterValues,
	isFilterComplete,
	VALUE_SEPARATOR,
}
