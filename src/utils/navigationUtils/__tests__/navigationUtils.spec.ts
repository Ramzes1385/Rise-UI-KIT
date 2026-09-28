import '@testing-library/jest-dom/vitest'
import { navigateAndEmit, openExternalUrl, resolveNavigation } from '../navigationUtils'

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
	describe('защита от небезопасных URL', () => {
		const PAYLOAD = 'javascript:alert(document.domain)'

		it('openExternalUrl не открывает javascript: URL', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			openExternalUrl(PAYLOAD)
			expect(openSpy).not.toHaveBeenCalled()
			expect(warnSpy).toHaveBeenCalledOnce()
		})

		it('navigateAndEmit не исполняет javascript: href с target _self и не эмитит его', () => {
			const hrefBefore = window.location.href
			const emitNavigate = vi.fn()
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			navigateAndEmit({ href: PAYLOAD, target: '_self' }, emitNavigate)
			expect(window.location.href).toBe(hrefBefore)
			expect(emitNavigate).not.toHaveBeenCalled()
			expect(warnSpy).toHaveBeenCalledOnce()
		})

		it('navigateAndEmit не открывает javascript: href в новом окне', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			vi.spyOn(console, 'warn').mockImplementation(() => {})
			const emitNavigate = vi.fn()
			navigateAndEmit({ href: ' JavaScript:alert(1)' }, emitNavigate)
			expect(openSpy).not.toHaveBeenCalled()
			expect(emitNavigate).not.toHaveBeenCalled()
		})

		it('navigateAndEmit открывает безопасный внешний href и эмитит его', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			const emitNavigate = vi.fn()
			navigateAndEmit({ href: 'https://example.com' }, emitNavigate)
			expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank', 'noopener')
			expect(emitNavigate).toHaveBeenCalledWith('https://example.com')
		})

		it('navigateAndEmit эмитит внутренний маршрут без открытия окна', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			const emitNavigate = vi.fn()
			navigateAndEmit({ to: '/catalog' }, emitNavigate)
			expect(openSpy).not.toHaveBeenCalled()
			expect(emitNavigate).toHaveBeenCalledWith('/catalog')
		})

		it('navigateAndEmit с target _self переходит по безопасному href в текущей вкладке и эмитит его', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			const emitNavigate = vi.fn()
			// Якорь — переход внутри документа: jsdom выполняет его без «navigation to another Document»
			navigateAndEmit({ href: '#catalog', target: '_self' }, emitNavigate)
			expect(window.location.hash).toBe('#catalog')
			expect(openSpy).not.toHaveBeenCalled()
			expect(emitNavigate).toHaveBeenCalledWith('#catalog')
			window.location.hash = ''
		})

		it('navigateAndEmit без href и to ничего не открывает и не эмитит', () => {
			const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
			const emitNavigate = vi.fn()
			navigateAndEmit({}, emitNavigate)
			expect(openSpy).not.toHaveBeenCalled()
			expect(emitNavigate).not.toHaveBeenCalled()
		})
	})
})
