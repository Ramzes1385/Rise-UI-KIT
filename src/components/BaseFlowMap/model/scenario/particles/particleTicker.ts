import { FLOW_PARTICLES_PER_LANE } from '../../../types/internal/flowParticles.types'
import type { FlowParticleLane, FlowParticleSlot } from '../../../types/internal/flowParticles.types'

export function wantedParticles(lane: FlowParticleLane): number {
	if (lane.rate <= 0 || lane.speed <= 0) {
		return 0
	}
	const perDirection = Math.min(FLOW_PARTICLES_PER_LANE, Math.max(1, Math.round((lane.rate * lane.table.length) / lane.speed)))
	return lane.direction === 'both' ? perDirection * 2 : perDirection
}

function scale(wants: number[], budget: number): number[] {
	const total = wants.reduce((sum, want) => sum + want, 0)
	if (total <= budget) {
		return wants
	}
	const factor = budget / total
	return wants.map(want => Math.floor(want * factor))
}

export function planParticles(lanes: readonly FlowParticleLane[], limit: number): FlowParticleSlot[] {
	const wants = lanes.map(wantedParticles)
	const hot = scale(
		wants.map((want, index) => (lanes[index]!.isHot ? want : 0)),
		limit,
	)
	const used = hot.reduce((sum, count) => sum + count, 0)
	const cold = scale(
		wants.map((want, index) => (lanes[index]!.isHot ? 0 : want)),
		Math.max(0, limit - used),
	)
	return lanes.map((lane, index) => ({ lane, count: hot[index]! + cold[index]! })).filter(slot => slot.count > 0)
}

export function particleDistance(slot: FlowParticleSlot, index: number, seconds: number): number {
	const { lane, count } = slot
	const { length } = lane.table
	const travelled = seconds * lane.speed + (index * length) / count
	const base = ((travelled % length) + length) % length
	const isBack = lane.direction === 'reverse' || (lane.direction === 'both' && index % 2 === 1)
	return isBack ? length - base : base
}
