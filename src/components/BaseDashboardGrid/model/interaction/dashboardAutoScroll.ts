import type { DashboardScrollBounds, DashboardScrollDelta, DashboardScrollPoint } from '../../types/BaseDashboardGrid.types'

const EDGE_ZONE = 56
const MAX_SPEED = 24
const SCROLLABLE = /auto|scroll|overlay/

export function edgeSpeed(position: number, min: number, max: number): number {
	const zone = Math.min(EDGE_ZONE, (max - min) / 2)
	if (zone <= 0) return 0
	const toStart = (min + zone - position) / zone
	const toEnd = (position - (max - zone)) / zone
	if (toStart > 0) return -Math.ceil(MAX_SPEED * Math.min(1, toStart))
	return toEnd > 0 ? Math.ceil(MAX_SPEED * Math.min(1, toEnd)) : 0
}

export function findScrollParent(element: HTMLElement | null): HTMLElement | null {
	for (let node = element?.parentElement; node && node !== document.body; node = node.parentElement) {
		const style = getComputedStyle(node)
		const isScrollableY = SCROLLABLE.test(style.overflowY) && node.scrollHeight > node.clientHeight
		const isScrollableX = SCROLLABLE.test(style.overflowX) && node.scrollWidth > node.clientWidth
		if (isScrollableY || isScrollableX) return node
	}
	return null
}

function viewportBounds(): DashboardScrollBounds {
	return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight }
}

function visibleBounds(element: HTMLElement): DashboardScrollBounds {
	const rect = element.getBoundingClientRect()
	const view = viewportBounds()
	return {
		left: Math.max(rect.left, view.left),
		top: Math.max(rect.top, view.top),
		right: Math.min(rect.right, view.right),
		bottom: Math.min(rect.bottom, view.bottom),
	}
}

function speedIn(point: DashboardScrollPoint, bounds: DashboardScrollBounds): DashboardScrollDelta {
	return { dx: edgeSpeed(point.x, bounds.left, bounds.right), dy: edgeSpeed(point.y, bounds.top, bounds.bottom) }
}

const NO_SCROLL: DashboardScrollDelta = { dx: 0, dy: 0 }

function isIdle(speed: DashboardScrollDelta): boolean {
	return speed.dx === 0 && speed.dy === 0
}

function scrollElement(element: HTMLElement, speed: DashboardScrollDelta): DashboardScrollDelta {
	if (isIdle(speed)) return NO_SCROLL
	const left = element.scrollLeft
	const top = element.scrollTop
	element.scrollLeft = left + speed.dx
	element.scrollTop = top + speed.dy
	return { dx: element.scrollLeft - left, dy: element.scrollTop - top }
}

function scrollWindow(speed: DashboardScrollDelta): DashboardScrollDelta {
	if (isIdle(speed)) return NO_SCROLL
	const left = window.scrollX
	const top = window.scrollY
	window.scrollBy(speed.dx, speed.dy)
	return { dx: window.scrollX - left, dy: window.scrollY - top }
}

export function autoScrollStep(root: HTMLElement | null, point: DashboardScrollPoint): DashboardScrollDelta {
	const parent = findScrollParent(root)
	const inParent = parent ? scrollElement(parent, speedIn(point, visibleBounds(parent))) : NO_SCROLL
	const inWindow = scrollWindow(speedIn(point, viewportBounds()))
	return { dx: inParent.dx + inWindow.dx, dy: inParent.dy + inWindow.dy }
}
