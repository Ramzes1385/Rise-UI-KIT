import '@testing-library/jest-dom/vitest'
import { useScrollLock } from './useScrollLock'
import type { UseScrollLockReturn } from './useScrollLock.types'

/** Экземпляры, созданные в тесте: блокировки общие для модуля, поэтому снимаем их после каждого теста */
const createdLocks: UseScrollLockReturn[] = []

/** Создать экземпляр useScrollLock с автоматической разблокировкой в afterEach */
function createLock(): UseScrollLockReturn {
	const instance = useScrollLock()
	createdLocks.push(instance)
	return instance
}

describe('useScrollLock', () => {
	beforeEach(() => {
		document.body.style.overflow = ''
		document.body.style.paddingRight = ''
	})

	afterEach(() => {
		createdLocks.splice(0).forEach(instance => instance.unlock())
	})

	it('блокирует скролл', () => {
		const { lock } = createLock()
		lock()
		expect(document.body.style.overflow).toBe('hidden')
	})

	it('разблокирует скролл', () => {
		const { lock, unlock } = createLock()
		lock()
		unlock()
		expect(document.body.style.overflow).toBe('')
	})

	it('идемпотентный lock', () => {
		const { lock } = createLock()
		lock()
		lock()
		expect(document.body.style.overflow).toBe('hidden')
	})

	it('идемпотентный unlock', () => {
		const { unlock } = createLock()
		unlock()
		expect(document.body.style.overflow).toBe('')
	})

	it('восстанавливает предыдущий overflow', () => {
		document.body.style.overflow = 'auto'
		const { lock, unlock } = createLock()
		lock()
		unlock()
		expect(document.body.style.overflow).toBe('auto')
	})

	it('добавляет paddingRight при наличии скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		const { lock } = createLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')
	})

	it('не добавляет paddingRight без скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1200, configurable: true })
		const { lock } = createLock()
		lock()
		expect(document.body.style.paddingRight).toBe('')
	})

	it('восстанавливает paddingRight после unlock при наличии скроллбара', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		document.body.style.paddingRight = '10px'

		const { lock, unlock } = createLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')

		unlock()
		expect(document.body.style.paddingRight).toBe('10px')
	})

	it('сохраняет предыдущий paddingRight при lock', () => {
		Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
		Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
		document.body.style.paddingRight = '8px'

		const { lock, unlock } = createLock()
		lock()
		expect(document.body.style.paddingRight).toBe('16px')

		unlock()
		expect(document.body.style.paddingRight).toBe('8px')
	})

	it('корректно работает при повторном lock/unlock цикле', () => {
		document.body.style.overflow = 'auto'

		const { lock, unlock } = createLock()
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

	describe('несколько экземпляров (общий счётчик блокировок)', () => {
		it('при закрытии не в порядке LIFO восстанавливает стили только после последнего unlock', () => {
			Object.defineProperty(window, 'innerWidth', { value: 1200, configurable: true })
			Object.defineProperty(document.documentElement, 'clientWidth', { value: 1184, configurable: true })
			document.body.style.overflow = 'auto'
			document.body.style.paddingRight = '10px'

			const modal = createLock()
			const slideover = createLock()
			modal.lock()
			slideover.lock()

			// Первым закрывается окно, открытое раньше: slideover ещё открыт
			modal.unlock()
			expect(document.body.style.overflow).toBe('hidden')
			expect(document.body.style.paddingRight).toBe('16px')

			slideover.unlock()
			expect(document.body.style.overflow).toBe('auto')
			expect(document.body.style.paddingRight).toBe('10px')
		})

		it('повторные lock/unlock одного экземпляра не сбивают счётчик', () => {
			const first = createLock()
			const second = createLock()

			first.lock()
			first.lock()
			second.lock()
			first.unlock()
			first.unlock()
			expect(document.body.style.overflow).toBe('hidden')

			// unlock экземпляра без блокировки не должен снимать чужую
			createLock().unlock()
			expect(document.body.style.overflow).toBe('hidden')

			second.unlock()
			expect(document.body.style.overflow).toBe('')
		})
	})
})
