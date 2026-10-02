/** Composable: анимация перестановки (FLIP) — элементы едут на новое место, контейнеры плавно меняют высоту */
import { watch, type Ref } from 'vue'
import type { SortableFlipOptions, SortableFlipTarget } from './types/useSortable.types'

const DURATION = 220

const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)'

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

function playItems(root: HTMLElement | null, target: SortableFlipTarget, before: { rects: Map<string, DOMRect>; duration: number }): void {
	for (const element of elements(root, target)) {
		const frames = itemFrames(before.rects.get(element.dataset[target.key] as string), element.getBoundingClientRect())
		if (frames) element.animate?.(frames, { duration: before.duration, easing: EASING })
	}
}

function playContainers(
	root: HTMLElement | null,
	target: SortableFlipTarget,
	before: { rects: Map<string, DOMRect>; duration: number },
): void {
	for (const element of elements(root, target)) {
		const old = before.rects.get(element.dataset[target.key] as string)
		const now = element.getBoundingClientRect()
		if (!old || old.height === now.height) continue
		element.animate?.([{ height: `${old.height}px` }, { height: `${now.height}px` }], { duration: before.duration, easing: EASING })
	}
}

/** Меряет положения до обновления DOM и проигрывает разницу после; при «уменьшить движение» — без анимации */
export function useSortableFlip(
	rootRef: Ref<HTMLElement | null>,
	options: SortableFlipOptions,
	isReducedMotion: Readonly<Ref<boolean>>,
): void {
	const duration = options.duration ?? DURATION
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
			if (isReducedMotion.value) return
			playItems(rootRef.value, options.items, { rects: items, duration })
			if (options.containers) playContainers(rootRef.value, options.containers, { rects: containers, duration })
		},
		{ flush: 'post' },
	)
}
