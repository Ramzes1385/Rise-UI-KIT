import { type ComputedRef, computed } from 'vue'
import type { FlowMode } from '../../../types/api/flowController.types'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'
import type { FlowEditState } from '../../../types/internal/edit/flowEdit.types'
import type { FlowFrameState, FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

const PALETTE_WIDTH = 224
const SIDE_WIDTH = 340

function sidePanelsWidth(mode: FlowMode, hasDetailsOrScenario: boolean, scale = 1): number {
	if (mode === 'edit') return (PALETTE_WIDTH + SIDE_WIDTH) * scale
	if (mode === 'review' || hasDetailsOrScenario) return SIDE_WIDTH * scale
	return 0
}

export function useFlowPanels(
	props: Pick<BaseFlowMapProps, 'sizeScale'>,
	parts: {
		model: FlowModelInternal
		chrome: Record<'hasToolbar' | 'hasMinimap' | 'hasLegend' | 'hasScenario' | 'hasDetails', ComputedRef<boolean>>
		state: FlowEditState
		frame: FlowFrameState
	},
) {
	const { model, chrome, state, frame } = parts
	const isEditChrome = computed(() => state.isEditing.value && !state.isCompact.value)
	frame.reserve(() =>
		sidePanelsWidth(
			model.mode.value,
			chrome.hasDetails.value || chrome.hasScenario.value,
			(props.sizeScale ?? SIZE_SCALE_DEFAULT) / SIZE_SCALE_DEFAULT,
		),
	)
	return {
		hasToolbar: computed(() => chrome.hasToolbar.value && !isEditChrome.value),
		hasMinimap: computed(() => chrome.hasMinimap.value && !isEditChrome.value),
		hasLegend: computed(() => chrome.hasLegend.value && !isEditChrome.value),
		hasDetails: computed(() => chrome.hasDetails.value && !state.isEditing.value),
		editClasses: computed(() => [
			isEditChrome.value && 'base-flow-map__stage--edit',
			isEditChrome.value && !state.isGridOn.value && 'base-flow-map__stage--no-grid',
		]),
	}
}
