const PAN_KEYS: Record<string, readonly [number, number]> = {
	ArrowLeft: [-1, 0],
	ArrowRight: [1, 0],
	ArrowUp: [0, -1],
	ArrowDown: [0, 1],
}

const ZOOM_KEYS: Record<string, number> = { '+': 1.1, '=': 1.1, '-': 1 / 1.1, _: 1 / 1.1 }

const PAN_STEP = 10

const LARGE_PAN_STEP = 50

const WHEEL_SPEED = 500

export function useCropKeys(controls: {
	isEnabled: () => boolean
	zoom: () => number
	panBy: (delta: { x: number; y: number }) => void
	zoomTo: (zoom: number) => void
	reset: () => void
}) {
	function actionFor(event: KeyboardEvent): (() => void) | undefined {
		const pan = PAN_KEYS[event.key]
		const step = event.shiftKey ? LARGE_PAN_STEP : PAN_STEP
		if (pan) return () => controls.panBy({ x: pan[0] * step, y: pan[1] * step })
		const factor = ZOOM_KEYS[event.key]
		if (factor) return () => controls.zoomTo(controls.zoom() * factor)
		return event.key === '0' ? controls.reset : undefined
	}
	return {
		handleKeydown(event: KeyboardEvent): void {
			const action = controls.isEnabled() ? actionFor(event) : undefined
			if (!action) return
			event.preventDefault()
			action()
		},
		handleWheel(event: WheelEvent): void {
			if (!controls.isEnabled() || !event.deltaY) return
			event.preventDefault()
			controls.zoomTo(controls.zoom() * Math.exp(-event.deltaY / WHEEL_SPEED))
		},
	}
}
