/**
 * Unit-тесты для composable useExpandTransition.
 * Проверяют анимацию раскрытия/сворачивания через Transition-хуки Vue.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useExpandTransition } from './useExpandTransition'

describe('useExpandTransition', () => {
	let rafCallbacks: FrameRequestCallback[] = []
	let rafId = 0

	beforeEach(() => {
		vi.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
			rafId += 1
			rafCallbacks.push(callback)
			return rafId
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
		rafCallbacks = []
		rafId = 0
	})

	function flushRaf(): void {
		const callbacks = [...rafCallbacks]
		rafCallbacks = []
		callbacks.forEach(cb => cb(performance.now()))
	}

	function createElement(height = 100): HTMLElement {
		const el = document.createElement('div')
		el.style.height = `${height}px`
		Object.defineProperty(el, 'scrollHeight', { value: height, configurable: true })
		return el
	}

	describe('onBeforeEnter', () => {
		it('устанавливает начальные стили для анимации раскрытия', () => {
			const { onBeforeEnter } = useExpandTransition()
			const el = createElement()

			onBeforeEnter(el)

			expect(el.style.height).toBe('0px')
			expect(el.style.overflow).toBe('hidden')
			expect(el.style.opacity).toBe('0')
		})
	})

	describe('onEnter', () => {
		it('анимирует раскрытие и вызывает done после transitionend', () => {
			const { onEnter } = useExpandTransition()
			const el = createElement(120)
			const done = vi.fn()

			onEnter(el, done)
			flushRaf()

			expect(el.style.height).toBe('120px')
			expect(el.style.opacity).toBe('1')
			expect(el.style.transition).toContain('height 300ms ease')

			el.dispatchEvent(new Event('transitionend'))

			expect(done).toHaveBeenCalled()
			expect(el.style.height).toBe('')
			expect(el.style.overflow).toBe('')
			expect(el.style.opacity).toBe('')
			expect(el.style.transition).toBe('')
		})
	})

	describe('onAfterEnter', () => {
		it('сбрасывает inline-стили', () => {
			const { onAfterEnter } = useExpandTransition()
			const el = createElement()
			el.style.height = '120px'
			el.style.overflow = 'hidden'
			el.style.opacity = '1'
			el.style.transition = 'height 300ms ease'

			onAfterEnter(el)

			expect(el.style.height).toBe('')
			expect(el.style.overflow).toBe('')
			expect(el.style.opacity).toBe('')
			expect(el.style.transition).toBe('')
		})
	})

	describe('onBeforeLeave', () => {
		it('устанавливает текущую высоту перед сворачиванием', () => {
			const { onBeforeLeave } = useExpandTransition()
			const el = createElement(80)

			onBeforeLeave(el)

			expect(el.style.height).toBe('80px')
			expect(el.style.overflow).toBe('hidden')
		})
	})

	describe('onLeave', () => {
		it('анимирует сворачивание и вызывает done после transitionend', () => {
			const { onLeave } = useExpandTransition()
			const el = createElement(80)
			const done = vi.fn()

			onLeave(el, done)
			flushRaf()

			expect(el.style.height).toBe('0px')
			expect(el.style.opacity).toBe('0')
			expect(el.style.transition).toContain('height 300ms ease')

			el.dispatchEvent(new Event('transitionend'))

			expect(done).toHaveBeenCalled()
			expect(el.style.height).toBe('')
			expect(el.style.overflow).toBe('')
			expect(el.style.opacity).toBe('')
			expect(el.style.transition).toBe('')
		})
	})

	describe('onAfterLeave', () => {
		it('сбрасывает inline-стили', () => {
			const { onAfterLeave } = useExpandTransition()
			const el = createElement()
			el.style.height = '0px'
			el.style.overflow = 'hidden'
			el.style.opacity = '0'
			el.style.transition = 'height 300ms ease'

			onAfterLeave(el)

			expect(el.style.height).toBe('')
			expect(el.style.overflow).toBe('')
			expect(el.style.opacity).toBe('')
			expect(el.style.transition).toBe('')
		})
	})

	describe('кастомная длительность', () => {
		it('использует переданную длительность перехода', () => {
			const { onEnter } = useExpandTransition({ duration: 500 })
			const el = createElement(100)

			onEnter(el, vi.fn())
			flushRaf()

			expect(el.style.transition).toContain('height 500ms ease')
		})
	})
})
