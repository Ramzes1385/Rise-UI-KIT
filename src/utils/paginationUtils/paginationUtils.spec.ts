/**
 * Unit-тесты для paginationUtils.
 * Покрывают: calcTotalPages, calcVisiblePages, calcPageInfo.
 */

import '@testing-library/jest-dom/vitest'

import { calcPageInfo, calcTotalPages, calcVisiblePages } from './paginationUtils'

describe('paginationUtils', () => {
	// ── calcTotalPages ──

	describe('calcTotalPages', () => {
		it('рассчитывает общее количество страниц', () => {
			expect(calcTotalPages(100, 10)).toBe(10)
		})

		it('округляет вверх при неполной странице', () => {
			expect(calcTotalPages(95, 10)).toBe(10)
		})

		it('возвращает 1 при нулевом pageSize', () => {
			expect(calcTotalPages(100, 0)).toBe(1)
		})

		it('возвращает 1 при отрицательном pageSize', () => {
			expect(calcTotalPages(100, -5)).toBe(1)
		})

		it('возвращает 0 страниц для пустого списка', () => {
			expect(calcTotalPages(0, 10)).toBe(0)
		})

		it('возвращает 0 страниц для отрицательного total', () => {
			// Math.ceil(-0.5) даёт -0, приводим к +0 через сложение
			expect(calcTotalPages(-5, 10) + 0).toBe(0)
		})
	})

	// ── calcVisiblePages ──

	describe('calcVisiblePages', () => {
		it('возвращает пустой массив при total = 0', () => {
			expect(calcVisiblePages({ current: 1, total: 0 })).toEqual([])
		})

		it('показывает все страницы если total <= maxVisible', () => {
			expect(calcVisiblePages({ current: 3, total: 5 })).toEqual([1, 2, 3, 4, 5])
		})

		it('добавляет многоточие при большом количестве страниц', () => {
			const result = calcVisiblePages({ current: 10, total: 20 })
			expect(result).toContain('...')
		})

		it('всегда содержит первую страницу', () => {
			const result = calcVisiblePages({ current: 15, total: 20 })
			expect(result[0]).toBe(1)
		})

		it('всегда содержит последнюю страницу при showLastPage', () => {
			const result = calcVisiblePages({ current: 5, total: 20, showLastPage: true })
			expect(result[result.length - 1]).toBe(20)
		})

		it('не показывает последнюю страницу при showLastPage = false', () => {
			const result = calcVisiblePages({ current: 5, total: 20, showLastPage: false })
			expect(result[result.length - 1]).not.toBe(20)
		})

		it('текущая страница входит в результат', () => {
			const result = calcVisiblePages({ current: 10, total: 20 })
			expect(result).toContain(10)
		})

		it('прижимает диапазон к началу если current близко к 1', () => {
			const result = calcVisiblePages({ current: 2, total: 20 })
			expect(result).toContain(2)
			expect(result).toContain(3)
		})

		it('прижимает диапазон к концу если current близко к total', () => {
			const result = calcVisiblePages({ current: 19, total: 20 })
			expect(result).toContain(19)
			expect(result).toContain(18)
		})

		it('возвращает пустой массив при отрицательном total', () => {
			expect(calcVisiblePages({ current: 1, total: -3 })).toEqual([])
		})

		it('возвращает [1] при одной странице', () => {
			expect(calcVisiblePages({ current: 1, total: 1 })).toEqual([1])
		})

		it('использует кастомный maxVisible', () => {
			const result = calcVisiblePages({ current: 5, total: 20, maxVisible: 5 })
			// maxVisible ограничивает число номеров страниц, без учёта многоточий
			const pageNums = result.filter((p): p is number => typeof p === 'number')
			expect(pageNums.length).toBeLessThanOrEqual(5)
			expect(result[0]).toBe(1)
		})

		it('показывает все страницы когда total равен maxVisible', () => {
			const result = calcVisiblePages({ current: 4, total: 7, maxVisible: 7 })
			expect(result).toEqual([1, 2, 3, 4, 5, 6, 7])
		})

		it('показывает последнюю страницу при явном showLastPage=true', () => {
			const result = calcVisiblePages({ current: 5, total: 20, showLastPage: true })
			expect(result[result.length - 1]).toBe(20)
		})

		it('не показывает последнюю страницу и правое многоточие при showLastPage=false', () => {
			const result = calcVisiblePages({ current: 10, total: 20, showLastPage: false })
			expect(result).not.toContain(20)
			expect(result[result.length - 1]).not.toBe('...')
		})

		it('прижимает к концу без showLastPage', () => {
			const result = calcVisiblePages({ current: 19, total: 20, showLastPage: false })
			expect(result).toContain(19)
			expect(result).not.toContain(20)
		})
	})

	// ── calcPageInfo ──

	describe('calcPageInfo', () => {
		it('форматирует информацию о первой странице', () => {
			const result = calcPageInfo({ current: 1, pageSize: 10, total: 100 })
			expect(result).toBe('1–10 из 100')
		})

		it('форматирует информацию о средней странице', () => {
			const result = calcPageInfo({ current: 5, pageSize: 10, total: 100 })
			expect(result).toBe('41–50 из 100')
		})

		it('форматирует информацию о последней неполной странице', () => {
			const result = calcPageInfo({ current: 10, pageSize: 10, total: 95 })
			expect(result).toBe('91–95 из 95')
		})

		it('форматирует информацию при одном элементе', () => {
			const result = calcPageInfo({ current: 1, pageSize: 10, total: 1 })
			expect(result).toBe('1–1 из 1')
		})
	})
})
