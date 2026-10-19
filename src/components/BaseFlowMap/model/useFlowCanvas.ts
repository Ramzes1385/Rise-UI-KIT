import { computed, provide, useId } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { useFlowNodes } from './render/useFlowNodes'
import { collectMarkers } from './render/flowMarkers'
import { useFlowGroups } from './render/useFlowGroups'
import { FLOW_CANVAS_CONTEXT } from './context/flowContext'
import { useFlowEdges, useFlowLabels } from './render/useFlowEdges'
import type { FlowCanvasContext, FlowCanvasParts } from '../types/internal/core/flowRenderInternal.types'

export function useFlowCanvas(parts: FlowCanvasParts): FlowCanvasContext {
	const { model, map, view, focus, frame, active, ui } = parts
	const uid = `flow-${useId()}`
	const source = { model, map, active, tabIndexOf: focus.tabIndexOf }
	const nodes = useFlowNodes(source)
	const edges = useFlowEdges(source)
	const groups = useFlowGroups(model)
	const hasLabels = computed(() => !map.isCompact.value)
	const labels = useFlowLabels(
		edges,
		computed(() => !hasLabels.value),
	)
	const markers = computed(() => collectMarkers(edges.value.map(item => item.kind)))
	const context: FlowCanvasContext = {
		...{ map, ui, events: model.events, view, focus, gestures: parts.gestures, attach: frame.attach, pick: parts.pick },
		...{ nodes, edges, groups, labels, markers, uid, hasLabels },
		toggleGroup: (id: string) => model.groups.toggle(id),
		...{ isAnimating: view.isAnimating, hint: view.hint, zoom: computed(() => view.viewport.value.zoom) },
		label: computed(() => formatMessage(UI_FLOW_MAP.CANVAS_ARIA, { title: model.data.value.title ?? UI_FLOW_MAP.DEFAULT_LABEL })),
		htmlNodes: computed(() => nodes.value.filter(item => item.kind.render === 'html')),
		svgNodes: computed(() => nodes.value.filter(item => item.kind.render === 'svg')),
		size: computed(() => {
			const { x, y, width, height } = model.layout.value.bounds
			return { width: Math.ceil(x + width), height: Math.ceil(y + height) }
		}),
		sceneStyle: computed(() => {
			const { x, y, zoom } = view.viewport.value
			return { transform: `translate(${x}px, ${y}px) scale(${zoom})` }
		}),
		scene: () => ({
			...{ nodes: nodes.value, edges: edges.value, groups: groups.value, labels: labels.value, markers: markers.value },
			...{
				bounds: model.layout.value.bounds,
				viewport: view.viewport.value,
				frame: frame.frame.value,
				uid,
				root: frame.element.value,
			},
		}),
	}
	provide(FLOW_CANVAS_CONTEXT, context)
	return context
}
