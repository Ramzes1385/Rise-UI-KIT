/**
 * Unit-тесты для idUtils.
 * Покрывают: generateId (с префиксом и без).
 * Date.now и Math.random замокированы для детерминизма.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { generateId } from './idUtils'

describe('idUtils', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('generateId', () => {
		it('генерирует id без префикса', () => {
			vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
			vi.spyOn(Math, 'random').mockReturnValue(0.5)
			const id = generateId()
			expect(id).not.toContain('_')
			expect(typeof id).toBe('string')
			expect(id.length).toBeGreaterThan(0)
		})

		it('генерирует id с префиксом', () => {
			vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
			vi.spyOn(Math, 'random').mockReturnValue(0.5)
			const id = generateId('btn')
			expect(id).toMatch(/^btn_/)
		})

		it('детерминирует id при фиксированных значениях', () => {
			vi.spyOn(Date, 'now').mockReturnValue(1000000)
			vi.spyOn(Math, 'random').mockReturnValue(0.123456)
			const id = generateId('test')
			const expected = `test_${(1000000).toString(36)}${(0.123456).toString(36).slice(2, 8)}`
			expect(id).toBe(expected)
		})

		it('пустой префикс эквивалентен отсутствию префикса', () => {
			vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
			vi.spyOn(Math, 'random').mockReturnValue(0.5)
			const idEmpty = generateId('')
			const idNoArg = generateId()
			expect(idEmpty).toBe(idNoArg)
		})

		it('разные вызовы дают разные id при разных random', () => {
			vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
			vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.9)
			const id1 = generateId()
			const id2 = generateId()
			expect(id1).not.toBe(id2)
		})
	})
})
