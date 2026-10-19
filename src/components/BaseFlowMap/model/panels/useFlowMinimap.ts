import type { ComputedRef } from 'vue'
import { computed, ref, useId } from 'vue'
import { UI_FLOW_PANELS } from '@/locales/messages'
import { useFlowMapContext } from '../context/flowContext'
import { FLOW_MINIMAP_SIZE } from '../../types/internal/flowPanels.types'
import type { FlowMapContext } from '../../types/internal/flowModel.types'
import type { FlowMinimapItem, FlowMinimapTransform } from '../../types/internal/flowPanels.types'
import {
	fromMinimapPoint,
	minimapTransform,
	pointInMinimap,
	toMinimapRect,
	viewportCenteredOn,
	viewportShiftedByKey,
	visibleCanvasRect,
} from './minimapGeometry'

function useMinimapItems(context: FlowMapContext) {
	const { model } = context
	const transform = computed(() => minimapTransform(model.layout.value.bounds))

	const groups = computed<FlowMinimapItem[]>(() =>
		Object.entries(model.layout.value.groups).map(([id, rect]) => ({
			id,
			rect: toMinimapRect(rect, transform.value),
			color: model.graph.value.groups.get(id)?.color,
		})),
	)

	const nodes = computed<FlowMinimapItem[]>(() =>
		Object.entries(model.layout.value.nodes).map(([id, rect]) => ({
			id,
			rect: toMinimapRect(rect, transform.value),
			status: model.live.value.nodes?.[id]?.status ?? model.graph.value.nodes.get(id)?.status,
		})),
	)

	const viewportRect = computed(() => toMinimapRect(visibleCanvasRect(context.viewport.value, context.frame.value), transform.value))
	return { transform, groups, nodes, viewportRect }
}

function useMinimapControls(context: FlowMapContext, transform: ComputedRef<FlowMinimapTransform>) {
	const rootRef = ref<HTMLElement | null>(null)
	const isDragging = ref(false)

	function moveTo(event: PointerEvent, isAnimated: boolean): void {
		const box = (rootRef.value as HTMLElement).getBoundingClientRect()
		const center = fromMinimapPoint(pointInMinimap(event, box), transform.value)
		context.setViewport(viewportCenteredOn(center, context.viewport.value, context.frame.value), { isAnimated })
	}

	function onPointerDown(event: PointerEvent): void {
		if (event.button !== 0) return
		isDragging.value = true
		rootRef.value?.setPointerCapture?.(event.pointerId)
		moveTo(event, true)
	}

	function onPointerMove(event: PointerEvent): void {
		if (isDragging.value) moveTo(event, false)
	}

	function onPointerUp(event: PointerEvent): void {
		isDragging.value = false
		rootRef.value?.releasePointerCapture?.(event.pointerId)
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === 'Home') {
			event.preventDefault()
			context.model.controller.fitView({ isAnimated: true })
			return
		}
		const next = viewportShiftedByKey(event.key, context.viewport.value, context.frame.value)
		if (!next) return
		event.preventDefault()
		context.setViewport(next, { isAnimated: true })
	}

	return { rootRef, isDragging, onPointerDown, onPointerMove, onPointerUp, onKeydown }
}

export function useFlowMinimap() {
	const context = useFlowMapContext()
	const items = useMinimapItems(context)
	const controls = useMinimapControls(context, items.transform)

	return {
		...controls,
		groups: items.groups,
		nodes: items.nodes,
		viewportRect: items.viewportRect,
		isShown: computed(() => !context.isCompact.value),
		size: FLOW_MINIMAP_SIZE,
		label: computed(() => UI_FLOW_PANELS.MINIMAP),
		hint: computed(() => UI_FLOW_PANELS.MINIMAP_HINT),
		hintId: `flow-minimap-hint-${useId()}`,
	}
}
