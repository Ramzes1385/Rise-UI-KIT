import { formatMessage } from '@/locales/state'
import { computed, type ComputedRef } from 'vue'
import { noteKindOf } from '../actions/editPlace'
import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { FLOW_EDIT_TOOLS } from '../../../types/internal/edit/flowEdit.types'
import type { FlowEditTool } from '../../../types/internal/edit/flowEdit.types'
import type { FlowEditContext } from '../../../types/internal/edit/flowEditApi.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

const TOOL_META: Record<FlowEditTool, { icon: string; key: string; name: () => string }> = {
	select: { icon: 'tool-select', key: 'V', name: () => UI_FLOW_EDITOR.TOOL_SELECT },
	hand: { icon: 'grip-vertical', key: 'H', name: () => UI_FLOW_EDITOR.TOOL_HAND },
	connect: { icon: 'link', key: 'C', name: () => UI_FLOW_EDITOR.TOOL_CONNECT },
	node: { icon: 'tool-rect', key: 'N', name: () => UI_FLOW_EDITOR.TOOL_NODE },
	note: { icon: 'sticky-note', key: 'T', name: () => UI_FLOW_EDITOR.TOOL_NOTE },
	group: { icon: 'layers', key: 'G', name: () => UI_FLOW_EDITOR.TOOL_GROUP_ITEM },
}

function toolbarText() {
	return {
		toolbar: UI_FLOW_EDITOR.TOOLBAR,
		group: UI_FLOW_EDITOR.TOOL_GROUP,
		undo: UI_FLOW_EDITOR.UNDO,
		redo: UI_FLOW_EDITOR.REDO,
		arrange: UI_FLOW_EDITOR.ARRANGE,
		align: UI_FLOW_EDITOR.ALIGN,
		distribute: UI_FLOW_EDITOR.DISTRIBUTE_X,
		grid: UI_FLOW_EDITOR.GRID,
		snap: UI_FLOW_EDITOR.SNAP,
		zoom: UI_FLOW_EDITOR.ZOOM,
		done: UI_FLOW_EDITOR.DONE,
		help: UI_FLOW_EDITOR.HELP,
		history: UI_FLOW_EDITOR.HISTORY,
		helpTitle: UI_FLOW_EDITOR.HELP_TITLE,
	}
}

function useArrangeItems(context: FlowEditContext, selectedNodes: ComputedRef<string[]>) {
	const { actions } = context
	const { model } = context.env
	const direction = computed(() => model.data.value.layout?.direction ?? model.notation.value.layout?.direction ?? 'LR')
	const arrangeItems = computed<DropdownMenuItem[][]>(() => [
		[
			{
				label: UI_FLOW_EDITOR.ARRANGE_TB,
				type: 'radio',
				isChecked: direction.value === 'TB',
				onSelect: () => void actions.arrange({ direction: 'TB', isForced: true }),
			},
			{
				label: UI_FLOW_EDITOR.ARRANGE_LR,
				type: 'radio',
				isChecked: direction.value === 'LR',
				onSelect: () => void actions.arrange({ direction: 'LR', isForced: true }),
			},
			{
				label: UI_FLOW_EDITOR.ARRANGE_LANES,
				type: 'checkbox',
				isChecked: Boolean(model.data.value.layout?.byLanes),
				onSelect: () => void actions.arrange({ byLanes: !model.data.value.layout?.byLanes, isForced: true }),
			},
		],
		[
			{
				label: UI_FLOW_EDITOR.ARRANGE_SELECTED,
				isDisabled: selectedNodes.value.length === 0,
				onSelect: () => void actions.arrange({ ids: selectedNodes.value }),
			},
		],
	])
	return arrangeItems
}

export function useFlowEditToolbar() {
	const context = useEditContext()
	const { actions } = context
	const { model, map, state } = context.env
	const selectedNodes = computed(() => model.selection.value.filter(id => model.graph.value.nodes.has(id)))
	const tools = computed(() =>
		FLOW_EDIT_TOOLS.filter(tool => tool !== 'note' || noteKindOf(context) !== null).map(tool => ({
			id: tool,
			icon: TOOL_META[tool].icon,
			key: TOOL_META[tool].key,
			label: formatMessage(UI_FLOW_EDITOR.TOOL_LABEL, { name: TOOL_META[tool].name(), key: TOOL_META[tool].key }),
			isActive: state.tool.value === tool,
		})),
	)
	const arrangeItems = useArrangeItems(context, selectedNodes)
	const aligns = [
		{ id: 'left', icon: 'align-left', label: UI_FLOW_EDITOR.ALIGN_LEFT },
		{ id: 'center', icon: 'align-center', label: UI_FLOW_EDITOR.ALIGN_CENTER },
		{ id: 'top', icon: 'chevron-up', label: UI_FLOW_EDITOR.ALIGN_TOP },
	] as const
	return {
		tools,
		aligns,
		arrangeItems,
		isMultiple: computed(() => selectedNodes.value.length > 1),
		isDistributable: computed(() => selectedNodes.value.length > 2),
		history: model.history.state,
		isGridOn: state.isGridOn,
		isSnapOn: state.isSnapOn,
		isHelpOpen: state.isHelpOpen,
		percent: computed(() => Math.round(map.viewport.value.zoom * 100)),
		pick: (tool: FlowEditTool) => {
			state.tool.value = tool
			map.announce(formatMessage(UI_FLOW_EDITOR.ANNOUNCE_TOOL, { name: TOOL_META[tool].name() }))
		},
		undo: actions.undo,
		redo: actions.redo,
		align: (mode: Parameters<typeof actions.align>[0]) => void actions.align(mode),
		distribute: () => void actions.distribute('x'),
		zoomIn: () => model.controller.zoom('in'),
		zoomOut: () => model.controller.zoom('out'),
		done: () => model.events.emit('update:mode', 'view'),
		text: toolbarText(),
	}
}
