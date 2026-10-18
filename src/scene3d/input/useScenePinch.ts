const MIN_SPREAD = 1

export function useScenePinch(zoomBy: (factor: number) => void) {
	const touches = new Map<number, { x: number; y: number }>()
	let spread = 0

	function measure(): number {
		const [first, second] = [...touches.values()]
		return first && second ? Math.hypot(first.x - second.x, first.y - second.y) : 0
	}

	return {
		onPointerDown(event: PointerEvent): void {
			if (event.pointerType !== 'touch') return
			touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
			spread = measure()
		},
		onPointerMove(event: PointerEvent): void {
			if (!touches.has(event.pointerId)) return
			touches.set(event.pointerId, { x: event.clientX, y: event.clientY })
			const next = measure()
			if (spread >= MIN_SPREAD && next >= MIN_SPREAD) zoomBy(next / spread)
			spread = next
		},
		onPointerUp(event: PointerEvent): void {
			touches.delete(event.pointerId)
			spread = measure()
		},
	}
}
