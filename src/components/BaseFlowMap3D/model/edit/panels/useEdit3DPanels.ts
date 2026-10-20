import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { isModelUrl } from '../actions/useModelPalette'
import type { FlowMap3DComposeParts } from '../../../types/internal/flowMap3dCompose.types'
import type { FlowMap3DEdit, FlowMap3DEditUi, FlowMap3DPanelContext } from '../../../types/internal/flowMap3dEdit.types'

const STATUSES = [
	{ value: 'ok', label: () => UI_FLOW_MAP_3D.STATUS_OK, color: 'var(--rise-success)' },
	{ value: 'warning', label: () => UI_FLOW_MAP_3D.STATUS_WARNING, color: 'var(--rise-warning)' },
	{ value: 'down', label: () => UI_FLOW_MAP_3D.STATUS_DOWN, color: 'var(--rise-error)' },
]

function useNode(parts: FlowMap3DComposeParts, edit: FlowMap3DEdit) {
	const { model } = parts.core
	return computed(() => {
		const id = edit.selection.value[0]
		return id ? (model.graph.value.nodes.get(id) ?? null) : null
	})
}

function useHandlers(context: FlowMap3DPanelContext) {
	const { edit, node } = context
	const { actions, palette } = edit
	const ids = () => edit.selection.value
	const done = (isDone: boolean): void => void (isDone && palette.close())
	function loadUrl(): void {
		if (!isModelUrl(palette.url.value)) return edit.notify({ text: UI_FLOW_MAP_3D.PALETTE_URL_INVALID, kind: 'warning' })
		void actions.replaceModel(ids(), { url: palette.url.value.trim() }).then(done)
	}
	return {
		rotate: () => void actions.rotate(ids()),
		remove: () => void actions.remove(ids()),
		swap: palette.toggle,
		pick: (key: string) => void actions.replaceModel(ids(), { model: key }).then(done),
		loadUrl,
		rename: (label: string) => void (node.value && actions.rename(node.value.id, label)),
		status: (value: string) => void actions.setStatus(ids(), value),
		tint: (value: string | null) => void actions.setTint(ids(), value),
		scale: (scale: number) => void actions.setPose(ids(), { scale }),
		elevation: (elevation: number) => void actions.setPose(ids(), { elevation }),
	}
}

function useNodeFacts(context: FlowMap3DPanelContext) {
	const { parts, edit, node } = context
	const { model } = parts.core
	const groupOf = (group: string | undefined): string => (group ? (model.graph.value.groups.get(group)?.label ?? '') : '')
	return computed(() => {
		const current = node.value
		const rect = current ? model.layout.value.nodes[current.id] : undefined
		return {
			kindLabel: current ? model.nodeKind(current).label() : '',
			groupLabel: groupOf(current?.group),
			modelKey: current ? edit.palette.keyOf(current.id) : '',
			x: rect?.x ?? 0,
			y: rect?.y ?? 0,
		}
	})
}

function useInspector(context: FlowMap3DPanelContext) {
	const { edit, ui, node } = context
	const facts = useNodeFacts(context)
	return computed(() => ({
		className: ui('inspector'),
		node: node.value,
		count: edit.selection.value.length,
		...facts.value,
		modelTitle: edit.palette.currentTitle.value,
		status: node.value?.status ?? 'ok',
		statuses: STATUSES.map(item => ({ value: item.value, label: item.label(), color: item.color })),
		history: edit.history.value,
		focusTick: edit.inspectorFocus.value,
	}))
}

function useToolbar(edit: FlowMap3DEdit, ui: FlowMap3DEditUi, node: FlowMap3DPanelContext['node']) {
	const name = computed(() => {
		const count = edit.selection.value.length
		return count > 1 ? formatMessage(UI_FLOW_MAP_3D.EDIT_SELECTED_MANY, { count }) : (node.value?.label ?? '—')
	})
	return computed(() => ({
		className: ui('toolbar'),
		name: name.value,
		hasSelection: edit.selection.value.length > 0,
		isLinking: edit.tool.value === 'link',
		isSwapOpen: edit.palette.isOpen.value,
	}))
}

export function useEdit3DPanels(parts: FlowMap3DComposeParts, edit: FlowMap3DEdit, ui: FlowMap3DEditUi) {
	const node = useNode(parts, edit)
	const context = { parts, edit, ui, node }
	const { palette } = edit
	return {
		inspector: useInspector(context),
		toolbar: useToolbar(edit, ui, node),
		palette: computed(() => ({
			className: ui('palette'),
			groups: palette.groups.value,
			currentTitle: palette.currentTitle.value,
			url: palette.url.value,
		})),
		on: useHandlers(context),
		isPaletteOpen: computed(() => palette.isOpen.value && edit.selection.value.length > 0),
		hint: computed(() =>
			edit.tool.value === 'link' ? edit.connect.refusal.value || UI_FLOW_MAP_3D.EDIT_HINT_LINK : UI_FLOW_MAP_3D.EDIT_HINT,
		),
	}
}
