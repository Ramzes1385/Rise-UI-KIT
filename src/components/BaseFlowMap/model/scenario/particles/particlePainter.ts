import { readRoute } from './routeSampler'
import { particleDistance } from './particleTicker'
import type { FlowParticleSlot } from '../../../types/internal/flowParticles.types'
import { FLOW_MAX_FRAME_DELTA } from '../../../types/internal/flowScenarioInternal.types'

export function paintParticles(circles: HTMLCollection, slots: readonly FlowParticleSlot[], seconds: number): void {
	const point = { x: 0, y: 0 }
	let position = 0
	for (const slot of slots) {
		for (let index = 0; index < slot.count; index += 1) {
			const circle = circles[position]
			if (!circle) {
				return
			}
			readRoute(slot.lane.table, particleDistance(slot, index, seconds), point)
			circle.setAttribute('transform', `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`)
			position += 1
		}
	}
}

export function createParticleLoop(paint: (seconds: number) => void): { start: () => void; stop: () => void } {
	let frame = 0
	let last: number | null = null
	let seconds = 0
	let isRunning = false
	const loop = (now: number) => {
		if (!isRunning) {
			return
		}
		seconds += Math.min(last === null ? 0 : now - last, FLOW_MAX_FRAME_DELTA) / 1000
		last = now
		paint(seconds)
		frame = requestAnimationFrame(loop)
	}
	return {
		start() {
			if (!isRunning && typeof requestAnimationFrame === 'function') {
				isRunning = true
				last = null
				frame = requestAnimationFrame(loop)
			}
		},
		stop() {
			if (isRunning) {
				cancelAnimationFrame(frame)
			}
			isRunning = false
		},
	}
}
