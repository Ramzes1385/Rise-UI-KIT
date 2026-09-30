import '@testing-library/jest-dom/vitest'
import { en } from '@/locales/en'
import { defineLocale, setLocale } from '@/locales/state'
import type { SortType } from '@components/BaseTable/types/BaseTable.types'
import { calcColumnWidths, calcRowNumber, calcTotalColumns, compareSortKeys, getColumnStyle, toSortKey } from '../tableUtils'

describe('tableUtils', () => {
	describe('calcRowNumber', () => {
		it('рассчитывает номер строки в режиме pagination', () => {
			const result = calcRowNumber({
				index: 0,
				currentPage: 2,
				pageSize: 10,
				loadMode: 'pagination',
			})
			expect(result).toBe(11)
		})

		it('рассчитывает номер для произвольного индекса', () => {
			const result = calcRowNumber({
				index: 5,
				currentPage: 3,
				pageSize: 10,
				loadMode: 'pagination',
			})
			expect(result).toBe(26)
		})

		it('возвращает index + 1 если loadMode не pagination', () => {
			const result = calcRowNumber({
				index: 3,
				currentPage: 1,
				pageSize: 10,
				loadMode: 'scroll',
			})
			expect(result).toBe(4)
		})

		it('возвращает index + 1 если pageSize = 0 даже в режиме pagination', () => {
			const result = calcRowNumber({
				index: 3,
				currentPage: 2,
				pageSize: 0,
				loadMode: 'pagination',
			})
			expect(result).toBe(4)
		})

		it('игнорирует pageSize если loadMode не pagination', () => {
			const result = calcRowNumber({
				index: 3,
				currentPage: 2,
				pageSize: 10,
				loadMode: 'scroll',
			})
			expect(result).toBe(4)
		})
	})

	describe('getColumnStyle', () => {
		it('возвращает пустой объект без параметров', () => {
			expect(getColumnStyle({})).toEqual({})
		})

		it('добавляет minWidth если указан', () => {
			const result = getColumnStyle({ minWidth: '100px' })
			expect(result.minWidth).toBe('100px')
		})

		it('добавляет maxWidth если указан', () => {
			const result = getColumnStyle({ maxWidth: '200px' })
			expect(result.maxWidth).toBe('200px')
		})

		it('добавляет оба ограничения', () => {
			const result = getColumnStyle({ minWidth: '100px', maxWidth: '200px' })
			expect(result).toEqual({ minWidth: '100px', maxWidth: '200px' })
		})
	})

	describe('calcTotalColumns', () => {
		it('возвращает только видимые колонки', () => {
			expect(calcTotalColumns(5, {})).toBe(5)
		})

		it('добавляет колонку для чекбоксов', () => {
			expect(calcTotalColumns(5, { isSelectable: true })).toBe(6)
		})

		it('добавляет колонку для номеров строк', () => {
			expect(calcTotalColumns(5, { hasRowNumber: true })).toBe(6)
		})

		it('добавляет колонку для раскрывающихся строк', () => {
			expect(calcTotalColumns(5, { hasExpandableRows: true })).toBe(6)
		})

		it('добавляет все дополнительные колонки', () => {
			expect(calcTotalColumns(5, { isSelectable: true, hasRowNumber: true, hasExpandableRows: true })).toBe(8)
		})
	})

	describe('calcColumnWidths', () => {
		it('возвращает auto для колонок без width и flex', () => {
			expect(calcColumnWidths([{}, {}])).toEqual(['auto', 'auto'])
		})

		it('возвращает width если указан', () => {
			expect(calcColumnWidths([{ width: '100px' }])).toEqual(['100px'])
		})

		it('рассчитывает процент для flex-колонок', () => {
			const result = calcColumnWidths([{ flex: 1 }, { flex: 3 }])
			expect(result[0]).toBe('25%')
			expect(result[1]).toBe('75%')
		})

		it('смешивает width и flex', () => {
			const result = calcColumnWidths([{ width: '200px' }, { flex: 1 }])
			expect(result[0]).toBe('200px')
			expect(result[1]).toBe('100%')
		})

		it('возвращает auto для flex при totalFlex = 0', () => {
			const result = calcColumnWidths([{ flex: 0 }])
			expect(result[0]).toBe('auto')
		})

		it('возвращает пустой массив для пустых колонок', () => {
			expect(calcColumnWidths([])).toEqual([])
		})

		it('приоритет width над flex', () => {
			const result = calcColumnWidths([{ width: '200px', flex: 1 }, { flex: 1 }])
			expect(result[0]).toBe('200px')
			expect(result[1]).toBe('50%')
		})

		it('возвращает auto для колонки с undefined flex', () => {
			expect(calcColumnWidths([{ flex: undefined }])).toEqual(['auto'])
		})

		it('корректно распределяет проценты при нескольких flex-колонках', () => {
			const result = calcColumnWidths([{ flex: 1 }, { flex: 2 }, { flex: 1 }])
			expect(result[0]).toBe('25%')
			expect(result[1]).toBe('50%')
			expect(result[2]).toBe('25%')
		})
	})

	describe('toSortKey', () => {
		it('пустые значения получают ранг 2 для любого типа', () => {
			for (const sortType of ['string', 'number', 'date'] as SortType[]) {
				expect(toSortKey(null, sortType).rank).toBe(2)
				expect(toSortKey(undefined, sortType).rank).toBe(2)
				expect(toSortKey('   ', sortType).rank).toBe(2)
			}
		})

		it('number: числа, числовые строки, bigint и Date распознаются, остальное — ранг 1', () => {
			expect(toSortKey(42, 'number')).toEqual({ rank: 0, value: 42 })
			expect(toSortKey(' 7.5 ', 'number')).toEqual({ rank: 0, value: 7.5 })
			expect(toSortKey(BigInt(3), 'number')).toEqual({ rank: 0, value: 3 })
			expect(toSortKey(new Date(Date.UTC(2024, 0, 1)), 'number')).toEqual({ rank: 0, value: Date.UTC(2024, 0, 1) })
			expect(toSortKey(Number.NaN, 'number').rank).toBe(1)
			expect(toSortKey('1 000', 'number').rank).toBe(1)
			expect(toSortKey(true, 'number').rank).toBe(1)
		})

		it('date: ISO-даты, Date и timestamp распознаются, неоднозначные форматы — нет', () => {
			expect(toSortKey('2024-01-15', 'date')).toEqual({ rank: 0, value: Date.UTC(2024, 0, 15) })
			expect(toSortKey('2024-01-15T10:30:00Z', 'date')).toEqual({ rank: 0, value: Date.UTC(2024, 0, 15, 10, 30) })
			expect(toSortKey('2024-01-15T10:30:00+03:00', 'date')).toEqual({ rank: 0, value: Date.UTC(2024, 0, 15, 7, 30) })
			expect(toSortKey('2024-01-15 10:30:15.5', 'date')).toEqual({ rank: 0, value: Date.UTC(2024, 0, 15, 10, 30, 15, 500) })
			expect(toSortKey(Date.UTC(2020, 5, 1), 'date')).toEqual({ rank: 0, value: Date.UTC(2020, 5, 1) })
			expect(toSortKey(new Date('invalid'), 'date').rank).toBe(1)
			expect(toSortKey('01.02.2024', 'date').rank).toBe(1)
			expect(toSortKey('2024-02-30', 'date').rank).toBe(1)
			expect(toSortKey('2024-01-15T24:00', 'date').rank).toBe(1)
		})

		it('date: годы 0–99 не превращаются в 1900-е', () => {
			const key = toSortKey('0050-06-01', 'date')
			expect(key.rank).toBe(0)
			expect(new Date(key.value).getUTCFullYear()).toBe(50)
		})

		it('string: любое непустое значение — строка ранга 0', () => {
			expect(toSortKey(15, 'string')).toEqual({ rank: 0, value: '15' })
			expect(toSortKey('Роза')).toEqual({ rank: 0, value: 'Роза' })
		})
	})

	describe('compareSortKeys', () => {
		it('ранг важнее направления: пустые и нераспознанные значения в конце и при desc', () => {
			const valid = toSortKey(1, 'number')
			const invalid = toSortKey('—', 'number')
			const empty = toSortKey(null, 'number')

			for (const direction of ['asc', 'desc'] as const) {
				expect(compareSortKeys(valid, invalid, direction)).toBeLessThan(0)
				expect(compareSortKeys(invalid, empty, direction)).toBeLessThan(0)
				expect(compareSortKeys(empty, valid, direction)).toBeGreaterThan(0)
			}
			expect(compareSortKeys(empty, toSortKey(undefined), 'asc')).toBe(0)
		})

		it('направление меняет порядок внутри ранга, строки сравниваются с numeric-коллацией', () => {
			expect(compareSortKeys(toSortKey(1, 'number'), toSortKey(2, 'number'), 'asc')).toBeLessThan(0)
			expect(compareSortKeys(toSortKey(1, 'number'), toSortKey(2, 'number'), 'desc')).toBeGreaterThan(0)
			expect(compareSortKeys(toSortKey('Item 2'), toSortKey('Item 10'), 'asc')).toBeLessThan(0)
		})

		it('строки сравниваются по правилам языка кита, коллатор один на язык', () => {
			const RealCollator = Intl.Collator
			const collator = vi.spyOn(Intl, 'Collator').mockImplementation(function (...args: ConstructorParameters<typeof Intl.Collator>) {
				return new RealCollator(...args)
			} as unknown as typeof Intl.Collator)
			setLocale(defineLocale(en, { intl: 'de-DE' }))
			compareSortKeys(toSortKey('a'), toSortKey('b'), 'asc')
			compareSortKeys(toSortKey('b'), toSortKey('c'), 'asc')

			expect(collator.mock.calls).toEqual([['de-DE', { numeric: true }]])
			setLocale('ru')
			collator.mockRestore()
		})

		it('даёт транзитивный порядок для смеси значений (Array.sort получает корректный компаратор)', () => {
			// Значения обёрнуты в объекты, как строки таблицы: «голые» undefined Array.sort уносит в конец без компаратора
			const cells = [30, undefined, 10, '—', 20, null, 'abc', 5].map(value => ({ value }))
			const sorted = [...cells].sort((a, b) => compareSortKeys(toSortKey(a.value, 'number'), toSortKey(b.value, 'number'), 'asc'))

			expect(sorted.map(cell => cell.value)).toEqual([5, 10, 20, 30, '—', 'abc', undefined, null])
		})
	})
})
