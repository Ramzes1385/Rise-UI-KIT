import type { ComputedRef } from 'vue'
import { collectLanes } from './particleLanes'
import { isRouteInView } from './routeSampler'
import { planParticles } from './particleTicker'
import type { FlowRect } from '../../../types/data/flowData.types'
import { createParticleLoop, paintParticles } from './particlePainter'
import type { FlowMapContext } from '../../../types/internal/flowModel.types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { FlowParticleSlot } from '../../../types/internal/flowParticles.types'
import type { FlowParticles } from '../../../types/internal/flowScenarioLayer.types'
import { FLOW_PARTICLE_LIMIT, FLOW_VIEW_MARGIN } from '../../../types/internal/flowParticles.types'

export function particleLimit(value: boolean | number | undefined): number {
	if (value === false) {
		return 0
	}
	return typeof value === 'number' ? Math.max(0, Math.floor(value)) : FLOW_PARTICLE_LIMIT
}

function visibleArea(context: FlowMapContext): FlowRect {
	const { x, y, zoom } = context.viewport.value
	const { width, height } = context.frame.value
	const margin = FLOW_VIEW_MARGIN
	return { x: -x / zoom - margin, y: -y / zoom - margin, width: width / zoom + margin * 2, height: height / zoom + margin * 2 }
}

function useSlots(context: FlowMapContext, limit: () => number): ComputedRef<FlowParticleSlot[]> {
	const { model } = context
	const lanes = computed(() =>
		collectLanes({
			edges: model.data.value.edges,
			routes: model.routes.value,
			trafficOf: edge => (edge.traffic ? { ...model.edgeKind(edge).traffic, ...edge.traffic } : model.edgeKind(edge).traffic),
			hot: model.highlighted.value,
		}),
	)
	return computed(() => {
		const area = visibleArea(context)
		return planParticles(
			lanes.value.filter(lane => isRouteInView(lane.table, area)),
			limit(),
		)
	})
}

export function useFlowParticles(context: FlowMapContext, particles: () => boolean | number | undefined): FlowParticles {
	const group = ref<SVGGElement | null>(null)
	const slots = useSlots(context, () => particleLimit(particles()))
	const count = computed(() => (context.isReducedMotion.value ? 0 : slots.value.reduce((sum, slot) => sum + slot.count, 0)))
	const loop = createParticleLoop(seconds => group.value && paintParticles(group.value.children, slots.value, seconds))
	const sync = () => (count.value > 0 && context.isVisible.value && group.value ? loop.start() : loop.stop())
	onMounted(sync)
	watch([count, context.isVisible], () => void nextTick(sync))
	onBeforeUnmount(loop.stop)
	return { group, count, isMuted: computed(() => context.model.mode.value === 'edit') }
}
