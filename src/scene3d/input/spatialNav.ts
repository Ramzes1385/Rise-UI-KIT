import type { Scene3DDirection, Scene3DSpot } from '../types/internal/scene3dGeometry.types'

const SIDE_WEIGHT = 2

function reading(first: Scene3DSpot, second: Scene3DSpot): number {
	return first.y - second.y || first.x - second.x
}

function offsets(from: Scene3DSpot, to: Scene3DSpot, direction: Scene3DDirection): { along: number; across: number } {
	const [dx, dy] = [to.x - from.x, to.y - from.y]
	if (direction === 'left') return { along: -dx, across: Math.abs(dy) }
	if (direction === 'right') return { along: dx, across: Math.abs(dy) }
	return direction === 'up' ? { along: -dy, across: Math.abs(dx) } : { along: dy, across: Math.abs(dx) }
}

/** Первый объект в порядке чтения: сверху вниз, слева направо */
export function firstSpot(spots: readonly Scene3DSpot[]): Scene3DSpot | null {
	return [...spots].sort(reading)[0] ?? null
}

/** Последний объект в порядке чтения */
export function lastSpot(spots: readonly Scene3DSpot[]): Scene3DSpot | null {
	return [...spots].sort(reading).pop() ?? null
}

/**
 * Сосед по стрелке на экране: среди объектов впереди по направлению — с наименьшим `вперёд + 2 × вбок`.
 * Нет текущего — первый в порядке чтения; впереди никого — `null` (фокус остаётся)
 */
export function nextSpot(spots: readonly Scene3DSpot[], currentId: string | null, direction: Scene3DDirection): Scene3DSpot | null {
	const from = spots.find(spot => spot.id === currentId)
	if (!from) return firstSpot(spots)
	const scored = spots
		.filter(spot => spot.id !== from.id)
		.map(spot => ({ spot, ...offsets(from, spot, direction) }))
		.filter(entry => entry.along > 0)
		.map(entry => ({ spot: entry.spot, score: entry.along + entry.across * SIDE_WEIGHT }))
	return scored.sort((a, b) => a.score - b.score)[0]?.spot ?? null
}
