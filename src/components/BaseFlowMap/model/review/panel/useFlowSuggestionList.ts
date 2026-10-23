import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { initialsOf } from '../data/reviewSuggestions'
import { flowReviewAdapter } from '../flowReviewAdapter'
import { useFlowReviewState } from '../useFlowReviewState'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { buildReviewMarks, markKey } from '../data/reviewDiff'
import type { FlowChange } from '../../../types/data/flowReview.types'
import type { ReviewSuggestionView } from '../../../types/internal/review/reviewCore.types'
import { formatCount, formatValue, kindLabel, kindStatus, summaryText } from './reviewFormat'

const MAX_FIELDS = 3

function fieldRows(view: ReviewSuggestionView<FlowChange>) {
	const marks = buildReviewMarks(view.suggestion.changes, flowReviewAdapter)
	return marks
		.flatMap(mark => mark.fields.map(item => ({ key: `${markKey(mark.entity, mark.id)}:${item.field}`, ...item })))
		.slice(0, MAX_FIELDS)
		.map(item => ({ key: item.key, field: item.field, before: formatValue(item.before), after: formatValue(item.after) }))
}

function toItem(view: ReviewSuggestionView<FlowChange>, focusId: string | null) {
	const { suggestion } = view
	const { author } = suggestion
	return {
		id: suggestion.id,
		name: author.name,
		avatar: author.avatar,
		initials: initialsOf(author.name),
		time: formatRelativeTime(suggestion.date),
		kind: kindLabel(view.kind),
		kindStatus: kindStatus(view.kind),
		title: suggestion.label ?? UI_FLOW_REVIEW.SUGGESTION_UNTITLED,
		summary: summaryText(view.counts),
		fields: fieldRows(view),
		status: suggestion.status,
		isOpen: suggestion.status === 'open',
		isStale: view.isStale,
		isFocused: focusId === suggestion.id,
		label: formatMessage(UI_FLOW_REVIEW.SUGGESTION_ARIA, { title: suggestion.label ?? '', name: author.name }),
	}
}

export function useFlowSuggestionList() {
	const review = useFlowReviewState()
	const { suggestions, controller } = review
	const items = computed(() => suggestions.views.value.map(view => toItem(view, suggestions.focusId.value)))
	const openIds = computed(() => items.value.filter(item => item.isOpen && !item.isStale).length)
	const show = (id: string): void => {
		const view = suggestions.views.value.find(item => item.suggestion.id === id)
		const first = view ? buildReviewMarks(view.suggestion.changes, flowReviewAdapter)[0] : undefined
		if (first) controller.focus(first.id)
	}
	return {
		items,
		isEmpty: computed(() => items.value.length === 0),
		acceptAllLabel: computed(() => formatCount(UI_FLOW_REVIEW.ACCEPT_ALL, openIds.value)),
		canAcceptAll: computed(() => openIds.value > 0),
		accept: (id: string) => suggestions.accept(id),
		acceptAll: () => suggestions.acceptAll(),
		decline: (id: string) => suggestions.decline(id),
		setFocus: (id: string | null) => (suggestions.focusId.value = id),
		show,
	}
}
