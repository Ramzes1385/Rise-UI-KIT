import { UI_FILTER_BUILDER } from '@/locales/messages'
import type { FilterBuilderFieldType, FilterBuilderOperator } from '../../types/BaseFilterBuilder.types'

const OPERATORS_BY_TYPE: Record<FilterBuilderFieldType, readonly FilterBuilderOperator[]> = {
	text: ['contains', 'notContains', 'eq', 'ne', 'startsWith', 'empty', 'notEmpty'],
	number: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'empty', 'notEmpty'],
	date: ['eq', 'before', 'after', 'between', 'empty', 'notEmpty'],
	select: ['eq', 'ne', 'empty', 'notEmpty'],
	boolean: ['isTrue', 'isFalse'],
}

const LABEL_KEYS = {
	contains: 'CONTAINS',
	notContains: 'NOT_CONTAINS',
	eq: 'EQ',
	ne: 'NE',
	startsWith: 'STARTS_WITH',
	gt: 'GT',
	gte: 'GTE',
	lt: 'LT',
	lte: 'LTE',
	between: 'BETWEEN',
	before: 'BEFORE',
	after: 'AFTER',
	empty: 'EMPTY_VALUE',
	notEmpty: 'NOT_EMPTY_VALUE',
	isTrue: 'IS_TRUE',
	isFalse: 'IS_FALSE',
} as const

const WITHOUT_VALUE = new Set<FilterBuilderOperator>(['empty', 'notEmpty', 'isTrue', 'isFalse'])

export const operatorsFor = (type: FilterBuilderFieldType): readonly FilterBuilderOperator[] => OPERATORS_BY_TYPE[type]

export const operatorLabel = (operator: FilterBuilderOperator): string => UI_FILTER_BUILDER[LABEL_KEYS[operator]]

export function valueKind(operator: FilterBuilderOperator): 'none' | 'single' | 'range' {
	if (WITHOUT_VALUE.has(operator)) return 'none'
	return operator === 'between' ? 'range' : 'single'
}
