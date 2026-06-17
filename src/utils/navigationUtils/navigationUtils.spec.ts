import '@testing-library/jest-dom/vitest'
import { openExternalUrl, resolveNavigation } from './navigationUtils'

describe('navigationUtils', () => {
	describe('openExternalUrl', () => {
		it('открывает URL в новой вкладке', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			openExternalUrl('https://example.com')
			expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener')
			openSpy.mockRestore()
		})

		it('открывает URL в текущей вкладке', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			openExternalUrl('https://example.com', '_self')
			expect(openSpy).toHaveBeenCalledWith('https://example.com', '_self', undefined)
			openSpy.mockRestore()
		})

		it('передаёт noopener при явном _blank', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			openExternalUrl('https://example.com', '_blank')
			expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener')
			openSpy.mockRestore()
		})

		it('не падает когда window.open не функция', () => {
			// Покрывает navigationUtils.ts:5 — `typeof window.open === 'function'` ветка false.
			const originalOpen = window.open
			Object.defineProperty(window, 'open', { value: undefined, configurable: true })
			expect(() => openExternalUrl('https://example.com')).not.toThrow()
			Object.defineProperty(window, 'open', { value: originalOpen, configurable: true })
		})
	})

	describe('resolveNavigation', () => {
		it('возвращает external для href', () => {
			expect(resolveNavigation({ href: 'https://example.com' })).toEqual({
				type: 'external',
				url: 'https://example.com',
			})
		})

		it('возвращает internal для to', () => {
			expect(resolveNavigation({ to: '/about' })).toEqual({
				type: 'internal',
				url: '/about',
			})
		})

		it('приоритет href над to', () => {
			expect(resolveNavigation({ href: 'https://example.com', to: '/about' })).toEqual({
				type: 'external',
				url: 'https://example.com',
			})
		})

		it('возвращает none когда ничего не задано', () => {
			expect(resolveNavigation({})).toEqual({ type: 'none', url: '' })
		})

		it('возвращает internal когда href пустая строка', () => {
			expect(resolveNavigation({ href: '', to: '/about' })).toEqual({
				type: 'internal',
				url: '/about',
			})
		})

		it('возвращает none когда и href и to пустые строки', () => {
			expect(resolveNavigation({ href: '', to: '' })).toEqual({ type: 'none', url: '' })
		})
	})
})
