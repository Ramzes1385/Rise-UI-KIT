import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { createViewportAnimation } from './useFlowAnimation'
import type { FlowRect } from '../../types/data/flowData.types'
import { useReducedMotion } from '@composables/app/useReducedMotion'
import type { FlowViewport } from '../../types/api/flowController.types'
import { DEFAULT_VIEWPORT, FIT_PADDING, centerViewport, clampZoom, fitViewport, isRevealed, zoomAt } from './viewGeometry'
import type { FlowFrameState, FlowModelInternal, FlowViewState, FlowZoomLimits } from '../../types/internal/core/flowRenderInternal.types'

export function useFlowViewport(model: FlowModelInternal, frame: FlowFrameState, limits: () => FlowZoomLimits): FlowViewState {
	const viewport = ref<FlowViewport>(DEFAULT_VIEWPORT)
	const isAnimating = ref(false)
	const isReducedMotion = useReducedMotion()
	let isAuto = true

	const commit = (next: FlowViewport): void => {
		viewport.value = next
		model.events.emit('viewport-change', next)
	}
	const animation = createViewportAnimation(viewport, isAnimating, commit)

	function apply(next: FlowViewport, options?: { isAnimated?: boolean }): void {
		animation.stop()
		const safe = { ...next, zoom: clampZoom(next.zoom, limits()) }
		if (options?.isAnimated && !isReducedMotion.value && typeof requestAnimationFrame !== 'undefined') animation.run(safe)
		else commit(safe)
	}

	function setViewport(next: FlowViewport, options?: { isAnimated?: boolean }): void {
		isAuto = false
		apply(next, options)
	}

	function fit(padding = FIT_PADDING): void {
		isAuto = true
		apply(fitViewport(model.layout.value.bounds, frame.frame.value, { padding, limits: limits(), insets: frame.insets() }))
	}

	function zoomBy(factor: number): void {
		const anchor = { x: frame.frame.value.width / 2, y: frame.frame.value.height / 2 }
		setViewport(zoomAt(viewport.value, { factor, anchor }, limits()), { isAnimated: true })
	}

	function reveal(rect: FlowRect): void {
		if (isRevealed(rect, viewport.value, frame.frame.value)) return
		setViewport(centerViewport(rect, frame.frame.value, viewport.value.zoom), { isAnimated: true })
	}

	watch([() => model.layout.value.bounds, frame.frame], () => isAuto && fit(), { flush: 'post' })
	onBeforeUnmount(animation.stop)
	return {
		...{ viewport, isAnimating, hint: ref(false), limits, setViewport, fit, zoomBy, reveal },
		percent: computed(() => Math.round(viewport.value.zoom * 100)),
	}
}
