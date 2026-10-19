import { computed } from 'vue'
import { summaryText } from './reviewFormat'
import { diffFlowData } from '../../data/flowDiff'
import { UI_FLOW_REVIEW } from '@/locales/messages'
import { flowReviewAdapter } from '../flowReviewAdapter'
import { useFlowReviewState } from '../useFlowReviewState'
import { formatRelativeTime } from '@utils/data/dateUtils'
import { initialsOf, describeChanges, summarizeChanges } from '../reviewSuggestions'

export function useFlowVersionList() {
	const { compare } = useFlowReviewState()
	const items = computed(() => {
		const list = compare.versions.value
		const current = list.find(item => item.id === compare.currentId.value)
		return list.map(version => {
			const isCurrent = version.id === compare.currentId.value
			const changes = current && !isCurrent ? diffFlowData(version.data, current.data) : []
			return {
				id: version.id,
				label: version.label,
				name: version.author?.name ?? '',
				avatar: version.author?.avatar,
				initials: initialsOf(version.author?.name ?? ''),
				time: formatRelativeTime(version.date),
				isCurrent,
				isCompared: compare.compareId.value === version.id,
				summary: summaryText(summarizeChanges(describeChanges(changes, flowReviewAdapter))),
			}
		})
	})
	return {
		items,
		isEmpty: computed(() => items.value.length === 0),
		buttonLabel: (isCompared: boolean) => (isCompared ? UI_FLOW_REVIEW.COMPARING : UI_FLOW_REVIEW.COMPARE_WITH_CURRENT),
		toggle: (id: string, isCompared: boolean) => compare.select(isCompared ? null : id),
	}
}
