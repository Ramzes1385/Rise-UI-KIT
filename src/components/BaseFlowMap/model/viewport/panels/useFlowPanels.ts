import { type ComputedRef, computed } from 'vue'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseFlowMapProps } from '../../../types/BaseFlowMap.types'
import type { FlowModesState } from '../../../types/internal/core/flowModes.types'
import type { FlowFrameState } from '../../../types/internal/core/flowRenderInternal.types'

const PALETTE_WIDTH = 224
const SIDE_WIDTH = 340

function sidePanelsWidth(modes: Pick<FlowModesState, 'isEditing' | 'isReviewing'>, hasDetailsOrScenario: boolean, scale: number): number {
	if (modes.isEditing.value) return (PALETTE_WIDTH + SIDE_WIDTH) * scale
	if (modes.isReviewing.value || hasDetailsOrScenario) return SIDE_WIDTH * scale
	return 0
}

export function useFlowPanels(
	props: Pick<BaseFlowMapProps, 'sizeScale'>,
	parts: {
		chrome: Record<'hasToolbar' | 'hasMinimap' | 'hasLegend' | 'hasScenario' | 'hasDetails', ComputedRef<boolean>>
		modes: FlowModesState
		frame: FlowFrameState
	},
) {
	const { chrome, modes, frame } = parts
	const isEditChrome = computed(() => modes.isEditing.value && !frame.isCompact.value)
	frame.reserve(() =>
		sidePanelsWidth(
			modes,
			chrome.hasDetails.value || chrome.hasScenario.value,
			(props.sizeScale ?? SIZE_SCALE_DEFAULT) / SIZE_SCALE_DEFAULT,
		),
	)
	return {
		hasToolbar: computed(() => chrome.hasToolbar.value && !isEditChrome.value),
		hasMinimap: computed(() => chrome.hasMinimap.value && !isEditChrome.value),
		hasLegend: computed(() => chrome.hasLegend.value && !isEditChrome.value),
		hasDetails: computed(() => chrome.hasDetails.value && !modes.isEditing.value),
		editClasses: computed(() => [
			isEditChrome.value && 'base-flow-map__stage--edit',
			isEditChrome.value && !modes.isGridOn.value && 'base-flow-map__stage--no-grid',
		]),
	}
}
