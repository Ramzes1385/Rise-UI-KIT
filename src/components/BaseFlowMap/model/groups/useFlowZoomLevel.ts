import { onBeforeUnmount, watch } from 'vue'
import type { FlowModelInternal, FlowViewState } from '../../types/internal/core/flowRenderInternal.types'

const DEBOUNCE_MS = 150

export function useFlowZoomLevel(model: FlowModelInternal, view: FlowViewState): void {
	let timer: ReturnType<typeof setTimeout> | undefined
	watch(
		() => view.viewport.value.zoom,
		zoom => {
			clearTimeout(timer)
			timer = setTimeout(() => model.groups.setZoom(zoom), DEBOUNCE_MS)
		},
	)
	onBeforeUnmount(() => clearTimeout(timer))
}
