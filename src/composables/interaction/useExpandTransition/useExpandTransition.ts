/** Composable: Vue transition-хуки анимации expand/collapse */
import { toHTMLElement } from '@utils/dom/domUtils'
import { readMotionDuration } from '@composables/app/useMotion'
import type { ExpandFrame, UseExpandTransitionOptions, UseExpandTransitionReturn } from './types/useExpandTransition.types'

const FALLBACK_MARGIN = 50
const HEIGHT_EASING = 'var(--rise-ease-emphasized)'
const OPACITY_EASING = 'var(--rise-ease)'

const pendingTransitions = new WeakMap<HTMLElement, () => void>()

function resetStyles(el: HTMLElement): void {
	el.style.height = ''
	el.style.overflow = ''
	el.style.opacity = ''
	el.style.transition = ''
}

function applyTransition(el: HTMLElement, duration: number): void {
	el.style.transition = `height ${duration}ms ${HEIGHT_EASING}, opacity ${duration}ms ${OPACITY_EASING}`
}

function cancelPending(el: HTMLElement): void {
	pendingTransitions.get(el)?.()
}

/**
 * Ждёт конца перехода: `transitionend` самого элемента (всплывшие от потомков не считаются) или таймер-страховка
 * на `duration` + 50 мс — событие не приходит, если переход не начался (элемент скрыт, стили перебиты, длительность 0).
 * Завершение срабатывает один раз; новый переход того же элемента отменяет ожидание прежнего.
 */
function waitForTransition(el: HTMLElement, duration: number, done: () => void): void {
	function cleanup(): void {
		clearTimeout(timer)
		el.removeEventListener('transitionend', onTransitionEnd)
		pendingTransitions.delete(el)
	}

	function finish(): void {
		cleanup()
		resetStyles(el)
		done()
	}

	function onTransitionEnd(event: Event): void {
		if (event.target === el) finish()
	}

	const timer = setTimeout(finish, duration + FALLBACK_MARGIN)
	el.addEventListener('transitionend', onTransitionEnd)
	pendingTransitions.set(el, cleanup)
}

function finishInstantly(el: HTMLElement, done: () => void): void {
	resetStyles(el)
	done()
}

/** Длительность кадра: заданная явно — только если движение не выключено; иначе — токен `--rise-duration-slow` элемента */
function resolveDuration(el: HTMLElement, duration: number | undefined): number {
	const fromTokens = readMotionDuration(el, 'slow')
	if (fromTokens === 0 || duration === undefined) return fromTokens
	return duration
}

function animate(el: HTMLElement, frame: ExpandFrame, done: () => void): void {
	cancelPending(el)
	if (frame.duration <= 0) {
		finishInstantly(el, done)
		return
	}
	applyTransition(el, frame.duration)
	requestAnimationFrame(() => {
		el.style.height = frame.height
		el.style.opacity = frame.opacity
	})
	waitForTransition(el, frame.duration, done)
}

/**
 * Хуки `<Transition>` для раскрытия по высоте: от 0 до `scrollHeight` и обратно, с прозрачностью.
 * Длительность по умолчанию — токен `--rise-duration-slow` элемента (пресет `data-rise-motion` действует), кривая высоты —
 * `--rise-ease-emphasized`, прозрачности — `--rise-ease`. При «уменьшить движение», пресете `none`,
 * `reducedMotion: 'always'` и при `duration: 0` анимации нет — элемент сразу в конечном состоянии.
 *
 * @example
 * ```ts
 * const expand = useExpandTransition({ duration: 200 })
 * // <Transition :css="false" @before-enter="expand.onBeforeEnter" @enter="expand.onEnter" …>
 * ```
 */
function useExpandTransition(options: UseExpandTransitionOptions = {}): UseExpandTransitionReturn {
	function onBeforeEnter(el: Element): void {
		const htmlEl = toHTMLElement(el)!
		htmlEl.style.height = '0'
		htmlEl.style.overflow = 'hidden'
		htmlEl.style.opacity = '0'
	}

	function onEnter(el: Element, done: () => void): void {
		const htmlEl = toHTMLElement(el)!
		animate(htmlEl, { height: `${htmlEl.scrollHeight}px`, opacity: '1', duration: resolveDuration(htmlEl, options.duration) }, done)
	}

	function onAfterEnter(el: Element): void {
		resetStyles(toHTMLElement(el)!)
	}

	function onBeforeLeave(el: Element): void {
		const htmlEl = toHTMLElement(el)!
		htmlEl.style.height = `${htmlEl.scrollHeight}px`
		htmlEl.style.overflow = 'hidden'
	}

	function onLeave(el: Element, done: () => void): void {
		const htmlEl = toHTMLElement(el)!
		animate(htmlEl, { height: '0', opacity: '0', duration: resolveDuration(htmlEl, options.duration) }, done)
	}

	function onAfterLeave(el: Element): void {
		resetStyles(toHTMLElement(el)!)
	}

	return {
		onBeforeEnter,
		onEnter,
		onAfterEnter,
		onBeforeLeave,
		onLeave,
		onAfterLeave,
	}
}

export { useExpandTransition }
