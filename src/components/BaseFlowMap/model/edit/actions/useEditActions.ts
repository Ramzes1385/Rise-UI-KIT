import { formatMessage } from '@/locales/state'
import { unionOf } from '../geometry/editGeometry'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useConfirm } from '@components/BaseConfirm/useConfirm'
import { alignPositions, distributePositions } from './editAlign'
import type { FlowPoint } from '../../../types/data/flowData.types'
import { buildClip, parseClip, pasteClip, PASTE_OFFSET } from './editClipboard'
import type { FlowCommandResult } from '../../../types/api/flowController.types'
import type { FlowLayoutOptions } from '../../../types/internal/core/flowCommandInternal.types'
import type { FlowEditAlign, FlowEditClip, FlowEditEnv } from '../../../types/internal/edit/flowEdit.types'
import type {
	FlowEditActionContext,
	FlowEditActions,
	FlowEditCommands,
	FlowEditNotify,
} from '../../../types/internal/edit/flowEditApi.types'

function selectedIds(context: FlowEditActionContext): string[] {
	const { graph, selection } = context.env.model
	return selection.value.filter(id => graph.value.nodes.has(id) || graph.value.groups.has(id))
}

function selectedNodes(context: FlowEditActionContext): { id: string; rect: { x: number; y: number; width: number; height: number } }[] {
	const { graph, layout, selection } = context.env.model
	return selection.value.flatMap(id => {
		const rect = layout.value.nodes[id]
		return graph.value.nodes.has(id) && rect ? [{ id, rect }] : []
	})
}

function positionsOf(context: FlowEditActionContext): Record<string, FlowPoint> {
	return Object.fromEntries(Object.entries(context.env.model.layout.value.nodes).map(([id, rect]) => [id, { x: rect.x, y: rect.y }]))
}

function nodeIdsOf(context: FlowEditActionContext, ids: readonly string[]): string[] {
	return ids.filter(id => context.env.model.graph.value.nodes.has(id))
}

const memory = new WeakMap<object, string>()

async function writeClip(context: FlowEditActionContext, clip: FlowEditClip): Promise<void> {
	const text = JSON.stringify(clip)
	memory.set(context.env.model, text)
	try {
		await navigator.clipboard?.writeText(text)
	} catch {
		return
	}
}

async function readClip(context: FlowEditActionContext): Promise<FlowEditClip | null> {
	let text: string | undefined
	try {
		text = await navigator.clipboard?.readText()
	} catch {
		text = undefined
	}
	return parseClip(text ?? '') ?? parseClip(memory.get(context.env.model) ?? '')
}

async function pasteInto(context: FlowEditActionContext, clip: FlowEditClip): Promise<void> {
	const { model } = context.env
	const pasted = pasteClip(model.data.value, clip, { x: PASTE_OFFSET, y: PASTE_OFFSET })
	const ids = [...pasted.groups, ...pasted.nodes].map(item => item.id)
	await model.controller.transact(UI_FLOW_EDITOR.CMD_PASTE, async () => {
		for (const group of pasted.groups) await context.commands.addGroup(group)
		for (const node of pasted.nodes) await context.commands.addNode(node)
		for (const edge of pasted.edges) await context.commands.addEdge(edge)
	})
	model.controller.select(ids)
	context.env.map.announce(formatMessage(UI_FLOW_EDITOR.ANNOUNCE_PASTED, { count: ids.length }))
}

function clipboardActions(context: FlowEditActionContext, removeSelection: () => Promise<void>) {
	const { model } = context.env
	const copy = async (): Promise<void> => {
		const ids = selectedIds(context)
		if (ids.length > 0) await writeClip(context, buildClip(model.data.value, ids, positionsOf(context)))
	}
	return {
		copy,
		cut: async () => {
			await copy()
			await removeSelection()
		},
		paste: async () => {
			const clip = await readClip(context)
			if (clip) await pasteInto(context, clip)
		},
		duplicate: async () => {
			const ids = selectedIds(context)
			if (ids.length > 0) await pasteInto(context, buildClip(model.data.value, ids, positionsOf(context)))
		},
	}
}

function arrangeActions(context: FlowEditActionContext) {
	const { model } = context.env
	const place = async (positions: Record<string, FlowPoint>): Promise<void> => {
		if (Object.keys(positions).length > 0) await context.commands.move(Object.keys(positions), positions)
	}
	return {
		nudge: async (delta: FlowPoint): Promise<void> => {
			const ids = nodeIdsOf(context, model.selection.value)
			if (ids.length > 0) await context.commands.move(ids, delta)
		},
		align: (mode: FlowEditAlign) => place(alignPositions(selectedNodes(context), mode)),
		distribute: (axis: 'x' | 'y') => place(distributePositions(selectedNodes(context), axis)),
		groupSelection: () => groupNodes(context),
		arrange: async (options?: FlowLayoutOptions) => reportLayout(context, await context.commands.layout(options)),
	}
}

function selectionActions(context: FlowEditActionContext) {
	const { model, map } = context.env
	return {
		selectAll: () => {
			model.controller.select(model.data.value.nodes.map(node => node.id))
			map.announce(formatMessage(UI_FLOW_EDITOR.ANNOUNCE_SELECTED_ALL, { count: model.data.value.nodes.length }))
		},
		clearSelection: () => {
			model.controller.select([])
			map.openDetails(null)
		},
		undo: () => stepHistory(context, 'undo'),
		redo: () => stepHistory(context, 'redo'),
	}
}

export function useEditActions(env: FlowEditEnv, commands: FlowEditCommands, notify: FlowEditNotify): FlowEditActions {
	const context: FlowEditActionContext = { env, commands, notify }
	const { model } = env
	const confirm = useConfirm()
	const removeSelection = async (): Promise<void> => {
		const ids = model.selection.value
		if (ids.length === 0) return
		const isPool = ids.some(id => model.graph.value.groups.get(id)?.kind === 'pool')
		const isConfirmed =
			!isPool ||
			(await confirm({ title: UI_FLOW_EDITOR.CONFIRM_POOL_TITLE, description: UI_FLOW_EDITOR.CONFIRM_POOL_TEXT, isDanger: true }))
		if (isConfirmed) await commands.remove([...ids])
		model.controller.select([])
	}
	return { removeSelection, ...clipboardActions(context, removeSelection), ...arrangeActions(context), ...selectionActions(context) }
}

function reportLayout(context: FlowEditActionContext, result: FlowCommandResult): void {
	if (result.isApplied) context.env.map.announce(UI_FLOW_EDITOR.ANNOUNCE_ARRANGED)
}

function stepHistory(context: FlowEditActionContext, direction: 'undo' | 'redo'): void {
	const { model } = context.env
	const state = model.history.state.value
	const label = direction === 'undo' ? state.undoLabel : state.redoLabel
	model.controller[direction]()
	if (!label) return
	const text = direction === 'undo' ? UI_FLOW_EDITOR.NOTICE_UNDONE : UI_FLOW_EDITOR.NOTICE_REDONE
	context.notify('info', formatMessage(text, { label }))
}

async function groupNodes(context: FlowEditActionContext): Promise<void> {
	const { model } = context.env
	const nodes = selectedNodes(context)
	if (nodes.length === 0) return
	const kinds = Object.keys(model.notation.value.groupKinds ?? {})
	const kind = kinds.includes('zone') ? 'zone' : (kinds[0] ?? 'zone')
	const id = `g-${model.data.value.groups?.length ?? 0}-${Date.now().toString(36)}`
	const frame = unionOf(nodes.map(node => node.rect))
	await model.controller.transact(UI_FLOW_EDITOR.CMD_GROUP, async () => {
		await context.commands.addGroup({ id, kind, label: UI_FLOW_EDITOR.GROUP_LABEL, position: { x: frame.x, y: frame.y } })
		for (const node of nodes) await context.commands.update({ entity: 'node', id: node.id }, { group: id })
	})
	model.controller.select([id])
}
