import type { CameraKeyAction } from '../../types/internal/imageMap3dInternal.types'

export const ROTATE_STEP = 15
const TILT_STEP = 10

const SHIFT_KEYS: Record<string, CameraKeyAction> = {
	ArrowLeft: { type: 'rotate', degrees: -ROTATE_STEP },
	ArrowRight: { type: 'rotate', degrees: ROTATE_STEP },
	ArrowUp: { type: 'tilt', degrees: -TILT_STEP },
	ArrowDown: { type: 'tilt', degrees: TILT_STEP },
}

const PLAIN_KEYS: Record<string, CameraKeyAction> = {
	'+': { type: 'zoom', direction: 1 },
	'=': { type: 'zoom', direction: 1 },
	'-': { type: 'zoom', direction: -1 },
	_: { type: 'zoom', direction: -1 },
	'0': { type: 'reset' },
}

export function cameraKeyAction(event: KeyboardEvent): CameraKeyAction | null {
	if (event.ctrlKey || event.metaKey || event.altKey) return null
	if (event.shiftKey && SHIFT_KEYS[event.key]) return SHIFT_KEYS[event.key]
	return PLAIN_KEYS[event.key] ?? null
}
