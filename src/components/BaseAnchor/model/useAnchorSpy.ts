import { onBeforeUnmount } from 'vue'
import { findCurrent, SECTION_LINE_GAP } from './anchorDom'
import type { AnchorSpyOptions, AnchorScrollTarget as ScrollTarget } from '../types/BaseAnchor.types'

const SCROLL_LOCK_FALLBACK_MS = 1000
const SCROLL_END_DEBOUNCE_MS = 100

function onScrollEnd(target: ScrollTarget, callback: () => void): () => void {
	if ('onscrollend' in window) {
		target.addEventListener('scrollend', callback)
		return () => target.removeEventListener('scrollend', callback)
	}
	let timer: ReturnType<typeof setTimeout> | undefined
	const handleScroll = (): void => {
		clearTimeout(timer)
		timer = setTimeout(callback, SCROLL_END_DEBOUNCE_MS)
	}
	target.addEventListener('scroll', handleScroll, { passive: true })
	return () => {
		clearTimeout(timer)
		target.removeEventListener('scroll', handleScroll)
	}
}

function useScrollLock() {
	let isLocked = false
	let timer: ReturnType<typeof setTimeout> | undefined
	let release = (): void => {}

	return {
		isLocked: () => isLocked,
		lock(target: ScrollTarget): void {
			release()
			isLocked = true
			const unlock = (): void => release()
			release = (): void => {
				isLocked = false
				clearTimeout(timer)
				target.removeEventListener('scrollend', unlock)
				release = (): void => {}
			}
			target.addEventListener('scrollend', unlock, { once: true })
			timer = setTimeout(unlock, SCROLL_LOCK_FALLBACK_MS)
		},
		release: () => release(),
	}
}

export function useAnchorSpy(options: AnchorSpyOptions) {
	const scrollLock = useScrollLock()
	let observer: IntersectionObserver | null = null
	let stopScrollEnd = (): void => {}
	let target: ScrollTarget = window

	const update = (): void => {
		if (scrollLock.isLocked()) return
		const current = findCurrent(options.getLinks(), target, options.getOffset())
		if (current) options.onChange(current)
	}

	const stop = (): void => {
		observer?.disconnect()
		observer = null
		stopScrollEnd()
		stopScrollEnd = (): void => {}
		scrollLock.release()
	}

	const start = (nextTarget: ScrollTarget): void => {
		stop()
		target = nextTarget
		update()
		if (typeof IntersectionObserver === 'undefined') return
		const root = target === window ? null : (target as HTMLElement)
		const rootMargin = `-${options.getOffset() + SECTION_LINE_GAP}px 0px 0px 0px`
		observer = new IntersectionObserver(update, { root, rootMargin, threshold: [0, 1] })
		stopScrollEnd = onScrollEnd(target, update)
		for (const link of options.getLinks()) {
			const element = document.getElementById(link.id)
			if (element) observer.observe(element)
		}
	}

	onBeforeUnmount(stop)

	return { start, lockUntilScrollEnd: () => scrollLock.lock(target), getTarget: () => target }
}
