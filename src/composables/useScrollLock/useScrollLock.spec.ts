import '@testing-library/jest-dom/vitest'

import { useScrollLock } from './useScrollLock'

describe('useScrollLock', () => {
	beforeEach(() => {
		document.body.style.overflow = ''
		document.body.style.paddingRight = ''
	})

	it('блокирует скролл', () => {
		const { lock } = useScrollLock()
		lock()
		expect(document.body.style.overflow).toBe('hidden')
	})

	it('разблокирует скролл', () => {
		const { lock, unlock } = useScrollLock()
		lock()
		unlock()
		expect(document.body.style.overflow).toBe('')
	})

	it('идемпотентный lock', () => {
		const { lock } = useScrollLock()
		lock()
		lock()
		expect(document.body.style.overflow).toBe('hidden')
	})

	it('идемпотентный unlock', () => {
		const { unlock } = useScrollLock()
		unlock()
		expect(document.body.style.overflow).toBe('')
	})

	it('восстанавливает предыдущий overflow', () => {
		document.body.style.overflow = 'auto'
		const { lock, unlock } = useScrollLock()
		lock()
		unlock()
		expect(document.body.style.overflow).toBe('auto')
	})

	it('добавляет paddingRight при наличии скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		const { lock } = useScrollLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')
	})

	it('не добавляет paddingRight без скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1200, configurable: true })
		const { lock } = useScrollLock()
		lock()
		expect(document.body.style.paddingRight).toBe('')
	})

	it('восстанавливает paddingRight после unlock при наличии скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		document.body.style.paddingRight = '10px'

		const { lock, unlock } = useScrollLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')

		unlock()
		expect(document.body.style.paddingRight).toBe('10px')
	})

	it('сохраняет предыдущий paddingRight при lock', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		document.body.style.paddingRight = '8px'

		const { lock, unlock } = useScrollLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')

		unlock()
		expect(document.body.style.paddingRight).toBe('8px')
	})

	it('корректно работает при повторном lock/unlock цикле', () => {
		document.body.style.overflow = 'auto'

		const { lock, unlock } = useScrollLock()
		lock()
		expect(document.body.style.overflow).toBe('hidden')

		unlock()
		expect(document.body.style.overflow).toBe('auto')

		// Сбрасываем для второго цикла
		document.body.style.overflow = 'scroll'
		lock()
		expect(document.body.style.overflow).toBe('hidden')

		unlock()
		expect(document.body.style.overflow).toBe('scroll')
	})
})
