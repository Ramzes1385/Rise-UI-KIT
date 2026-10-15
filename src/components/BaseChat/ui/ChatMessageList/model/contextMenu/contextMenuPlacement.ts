import { getFixedOrigin, toFixedSpace } from '@utils/dom/domUtils'
import type { ChatMenuPlacement, ChatMenuPoint, ChatMenuSize } from '../../types/ChatMessageContextMenu.types'

const VIEWPORT_MARGIN = 8

function getViewport(ownerDocument: Document): ChatMenuSize {
	const root = ownerDocument.documentElement
	const view = ownerDocument.defaultView
	return { width: root.clientWidth || view?.innerWidth || 0, height: root.clientHeight || view?.innerHeight || 0 }
}

function placeAlongX(x: number, width: number, viewport: number): number {
	if (x + width + VIEWPORT_MARGIN <= viewport) return Math.max(VIEWPORT_MARGIN, x)
	if (x - width >= VIEWPORT_MARGIN) return x - width
	return Math.max(VIEWPORT_MARGIN, viewport - width - VIEWPORT_MARGIN)
}

function placeAlongY(point: ChatMenuPoint, height: number, viewport: number): Pick<ChatMenuPlacement, 'top' | 'maxHeight'> {
	const { y } = point
	const flipY = point.anchorY ?? y
	const below = viewport - y - VIEWPORT_MARGIN
	const above = flipY - VIEWPORT_MARGIN
	if (height <= below) return { top: Math.max(VIEWPORT_MARGIN, y), maxHeight: undefined }
	if (height <= above) return { top: flipY - height, maxHeight: undefined }
	if (below >= above) return { top: Math.max(VIEWPORT_MARGIN, y), maxHeight: Math.max(0, below) }
	return { top: VIEWPORT_MARGIN, maxHeight: Math.max(0, above) }
}

function measureMenu(menu: HTMLElement): ChatMenuSize {
	const previousLeft = menu.style.left
	menu.style.left = '0px'
	const size = { width: menu.offsetWidth, height: menu.offsetHeight }
	menu.style.left = previousLeft
	return size
}

export function placeContextMenu(point: ChatMenuPoint, menu: HTMLElement): ChatMenuPlacement {
	const size = measureMenu(menu)
	const origin = getFixedOrigin(menu.parentElement)
	if (size.width === 0 || size.height === 0) {
		const local = toFixedSpace(origin, point.x, point.y)
		return { top: local.y, left: local.x, maxHeight: undefined }
	}
	const viewport = getViewport(menu.ownerDocument)
	const vertical = placeAlongY(point, size.height, viewport.height)
	const local = toFixedSpace(origin, placeAlongX(point.x, size.width, viewport.width), vertical.top)
	return { top: local.y, left: local.x, maxHeight: vertical.maxHeight }
}
