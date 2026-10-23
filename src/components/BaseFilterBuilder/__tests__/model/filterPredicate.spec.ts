import { createFilterPredicate, isConditionComplete } from '../../model/filters/filterPredicate'
import type { FilterBuilderCondition, FilterBuilderField, FilterBuilderOperator } from '../../types/BaseFilterBuilder.types'

const FIELDS: FilterBuilderField[] = [
	{ key: 'title', label: 'Задача', type: 'text' },
	{ key: 'status', label: 'Статус', type: 'select' },
	{ key: 'estimate', label: 'Оценка', type: 'number' },
	{ key: 'due', label: 'Срок', type: 'date' },
	{ key: 'isUrgent', label: 'Срочно', type: 'boolean' },
]

const ROWS = [
	{ id: 1, title: 'Тёмная тема', status: 'todo', estimate: 3, due: '2025-05-20', isUrgent: false },
	{ id: 2, title: 'Поиск', status: 'done', estimate: 1, due: new Date(2025, 4, 2), isUrgent: 'true' },
	{ id: 3, title: 'Экспорт', status: '', estimate: null, due: '', isUrgent: true },
]

const ids = (condition: Omit<FilterBuilderCondition, 'id'>, match: 'all' | 'any' = 'all') =>
	ROWS.filter(createFilterPredicate({ match, conditions: [{ id: 'c', ...condition }] }, FIELDS)).map(row => row.id)

const run = (field: string, operator: FilterBuilderOperator, [value = '', valueTo]: string[] = []) =>
	ids({ field, operator, value, valueTo })

describe('createFilterPredicate', () => {
	it('текст: без регистра и «ё», пустые значения', () => {
		expect(run('title', 'contains', ['ТЕМ'])).toEqual([1])
		expect(run('title', 'notContains', ['тем'])).toEqual([2, 3])
		expect(run('title', 'startsWith', ['по'])).toEqual([2])
		expect(run('title', 'eq', ['поиск'])).toEqual([2])
		expect(run('title', 'ne', ['поиск'])).toEqual([1, 3])
		expect(run('status', 'empty')).toEqual([3])
		expect(run('status', 'notEmpty')).toEqual([1, 2])
	})

	it('числа и диапазон', () => {
		expect(run('estimate', 'gt', ['1'])).toEqual([1])
		expect(run('estimate', 'gte', ['1'])).toEqual([1, 2])
		expect(run('estimate', 'lt', ['3'])).toEqual([2])
		expect(run('estimate', 'lte', ['3'])).toEqual([1, 2])
		expect(run('estimate', 'between', ['2', '5'])).toEqual([1])
	})

	it('даты: строка и Date, раньше, позже, равно, диапазон', () => {
		expect(run('due', 'eq', ['2025-05-02'])).toEqual([2])
		expect(run('due', 'before', ['2025-05-10'])).toEqual([2])
		expect(run('due', 'after', ['2025-05-10'])).toEqual([1])
		expect(run('due', 'between', ['2025-05-01', '2025-05-31'])).toEqual([1, 2])
	})

	it('флажки', () => {
		expect(run('isUrgent', 'isTrue')).toEqual([2, 3])
		expect(run('isUrgent', 'isFalse')).toEqual([1])
	})

	it('связки, незаполненные и неизвестные условия, своё чтение значения', () => {
		const conditions: FilterBuilderCondition[] = [
			{ id: '1', field: 'status', operator: 'eq', value: 'todo' },
			{ id: '2', field: 'isUrgent', operator: 'isTrue', value: '' },
			{ id: '3', field: 'title', operator: 'contains', value: '  ' },
			{ id: '4', field: 'нет', operator: 'contains', value: 'x' },
		]
		expect(ROWS.filter(createFilterPredicate({ match: 'any', conditions }, FIELDS)).map(row => row.id)).toEqual([1, 2, 3])
		expect(ROWS.filter(createFilterPredicate({ match: 'all', conditions }, FIELDS)).map(row => row.id)).toEqual([])
		expect(ROWS.filter(createFilterPredicate({ match: 'all', conditions: conditions.slice(2) }, FIELDS))).toHaveLength(3)
		const byMap = createFilterPredicate<Map<string, unknown>>({ match: 'all', conditions: [conditions[0]] }, FIELDS, (row, key) =>
			row.get(key),
		)
		expect(byMap(new Map([['status', 'todo']]))).toBe(true)
	})

	it('isConditionComplete', () => {
		expect(isConditionComplete({ id: '1', field: 'x', operator: 'empty', value: '' })).toBe(true)
		expect(isConditionComplete({ id: '1', field: 'x', operator: 'eq', value: ' ' })).toBe(false)
		expect(isConditionComplete({ id: '1', field: 'x', operator: 'between', value: '1' })).toBe(false)
		expect(isConditionComplete({ id: '1', field: 'x', operator: 'between', value: '1', valueTo: '2' })).toBe(true)
	})
})
