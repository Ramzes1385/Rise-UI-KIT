import { startLabel } from '../panels/editLabel'
import { matchesHotkey } from '@composables/interaction/useHotkeys'
import { addFollowing, noteKindOf, placeNode, viewCenter } from './editPlace'
import type { FlowEditTool } from '../../../types/internal/edit/flowEdit.types'
import type { FlowEditContext, FlowEditKeys } from '../../../types/internal/edit/flowEditApi.types'

const STEP = 8

function toolKey(context: FlowEditContext, tool: FlowEditTool): () => void {
	return () => {
		const { state } = context.env
		state.tool.value = tool
		if (tool === 'group' && context.env.model.selection.value.length > 0) {
			state.tool.value = 'select'
			void context.actions.groupSelection()
		}
	}
}

function nudgeKey(context: FlowEditContext, vector: { dx: number; dy: number }, isFine: boolean): () => void {
	const step = isFine ? 1 : (context.env.model.data.value.layout?.gridSize ?? STEP)
	return () => void context.actions.nudge({ x: vector.dx * step, y: vector.dy * step })
}

function focusedRef(context: FlowEditContext) {
	const { map, model } = context.env
	const id = map.focused.value ?? model.selection.value[0]
	if (!id) return null
	const graph = model.graph.value
	if (graph.nodes.has(id)) return { entity: 'node' as const, id }
	return graph.edges.has(id) ? { entity: 'edge' as const, id } : { entity: 'group' as const, id }
}

function editFlowEditKeys(context: FlowEditContext): FlowEditKeys {
	const { actions } = context
	return {
		delete: () => void actions.removeSelection(),
		backspace: () => void actions.removeSelection(),
		'mod+z': actions.undo,
		'mod+shift+z': actions.redo,
		'mod+y': actions.redo,
		'mod+a': actions.selectAll,
		'mod+c': () => void actions.copy(),
		'mod+x': () => void actions.cut(),
		'mod+v': () => void actions.paste(),
		'mod+d': () => void actions.duplicate(),
		f2: () => {
			const target = focusedRef(context)
			if (target) startLabel(context, target)
		},
	}
}

function toolFlowEditKeys(context: FlowEditContext): FlowEditKeys {
	const { model, state } = context.env
	return {
		v: toolKey(context, 'select'),
		h: toolKey(context, 'hand'),
		g: toolKey(context, 'group'),
		c: () => {
			const id = model.selection.value.find(item => model.graph.value.nodes.has(item)) ?? context.env.map.focused.value
			state.linkFrom.value = id ?? null
		},
		n: () => void placeNode(context, { kind: model.notation.value.defaultNodeKind, at: viewCenter(context) }),
		t: () => {
			const kind = noteKindOf(context)
			if (kind) void placeNode(context, { kind, at: viewCenter(context) })
		},
		escape: () => {
			if (state.tool.value !== 'select') state.tool.value = 'select'
			else context.actions.clearSelection()
		},
		enter: () => {
			if (state.tool.value === 'node') void addFollowing(context, model.notation.value.defaultNodeKind)
		},
	}
}

function viewFlowEditKeys(context: FlowEditContext): FlowEditKeys {
	const { model, map, state } = context.env
	return {
		'?': () => (state.isHelpOpen.value = !state.isHelpOpen.value),
		plus: () => model.controller.zoom('in'),
		'-': () => model.controller.zoom('out'),
		'0': () => model.controller.fitView(),
		space: event => {
			const id = map.focused.value
			if ((event.target as Element).closest('[data-flow-id]') && id) model.controller.select([id], 'toggle')
			else state.isHandHeld.value = true
		},
	}
}

export function createKeyMap(context: FlowEditContext): FlowEditKeys {
	const keys: FlowEditKeys = { ...editFlowEditKeys(context), ...toolFlowEditKeys(context), ...viewFlowEditKeys(context) }
	for (const [key, dx, dy] of [
		['left', -1, 0],
		['right', 1, 0],
		['up', 0, -1],
		['down', 0, 1],
	] as const) {
		keys[`shift+${key}`] = nudgeKey(context, { dx, dy }, false)
		keys[`shift+alt+${key}`] = nudgeKey(context, { dx, dy }, true)
	}
	return keys
}

function isBlocked(context: FlowEditContext, event: KeyboardEvent): boolean {
	const { state } = context.env
	return event.defaultPrevented || event.isComposing || !state.isActive.value || state.isCompact.value
}

export function handleKeydown(context: FlowEditContext, keys: FlowEditKeys, event: KeyboardEvent): void {
	if (isBlocked(context, event)) return
	const isField = Boolean((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]'))
	const found = Object.entries(keys).find(([hotkey]) => matchesHotkey(event, hotkey) && (!isField || /mod|alt/.test(hotkey)))
	if (!found) return
	event.preventDefault()
	event.stopPropagation()
	found[1](event)
}
