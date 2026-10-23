import { computed, ref } from 'vue'
import { writer } from './editFields'
import { getFlowEditing } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowMapContext } from '../../context/flowContext'

export function useFlowEditData(props: { id: string }) {
	const { model } = useFlowMapContext()
	const { context } = getFlowEditing(model)
	const write = writer(context, 'node', props.id)
	const node = computed(() => model.graph.value.nodes.get(props.id))
	const name = ref('')
	const value = ref('')
	return {
		name,
		value,
		metrics: computed(() => node.value?.metrics ?? []),
		fields: computed(() => node.value?.fields ?? []),
		add: () => {
			const label = name.value.trim()
			if (!label) return
			const fields = [...(node.value?.fields ?? []), { id: `f-${Date.now().toString(36)}`, label, value: value.value }]
			write({ fields })
			name.value = ''
			value.value = ''
		},
		remove: (id: string) => write({ fields: (node.value?.fields ?? []).filter(field => field.id !== id) }),
		text: {
			metrics: UI_FLOW_EDITOR.DATA_METRICS,
			fields: UI_FLOW_EDITOR.DATA_FIELDS,
			empty: UI_FLOW_EDITOR.DATA_EMPTY,
			add: UI_FLOW_EDITOR.FIELD_ADD,
			name: UI_FLOW_EDITOR.FIELD_ADD_NAME,
			value: UI_FLOW_EDITOR.FIELD_VALUE,
			remove: UI_FLOW_EDITOR.FIELD_REMOVE,
		},
	}
}
