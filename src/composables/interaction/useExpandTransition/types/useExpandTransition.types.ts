export interface UseExpandTransitionOptions {
	/**
	 * Длительность анимации в миллисекундах. По умолчанию — токен `--rise-duration-slow` элемента (320 мс в пресете
	 * `standard`). `0` — без анимации: конечное состояние сразу. При «уменьшить движение», пресете `none`
	 * и `reducedMotion: 'always'` анимации нет при любой длительности.
	 */
	duration?: number
}

export interface UseExpandTransitionReturn {
	onBeforeEnter: (el: Element) => void
	onEnter: (el: Element, done: () => void) => void
	onAfterEnter: (el: Element) => void
	onBeforeLeave: (el: Element) => void
	onLeave: (el: Element, done: () => void) => void
	onAfterLeave: (el: Element) => void
}

/** Конечное состояние шага анимации: высота, прозрачность и длительность перехода */
export interface ExpandFrame {
	height: string
	opacity: string
	duration: number
}
