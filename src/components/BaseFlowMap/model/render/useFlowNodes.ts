import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { glyphPath } from './shapes/flowGlyphs'
import { shapeView } from './shapes/flowShapes'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP } from '@/locales/messages'
import { highlightOf } from '../context/useFlowHighlight'
import { FLOW_COLLAPSED_KIND } from '../groups/tree/collapseData'
import type { FlowNodeKindDef } from '../../types/api/flowNotation.types'
import type { FlowNode, FlowRect } from '../../types/data/flowData.types'
import { describeLinks, describeNode, statusView } from '../a11y/flowDescribe'
import type { FlowNodeItem, FlowRenderSource } from '../../types/internal/core/flowRenderInternal.types'

function iconOf(name: string | undefined): { icon: string | null; glyph: string | null } {
	const glyph = glyphPath(name)
	return { glyph, icon: glyph || !name ? null : name }
}

function describeOf(node: FlowNode, kindLabel: string, source: FlowRenderSource) {
	const { model } = source
	const status = statusView(model.live.value.nodes?.[node.id]?.status ?? node.status, model.data.value.statuses)
	const graph = model.graph.value
	const links = describeLinks(graph.incoming(node.id).length, graph.outgoing(node.id).length)
	return { status, ariaLabel: `${describeNode(node, kindLabel, status)}. ${links}` }
}

function flagsOf(node: FlowNode, kind: FlowNodeKindDef, source: FlowRenderSource) {
	const { model, map } = source
	return {
		...highlightOf(source.active.value, node.id),
		isSelected: model.selection.value.includes(node.id),
		isFocused: map.focused.value === node.id,
		isExternal: node.isExternal ?? kind.isExternal ?? false,
		isCompact: map.isCompact.value && kind.render === 'html',
		tabIndex: source.tabIndexOf(node.id),
		expandLabel: node.kind === FLOW_COLLAPSED_KIND ? formatMessage(UI_FLOW_MAP.GROUP_EXPAND, { name: node.label }) : null,
	}
}

function buildNode(node: FlowNode, rect: FlowRect, source: FlowRenderSource): FlowNodeItem {
	const { model } = source
	const kind = model.nodeKind(node)
	const kindLabel = kind.label()
	return {
		...{ id: node.id, node, kind, rect, kindLabel },
		...describeOf(node, kindLabel, source),
		...iconOf(node.icon ?? kind.icon),
		...flagsOf(node, kind, source),
		shape: shapeView(kind.shape, rect),
		metrics: model.live.value.nodes?.[node.id]?.metrics ?? node.metrics ?? [],
	}
}

export function useFlowNodes(source: FlowRenderSource): ComputedRef<FlowNodeItem[]> {
	return computed(() => {
		const rects = source.model.layout.value.nodes
		return source.model.shown.value.nodes.flatMap(node => (rects[node.id] ? [buildNode(node, rects[node.id], source)] : []))
	})
}
