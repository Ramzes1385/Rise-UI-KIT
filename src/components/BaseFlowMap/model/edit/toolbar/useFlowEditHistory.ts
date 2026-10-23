import { computed } from 'vue'
import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'

export function useFlowEditHistory() {
	const { model } = useEditContext().env
	return {
		title: UI_FLOW_EDITOR.HISTORY,
		empty: UI_FLOW_EDITOR.HISTORY_EMPTY,
		undone: UI_FLOW_EDITOR.HISTORY_UNDONE,
		items: computed(() => {
			void model.history.state.value
			return [...model.history.list()].reverse().map((item, index) => ({
				key: `${item.time}-${index}`,
				label: item.label,
				time: new Date(item.time).toLocaleTimeString(),
				isUndone: item.isUndone,
			}))
		}),
	}
}
