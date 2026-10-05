import { AVATAR_MASCOT_PUPIL_RANGE, AVATAR_MASCOT_REACH, AVATAR_MASCOT_TILT } from '../types/BaseAvatar.types'
import type { AvatarPupilOffset, AvatarSpringConfig, AvatarSpringFrame, AvatarSpringState } from '../types/BaseAvatar.types'

const MAX_SUBSTEP = 1 / 120
const MAX_FRAME = 1 / 15
const SETTLE_DISTANCE = 0.01
const SETTLE_SPEED = 0.05

export const PUPIL_SPRING: AvatarSpringConfig = { stiffness: 170, damping: 17 }
export const TILT_SPRING: AvatarSpringConfig = { stiffness: 120, damping: 15 }
export const FACE_SPRING: AvatarSpringConfig = { stiffness: 220, damping: 28 }
export const EYE_SPRING: AvatarSpringConfig = { stiffness: 900, damping: 60 }

export const roundTo = (value: number): number => Math.round(value * 100) / 100

export function springStep(state: AvatarSpringState, target: number, { seconds, config }: AvatarSpringFrame): AvatarSpringState {
	const frame = Math.min(Math.max(seconds, 0), MAX_FRAME)
	const steps = Math.max(1, Math.ceil(frame / MAX_SUBSTEP))
	const step = frame / steps
	let { value, velocity } = state
	for (let index = 0; index < steps; index++) {
		velocity += (-config.stiffness * (value - target) - config.damping * velocity) * step
		value += velocity * step
	}
	return { value, velocity }
}

export const isSpringSettled = (state: AvatarSpringState, target: number): boolean =>
	Math.abs(state.value - target) < SETTLE_DISTANCE && Math.abs(state.velocity) < SETTLE_SPEED

export function settleSpring(state: AvatarSpringState, target: number, frame: AvatarSpringFrame): AvatarSpringState {
	const next = springStep(state, target, frame)
	return isSpringSettled(next, target) ? { value: target, velocity: 0 } : next
}

export function toPupilOffset(rect: DOMRect, point: AvatarPupilOffset): AvatarPupilOffset {
	const dx = point.x - (rect.left + rect.width / 2)
	const dy = point.y - (rect.top + rect.height / 2)
	const distance = Math.hypot(dx, dy)
	if (distance === 0) return { x: 0, y: 0 }
	const length = (Math.min(distance, AVATAR_MASCOT_REACH) / AVATAR_MASCOT_REACH) * AVATAR_MASCOT_PUPIL_RANGE
	return { x: (dx / distance) * length, y: (dy / distance) * length }
}

export function toTilt(rect: DOMRect, point: AvatarPupilOffset): number {
	const dx = point.x - (rect.left + rect.width / 2)
	return (Math.max(-AVATAR_MASCOT_REACH, Math.min(dx, AVATAR_MASCOT_REACH)) / AVATAR_MASCOT_REACH) * AVATAR_MASCOT_TILT
}
