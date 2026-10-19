import { toScreen } from '../geometry/editGeometry'
import type { FlowRect } from '../../../types/data/flowData.types'
import type { FlowElementRef } from '../../../types/data/flowReview.types'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'

function edgeFrame(context: FlowEditContext, id: string): FlowRect | null {
	const route = context.env.model.routes.value[id]
	const point = route?.label?.point ?? route?.points[Math.floor((route?.points.length ?? 0) / 2)]
	return point ? { x: point.x - 60, y: point.y - 12, width: 120, height: 24 } : null
}

function frameOf(context: FlowEditContext, target: FlowElementRef): FlowRect | null {
	const { layout } = context.env.model
	if (target.entity === 'node') return layout.value.nodes[target.id] ?? null
	return target.entity === 'group' ? (layout.value.groups[target.id] ?? null) : edgeFrame(context, target.id)
}

function textOf(context: FlowEditContext, target: FlowElementRef): string {
	const { graph } = context.env.model
	const tables = {
		node: graph.value.nodes,
		edge: graph.value.edges,
		group: graph.value.groups,
		scenario: new Map<string, { label?: string }>(),
	}
	return tables[target.entity].get(target.id)?.label ?? ''
}

export function startLabel(context: FlowEditContext, target: FlowElementRef): void {
	const { model, state } = context.env
	const rect = frameOf(context, target)
	if (!rect || target.entity === 'scenario') return
	const view = context.view()
	const origin = toScreen(rect, view)
	const node = target.entity === 'node' ? model.graph.value.nodes.get(target.id) : undefined
	const isMultiline = node ? model.nodeKind(node).shape.shape === 'note' : false
	const box = { x: origin.x, y: origin.y, width: rect.width * view.viewport.zoom, height: rect.height * view.viewport.zoom }
	state.label.value = { target, box, value: textOf(context, target), isMultiline }
}

export async function commitLabel(context: FlowEditContext, value: string): Promise<void> {
	const { state } = context.env
	const draft = state.label.value
	state.label.value = null
	if (!draft || value === draft.value) return
	const entity = draft.target.entity
	if (entity === 'scenario') return
	await context.commands.update({ entity, id: draft.target.id }, { label: value })
}

export function cancelLabel(context: FlowEditContext): void {
	context.env.state.label.value = null
}
