import { watch } from 'vue'
import type { FlowMap3DView } from '../../../types/BaseFlowMap3D.types'
import type { FlowMap3DViewTransitionOptions } from '../../../types/internal/flowMap3dMotion.types'

export function useViewTransition(options: FlowMap3DViewTransitionOptions) {
	const { view, camera } = options
	let isFlying = false

	view.setDeferrer({ wait: waitOf, fade: options.getFadeMs })

	function waitOf(next: FlowMap3DView, current: FlowMap3DView): number {
		if (next === '3d' && current === '3d' && isFlying) {
			isFlying = false
			camera.flyFrom2d(options.getPreset())
			return 0
		}
		const wait = options.getFlightMs()
		const canFly = current === '3d' && next === '2d' && wait > 0 && !view.fallback.reason.value
		if (!canFly) return 0
		isFlying = true
		camera.flyTo2d()
		return wait
	}

	watch(view.shownView, () => (isFlying = false))

	return {
		arrive: (): void => {
			if (options.getFlightMs() > 0) camera.flyFrom2d(options.getPreset())
		},
	}
}
