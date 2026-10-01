import { filterRowsBySearch, matchesFilter, sortRowsByStates } from '../useTableDataUtils'
import type { ColumnFilter, TableColumn, TableRow } from '@components/BaseTable/types/BaseTable.types'

const rows: TableRow[] = [
	{ id: 1, data: { name: 'Борис', age: 30 } },
	{ id: 2, data: { name: 'анна', age: 25 } },
	{ id: 3, data: { name: 'Вика', age: 30 } },
]

const row: TableRow = { id: 1, data: { name: 'Анна', age: 30 } }

function filter(key: string, operator: ColumnFilter['operator'], value: string): ColumnFilter {
	return { key, operator, value }
}

describe('useTableDataUtils', () => {
	it('filterRowsBySearch ищет без учёта регистра по всем значениям', () => {
		expect(filterRowsBySearch(rows, 'АННА').map(r => r.id)).toEqual([2])
		expect(filterRowsBySearch(rows, '30').map(r => r.id)).toEqual([1, 3])
	})

	it.each([
		{ operator: 'eq', key: 'name', value: 'анна', expected: true },
		{ operator: 'eq', key: 'name', value: 'Вика', expected: false },
		{ operator: 'ne', key: 'name', value: 'Вика', expected: true },
		{ operator: 'contains', key: 'name', value: 'нн', expected: true },
		{ operator: 'gt', key: 'age', value: '29', expected: true },
		{ operator: 'lt', key: 'age', value: '30', expected: false },
		{ operator: 'gte', key: 'age', value: '30', expected: true },
		{ operator: 'lte', key: 'age', value: '29', expected: false },
		{ operator: 'between', key: 'age', value: '1', expected: true },
	] as const)('matchesFilter: $operator по $key = $value → $expected', ({ operator, key, value, expected }) => {
		expect(matchesFilter(row, filter(key, operator, value))).toBe(expected)
	})

	it('matchesFilter отбрасывает строку без значения в колонке', () => {
		expect(matchesFilter(row, filter('missing', 'ne', 'x'))).toBe(false)
	})

	it('sortRowsByStates сортирует по нескольким ключам с учётом sortType', () => {
		const columns: TableColumn[] = [
			{ key: 'name', label: 'Имя' },
			{ key: 'age', label: 'Возраст', sortType: 'number' },
		]
		const sorted = sortRowsByStates(
			rows,
			[
				{ key: 'age', direction: 'desc' },
				{ key: 'name', direction: 'asc' },
			],
			columns,
		)
		expect(sorted.map(r => r.id)).toEqual([1, 3, 2])
	})

	it('sortRowsByStates сохраняет порядок равных строк', () => {
		const sorted = sortRowsByStates(rows, [{ key: 'age', direction: 'asc' }], [])
		expect(sorted.map(r => r.id)).toEqual([2, 1, 3])
	})
})
