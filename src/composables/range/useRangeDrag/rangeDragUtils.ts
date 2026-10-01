/** Утилиты: положение указателя на треке range-слайдера, ближайший ползунок и шаг клавиатуры */

/** Описание: доля трека под указателем, 0…1; у вертикального трека 0 — внизу */
function trackRatio(event: MouseEvent | TouchEvent, rect: DOMRect, isVertical: boolean): number {
	const point = 'touches' in event ? event.touches[0] : event
	const ratio = isVertical ? 1 - (point.clientY - rect.top) / rect.height : (point.clientX - rect.left) / rect.width
	return Math.max(0, Math.min(1, ratio))
}

/** Описание: индекс ближайшей к значению точки; при равном расстоянии — первая из них */
function nearestIndex(values: number[], value: number): number {
	let best = 0
	let bestDistance = Math.abs(value - values[0])
	for (let i = 1; i < values.length; i += 1) {
		const distance = Math.abs(value - values[i])
		if (distance < bestDistance) {
			best = i
			bestDistance = distance
		}
	}
	return best
}

/** Описание: направление шага по клавише: вправо и вверх — 1, влево и вниз — −1, другая клавиша — 0 */
function keyDirection(key: string): number {
	if (key === 'ArrowRight' || key === 'ArrowUp') return 1
	if (key === 'ArrowLeft' || key === 'ArrowDown') return -1
	return 0
}

export { keyDirection, nearestIndex, trackRatio }
