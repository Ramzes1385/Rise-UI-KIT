import { ref, watch } from 'vue'
import type { FlowEditFieldDef } from '../../../types/internal/edit/flowEditApi.types'

export function useFlowEditField(props: { field: FlowEditFieldDef }) {
	const draft = ref<string>(String(props.field.value ?? ''))
	watch(
		() => props.field.value,
		value => (draft.value = String(value ?? '')),
	)
	return {
		draft,
		save: () => {
			if (draft.value !== String(props.field.value ?? '')) props.field.commit(draft.value)
		},
		commit: (value: string | number | boolean | null) => props.field.commit(value),
		number: (value: number | null) => props.field.commit(value),
		options: () => (props.field.options ?? []).map(option => ({ value: option.value, label: option.label })),
	}
}
