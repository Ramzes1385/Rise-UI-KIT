import type { UseExpandTransitionOptions, UseExpandTransitionReturn } from './useExpandTransition.types'

const DEFAULT_DURATION = 300

function toHtmlEl(el: Element): HTMLElement {
	return el as HTMLElement
}

function resetStyles(el: HTMLElement): void {
	el.style.height = ''
	el.style.overflow = ''
	el.style.opacity = ''
	el.style.transition = ''
}

function applyTransition(el: HTMLElement, duration: number): void {
	el.style.transition = `height ${duration}ms ease, opacity ${duration}ms ease`
}

function useExpandTransition(options: UseExpandTransitionOptions = {}): UseExpandTransitionReturn {
	const duration = options.duration ?? DEFAULT_DURATION

	function onBeforeEnter(el: Element): void {
		const htmlEl = toHtmlEl(el)
		htmlEl.style.height = '0'
		htmlEl.style.overflow = 'hidden'
		htmlEl.style.opacity = '0'
	}

	function onEnter(el: Element, done: () => void): void {
		const htmlEl = toHtmlEl(el)
		const height = htmlEl.scrollHeight

		applyTransition(htmlEl, duration)

		requestAnimationFrame(() => {
			htmlEl.style.height = `${height}px`
			htmlEl.style.opacity = '1'
		})

		function onEnd(): void {
			resetStyles(htmlEl)
			htmlEl.removeEventListener('transitionend', onEnd)
			done()
		}

		htmlEl.addEventListener('transitionend', onEnd)
	}

	function onAfterEnter(el: Element): void {
		resetStyles(toHtmlEl(el))
	}

	function onBeforeLeave(el: Element): void {
		const htmlEl = toHtmlEl(el)
		htmlEl.style.height = `${htmlEl.scrollHeight}px`
		htmlEl.style.overflow = 'hidden'
	}

	function onLeave(el: Element, done: () => void): void {
		const htmlEl = toHtmlEl(el)

		applyTransition(htmlEl, duration)

		requestAnimationFrame(() => {
			htmlEl.style.height = '0'
			htmlEl.style.opacity = '0'
		})

		function onEnd(): void {
			resetStyles(htmlEl)
			htmlEl.removeEventListener('transitionend', onEnd)
			done()
		}

		htmlEl.addEventListener('transitionend', onEnd)
	}

	function onAfterLeave(el: Element): void {
		resetStyles(toHtmlEl(el))
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
