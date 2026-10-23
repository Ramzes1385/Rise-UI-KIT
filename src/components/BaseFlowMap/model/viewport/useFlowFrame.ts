import { NO_INSETS } from './viewGeometry'
import type { FlowSize } from '../../types/data/flowData.types'
import { computed, onBeforeUnmount, ref, shallowRef } from 'vue'
import type { BaseFlowMapProps } from '../../types/BaseFlowMap.types'
import type { FlowFrameState, FlowInsets } from '../../types/internal/core/flowRenderInternal.types'

const DEFAULT_BREAKPOINT = 640
const OVERLAYS = '.base-flow-map__legend, .base-flow-map__minimap'
const OVERLAY_GAP = 16
const ROOT = '.base-flow-map'

function measureInsets(element: HTMLElement | null): FlowInsets {
	const stage = element?.closest('.base-flow-map__stage')
	if (!element || !stage) return NO_INSETS
	const frame = element.getBoundingClientRect()
	const widths = [...stage.querySelectorAll(OVERLAYS)].map(overlay => frame.right - overlay.getBoundingClientRect().left)
	const right = Math.max(0, ...widths.filter(width => width > 0)) + (widths.length > 0 ? OVERLAY_GAP : 0)
	return { ...NO_INSETS, right }
}

export function useFlowFrame(props: Pick<BaseFlowMapProps, 'compactBreakpoint'>): FlowFrameState {
	const frame = ref<FlowSize>({ width: 0, height: 0 })
	const element = shallowRef<HTMLElement | null>(null)
	const rootWidth = ref(0)
	const reserved = shallowRef<() => number>(() => 0)
	let root: HTMLElement | null = null
	let observer: ResizeObserver | null = null

	function resolveRoot(target: HTMLElement): void {
		if (root?.isConnected) return
		const found = target.closest<HTMLElement>(ROOT)
		if (!found || found === root) return
		root = found
		observer?.observe(found)
	}

	function measure(): void {
		const target = element.value
		if (!target) return
		resolveRoot(target)
		if (root && rootWidth.value !== root.clientWidth) rootWidth.value = root.clientWidth
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
		root = null
		rootWidth.value = 0
		if (!target) return
		measure()
		if (typeof ResizeObserver === 'undefined') return
		observer = new ResizeObserver(measure)
		observer.observe(target)
		if (root) observer.observe(root)
	}

	onBeforeUnmount(() => observer?.disconnect())

	const isCompact = computed(() => {
		const width = rootWidth.value > 0 ? rootWidth.value - reserved.value() : frame.value.width
		return rootWidth.value + frame.value.width > 0 && width < (props.compactBreakpoint ?? DEFAULT_BREAKPOINT)
	})
	const insets = (): FlowInsets => (isCompact.value ? NO_INSETS : measureInsets(element.value))
	return { frame, isCompact, element, attach, insets, reserve: getter => (reserved.value = getter) }
}
