import { computed } from 'vue'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import type { TabItem } from '@components/BaseTabs/types/BaseTabs.types'
import { edgeFields, groupFields, manyFields, mapFields, nodeFields } from './editFields'
import type { FlowEditContext, FlowEditSubject } from '../../../types/internal/edit/flowEditApi.types'

export function useInspectorSubject(context: FlowEditContext) {
	const { model } = context.env
	const subject = computed<FlowEditSubject>(() => {
		const ids = model.selection.value
		if (ids.length > 1) return { type: 'many', ids: [...ids] }
		const graph = model.graph.value
		const id = ids[0]
		if (id && graph.nodes.has(id)) return { type: 'node', id }
		if (id && graph.edges.has(id)) return { type: 'edge', id }
		return id && graph.groups.has(id) ? { type: 'group', id } : { type: 'map' }
	})
	const target = computed(() => {
		const current = subject.value
		return current.type === 'map' || current.type === 'many' ? null : { entity: current.type, id: current.id }
	})
	const fields = computed(() => {
		const current = subject.value
		const graph = model.graph.value
		if (current.type === 'node') return nodeFields(context, graph.nodes.get(current.id)!)
		if (current.type === 'edge') return edgeFields(context, graph.edges.get(current.id)!)
		if (current.type === 'group') return groupFields(context, graph.groups.get(current.id)!)
		return current.type === 'many' ? manyFields(context, current.ids) : mapFields(context)
	})
	const tabs = computed<TabItem[]>(() => [
		{ id: 'props', label: UI_FLOW_EDITOR.TAB_PROPS },
		...(subject.value.type === 'node'
			? [
					{ id: 'style', label: UI_FLOW_EDITOR.TAB_STYLE },
					{ id: 'data', label: UI_FLOW_EDITOR.TAB_DATA },
				]
			: []),
		{ id: 'hooks', label: UI_FLOW_EDITOR.TAB_HOOKS },
	])
	return { subject, target, fields, tabs }
}
