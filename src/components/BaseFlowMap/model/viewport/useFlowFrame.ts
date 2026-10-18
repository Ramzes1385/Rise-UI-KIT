import type { FlowSize } from '../../types/data/flowData.types'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowFrameState } from '../../types/internal/core/flowRenderInternal.types'

const DEFAULT_BREAKPOINT = 640

export function useFlowFrame(props: Pick<BaseFlowMapProps, 'compactBreakpoint'>): FlowFrameState {
	const frame = ref<FlowSize>({ width: 0, height: 0 })
	const element = shallowRef<HTMLElement | null>(null)
	let observer: ResizeObserver | null = null

	function measure(): void {
		const target = element.value
		if (!target) return
		const { width, height } = frame.value
		if (width !== target.clientWidth || height !== target.clientHeight)
			frame.value = { width: target.clientWidth, height: target.clientHeight }
	}

	function attach(value: unknown): void {
		const target = value instanceof HTMLElement ? value : null
		if (target === element.value) return
		observer?.disconnect()
		observer = null
		element.value = target
		if (!target) return
		measure()
		if (typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(measure)
		observer.observe(target)
	}

	onBeforeUnmount(() => observer?.disconnect())

	const isCompact = computed(() => frame.value.width > 0 && frame.value.width < (props.compactBreakpoint ?? DEFAULT_BREAKPOINT))
	return { frame, isCompact, element, attach }
}
