import { computed } from 'vue'
import { useEditContext } from '../useFlowEditing'

export function useFlowEditChrome() {
	const { state } = useEditContext().env
	return { isVisible: computed(() => state.isEditing.value && !state.isCompact.value) }
}
