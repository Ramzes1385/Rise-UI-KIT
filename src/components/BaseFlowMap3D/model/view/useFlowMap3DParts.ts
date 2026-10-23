import { defineAsyncComponent } from 'vue'

export function useFlowMap3DParts() {
	return {
		TwoDMap: defineAsyncComponent(() => import('@components/BaseFlowMap/ui/BaseFlowMap.vue')),
		ScenarioPanel: defineAsyncComponent(() => import('@components/BaseFlowMap/ui/scenario/FlowScenarioPanel.vue')),
		DetailsPanel: defineAsyncComponent(() => import('@components/BaseFlowMap/ui/panels/FlowDetails.vue')),
		LegendPanel: defineAsyncComponent(() => import('@components/BaseFlowMap/ui/panels/FlowLegend.vue')),
	}
}
