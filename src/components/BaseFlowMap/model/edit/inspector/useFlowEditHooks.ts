import { formatMessage } from '@/locales/state'
import { onScopeDispose, ref, watch } from 'vue'
import { UI_FLOW_EDITOR } from '@/locales/messages'
import { useFlowMapContext } from '../../context/flowContext'
import { EDIT_INTERNAL_HANDLER, getFlowEditing } from '../useFlowEditing'
import type { FlowBinding } from '../../../types/api/flowController.types'
import { REVIEW_INTERNAL_HANDLER } from '../../review/state/useReviewSuggestions'

export function useFlowEditHooks() {
	const { model } = useFlowMapContext()
	const { context } = getFlowEditing(model)
	const items = ref<FlowBinding[]>([])
	const refresh = (): void => {
		items.value = model.controller
			.getBindings()
			.filter(item => item.handler !== EDIT_INTERNAL_HANDLER && item.handler !== REVIEW_INTERNAL_HANDLER)
	}
	refresh()
	const offs = (['change', 'reject', 'history-change', 'update:selection'] as const).map(name =>
		context.env.model.events.subscribe(name, refresh as (value: never) => void),
	)
	onScopeDispose(() => offs.forEach(off => off()))
	watch(context.env.state.tab, refresh)
	return {
		items,
		intro: UI_FLOW_EDITOR.HOOKS_INTRO,
		empty: UI_FLOW_EDITOR.HOOKS_EMPTY,
		cancellable: UI_FLOW_EDITOR.HOOK_CANCELLABLE,
		handler: (item: FlowBinding) => item.handler || UI_FLOW_EDITOR.HOOK_ANONYMOUS,
		calls: (item: FlowBinding) => formatMessage(UI_FLOW_EDITOR.HOOK_CALLS, { count: item.calls }),
		last: (item: FlowBinding) => (item.lastResult ? formatMessage(UI_FLOW_EDITOR.HOOK_LAST, { result: item.lastResult }) : ''),
		toggleLabel: (item: FlowBinding) => formatMessage(UI_FLOW_EDITOR.HOOK_TOGGLE, { name: item.handler || item.name }),
		toggle: (item: FlowBinding, isEnabled: boolean) => {
			model.controller.setBindingEnabled(item.id, isEnabled)
			refresh()
		},
	}
}
