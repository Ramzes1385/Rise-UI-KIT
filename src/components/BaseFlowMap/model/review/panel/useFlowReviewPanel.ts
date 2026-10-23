import { computed } from 'vue'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import type { TabItem } from '@components/BaseTabs'
import { useFlowReviewState } from '../useFlowReviewState'

export function useFlowReviewPanel() {
	const review = useFlowReviewState()
	const { suggestions, comments, compare } = review
	const tabs = computed<TabItem[]>(() => [
		{ id: 'suggestions', label: `${UI_FLOW_REVIEW.TAB_SUGGESTIONS} ${suggestions.counts.value.open}` },
		{ id: 'comments', label: `${UI_FLOW_REVIEW.TAB_COMMENTS} ${comments.list.value.length}` },
		{ id: 'versions', label: `${UI_FLOW_REVIEW.TAB_VERSIONS} ${compare.versions.value.length}` },
	])
	return { isActive: review.isActive, tab: review.tab, tabs }
}
