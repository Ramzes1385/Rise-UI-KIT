import type { FlowMap3DProps } from '../../types/BaseFlowMap3D.types'
import type { FlowSize } from '@components/BaseFlowMap/types/data/flowData.types'
import { FLOW_MAP_CONTEXT } from '@components/BaseFlowMap/model/context/flowContext'
import { computed, onBeforeUnmount, onMounted, provide, ref, shallowRef } from 'vue'
import type { FlowViewport } from '@components/BaseFlowMap/types/api/flowController.types'
import type { FlowMapContext } from '@components/BaseFlowMap/types/internal/flowModel.types'
import type { FlowMap3DContextParts, FlowMap3DFrameState } from '../../types/internal/flowMap3dView.types'

const DEFAULT_BREAKPOINT = 640
const EDIT_MIN_WIDTH = 768

export function useFlowMap3DFrame(
	props: Pick<FlowMap3DProps, 'compactBreakpoint'>,
	rootRef: Readonly<{ value: HTMLElement | null }>,
): FlowMap3DFrameState {
	const frame = ref<FlowSize>({ width: 0, height: 0 })
	const rootWidth = ref(0)
	let observer: ResizeObserver | null = null

	onMounted(() => {
		const root = rootRef.value
		if (!root || typeof ResizeObserver === 'undefined') return
		rootWidth.value = root.clientWidth
		observer = new ResizeObserver(() => (rootWidth.value = root.clientWidth))
		observer.observe(root)
	})
	onBeforeUnmount(() => observer?.disconnect())

	return {
		frame,
		isCompact: computed(() => rootWidth.value > 0 && rootWidth.value < (props.compactBreakpoint ?? DEFAULT_BREAKPOINT)),
		isNarrow: computed(() => rootWidth.value > 0 && rootWidth.value < EDIT_MIN_WIDTH),
	}
}

function sameViewport(first: FlowViewport, second: FlowViewport): boolean {
	return Math.abs(first.x - second.x) < 0.5 && Math.abs(first.y - second.y) < 0.5 && Math.abs(first.zoom - second.zoom) < 1e-4
}

export function useFlowMap3DContext(parts: FlowMap3DContextParts): FlowMapContext {
	const { model, camera, state } = parts
	const viewport = shallowRef<FlowViewport>({ x: 0, y: 0, zoom: 1 })
	const details = ref<FlowMapContext['details']['value']>(null)

	function publish(): void {
		const next = camera.viewport()
		if (sameViewport(next, viewport.value)) return
		viewport.value = next
		model.events.emit('viewport-change', next)
	}

	parts.onFrame(publish)
	const context: FlowMapContext = {
		model,
		viewport,
		frame: state.frame,
		isCompact: state.isCompact,
		setViewport: (next, options) => camera.setViewport(next, options),
		focused: parts.focused,
		hovered: parts.hovered,
		details,
		openDetails: target => (details.value = target),
		isReducedMotion: parts.isReducedMotion,
		isVisible: parts.isVisible,
		announce: parts.announce,
	}
	provide(FLOW_MAP_CONTEXT, context)
	return context
}
