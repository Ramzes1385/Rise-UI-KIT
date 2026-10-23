/** Composable: анимация перестановки (FLIP) — элементы едут на новое место, контейнеры плавно меняют высоту */
import { watch, type Ref } from 'vue'
import type { SortableFlipMotion, SortableFlipOptions, SortableFlipTarget, SortableFlipTiming } from './types/useSortable.types'

const APPEAR = [
	{ opacity: 0, transform: 'scale(0.96)' },
	{ opacity: 1, transform: 'none' },
]

const elements = (root: HTMLElement | null, target: SortableFlipTarget): HTMLElement[] => [
	...(root?.querySelectorAll<HTMLElement>(target.selector) ?? []),
]

function measure(root: HTMLElement | null, target: SortableFlipTarget): Map<string, DOMRect> {
	return new Map(elements(root, target).map(element => [element.dataset[target.key] as string, element.getBoundingClientRect()]))
}

function itemFrames(old: DOMRect | undefined, now: DOMRect) {
	if (!old) return APPEAR
	if (old.left === now.left && old.top === now.top) return null
	return [{ transform: `translate(${old.left - now.left}px, ${old.top - now.top}px)` }, { transform: 'none' }]
}

function playItems(
	root: HTMLElement | null,
	target: SortableFlipTarget,
	before: { rects: Map<string, DOMRect>; timing: SortableFlipTiming },
): void {
	for (const element of elements(root, target)) {
		const frames = itemFrames(before.rects.get(element.dataset[target.key] as string), element.getBoundingClientRect())
		if (frames) element.animate?.(frames, before.timing)
	}
}

function playContainers(
	root: HTMLElement | null,
	target: SortableFlipTarget,
	before: { rects: Map<string, DOMRect>; timing: SortableFlipTiming },
): void {
	for (const element of elements(root, target)) {
		const old = before.rects.get(element.dataset[target.key] as string)
		const now = element.getBoundingClientRect()
		if (!old || old.height === now.height) continue
		element.animate?.([{ height: `${old.height}px` }, { height: `${now.height}px` }], before.timing)
	}
}

/**
 * Меряет положения до обновления DOM и проигрывает разницу после. Длительность и кривая — токены движения области
 * (`--rise-duration`, `--rise-ease-emphasized`), опция `duration` главнее; при выключенном движении (пресет `none`,
 * «уменьшить движение», `reducedMotion: 'always'`) — без анимации
 */
export function useSortableFlip(rootRef: Ref<HTMLElement | null>, options: SortableFlipOptions, motion: SortableFlipMotion): void {
	let items = new Map<string, DOMRect>()
	let containers = new Map<string, DOMRect>()
	watch(
		options.source,
		() => {
			items = measure(rootRef.value, options.items)
			if (options.containers) containers = measure(rootRef.value, options.containers)
		},
		{ flush: 'pre' },
	)
	watch(
		options.source,
		() => {
			if (motion.isReduced.value) return
			const timing = { duration: options.duration ?? motion.duration('base'), easing: motion.easing('emphasized') }
			playItems(rootRef.value, options.items, { rects: items, timing })
			if (options.containers) playContainers(rootRef.value, options.containers, { rects: containers, timing })
		},
		{ flush: 'post' },
	)
}
