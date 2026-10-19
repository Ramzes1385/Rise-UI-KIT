import { computed, ref, watch } from 'vue'
import { startLabel } from '../panels/editLabel'
import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu/types/BaseDropdownMenu.types'

export function useFlowEditMenu() {
	const context = useEditContext()
	const { actions } = context
	const { model, state } = context.env
	const menuRef = ref<{ openAt: (x: number, y: number) => void } | null>(null)
	const items = computed<DropdownMenuItem[][]>(() => {
		const target = state.menu.value?.target ?? null
		const hasNodes = model.selection.value.some(id => model.graph.value.nodes.has(id))
		return [
			[
				{
					label: UI_FLOW_EDITOR.MENU_RENAME,
					shortcut: 'F2',
					isDisabled: !target,
					onSelect: () => target && startLabel(context, target),
				},
				{
					label: UI_FLOW_EDITOR.MENU_CONNECT,
					shortcut: 'C',
					isDisabled: !hasNodes,
					onSelect: () => (state.linkFrom.value = model.selection.value[0] ?? null),
				},
				{ label: UI_FLOW_EDITOR.MENU_GROUP, shortcut: 'G', isDisabled: !hasNodes, onSelect: () => void actions.groupSelection() },
			],
			[
				{ label: UI_FLOW_EDITOR.MENU_COPY, shortcut: 'Ctrl+C', onSelect: () => void actions.copy() },
				{ label: UI_FLOW_EDITOR.MENU_CUT, shortcut: 'Ctrl+X', onSelect: () => void actions.cut() },
				{ label: UI_FLOW_EDITOR.MENU_PASTE, shortcut: 'Ctrl+V', onSelect: () => void actions.paste() },
				{ label: UI_FLOW_EDITOR.MENU_DUPLICATE, shortcut: 'Ctrl+D', onSelect: () => void actions.duplicate() },
			],
			[{ label: UI_FLOW_EDITOR.MENU_DELETE, shortcut: 'Del', isDanger: true, onSelect: () => void actions.removeSelection() }],
		]
	})
	watch(state.menu, menu => {
		if (menu) menuRef.value?.openAt(menu.x, menu.y)
	})
	return {
		items,
		ariaLabel: UI_FLOW_EDITOR.MENU,
		attach: (element: unknown) => (menuRef.value = element as typeof menuRef.value),
	}
}
