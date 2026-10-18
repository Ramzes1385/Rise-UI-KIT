import { ref } from 'vue'
import { useFlowCanvas } from './useFlowCanvas'
import { useUi } from '@composables/base/useUi'
import { useFlowFocus } from './a11y/useFlowFocus'
import { useFlowPick } from './context/useFlowPick'
import { useFlowChrome } from './chrome/useFlowChrome'
import { useFlowContext } from './context/useFlowContext'
import { createFlowViewApi } from './viewport/flowViewApi'
import { useFlowGestures } from './viewport/useFlowGestures'
import { useFlowViewport } from './viewport/useFlowViewport'
import { useFlowHighlight } from './context/useFlowHighlight'
import type { BaseFlowMapProps } from '../types/BaseFlowMap.types'
import type { FlowContextParts, FlowFrameState, FlowModelInternal } from '../types/internal/core/flowRenderInternal.types'

export function useFlowRendering(
	props: BaseFlowMapProps,
	model: FlowModelInternal,
	parts: Pick<FlowContextParts, 'environment'> & { frame: FlowFrameState },
) {
	const { frame, environment } = parts
	const ui = useUi(props, 'base-flow-map')
	const focused = ref<string | null>(null)
	const hovered = ref<string | null>(null)
	const view = useFlowViewport(model, frame, () => ({ min: props.minZoom ?? 0.2, max: props.maxZoom ?? 3 }))
	const map = useFlowContext({ model, frame, view, focused, hovered, environment })
	const pick = useFlowPick(model, map, { hovered, isDisabled: () => Boolean(props.isDisabled) })
	const focus = useFlowFocus(model, { frame, view, focused }, pick)
	const gestures = useFlowGestures(props, frame, view)
	const active = useFlowHighlight(model, hovered)
	const canvas = useFlowCanvas({ model, map, view, focus, gestures, frame, pick, active, ui })
	model.setView(createFlowViewApi(model, { view, frame, focus }, canvas.scene))
	return { ui, canvas, chrome: useFlowChrome(props, { model, map, view, pick, ui }) }
}
