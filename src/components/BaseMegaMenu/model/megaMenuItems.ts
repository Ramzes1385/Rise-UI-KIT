import type { MegaMenuDrilldown, MegaMenuItem, MegaMenuLink } from '../types/BaseMegaMenu.types'

export function getItemKey(item: MegaMenuItem | MegaMenuLink): string {
	return item.key ?? item.label
}

export function hasPanel(item: MegaMenuItem): boolean {
	return Boolean(item.groups?.length || item.promo)
}

export function hasChildren(link: MegaMenuLink): boolean {
	return Boolean(link.children?.length)
}

function getLinksDepth(links: MegaMenuLink[]): number {
	return links.length ? 1 + Math.max(...links.map(link => getLinksDepth(link.children ?? []))) : 0
}

export function getCatalogDepth(item: MegaMenuItem): number {
	return Math.max(0, ...(item.groups ?? []).map(group => getLinksDepth(group.items)))
}

export function isDrilldownItem(item: MegaMenuItem, mode: MegaMenuDrilldown, from: number): boolean {
	return mode === 'always' || (mode === 'auto' && getCatalogDepth(item) >= from)
}

export function getFocusable(container: Element | null | undefined, selector: string): HTMLElement[] {
	if (!container) return []
	return [...container.querySelectorAll<HTMLElement>(selector)].filter(
		element => !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true',
	)
}

export function getNextIndex(key: string, current: number, length: number): number {
	if (key === 'Home') return 0
	if (key === 'End') return length - 1
	if (key === 'ArrowRight' || key === 'ArrowDown') return (current + 1) % length
	if (key === 'ArrowLeft' || key === 'ArrowUp') return (current - 1 + length) % length
	return -1
}

export function getPanelLinks(container: Element | null | undefined, selector: string): HTMLElement[] {
	return getFocusable(container, selector).filter(element => !element.closest('.base-mega-menu__sub'))
}
