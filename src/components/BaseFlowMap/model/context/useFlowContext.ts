import { provide, ref } from 'vue'
import { FLOW_MAP_CONTEXT } from './flowContext'
import type { FlowElementRef } from '../../types/data/flowReview.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowContextParts } from '../../types/internal/core/flowRenderInternal.types'

export function useFlowContext(parts: FlowContextParts): FlowMapContext {
	const { model, frame, view, environment } = parts
	const details = ref<FlowElementRef | null>(null)
	const context: FlowMapContext = {
		model,
		viewport: view.viewport,
		frame: frame.frame,
		isCompact: frame.isCompact,
		setViewport: view.setViewport,
		focused: parts.focused,
		hovered: parts.hovered,
		details,
		openDetails: target => (details.value = target),
		isReducedMotion: environment.isReducedMotion,
		isVisible: environment.isVisible,
		announce: environment.announce,
	}
	provide(FLOW_MAP_CONTEXT, context)
	return context
}
