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
	const searchColumns: TableColumn[] = [
		{ key: 'name', label: 'Имя' },
		{ key: 'age', label: 'Возраст' },
	]

	it('filterRowsBySearch ищет без учёта регистра по видимым колонкам', () => {
		expect(filterRowsBySearch(rows, 'АННА', searchColumns).map(r => r.id)).toEqual([2])
		expect(filterRowsBySearch(rows, '30', searchColumns).map(r => r.id)).toEqual([1, 3])
	})

	it('filterRowsBySearch: пробелы по краям запроса не мешают, пустой запрос возвращает все строки', () => {
		expect(filterRowsBySearch(rows, '  вика ', searchColumns).map(r => r.id)).toEqual([3])
		expect(filterRowsBySearch(rows, '   ', searchColumns)).toBe(rows)
	})

	it('filterRowsBySearch не ищет по скрытым колонкам, полям вне колонок и пустым значениям', () => {
		const data: TableRow[] = [
			{ id: 1, data: { name: 'Ёжик', secret: 'пароль', note: null } },
			{ id: 2, data: { name: 'Кот', secret: 'ёлка' } },
		]
		const columns: TableColumn[] = [
			{ key: 'name', label: 'Имя' },
			{ key: 'secret', label: 'Секрет', isHidden: true },
			{ key: 'note', label: 'Заметка' },
		]
		expect(filterRowsBySearch(data, 'пароль', columns)).toEqual([])
		expect(filterRowsBySearch(data, 'null', columns)).toEqual([])
		expect(filterRowsBySearch(data, 'ежик', columns).map(r => r.id)).toEqual([1])
	})

	it('filterRowsBySearch находит и исходное значение, и текст formatter', () => {
		const data: TableRow[] = [{ id: 1, data: { price: 1500 } }]
		const columns: TableColumn[] = [{ key: 'price', label: 'Цена', formatter: value => `${value} ₽` }]
		expect(filterRowsBySearch(data, '₽', columns)).toHaveLength(1)
		expect(filterRowsBySearch(data, '1500', columns)).toHaveLength(1)
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

	it('matchesFilter: пустое значение проходит только ne', () => {
		expect(matchesFilter(row, filter('missing', 'ne', 'x'))).toBe(true)
		expect(matchesFilter(row, filter('missing', 'eq', 'x'))).toBe(false)
		expect(matchesFilter(row, filter('missing', 'contains', 'x'))).toBe(false)
		expect(matchesFilter({ id: 9, data: { name: null, note: '  ' } }, filter('name', 'ne', 'x'))).toBe(true)
		expect(matchesFilter({ id: 9, data: { name: null, note: '  ' } }, filter('note', 'eq', ''))).toBe(false)
	})

	describe('операторы по типу колонки', () => {
		const amount: TableColumn = { key: 'amount', label: 'Сумма', sortType: 'number' }
		const date: TableColumn = { key: 'date', label: 'Дата', sortType: 'date' }
		const status: TableColumn = { key: 'status', label: 'Статус', filterConfig: { type: 'multi-select' } }
		const amountRow: TableRow = { id: 1, data: { amount: 150, date: '2025-05-14', status: 'new' } }
		const dateRow = (value: unknown): TableRow => ({ id: 2, data: { date: value } })

		it.each([
			['eq', '150', undefined, true],
			['eq', '150.0', undefined, true],
			['ne', '150', undefined, false],
			['gt', '100', undefined, true],
			['gt', '150', undefined, false],
			['gte', '150', undefined, true],
			['lt', '200', undefined, true],
			['lte', '149', undefined, false],
			['between', '100', '200', true],
			['between', '150', '150', true],
			['between', '151', '200', false],
			['between', '100', undefined, true],
			['between', '', '149', false],
			['between', '', '', true],
			['gt', 'abc', undefined, true],
		] as const)('число: %s %s %s → %s', (...row) => {
			const [operator, value, valueTo, expected] = row
			const parts = valueTo === undefined ? { operator, value } : { operator, value, valueTo }
			expect(matchesFilter(amountRow, { key: 'amount', ...parts }, { column: amount })).toBe(expected)
		})

		it('число: нераспознанное значение ячейки проходит только ne', () => {
			const broken: TableRow = { id: 3, data: { amount: 'много' } }
			expect(matchesFilter(broken, filter('amount', 'gt', '1'), { column: amount })).toBe(false)
			expect(matchesFilter(broken, filter('amount', 'ne', '1'), { column: amount })).toBe(true)
		})

		it.each([
			['eq', '2025-05-14', undefined, true],
			['eq', '2025-05-15', undefined, false],
			['ne', '2025-05-14', undefined, false],
			['gt', '2025-05-13', undefined, true],
			['gt', '2025-05-14', undefined, false],
			['gte', '2025-05-14', undefined, true],
			['lt', '2025-05-15', undefined, true],
			['lt', '2025-05-14', undefined, false],
			['lte', '2025-05-14', undefined, true],
			['between', '2025-05-14', '2025-05-14', true],
			['between', '2025-05-01', '2025-05-31', true],
			['between', '2025-05-15', '2025-05-31', false],
		] as const)('дата: %s %s %s → %s (сравнение по дням)', (...row) => {
			const [operator, value, valueTo, expected] = row
			const parts = valueTo === undefined ? { operator, value } : { operator, value, valueTo }
			expect(matchesFilter(amountRow, { key: 'date', ...parts }, { column: date })).toBe(expected)
		})

		it('дата: значение с временем, Date и timestamp сравниваются по дню', () => {
			const onDay = filter('date', 'eq', '2025-05-14')
			expect(matchesFilter(dateRow('2025-05-14T18:30:00Z'), onDay, { column: date })).toBe(true)
			expect(matchesFilter(dateRow(new Date('2025-05-14T12:00:00Z')), onDay, { column: date })).toBe(true)
			expect(matchesFilter(dateRow(Date.UTC(2025, 4, 14, 23, 59)), onDay, { column: date, timeZone: 'UTC' })).toBe(true)
			expect(matchesFilter(dateRow('14.05.2025'), filter('date', 'gt', '2025-01-01'), { column: date })).toBe(false)
		})

		it('дата: нераспознанная граница ничего не отсекает', () => {
			expect(matchesFilter(amountRow, filter('date', 'gt', 'вчера'), { column: date })).toBe(true)
		})

		it('in: значение входит в values или в список через запятую, без учёта регистра', () => {
			expect(
				matchesFilter(amountRow, { key: 'status', operator: 'in', value: '', values: ['NEW', 'done'] }, { column: status }),
			).toBe(true)
			expect(matchesFilter(amountRow, { key: 'status', operator: 'in', value: 'done, other' }, { column: status })).toBe(false)
			expect(matchesFilter(amountRow, { key: 'status', operator: 'in', value: 'done, new' })).toBe(true)
		})

		it('select: eq и ne сравнивают точное значение, contains — подстроку', () => {
			const select: TableColumn = { key: 'status', label: 'Статус', filterConfig: { type: 'select' } }
			expect(matchesFilter(amountRow, filter('status', 'eq', 'NEW'), { column: select })).toBe(true)
			expect(matchesFilter(amountRow, filter('status', 'ne', 'new'), { column: select })).toBe(false)
			expect(matchesFilter(amountRow, filter('status', 'contains', 'ne'), { column: select })).toBe(true)
			expect(matchesFilter(amountRow, filter('status', 'contains', 'xx'), { column: select })).toBe(false)
		})

		it('неизвестный оператор ничего не отсекает', () => {
			expect(matchesFilter(amountRow, { key: 'amount', operator: 'xx' as 'eq', value: '1' }, { column: status })).toBe(true)
			expect(matchesFilter(amountRow, { key: 'amount', operator: 'xx' as 'eq', value: '1' }, { column: amount })).toBe(true)
		})
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
			{ columns },
		)
		expect(sorted.map(r => r.id)).toEqual([1, 3, 2])
	})

	it('sortRowsByStates: sortAccessor подменяет значение для сортировки, sortType применяется к нему', () => {
		const dates: TableRow[] = [
			{ id: 1, data: { date: '15.03.2024' } },
			{ id: 2, data: { date: '01.02.2024' } },
			{ id: 3, data: { date: '20.12.2023' } },
		]
		const toIso = (row: TableRow): string => String(row.data.date).split('.').reverse().join('-')
		const columns: TableColumn[] = [{ key: 'date', label: 'Дата', sortType: 'date', sortAccessor: toIso }]
		expect(sortRowsByStates(dates, [{ key: 'date', direction: 'asc' }], { columns }).map(r => r.id)).toEqual([3, 2, 1])
		expect(sortRowsByStates(dates, [{ key: 'date', direction: 'desc' }], { columns }).map(r => r.id)).toEqual([1, 2, 3])
	})

	it('sortRowsByStates: locale задаёт правила сравнения строк', () => {
		const letters: TableRow[] = ['z', 'ä', 'a'].map((name, index) => ({ id: index + 1, data: { name } }))
		const sort = (locale: string): Array<string | number> =>
			sortRowsByStates(letters, [{ key: 'name', direction: 'asc' }], { columns: [], locale }).map(r => r.id)
		expect(sort('sv')).toEqual([3, 1, 2])
		expect(sort('de')).toEqual([3, 2, 1])
	})

	it('sortRowsByStates сохраняет порядок равных строк', () => {
		const sorted = sortRowsByStates(rows, [{ key: 'age', direction: 'asc' }], { columns: [] })
		expect(sorted.map(r => r.id)).toEqual([2, 1, 3])
	})

	describe('пояс фильтра по датам', () => {
		const date: TableColumn = { key: 'date', label: 'Дата', sortType: 'date' }
		const at = (value: unknown): TableRow => ({ id: 1, data: { date: value } })
		const onDay = filter('date', 'eq', '2025-05-14')

		it('момент около полуночи попадает в сутки выбранного пояса', () => {
			const instant = Date.UTC(2025, 4, 14, 22, 30)
			expect(matchesFilter(at(instant), onDay, { column: date, timeZone: 'UTC' })).toBe(true)
			expect(matchesFilter(at(instant), onDay, { column: date, timeZone: 'Europe/Moscow' })).toBe(false)
			expect(matchesFilter(at(instant), filter('date', 'eq', '2025-05-15'), { column: date, timeZone: 'Europe/Moscow' })).toBe(true)
			expect(matchesFilter(at(instant), onDay, { column: date, timeZone: 'America/Los_Angeles' })).toBe(true)
		})

		it('filterConfig.timeZone колонки важнее пояса таблицы', () => {
			const own: TableColumn = { ...date, filterConfig: { type: 'date', timeZone: 'Europe/Moscow' } }
			const instant = Date.UTC(2025, 4, 14, 22, 30)
			expect(matchesFilter(at(instant), filter('date', 'eq', '2025-05-15'), { column: own, timeZone: 'UTC' })).toBe(true)
		})

		it('дата без пояса — сутки как написано в любом поясе', () => {
			for (const zone of ['UTC', 'Pacific/Auckland', 'America/Los_Angeles']) {
				expect(matchesFilter(at('2025-05-14'), onDay, { column: date, timeZone: zone })).toBe(true)
				expect(matchesFilter(at('2025-05-14 23:30'), onDay, { column: date, timeZone: zone })).toBe(true)
			}
		})

		it('без пояса сутки считаются в поясе пользователя', () => {
			const local = new Date(2025, 4, 14, 0, 30)
			expect(matchesFilter(at(local), onDay, { column: date })).toBe(true)
			expect(matchesFilter(at(new Date(2025, 4, 14, 23, 30)), onDay, { column: date })).toBe(true)
		})

		it('неизвестный пояс предупреждает один раз и считает в поясе пользователя', () => {
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
			const local = new Date(2025, 4, 14, 12)
			expect(matchesFilter(at(local), onDay, { column: date, timeZone: 'Mars/Olympus' })).toBe(true)
			expect(matchesFilter(at(local), onDay, { column: date, timeZone: 'Mars/Olympus' })).toBe(true)
			expect(warn).toHaveBeenCalledTimes(1)
			warn.mockRestore()
		})
	})

	describe('sortCompare', () => {
		const items: TableRow[] = [
			{ id: 1, data: { size: 'L' } },
			{ id: 2, data: { size: 'S' } },
			{ id: 3, data: { size: 'M' } },
			{ id: 4, data: { size: 'XS' } },
		]
		const ORDER = ['XS', 'S', 'M', 'L']
		const bySize = (a: unknown, b: unknown): number => ORDER.indexOf(String(a)) - ORDER.indexOf(String(b))
		const column: TableColumn = { key: 'size', label: 'Размер', isSortable: true, sortCompare: bySize }
		const ids = (direction: 'asc' | 'desc') =>
			sortRowsByStates(items, [{ key: 'size', direction }], { columns: [column] }).map(r => r.id)

		it('сортирует своей функцией по возрастанию и убыванию', () => {
			expect(ids('asc')).toEqual([4, 2, 3, 1])
			expect(ids('desc')).toEqual([1, 3, 2, 4])
		})

		it('важнее sortAccessor и sortType, получает значения ячеек и строки', () => {
			const compare = vi.fn((a: unknown, b: unknown, _rows: { a: TableRow; b: TableRow }) => bySize(a, b))
			const columns: TableColumn[] = [{ ...column, sortType: 'number', sortAccessor: () => 0, sortCompare: compare }]
			expect(sortRowsByStates(items, [{ key: 'size', direction: 'asc' }], { columns }).map(r => r.id)).toEqual([4, 2, 3, 1])
			const [a, b, { a: rowA, b: rowB }] = compare.mock.calls[0]
			expect(typeof a).toBe('string')
			expect(typeof b).toBe('string')
			expect(items).toContain(rowA)
			expect(items).toContain(rowB)
		})

		it('не число из функции считается равенством, сортировка стабильна; вторая колонка решает ничью', () => {
			const broken: TableColumn = { key: 'size', label: 'Размер', sortCompare: () => Number.NaN }
			expect(sortRowsByStates(items, [{ key: 'size', direction: 'asc' }], { columns: [broken] }).map(r => r.id)).toEqual([1, 2, 3, 4])
			const tie: TableRow[] = [
				{ id: 1, data: { size: 'S', n: 2 } },
				{ id: 2, data: { size: 'S', n: 1 } },
			]
			const columns: TableColumn[] = [column, { key: 'n', label: 'N', sortType: 'number' }]
			const sorted = sortRowsByStates(
				tie,
				[
					{ key: 'size', direction: 'asc' },
					{ key: 'n', direction: 'asc' },
				],
				{ columns },
			)
			expect(sorted.map(r => r.id)).toEqual([2, 1])
		})
	})
})
