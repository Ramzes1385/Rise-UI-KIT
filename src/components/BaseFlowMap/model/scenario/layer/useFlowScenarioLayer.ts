import { computed, inject } from 'vue'
import { buildMarks } from './layerMarks'
import { FLOW_SCENARIO_DETAILS } from '../scenarioContext'
import { useFlowMapContext } from '../../context/flowContext'
import { useFlowParticles } from '../particles/useFlowParticles'
import { useFlowScenarioAnnounce } from '../announce/useFlowScenarioAnnounce'
import type { FlowScenarioLayerView } from '../../../types/internal/flowScenarioLayer.types'

const NO_ACTIONS = new Map()

export function useFlowScenarioLayer(particles: () => boolean | number | undefined): FlowScenarioLayerView {
	const context = useFlowMapContext()
	const { model } = context
	const details = inject(FLOW_SCENARIO_DETAILS, null)
	useFlowScenarioAnnounce(context)
	const marks = computed(() =>
		buildMarks({
			status: model.scenario.state.value.status,
			time: model.scenario.state.value.time,
			timeline: model.scenario.timeline.value,
			routes: model.routes.value,
			rects: model.layout.value.nodes,
			actions: details?.actions.value ?? NO_ACTIONS,
			isReduced: context.isReducedMotion.value,
		}),
	)
	return { status: computed(() => model.scenario.state.value.status), marks, ...useFlowParticles(context, particles) }
}
