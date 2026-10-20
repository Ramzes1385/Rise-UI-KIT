import type { ComputedRef } from 'vue'
import { onMounted, watch } from 'vue'
import { runWhenIdle } from './runWhenIdle'
import { prefetchDetailsUi } from '../../ui/lazy/flowLazyParts'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

export function useFlowLazyStart(
	props: Pick<BaseFlowMapProps, 'particles'>,
	model: FlowModelInternal,
	hasDetails: ComputedRef<boolean>,
): void {
	onMounted(() => {
		model.events.emit('ready', model.controller)
		watch(
			() => props.particles,
			isOn => isOn && model.scenario.load().catch(() => undefined),
			{ immediate: true },
		)
		runWhenIdle(() => {
			if (hasDetails.value) prefetchDetailsUi().catch(() => undefined)
		})
	})
}
