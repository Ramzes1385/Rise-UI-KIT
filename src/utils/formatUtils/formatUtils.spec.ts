/**
 * Unit-тесты для formatUtils.
 * Покрывают: formatMessageStatus, formatUrl, formatDateLong, formatCellValue.
 */

import '@testing-library/jest-dom/vitest'

import { formatCellValue, formatDateLong, formatMessageStatus, formatUrl } from './formatUtils'

describe('formatUtils', () => {
	// ── formatMessageStatus ──

	describe('formatMessageStatus', () => {
		it('возвращает иконку для sent', () => {
			expect(formatMessageStatus('sent')).toBe('✓')
		})

		it('возвращает иконку для delivered', () => {
			expect(formatMessageStatus('delivered')).toBe('✓✓')
		})

		it('возвращает иконку для read', () => {
			expect(formatMessageStatus('read')).toBe('✓✓')
		})

		it('возвращает иконку для error', () => {
			expect(formatMessageStatus('error')).toBe('✗')
		})

		it('возвращает пустую строку для неизвестного статуса', () => {
			expect(formatMessageStatus('unknown')).toBe('')
		})
	})

	// ── formatUrl ──

	describe('formatUrl', () => {
		it('извлекает hostname из URL', () => {
			expect(formatUrl('https://example.com/path')).toBe('example.com')
		})

		it('возвращает исходную строку для невалидного URL', () => {
			expect(formatUrl('not-a-url')).toBe('not-a-url')
		})

		it('обрабатывает URL с портом', () => {
			expect(formatUrl('https://localhost:3000/api')).toBe('localhost')
		})
	})

	// ── formatDateLong ──

	describe('formatDateLong', () => {
		it('форматирует дату на русском', () => {
			const date = new Date(2025, 5, 10)
			const result = formatDateLong(date, 'ru-RU')
			expect(result).toContain('2025')
			expect(result).toContain('июня')
		})
	})

	// ── formatCellValue ──

	describe('formatCellValue', () => {
		it('возвращает строковое представление значения', () => {
			expect(formatCellValue(42)).toBe('42')
		})

		it('возвращает пустую строку для null/undefined', () => {
			expect(formatCellValue(null)).toBe('')
			expect(formatCellValue(undefined)).toBe('')
		})

		it('использует кастомный форматтер', () => {
			const formatter = (val: unknown) => `₽${val}`
			expect(formatCellValue(100, formatter)).toBe('₽100')
		})

		it('корректно форматирует falsy значения которые не nullish', () => {
			expect(formatCellValue(0)).toBe('0')
			expect(formatCellValue(false)).toBe('false')
			expect(formatCellValue('')).toBe('')
		})
	})
})
