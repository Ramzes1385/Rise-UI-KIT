import { trackPointer } from './editTrack'
import { snapMove } from '../geometry/editSnap'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import type { FlowPoint, FlowRect } from '../../../types/data/flowData.types'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'
import { areaOf, containsPoint, centerOf, shifted, toCanvas, unionOf } from '../geometry/editGeometry'

const GUIDE_PX = 6
const DEFAULT_GRID = 8

function gridOf(context: FlowEditContext): number {
	const { data, notation } = context.env.model
	return data.value.layout?.gridSize ?? notation.value.layout?.gridSize ?? DEFAULT_GRID
}

function groupAt(context: FlowEditContext, point: FlowPoint): string | null {
	const found = Object.entries(context.env.model.layout.value.groups)
		.filter(([, rect]) => containsPoint(rect, point))
		.sort(([, first], [, second]) => areaOf(first) - areaOf(second))
	return found[0]?.[0] ?? null
}

function dragIds(context: FlowEditContext, id: string, isToggle: boolean): string[] {
	const { model } = context.env
	const nodes = new Set(model.graph.value.nodes.keys())
	const selected = model.selection.value.filter(item => nodes.has(item))
	if (selected.includes(id)) return selected
	model.controller.select([id], isToggle ? 'add' : 'replace')
	return isToggle ? [...selected, id] : [id]
}

function denial(context: FlowEditContext, ids: readonly string[], group: string | null): string | null {
	const { model } = context.env
	const target = group === null ? null : (model.graph.value.groups.get(group) ?? null)
	for (const id of ids) {
		const node = model.graph.value.nodes.get(id)
		const verdict = node ? model.notation.value.rules?.canContain?.(target, node) : undefined
		if (verdict !== undefined && verdict !== true) return verdict.message
	}
	return null
}

function regrouped(context: FlowEditContext, ids: readonly string[], group: string | null): string[] {
	const { graph, layout } = context.env.model
	if (Object.keys(layout.value.groups).length === 0) return []
	return ids.filter(id => (graph.value.nodes.get(id)?.group ?? null) !== group)
}

async function commit(
	context: FlowEditContext,
	input: { ids: string[]; rects: Record<string, FlowRect>; delta: FlowPoint },
): Promise<void> {
	const { model } = context.env
	const { ids, rects, delta } = input
	const group = context.env.state.dropGroup.value
	const positions = Object.fromEntries(ids.map(id => [id, { x: rects[id].x + delta.x, y: rects[id].y + delta.y }]))
	const changed = regrouped(context, ids, group)
	const message = changed.length > 0 ? denial(context, changed, group) : null
	if (message) return context.notify('warning', formatMessage(UI_FLOW_EDITOR.NOTICE_DENIED, { message }))
	if (changed.length === 0) {
		await context.commands.move(ids, positions)
		return
	}
	await model.controller.transact(formatMessage(UI_FLOW_EDITOR.CMD_MOVE_INTO, { count: ids.length }), async () => {
		await context.commands.move(ids, positions)
		for (const id of changed) await context.commands.update({ entity: 'node', id }, { group: group ?? undefined })
	})
}

export function startDrag(context: FlowEditContext, event: PointerEvent, id: string): void {
	const { model, state } = context.env
	const ids = dragIds(context, id, event.shiftKey || event.ctrlKey || event.metaKey)
	const rects = Object.fromEntries(ids.flatMap(item => (model.layout.value.nodes[item] ? [[item, model.layout.value.nodes[item]]] : [])))
	const moving = Object.values(rects)
	const others = Object.entries(model.layout.value.nodes)
		.filter(([key]) => !ids.includes(key))
		.map(([, rect]) => rect)
	const start = toCanvas(event, context.view())
	let delta: FlowPoint = { x: 0, y: 0 }
	const update = (next: PointerEvent): void => {
		const point = toCanvas(next, context.view())
		const isSnap = state.isSnapOn.value && !next.altKey
		const snapped = snapMove({
			moving,
			others,
			delta: { x: point.x - start.x, y: point.y - start.y },
			grid: gridOf(context),
			tolerance: GUIDE_PX / context.view().viewport.zoom,
			isGrid: isSnap,
			isGuides: isSnap,
		})
		delta = snapped.delta
		state.guides.value = snapped.guides
		state.ghosts.value = ids.map(item => ({ id: item, rect: shifted(rects[item], delta) }))
		state.dropGroup.value = groupAt(context, centerOf(shifted(unionOf(moving), delta)))
	}
	const clear = (): void => {
		state.guides.value = []
		state.ghosts.value = []
		state.dropGroup.value = null
	}
	trackPointer(event, {
		onMove: update,
		onEnd: (_, isMoved) => {
			context.flags.isClickSuppressed = isMoved
			if (isMoved && moving.length > 0) void commit(context, { ids, rects, delta }).then(clear)
			else clear()
		},
	})
}
