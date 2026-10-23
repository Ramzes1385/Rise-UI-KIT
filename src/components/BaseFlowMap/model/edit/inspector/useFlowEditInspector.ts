import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { getFlowEditing } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useInspectorSubject } from './inspectorSubject'
import { useFlowMapContext } from '../../context/flowContext'

export function useFlowEditInspector() {
	const { model, isCompact } = useFlowMapContext()
	const { context } = getFlowEditing(model)
	const { state } = context.env
	const { subject, target, fields, tabs } = useInspectorSubject(context)
	return {
		isVisible: computed(() => state.isEditing.value),
		isCompact,
		isDrawerOpen: computed({
			get: () => isCompact.value && model.selection.value.length > 0,
			set: (open: boolean) => !open && context.actions.clearSelection(),
		}),
		subject,
		target,
		fields,
		tabs,
		tab: computed({
			get: () => (tabs.value.some(item => item.id === state.tab.value) ? state.tab.value : 'props'),
			set: value => (state.tab.value = value as typeof state.tab.value),
		}),
		title: UI_FLOW_EDITOR.INSPECTOR,
		controller: model.controller,
		count: computed(() =>
			subject.value.type === 'many' ? formatMessage(UI_FLOW_EDITOR.MULTI_COUNT, { count: subject.value.ids.length }) : '',
		),
		counts: computed(() => [
			formatMessage(UI_FLOW_EDITOR.COUNT_NODES, { count: model.data.value.nodes.length }),
			formatMessage(UI_FLOW_EDITOR.COUNT_EDGES, { count: model.data.value.edges.length }),
			formatMessage(UI_FLOW_EDITOR.COUNT_GROUPS, { count: model.data.value.groups?.length ?? 0 }),
			formatMessage(UI_FLOW_EDITOR.COUNT_SCENARIOS, { count: model.data.value.scenarios?.length ?? 0 }),
		]),
		multi: {
			title: UI_FLOW_EDITOR.MULTI_TITLE,
			group: () => void context.actions.groupSelection(),
			align: () => void context.actions.align('top'),
			distribute: () => void context.actions.distribute('x'),
			labels: {
				group: UI_FLOW_EDITOR.GROUP_SELECTION,
				align: UI_FLOW_EDITOR.ALIGN_TOP_BUTTON,
				distribute: UI_FLOW_EDITOR.DISTRIBUTE_BUTTON,
			},
		},
		compactHint: UI_FLOW_EDITOR.COMPACT_HINT,
	}
}
