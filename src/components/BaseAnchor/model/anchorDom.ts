import type {
	AnchorItem,
	AnchorLink,
	AnchorScrollOptions as ScrollOptions,
	AnchorScrollTarget as ScrollTarget,
} from '../types/BaseAnchor.types'

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

function rootTop(target: ScrollTarget): number {
	return target === window ? 0 : (target as HTMLElement).getBoundingClientRect().top
}

export const SECTION_LINE_GAP = 8

function isScrolledToEnd(target: ScrollTarget): boolean {
	const element = target === window ? document.documentElement : (target as HTMLElement)
	const [scrollTop, viewport] = target === window ? [window.scrollY, window.innerHeight] : [element.scrollTop, element.clientHeight]
	return scrollTop > 0 && element.scrollHeight > viewport && scrollTop + viewport >= element.scrollHeight - 1
}

export function findCurrent(links: AnchorLink[], target: ScrollTarget, offset: number): string | undefined {
	const elements = links.map(link => document.getElementById(link.id)).filter(element => element !== null)
	if (elements.length > 0 && isScrolledToEnd(target)) return elements[elements.length - 1]!.id
	const line = rootTop(target) + offset + SECTION_LINE_GAP
	let current = links[0]?.id
	for (const element of elements) {
		if (element.getBoundingClientRect().top < line) current = element.id
	}
	return current
}

export function scrollToSection(target: ScrollTarget, element: HTMLElement, { offset, isReducedMotion }: ScrollOptions): void {
	const scrollTop = target === window ? window.scrollY : (target as HTMLElement).scrollTop
	const top = element.getBoundingClientRect().top - rootTop(target) + scrollTop - offset
	target.scrollTo({ top, behavior: isReducedMotion ? 'auto' : 'smooth' })
}

export function focusSection(element: HTMLElement): void {
	if (element.tabIndex < 0 && !element.hasAttribute('tabindex')) {
		element.setAttribute('tabindex', '-1')
		element.addEventListener('blur', () => element.removeAttribute('tabindex'), { once: true })
	}
	element.focus({ preventScroll: true })
}
