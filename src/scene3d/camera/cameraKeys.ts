import type { Scene3DCameraKeyAction, Scene3DCameraKeyOptions } from '../types/internal/scene3dInternal.types'

export const ROTATE_STEP = 15
export const QUARTER_TURN = 90
const TILT_STEP = 10

const SHIFT_KEYS: Record<string, Scene3DCameraKeyAction> = {
	ArrowLeft: { type: 'rotate', degrees: -ROTATE_STEP },
	ArrowRight: { type: 'rotate', degrees: ROTATE_STEP },
	ArrowUp: { type: 'tilt', degrees: -TILT_STEP },
	ArrowDown: { type: 'tilt', degrees: TILT_STEP },
}

const PLAIN_KEYS: Record<string, Scene3DCameraKeyAction> = {
	'+': { type: 'zoom', direction: 1 },
	'=': { type: 'zoom', direction: 1 },
	'-': { type: 'zoom', direction: -1 },
	_: { type: 'zoom', direction: -1 },
	'0': { type: 'reset' },
}

const QUARTER_KEYS: Record<string, Scene3DCameraKeyAction> = {
	q: { type: 'rotate', degrees: -QUARTER_TURN },
	e: { type: 'rotate', degrees: QUARTER_TURN },
}

function quarterAction(event: KeyboardEvent, options: Scene3DCameraKeyOptions): Scene3DCameraKeyAction | null {
	return options.hasQuarterTurns && !event.shiftKey ? (QUARTER_KEYS[event.key.toLowerCase()] ?? null) : null
}

export function cameraKeyAction(event: KeyboardEvent, options: Scene3DCameraKeyOptions = {}): Scene3DCameraKeyAction | null {
	if (event.ctrlKey || event.metaKey || event.altKey) return null
	if (event.shiftKey && SHIFT_KEYS[event.key]) return SHIFT_KEYS[event.key]
	return quarterAction(event, options) ?? PLAIN_KEYS[event.key] ?? null
}
