import { UI_FILTER } from '@/locales/messages'
import type { ColumnFilter, TableColumn } from '@components/BaseTable/types/BaseTable.types'
import {
	formatFilterLabel,
	getDefaultFilterOperator,
	getFilterKind,
	getFilterOperatorOptions,
	getFilterValues,
	isFilterComplete,
} from '../useTableFilterUtils'

const STATUS: TableColumn = {
	key: 'status',
	label: 'Статус',
	filterConfig: {
		type: 'multi-select',
		options: [
			{ value: 'new', label: 'Новый' },
			{ value: 'done', label: 'Закрыт' },
		],
	},
}

describe('useTableFilterUtils', () => {
	it.each<[string, TableColumn | undefined, string]>([
		['без колонки', undefined, 'text'],
		['колонка без типов', { key: 'a', label: 'A' }, 'text'],
		['sortType number', { key: 'a', label: 'A', sortType: 'number' }, 'number'],
		['sortType date', { key: 'a', label: 'A', sortType: 'date' }, 'date'],
		['sortType string', { key: 'a', label: 'A', sortType: 'string' }, 'text'],
		['filterConfig select', { key: 'a', label: 'A', filterConfig: { type: 'select' } }, 'select'],
		['filterConfig multi-select', STATUS, 'multi-select'],
		['filterConfig date', { key: 'a', label: 'A', filterConfig: { type: 'date' } }, 'date'],
		['filterConfig text важнее sortType', { key: 'a', label: 'A', sortType: 'number', filterConfig: { type: 'text' } }, 'text'],
		['range без sortType — числа', { key: 'a', label: 'A', filterConfig: { type: 'range' } }, 'number'],
		['range с sortType date — даты', { key: 'a', label: 'A', sortType: 'date', filterConfig: { type: 'range' } }, 'date'],
	])('getFilterKind: %s → %s', (_, column, expected) => {
		expect(getFilterKind(column)).toBe(expected)
	})

	it('getDefaultFilterOperator: первый оператор типа, у range — between', () => {
		expect(getDefaultFilterOperator()).toBe('contains')
		expect(getDefaultFilterOperator({ key: 'a', label: 'A', sortType: 'number' })).toBe('eq')
		expect(getDefaultFilterOperator(STATUS)).toBe('in')
		expect(getDefaultFilterOperator({ key: 'a', label: 'A', filterConfig: { type: 'range' } })).toBe('between')
	})

	it('getFilterOperatorOptions: набор операторов зависит от типа', () => {
		const values = (kind: Parameters<typeof getFilterOperatorOptions>[0]) => getFilterOperatorOptions(kind).map(option => option.value)
		expect(values('text')).toEqual(['contains', 'eq', 'ne'])
		expect(values('number')).toEqual(['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between'])
		expect(values('date')).toEqual(values('number'))
		expect(values('select')).toEqual(['eq', 'ne'])
		expect(values('multi-select')).toEqual(['in'])
	})

	it('getFilterOperatorOptions: у чисел знаки, у дат слова', () => {
		const labels = (kind: Parameters<typeof getFilterOperatorOptions>[0]) => getFilterOperatorOptions(kind).map(option => option.label)
		expect(labels('number')).toEqual(['=', '≠', '>', '≥', '<', '≤', UI_FILTER.BETWEEN])
		expect(labels('date')).toEqual([
			'=',
			'≠',
			UI_FILTER.AFTER,
			UI_FILTER.ON_OR_AFTER,
			UI_FILTER.BEFORE,
			UI_FILTER.ON_OR_BEFORE,
			UI_FILTER.BETWEEN,
		])
		expect(labels('text')[0]).toBe(UI_FILTER.CONTAINS)
		expect(labels('multi-select')).toEqual([UI_FILTER.IN])
	})

	it('getFilterValues: массив values или строка через запятую', () => {
		expect(getFilterValues({ key: 'a', operator: 'in', value: '', values: ['x', 'y'] })).toEqual(['x', 'y'])
		expect(getFilterValues({ key: 'a', operator: 'in', value: ' x, y ,, ' })).toEqual(['x', 'y'])
	})

	it('isFilterComplete: between требует обе границы, in — значения, остальные — значение', () => {
		const base: ColumnFilter = { key: 'a', operator: 'eq', value: '' }
		expect(isFilterComplete(base)).toBe(false)
		expect(isFilterComplete({ ...base, value: 'x' })).toBe(true)
		expect(isFilterComplete({ ...base, operator: 'between', value: '1' })).toBe(false)
		expect(isFilterComplete({ ...base, operator: 'between', value: '1', valueTo: '2' })).toBe(true)
		expect(isFilterComplete({ ...base, operator: 'in', values: [] })).toBe(false)
		expect(isFilterComplete({ ...base, operator: 'in', values: ['x'] })).toBe(true)
	})

	describe('formatFilterLabel', () => {
		const amount: TableColumn = { key: 'amount', label: 'Сумма', sortType: 'number' }
		const date: TableColumn = { key: 'date', label: 'Дата', sortType: 'date' }

		it('знак оператора и значение', () => {
			expect(formatFilterLabel({ key: 'amount', operator: 'gte', value: '100' }, amount)).toBe('Сумма ≥ 100')
			expect(formatFilterLabel({ key: 'name', operator: 'contains', value: 'ан' })).toBe('name ∋ ан')
		})

		it('у дат оператор — слово строчными', () => {
			expect(formatFilterLabel({ key: 'date', operator: 'lt', value: '2025-05-14' }, date)).toBe(
				`Дата ${UI_FILTER.BEFORE.toLowerCase()} 2025-05-14`,
			)
			expect(formatFilterLabel({ key: 'date', operator: 'eq', value: '2025-05-14' }, date)).toBe('Дата = 2025-05-14')
			expect(formatFilterLabel({ key: 'date', operator: 'contains', value: '2025' }, date)).toBe('Дата ∋ 2025')
		})

		it('диапазон и список: границы через тире, значения — подписями вариантов', () => {
			expect(formatFilterLabel({ key: 'amount', operator: 'between', value: '100', valueTo: '200' }, amount)).toBe('Сумма: 100 – 200')
			expect(formatFilterLabel({ key: 'amount', operator: 'between', value: '100' }, amount)).toBe('Сумма: 100 – ')
			expect(formatFilterLabel({ key: 'status', operator: 'in', value: 'new, done', values: ['new', 'done', 'other'] }, STATUS)).toBe(
				'Статус ∈ Новый, Закрыт, other',
			)
		})
	})
})
