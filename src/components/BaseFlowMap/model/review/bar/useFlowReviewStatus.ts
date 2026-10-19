import { computed, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { formatCount } from '../panel/reviewFormat'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { useFlowReviewState } from '../useFlowReviewState'
import { REVIEW_INTERNAL_HANDLER } from '../state/useReviewSuggestions'
import type { FlowBinding } from '../../../types/api/flowController.types'

const REVIEW_NAMES = new Set(['beforeAccept', 'accept', 'decline', 'comment', 'update:suggestions', 'update:comments'])

export function useFlowReviewStatus() {
	const review = useFlowReviewState()
	const { suggestions, comments, controller } = review
	const isHooksOpen = ref(false)
	const bindings = ref<FlowBinding[]>([])
	const refresh = (): void => {
		bindings.value = controller.getBindings().filter(item => REVIEW_NAMES.has(item.name) && item.handler !== REVIEW_INTERNAL_HANDLER)
	}
	refresh()
	return {
		counts: suggestions.counts,
		unreadText: computed(() =>
			comments.unread.value > 0 ? formatCount(UI_FLOW_REVIEW.UNREAD, comments.unread.value) : UI_FLOW_REVIEW.ALL_READ,
		),
		commentCount: computed(() => comments.list.value.length),
		isHooksOpen,
		bindings,
		hooksLabel: computed(() => formatMessage(UI_FLOW_REVIEW.HOOKS_COUNT, { count: bindings.value.length })),
		setHooksOpen(value: boolean) {
			isHooksOpen.value = value
			if (value) refresh()
		},
		toggleBinding(binding: FlowBinding, isEnabled: boolean) {
			controller.setBindingEnabled(binding.id, isEnabled)
			refresh()
		},
		bindingLabel: (binding: FlowBinding) =>
			formatMessage(binding.isEnabled ? UI_FLOW_REVIEW.HOOK_ON : UI_FLOW_REVIEW.HOOK_OFF, { name: binding.name }),
		callsLabel: (binding: FlowBinding) => formatCount(UI_FLOW_REVIEW.HOOK_CALLS, binding.calls),
	}
}
