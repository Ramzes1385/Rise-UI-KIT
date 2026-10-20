import { nextTick, shallowRef, watch } from 'vue'
import type { FlowMap3DTransitionOptions } from '../../types/internal/flowMap3dView.types'
import type { FlowMapController, FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'

export function useFlowMap3DTransition(options: FlowMap3DTransitionOptions) {
	const twoD = shallowRef<FlowMapController | null>(null)
	let last: FlowViewport | null = null
	let pending: FlowViewport | null = null

	watch(options.shownView, next => {
		if (next === '2d') {
			pending = options.camera.viewport()
			return
		}
		twoD.value = null
		const from = last
		void nextTick(() =>
			nextTick(() => {
				if (from) options.camera.setViewport(from)
				options.onReturn()
			}),
		)
	})

	return {
		twoD,
		track: {
			viewport: (viewport: FlowViewport) => void (last = viewport),
			ready: (controller: FlowMapController) => {
				twoD.value = controller
				if (pending) controller.setViewport(pending)
				pending = null
			},
		},
	}
}
