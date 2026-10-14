import { getFixedOrigin } from '@utils/dom/domUtils'
import type { ChatMenuPlacement, ChatMenuPoint, ChatMenuSize } from '../../types/ChatMessageContextMenu.types'

const VIEWPORT_MARGIN = 8

function getViewport(): ChatMenuSize {
	const root = document.documentElement
	return { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight }
}

function placeAlongX(x: number, width: number, viewport: number): number {
	if (x + width + VIEWPORT_MARGIN <= viewport) return Math.max(VIEWPORT_MARGIN, x)
	if (x - width >= VIEWPORT_MARGIN) return x - width
	return Math.max(VIEWPORT_MARGIN, viewport - width - VIEWPORT_MARGIN)
}

function placeAlongY(y: number, height: number, viewport: number): Pick<ChatMenuPlacement, 'top' | 'maxHeight'> {
	const below = viewport - y - VIEWPORT_MARGIN
	const above = y - VIEWPORT_MARGIN
	if (height <= below) return { top: Math.max(VIEWPORT_MARGIN, y), maxHeight: undefined }
	if (height <= above) return { top: y - height, maxHeight: undefined }
	if (below >= above) return { top: Math.max(VIEWPORT_MARGIN, y), maxHeight: Math.max(0, below) }
	return { top: VIEWPORT_MARGIN, maxHeight: Math.max(0, above) }
}

export function placeContextMenu(point: ChatMenuPoint, menu: HTMLElement): ChatMenuPlacement {
	const size = { width: menu.offsetWidth, height: menu.offsetHeight }
	const origin = getFixedOrigin(menu.parentElement)
	if (size.width === 0 || size.height === 0) {
		return { top: point.y - origin.y, left: point.x - origin.x, maxHeight: undefined }
	}
	const viewport = getViewport()
	const vertical = placeAlongY(point.y, size.height, viewport.height)
	return {
		top: vertical.top - origin.y,
		left: placeAlongX(point.x, size.width, viewport.width) - origin.x,
		maxHeight: vertical.maxHeight,
	}
}
