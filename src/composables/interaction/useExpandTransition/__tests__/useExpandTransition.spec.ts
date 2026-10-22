import { useExpandTransition } from '../useExpandTransition'
import { readMotionDuration } from '@composables/app/useMotion'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const SLOW_DURATION = readMotionDuration(document.documentElement, 'slow')
const DEFAULT_HEIGHT_TRANSITION = `height ${SLOW_DURATION}ms var(--rise-ease-emphasized)`

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
			expect(el.style.transition).toContain(DEFAULT_HEIGHT_TRANSITION)

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
			expect(el.style.transition).toContain(DEFAULT_HEIGHT_TRANSITION)

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

			expect(el.style.transition).toContain('height 500ms var(--rise-ease-emphasized)')
		})
	})

	describe('prefers-reduced-motion', () => {
		function mockReducedMotion(matches: boolean): ReturnType<typeof vi.fn> {
			const matchMedia = vi.fn().mockReturnValue({ matches })
			vi.stubGlobal('matchMedia', matchMedia)
			return matchMedia
		}

		afterEach(() => {
			vi.unstubAllGlobals()
		})

		it('reduce: раскрытие сразу в конечном состоянии, без анимации и ожидания transitionend', () => {
			const matchMedia = mockReducedMotion(true)
			const { onBeforeEnter, onEnter } = useExpandTransition()
			const el = createElement(120)
			const done = vi.fn()

			onBeforeEnter(el)
			onEnter(el, done)

			expect(matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
			expect(done).toHaveBeenCalledOnce()
			expect(rafCallbacks).toHaveLength(0)
			expect(el.style.height).toBe('')
			expect(el.style.opacity).toBe('')
			expect(el.style.overflow).toBe('')
			expect(el.style.transition).toBe('')
		})

		it('reduce: сворачивание завершается сразу', () => {
			mockReducedMotion(true)
			const { onBeforeLeave, onLeave } = useExpandTransition()
			const el = createElement(80)
			const done = vi.fn()

			onBeforeLeave(el)
			onLeave(el, done)

			expect(done).toHaveBeenCalledOnce()
			expect(rafCallbacks).toHaveLength(0)
			expect(el.style.transition).toBe('')
		})

		it('no-preference: анимация как обычно', () => {
			mockReducedMotion(false)
			const { onEnter } = useExpandTransition()
			const el = createElement(120)
			const done = vi.fn()

			onEnter(el, done)
			flushRaf()

			expect(el.style.transition).toContain(DEFAULT_HEIGHT_TRANSITION)
			expect(done).not.toHaveBeenCalled()
		})

		it('без matchMedia (SSR, старые окружения) анимация остаётся', () => {
			vi.stubGlobal('matchMedia', undefined)
			const { onEnter } = useExpandTransition()
			const el = createElement(120)

			onEnter(el, vi.fn())

			expect(el.style.transition).toContain(DEFAULT_HEIGHT_TRANSITION)
		})
	})

	describe('нулевая длительность (EXP-1)', () => {
		it.each(['onEnter', 'onLeave'] as const)('%s при duration: 0 вызывает done сразу, без transitionend', hook => {
			const transition = useExpandTransition({ duration: 0 })
			const el = createElement(60)
			const done = vi.fn()

			transition[hook](el, done)

			expect(done).toHaveBeenCalledOnce()
			expect(rafCallbacks).toHaveLength(0)
			expect(el.style.transition).toBe('')
		})
	})

	describe('страховка, если transitionend не пришёл', () => {
		beforeEach(() => {
			vi.useFakeTimers()
		})

		afterEach(() => {
			vi.useRealTimers()
		})

		it.each(['onEnter', 'onLeave'] as const)('%s завершается по таймеру через duration + 50 мс', hook => {
			const transition = useExpandTransition({ duration: 200 })
			const el = createElement(60)
			const done = vi.fn()

			transition[hook](el, done)
			flushRaf()
			vi.advanceTimersByTime(249)
			expect(done).not.toHaveBeenCalled()

			vi.advanceTimersByTime(1)
			expect(done).toHaveBeenCalledOnce()
			expect(el.style.transition).toBe('')
			expect(el.style.height).toBe('')
		})

		it('после transitionend таймер не вызывает done второй раз, повторные события игнорируются', () => {
			const { onEnter } = useExpandTransition()
			const el = createElement(60)
			const done = vi.fn()

			onEnter(el, done)
			flushRaf()
			el.dispatchEvent(new Event('transitionend'))
			el.dispatchEvent(new Event('transitionend'))
			vi.advanceTimersByTime(1000)

			expect(done).toHaveBeenCalledOnce()
		})

		it('transitionend, всплывший от потомка, не завершает раскрытие', () => {
			const { onEnter } = useExpandTransition()
			const el = createElement(60)
			const child = document.createElement('span')
			el.append(child)
			const done = vi.fn()

			onEnter(el, done)
			flushRaf()
			child.dispatchEvent(new Event('transitionend', { bubbles: true }))

			expect(done).not.toHaveBeenCalled()

			el.dispatchEvent(new Event('transitionend'))
			expect(done).toHaveBeenCalledOnce()
		})

		it('сворачивание во время раскрытия отменяет ожидание раскрытия: его done и сброс стилей не приходят', () => {
			const { onEnter, onLeave } = useExpandTransition()
			const el = createElement(60)
			const enterDone = vi.fn()
			const leaveDone = vi.fn()

			onEnter(el, enterDone)
			flushRaf()
			onLeave(el, leaveDone)
			flushRaf()
			vi.advanceTimersByTime(SLOW_DURATION + 49)

			expect(enterDone).not.toHaveBeenCalled()
			expect(el.style.height).toBe('0px')

			vi.advanceTimersByTime(1)
			expect(leaveDone).toHaveBeenCalledOnce()
			expect(enterDone).not.toHaveBeenCalled()
		})
	})
})
