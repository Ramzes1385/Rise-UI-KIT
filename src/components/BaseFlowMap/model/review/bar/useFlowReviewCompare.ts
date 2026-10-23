import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { summaryText } from '../panel/reviewFormat'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { useFlowReviewState } from '../useFlowReviewState'
import type { FlowCompareSide } from '../../../types/internal/review/reviewState.types'

export function useFlowReviewCompare() {
	const { compare } = useFlowReviewState()
	const base = computed(() => compare.versions.value.find(item => item.id === compare.compareId.value))
	const current = computed(() => compare.versions.value.find(item => item.id === compare.currentId.value))
	const options = computed(() => [
		{ value: 'old', label: formatMessage(UI_FLOW_REVIEW.COMPARE_OLD, { version: base.value?.label ?? '' }) },
		{ value: 'new', label: formatMessage(UI_FLOW_REVIEW.COMPARE_NEW, { version: current.value?.label ?? '' }) },
		{ value: 'diff', label: UI_FLOW_REVIEW.COMPARE_DIFF },
	])
	return {
		isOpen: computed(() => compare.compareId.value !== null),
		options,
		side: computed({ get: () => compare.side.value, set: value => (compare.side.value = value as FlowCompareSide) }),
		summary: computed(() => summaryText(compare.counts.value)),
		close: () => compare.select(null),
	}
}
