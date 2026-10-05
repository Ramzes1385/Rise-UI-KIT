import type { Ref } from 'vue'
import { nextTick, watch } from 'vue'
import { otherSide } from './transferSides'
import type { ListItem } from '@components/BaseList'
import { useMotion } from '@composables/app/useMotion'
import { TRANSFER_SIDES } from '../types/BaseTransfer.types'
import type {
	TransferAnimationOptions,
	TransferKeyframes,
	TransferMotionTiming,
	TransferProps,
	TransferSide,
	TransferSnapshot,
	TransferSnapshotItem,
} from '../types/BaseTransfer.types'

const SAFETY_MS = 50

function itemsOf(root: HTMLElement, side: TransferSide): HTMLElement[] {
	return [...root.querySelectorAll<HTMLElement>(`.base-transfer__panel--${side} .base-list__item[data-list-id]`)]
}

function snapshot(root: HTMLElement): TransferSnapshot {
	const items: TransferSnapshot = new Map()
	for (const side of TRANSFER_SIDES) {
		for (const element of itemsOf(root, side)) {
			const id = element.dataset.listId as string
			items.set(`${side}:${id}`, { element, rect: element.getBoundingClientRect(), side, id })
		}
	}
	return items
}

function animate(element: HTMLElement, frames: TransferKeyframes, options: TransferAnimationOptions): void {
	if (typeof element.animate === 'function') element.animate(frames, options)
}

function shiftFrom(side: TransferSide, timing: TransferMotionTiming): string {
	return side === 'source' ? timing.distance : `calc(${timing.distance} * -1)`
}

function fadeOut(item: TransferSnapshotItem, timing: TransferMotionTiming): void {
	const { side } = item
	const host = timing.root.querySelector<HTMLElement>(`.base-transfer__panel--${side} .base-transfer__list`)!
	const ghost = item.element.cloneNode(true) as HTMLElement
	const box = host.getBoundingClientRect()
	for (const node of [ghost, ...ghost.querySelectorAll('[id]')]) node.removeAttribute('id')
	ghost.classList.add('base-transfer__ghost')
	ghost.setAttribute('aria-hidden', 'true')
	ghost.inert = true
	Object.assign(ghost.style, {
		top: `${item.rect.top - box.top}px`,
		left: `${item.rect.left - box.left}px`,
		width: `${item.rect.width}px`,
		height: `${item.rect.height}px`,
	})
	host.append(ghost)
	const frames = [{ opacity: 1 }, { opacity: 0, transform: `translateX(${shiftFrom(side, timing)})` }]
	animate(ghost, frames, { duration: timing.fast, easing: timing.easing('in'), fill: 'forwards' })
	setTimeout(() => ghost.remove(), timing.fast + SAFETY_MS)
}

function play(before: TransferSnapshot, timing: TransferMotionTiming): void {
	const after = snapshot(timing.root)
	for (const [key, item] of before) {
		if (!after.has(key) && after.has(`${otherSide(item.side)}:${item.id}`)) fadeOut(item, timing)
	}
}

export function useTransferMotion<T extends ListItem>(props: TransferProps<T>, rootRef: Ref<HTMLElement | null>): void {
	const motion = useMotion(rootRef)

	watch(
		() => props.modelValue.join('\n'),
		() => {
			const root = rootRef.value
			if (!root || motion.isReduced.value) return
			const before = snapshot(root)
			const distance = getComputedStyle(root).getPropertyValue('--rise-motion-distance').trim() || '8px'
			const timing = { root, distance, fast: motion.duration('fast'), easing: motion.easing }
			void nextTick(() => play(before, timing))
		},
		{ flush: 'pre' },
	)
}
