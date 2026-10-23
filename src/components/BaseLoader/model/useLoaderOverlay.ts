import { onBeforeUnmount, onMounted, type Ref, watch } from 'vue'
import type { LoaderCoveredElement as CoveredElement } from '../types/BaseLoader.types'

const registry = new WeakMap<Element, CoveredElement>()

function isCoverable(element: Element, root: HTMLElement): boolean {
	if (element === root || element.classList.contains('base-loader--overlay')) return false
	return registry.has(element) || !element.hasAttribute('inert')
}

function coverElement(element: Element, owner: HTMLElement): CoveredElement {
	const existing = registry.get(element)
	if (existing) {
		existing.owners.add(owner)
		return existing
	}
	const entry: CoveredElement = { busy: element.getAttribute('aria-busy'), owners: new Set([owner]) }
	registry.set(element, entry)
	element.setAttribute('inert', '')
	element.setAttribute('aria-busy', 'true')
	return entry
}

function uncoverElement(element: Element, entry: CoveredElement, owner: HTMLElement): void {
	entry.owners.delete(owner)
	if (entry.owners.size > 0) return
	registry.delete(element)
	element.removeAttribute('inert')
	if (entry.busy === null) element.removeAttribute('aria-busy')
	else element.setAttribute('aria-busy', entry.busy)
}

function cover(root: HTMLElement): Map<Element, CoveredElement> {
	const siblings = Array.from(root.parentElement?.children ?? []).filter(element => isCoverable(element, root))
	return new Map(siblings.map(element => [element, coverElement(element, root)]))
}

export function useLoaderOverlay(rootRef: Ref<HTMLElement | null>, getIsOverlay: () => boolean): void {
	let covered = new Map<Element, CoveredElement>()
	let owner: HTMLElement | null = null
	const release = (): void => {
		const current = owner
		if (current) covered.forEach((entry, element) => uncoverElement(element, entry, current))
		covered = new Map()
		owner = null
	}

	const apply = (): void => {
		release()
		if (!rootRef.value || !getIsOverlay()) return
		owner = rootRef.value
		covered = cover(owner)
	}

	onMounted(apply)
	watch(getIsOverlay, apply, { flush: 'post' })
	onBeforeUnmount(release)
}
