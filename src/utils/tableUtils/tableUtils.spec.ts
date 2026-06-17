/**
 * Unit-тесты для tableUtils.
 * Покрывают: calcRowNumber, getColumnStyle, calcTotalColumns, calcColumnWidths.
 */

import '@testing-library/jest-dom/vitest'
import { calcColumnWidths, calcRowNumber, calcTotalColumns, getColumnStyle } from './tableUtils'

describe('tableUtils', () => {
	// ── calcRowNumber ──

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

	// ── getColumnStyle ──

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

	// ── calcTotalColumns ──

	describe('calcTotalColumns', () => {
		it('возвращает только видимые колонки', () => {
			expect(calcTotalColumns(5, false, false, false)).toBe(5)
		})

		it('добавляет колонку для чекбоксов', () => {
			expect(calcTotalColumns(5, true, false, false)).toBe(6)
		})

		it('добавляет колонку для номеров строк', () => {
			expect(calcTotalColumns(5, false, true, false)).toBe(6)
		})

		it('добавляет колонку для раскрывающихся строк', () => {
			expect(calcTotalColumns(5, false, false, true)).toBe(6)
		})

		it('добавляет все дополнительные колонки', () => {
			expect(calcTotalColumns(5, true, true, true)).toBe(8)
		})
	})

	// ── calcColumnWidths ──

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
})
