import type { Camera } from 'three'
import { projectPoint } from './projection'
import type {
	Scene3DLabelBox,
	Scene3DLabelItem,
	Scene3DLabelRect,
	Scene3DLabelSpot,
	Scene3DScreenSize,
} from '../types/internal/scene3dInternal.types'

const NO_BOX: Scene3DLabelBox = { width: 0, height: 0 }

function overlaps(first: Scene3DLabelRect, second: Scene3DLabelRect): boolean {
	return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top
}

function rectOf(spot: Scene3DLabelSpot, box: Scene3DLabelBox): Scene3DLabelRect {
	return { left: spot.x - box.width / 2, right: spot.x + box.width / 2, top: spot.y - box.height, bottom: spot.y }
}

/** Положения подписей на экране без учёта перекрытий: камера и размер холста → точки */
export function projectLabels(items: readonly Scene3DLabelItem[], camera: Camera, size: Scene3DScreenSize): Map<string, Scene3DLabelSpot> {
	return new Map(items.map(item => [item.id, projectPoint(item.anchor, camera, size)]))
}

/**
 * Жадное раскладывание: подписи по убыванию важности, закреплённые всегда первыми и видны,
 * вне экрана и перекрытые более важными — скрыты. Правит `isVisible` положений
 */
export function resolveOverlaps(
	items: readonly Scene3DLabelItem[],
	spots: Map<string, Scene3DLabelSpot>,
	boxes: ReadonlyMap<string, Scene3DLabelBox>,
): void {
	const placed: Scene3DLabelRect[] = []
	const ordered = [...items].sort((a, b) => Number(b.isPinned ?? false) - Number(a.isPinned ?? false) || b.priority - a.priority)
	ordered.forEach(item => {
		const spot = spots.get(item.id) as Scene3DLabelSpot
		const rect = rectOf(spot, boxes.get(item.id) ?? NO_BOX)
		const isFree = !placed.some(other => overlaps(other, rect))
		spot.isVisible = spot.isVisible && (item.isPinned === true || isFree)
		if (spot.isVisible) placed.push(rect)
	})
}
