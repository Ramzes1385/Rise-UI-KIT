import type { ComputedRef } from 'vue'
import { computed, onScopeDispose, watch } from 'vue'
import { flowReviewAdapter } from '../flowReviewAdapter'
import { buildReviewMarks, buildSuggestionMarks } from '../data/reviewDiff'
import type { FlowModelProps } from '../../../types/internal/flowModel.types'
import type { ReviewMark } from '../../../types/internal/review/reviewCore.types'
import type { ReviewMarkParts } from '../../../types/internal/review/reviewState.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

const DRAFT_ID = 'draft'

export function useReviewMarks(model: FlowModelInternal, props: FlowModelProps, parts: ReviewMarkParts): ComputedRef<ReviewMark[]> {
	const { isActive, suggestions, compare } = parts
	return computed(() => {
		if (!isActive.value) return []
		if (compare.compareId.value !== null) return buildReviewMarks(compare.changes.value, flowReviewAdapter)
		const open = suggestions.views.value.map(item => item.suggestion).filter(item => item.status === 'open')
		const draft = buildReviewMarks(suggestions.draftChanges.value, flowReviewAdapter)
		const author = props.currentUser?.name
		return [...buildSuggestionMarks(open, flowReviewAdapter), ...draft.map(mark => ({ ...mark, suggestionId: DRAFT_ID, author }))]
	})
}

function relatedIds(model: FlowModelInternal, marks: readonly ReviewMark[]): Set<string> {
	const ids = new Set(marks.map(mark => mark.id))
	for (const edge of model.data.value.edges) {
		if (ids.has(edge.id)) {
			ids.add(edge.source)
			ids.add(edge.target)
		}
	}
	return ids
}

export function useReviewDimming(model: FlowModelInternal, marks: ComputedRef<ReviewMark[]>, parts: ReviewMarkParts): void {
	const { suggestions, filters, isActive } = parts
	const target = computed(() => {
		if (!isActive.value) return null
		const focus = suggestions.focusId.value
		const shown = focus === null ? marks.value : marks.value.filter(mark => mark.suggestionId === focus)
		const isSelective = focus !== null || filters.isOnlyChanged.value
		return isSelective && shown.length > 0 ? relatedIds(model, shown) : null
	})
	const { controller } = model
	let isOwned = false
	watch(
		target,
		value => {
			if (value) {
				controller.highlightPath([...value])
				isOwned = true
			} else if (isOwned) {
				controller.clearHighlight()
				isOwned = false
			}
		},
		{ immediate: true },
	)
	onScopeDispose(() => {
		if (isOwned) controller.clearHighlight()
	})
}
