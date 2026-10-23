import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { formatCount } from '../panel/reviewFormat'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { initialsOf } from '../data/reviewSuggestions'
import { useFlowReviewState } from '../useFlowReviewState'
import type { SegmentedOption } from '@components/BaseSegmented'

export function useFlowReviewToolbar() {
	const review = useFlowReviewState()
	const { filters, suggestions } = review
	const authors = computed(() =>
		suggestions.authors.value.map(author => {
			const isOn = !filters.hidden.value.has(author.name)
			const key = isOn ? UI_FLOW_REVIEW.AUTHOR_SHOWN : UI_FLOW_REVIEW.AUTHOR_HIDDEN
			return {
				name: author.name,
				avatar: author.avatar,
				initials: initialsOf(author.name),
				isOn,
				label: formatMessage(key, { name: author.name }),
			}
		}),
	)
	const showOptions: SegmentedOption[] = [
		{ value: 'all', label: UI_FLOW_REVIEW.SHOW_ALL },
		{ value: 'mine', label: UI_FLOW_REVIEW.SHOW_MINE },
		{ value: 'open', label: UI_FLOW_REVIEW.SHOW_OPEN },
	]
	const legend = [
		{ kind: 'add', label: UI_FLOW_REVIEW.LEGEND_ADD },
		{ kind: 'remove', label: UI_FLOW_REVIEW.LEGEND_REMOVE },
		{ kind: 'rename', label: UI_FLOW_REVIEW.LEGEND_RENAME },
		{ kind: 'move', label: UI_FLOW_REVIEW.LEGEND_MOVE },
		{ kind: 'comment', label: UI_FLOW_REVIEW.LEGEND_COMMENT },
	]
	return {
		authors,
		showOptions,
		legend,
		show: computed({ get: () => filters.show.value, set: value => (filters.show.value = value as typeof filters.show.value) }),
		isOnlyChanged: filters.isOnlyChanged,
		toggleAuthor: filters.toggleAuthor,
		draftCount: suggestions.draftCount,
		submitLabel: computed(() => formatCount(UI_FLOW_REVIEW.SUBMIT, suggestions.draftCount.value)),
		submit: suggestions.submit,
		discard: suggestions.discard,
	}
}
