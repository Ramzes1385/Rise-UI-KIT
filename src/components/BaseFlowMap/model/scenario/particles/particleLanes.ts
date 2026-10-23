import { cachedRouteTable } from './routeSampler'
import type { FlowTraffic } from '../../../types/data/flowData.types'
import { FLOW_PARTICLE_SPEED } from '../../../types/internal/flowParticles.types'
import type { FlowLaneSource, FlowParticleDirection, FlowParticleLane } from '../../../types/internal/flowParticles.types'

function directionOf(traffic: FlowTraffic): FlowParticleDirection {
	if (traffic.isBidirectional) {
		return 'both'
	}
	return traffic.isReversed ? 'reverse' : 'forward'
}

export function collectLanes(source: FlowLaneSource): FlowParticleLane[] {
	const lanes: FlowParticleLane[] = []
	for (const edge of source.edges) {
		const traffic = source.trafficOf(edge)
		const route = source.routes[edge.id]
		const table = route && traffic && (traffic.rate ?? 0) > 0 ? cachedRouteTable(route.points) : null
		if (traffic && table) {
			lanes.push({
				id: edge.id,
				table,
				rate: traffic.rate as number,
				speed: traffic.speed ?? FLOW_PARTICLE_SPEED,
				direction: directionOf(traffic),
				isHot: source.hot.has(edge.id),
			})
		}
	}
	return lanes
}
