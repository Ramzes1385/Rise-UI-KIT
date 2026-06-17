/**
 * Unit-тесты для imageUtils.
 * Покрывают: isExternalImage, replaceExtension, buildOptimizedSrc, buildSrcset.
 */

import '@testing-library/jest-dom/vitest'
import { buildOptimizedSrc, buildSrcset, isExternalImage, replaceExtension } from './imageUtils'

describe('imageUtils', () => {
	// ── isExternalImage ──

	describe('isExternalImage', () => {
		it('распознаёт https URL', () => {
			expect(isExternalImage('https://example.com/img.png')).toBe(true)
		})

		it('распознаёт http URL', () => {
			expect(isExternalImage('http://example.com/img.png')).toBe(true)
		})

		it('распознаёт blob URL', () => {
			expect(isExternalImage('blob:abc123')).toBe(true)
		})

		it('распознаёт data URL', () => {
			expect(isExternalImage('data:image/png;base64,abc')).toBe(true)
		})

		it('возвращает false для локального пути', () => {
			expect(isExternalImage('/images/photo.png')).toBe(false)
		})

		it('возвращает false для относительного пути', () => {
			expect(isExternalImage('./img.png')).toBe(false)
		})

		it('возвращает false для пустой строки', () => {
			expect(isExternalImage('')).toBe(false)
		})
	})

	// ── replaceExtension ──

	describe('replaceExtension', () => {
		it('заменяет расширение файла', () => {
			expect(replaceExtension('photo.png', '.webp')).toBe('photo.webp')
		})

		it('сохраняет query-параметры', () => {
			expect(replaceExtension('photo.png?w=200', '.webp')).toBe('photo.webp?w=200')
		})

		it('возвращает исходную строку если нет расширения', () => {
			expect(replaceExtension('noext', '.webp')).toBe('noext')
		})

		it('возвращает исходную строку если нет расширения но есть query', () => {
			expect(replaceExtension('noext?v=1', '.webp')).toBe('noext?v=1')
		})
	})

	// ── buildOptimizedSrc ──

	describe('buildOptimizedSrc', () => {
		it('добавляет параметр ширины', () => {
			expect(buildOptimizedSrc('img.png', 400)).toBe('img.png?w=400')
		})

		it('добавляет через & если уже есть query', () => {
			expect(buildOptimizedSrc('img.png?v=1', 400)).toBe('img.png?v=1&w=400')
		})

		it('возвращает исходный src без srcWidth', () => {
			expect(buildOptimizedSrc('img.png')).toBe('img.png')
		})

		it('возвращает исходный src при srcWidth=0', () => {
			expect(buildOptimizedSrc('img.png', 0)).toBe('img.png')
		})
	})

	// ── buildSrcset ──

	describe('buildSrcset', () => {
		it('строит srcset с 1x и 2x', () => {
			const result = buildSrcset('img.png', 400)
			expect(result).toBe('img.png?w=400 1x, img.png?w=800 2x')
		})

		it('возвращает undefined без srcWidth', () => {
			expect(buildSrcset('img.png')).toBeUndefined()
		})

		it('возвращает undefined при srcWidth=0', () => {
			expect(buildSrcset('img.png', 0)).toBeUndefined()
		})
	})
})
