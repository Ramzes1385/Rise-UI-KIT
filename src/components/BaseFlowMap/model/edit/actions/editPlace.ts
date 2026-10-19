import { startLabel } from '../panels/editLabel'
import { snapToGrid } from '../geometry/editGeometry'
import { collectFlowIds, createFlowId } from '../../data/flowIds'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowNode, FlowPoint, FlowRect } from '../../../types/data/flowData.types'

const FOLLOW_GAP = 56
const DEFAULT_GRID = 8

export function noteKindOf(context: FlowEditContext): string | null {
	const kinds = context.env.model.notation.value.nodeKinds
	return Object.keys(kinds).find(id => kinds[id].shape.shape === 'note') ?? null
}

function draftNode(context: FlowEditContext, kind: string, at: FlowPoint): FlowNode {
	const { model, state } = context.env
	const def = model.notation.value.nodeKinds[kind]
	const size = def?.size ?? { width: 160, height: 56 }
	const grid = state.isSnapOn.value ? (model.data.value.layout?.gridSize ?? DEFAULT_GRID) : 0
	const id = createFlowId('n', collectFlowIds(model.data.value))
	const position = { x: snapToGrid(at.x - size.width / 2, grid), y: snapToGrid(at.y - size.height / 2, grid) }
	return { id, kind, label: def ? def.label() : kind, position, isPinned: true }
}

export async function placeNode(context: FlowEditContext, input: { kind: string; at: FlowPoint }): Promise<string | null> {
	const node = draftNode(context, input.kind, input.at)
	const result = await context.commands.addNode(node)
	if (!result.isApplied) return null
	context.env.model.controller.select([node.id])
	startLabel(context, { entity: 'node', id: node.id })
	return node.id
}

export function viewCenter(context: FlowEditContext): FlowPoint {
	const { viewport, frame } = context.env.map
	return {
		x: (frame.value.width / 2 - viewport.value.x) / viewport.value.zoom,
		y: (frame.value.height / 2 - viewport.value.y) / viewport.value.zoom,
	}
}

function followPoint(context: FlowEditContext, input: { rect: FlowRect; kind: string }): FlowPoint {
	const { model } = context.env
	const { rect } = input
	const isVertical = (model.data.value.layout?.direction ?? model.notation.value.layout?.direction) === 'TB'
	const size = model.notation.value.nodeKinds[input.kind].size
	return isVertical
		? { x: rect.x + rect.width / 2, y: rect.y + rect.height + FOLLOW_GAP + size.height / 2 }
		: { x: rect.x + rect.width + FOLLOW_GAP + size.width / 2, y: rect.y + rect.height / 2 }
}

export async function addFollowing(context: FlowEditContext, kind: string): Promise<string | null> {
	const { model, map } = context.env
	const anchor = model.selection.value.find(id => model.graph.value.nodes.has(id)) ?? map.focused.value
	const rect = anchor ? model.layout.value.nodes[anchor] : undefined
	if (!anchor || !rect) return placeNode(context, { kind, at: viewCenter(context) })
	const node = draftNode(context, kind, followPoint(context, { rect, kind }))
	await model.controller.transact(node.label, async () => {
		const added = await context.commands.addNode(node)
		if (added.isApplied) await context.commands.connect([{ node: anchor }, { node: node.id }])
	})
	model.controller.select([node.id])
	startLabel(context, { entity: 'node', id: node.id })
	return node.id
}
