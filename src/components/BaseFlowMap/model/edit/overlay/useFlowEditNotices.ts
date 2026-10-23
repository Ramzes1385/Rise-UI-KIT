import { useEditContext } from '../useFlowEditing'
import { UI_FLOW_EDITOR } from '@/locales/messages'

export function useFlowEditNotices() {
	const { state } = useEditContext().env
	return {
		notices: state.notices,
		region: UI_FLOW_EDITOR.NOTICE_REGION,
		dismiss: (id: number) => (state.notices.value = state.notices.value.filter(item => item.id !== id)),
		dismissLabel: UI_FLOW_EDITOR.NOTICE_DISMISS,
	}
}
