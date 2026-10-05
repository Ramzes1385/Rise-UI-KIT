import { Vector2, Vector3 } from 'three'
import type { Box3, Camera } from 'three'
import type { CardPlacement, ScreenSize, ScreenSpot } from '../../types/internal/imageMap3dInternal.types'

const CARD_GAP = 12
const CARD_MARGIN = 8

export function projectPoint(point: Vector3, camera: Camera, size: ScreenSize): ScreenSpot {
	camera.updateMatrixWorld()
	const ndc = point.clone().project(camera)
	const isInside = Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && Math.abs(ndc.z) <= 1
	return { x: ((ndc.x + 1) / 2) * size.width, y: ((1 - ndc.y) / 2) * size.height, isVisible: isInside }
}

export function boxAnchor(box: Box3): Vector3 {
	const anchor = box.getCenter(new Vector3())
	anchor.y = box.max.y
	return anchor
}

export function boxCenter(box: Box3): Vector3 {
	return box.getCenter(new Vector3())
}

export function toNdc(x: number, y: number, rect: DOMRect): Vector2 | null {
	if (!rect.width || !rect.height) return null
	return new Vector2(((x - rect.left) / rect.width) * 2 - 1, 1 - ((y - rect.top) / rect.height) * 2)
}

export function placeCard(anchor: ScreenSpot, card: ScreenSize, size: ScreenSize): CardPlacement {
	const half = card.width / 2
	const isBelow = anchor.y - CARD_GAP - card.height < 0
	const minLeft = half + CARD_MARGIN
	const maxLeft = Math.max(size.width - half - CARD_MARGIN, minLeft)
	return {
		left: Math.min(Math.max(anchor.x, minLeft), maxLeft),
		top: isBelow ? anchor.y + CARD_GAP : anchor.y - CARD_GAP,
		isBelow,
	}
}
