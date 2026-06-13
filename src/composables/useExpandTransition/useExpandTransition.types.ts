export interface UseExpandTransitionOptions {
	/** Длительность анимации в миллисекундах */
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
