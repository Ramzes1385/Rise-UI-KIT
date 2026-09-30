import { valueKind } from './filterOperators'
import type {
	FilterBuilderCell,
	FilterBuilderCondition,
	FilterBuilderField,
	FilterBuilderGroup,
	FilterBuilderOperator,
} from '../../types/BaseFilterBuilder.types'

const normalize = (value: unknown): string =>
	String(value ?? '')
		.trim()
		.toLocaleLowerCase()
		.replace(/ё/g, 'е')

function toDate(value: unknown): string {
	if (value instanceof Date) {
		const month = String(value.getMonth() + 1).padStart(2, '0')
		return `${value.getFullYear()}-${month}-${String(value.getDate()).padStart(2, '0')}`
	}
	return String(value ?? '').slice(0, 10)
}

const isBlank = (value: unknown): boolean => value === null || value === undefined || String(value).trim() === ''

function toCell(raw: unknown): FilterBuilderCell {
	return { raw, text: normalize(raw), number: isBlank(raw) ? Number.NaN : Number(raw), date: toDate(raw) }
}

function compare(cell: FilterBuilderCell, value: string, type: FilterBuilderField['type']): number {
	if (type === 'number') return cell.number - Number(value)
	if (type === 'date') return cell.date.localeCompare(value)
	return cell.text.localeCompare(normalize(value))
}

const TESTS: Record<
	FilterBuilderOperator,
	(cell: FilterBuilderCell, condition: FilterBuilderCondition, type: FilterBuilderField['type']) => boolean
> = {
	contains: (cell, condition) => cell.text.includes(normalize(condition.value)),
	notContains: (cell, condition) => !cell.text.includes(normalize(condition.value)),
	startsWith: (cell, condition) => cell.text.startsWith(normalize(condition.value)),
	eq: (cell, condition, type) => compare(cell, condition.value, type) === 0,
	ne: (cell, condition, type) => compare(cell, condition.value, type) !== 0,
	gt: (cell, condition, type) => compare(cell, condition.value, type) > 0,
	gte: (cell, condition, type) => compare(cell, condition.value, type) >= 0,
	lt: (cell, condition, type) => compare(cell, condition.value, type) < 0,
	lte: (cell, condition, type) => compare(cell, condition.value, type) <= 0,
	before: (cell, condition) => !isBlank(cell.raw) && cell.date < condition.value,
	after: (cell, condition) => cell.date > condition.value,
	between: (cell, condition, type) => compare(cell, condition.value, type) >= 0 && compare(cell, condition.valueTo ?? '', type) <= 0,
	empty: cell => isBlank(cell.raw),
	notEmpty: cell => !isBlank(cell.raw),
	isTrue: cell => cell.raw === true || cell.text === 'true',
	isFalse: cell => cell.raw === false || cell.text === 'false',
}

export function isConditionComplete(condition: FilterBuilderCondition): boolean {
	const kind = valueKind(condition.operator)
	if (kind === 'none') return true
	return condition.value.trim() !== '' && (kind === 'single' || Boolean(condition.valueTo?.trim()))
}

export function createFilterPredicate<Row = Record<string, unknown>>(
	group: FilterBuilderGroup,
	fields: readonly FilterBuilderField[],
	getValue: (row: Row, key: string) => unknown = (row, key) => (row as Record<string, unknown>)[key],
): (row: Row) => boolean {
	const checks = group.conditions.filter(isConditionComplete).flatMap(condition => {
		const field = fields.find(item => item.key === condition.field)
		if (!field) return []
		return [(row: Row) => TESTS[condition.operator](toCell(getValue(row, field.key)), condition, field.type)]
	})
	if (checks.length === 0) return () => true
	return group.match === 'any' ? row => checks.some(check => check(row)) : row => checks.every(check => check(row))
}
