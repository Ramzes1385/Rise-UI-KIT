import type { AnchorItem, AnchorLink, AnchorScrollTarget as ScrollTarget } from '../types/BaseAnchor.types'

export function resolveElement(value: string | HTMLElement | undefined): HTMLElement | null {
	if (!value) return null
	return typeof value === 'string' ? document.querySelector<HTMLElement>(value) : value
}

export function flattenItems(items: AnchorItem[], level = 0): AnchorLink[] {
	return items.flatMap(item => [{ id: item.id, label: item.label, level }, ...flattenItems(item.children ?? [], level + 1)])
}

function headingRank(element: Element): number {
	const match = /^H([1-6])$/.exec(element.tagName)
	return match ? Number(match[1]) : 0
}

export function collectHeadings(root: Element, selector: string, idPrefix: string): AnchorLink[] {
	const found = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(element => element.textContent?.trim())
	const ranks = found.map(headingRank)
	const minRank = Math.min(...ranks)
	return found.map((element, index) => {
		if (!element.id) element.id = `${idPrefix}-${index}`
		return { id: element.id, label: element.textContent!.trim(), level: ranks[index]! - minRank }
	})
}

export function isPlainClick(event: MouseEvent): boolean {
	return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
}

function prefersReducedMotion(): boolean {
	return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function rootTop(target: ScrollTarget): number {
	return target === window ? 0 : (target as HTMLElement).getBoundingClientRect().top
}

export function findCurrent(links: AnchorLink[], target: ScrollTarget, offset: number): string | undefined {
	const line = rootTop(target) + offset + 8
	let current = links[0]?.id
	for (const link of links) {
		const element = document.getElementById(link.id)
		if (element && element.getBoundingClientRect().top <= line) current = link.id
	}
	return current
}

export function scrollToSection(target: ScrollTarget, element: HTMLElement, offset: number): void {
	const scrollTop = target === window ? window.scrollY : (target as HTMLElement).scrollTop
	const top = element.getBoundingClientRect().top - rootTop(target) + scrollTop - offset
	target.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function focusSection(element: HTMLElement): void {
	if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
		element.setAttribute('tabindex', '-1')
		element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true })
	}
	element.focus({ preventScroll: true })
}
