import { computed, ref } from 'vue'
import { useReviewCompare } from './state/useReviewCompare'
import { useReviewFilters } from './state/useReviewFilters'
import { useReviewComments } from './state/useReviewComments'
import { useReviewSuggestions } from './state/useReviewSuggestions'
import { useReviewMarks, useReviewDimming } from './state/useReviewMarks'
import type { FlowModelProps } from '../../types/internal/flowModel.types'
import type { FlowReviewState } from '../../types/internal/review/reviewState.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

const registry = new WeakMap<object, FlowReviewState>()

function createState(model: FlowModelInternal, props: FlowModelProps, announce: (text: string) => void): FlowReviewState {
	const isActive = computed(() => model.mode.value === 'review')
	const filters = useReviewFilters()
	const compare = useReviewCompare(model, props)
	const suggestions = useReviewSuggestions(model, props, { filters, announce, versionId: () => compare.currentId.value })
	const parts = { isActive, filters, suggestions, compare }
	const marks = useReviewMarks(model, props, parts)
	useReviewDimming(model, marks, parts)
	return {
		isActive,
		tab: ref('suggestions'),
		filters,
		suggestions,
		comments: useReviewComments(model, props),
		compare,
		marks,
		currentUser: computed(() => props.currentUser),
		controller: model.controller,
		announce,
	}
}

export function useFlowReview(model: FlowModelInternal, props: FlowModelProps, announce: (text: string) => void): FlowReviewState {
	const state = createState(model, props, announce)
	registry.set(model, state)
	return state
}

export function getFlowReview(model: object): FlowReviewState {
	const state = registry.get(model)
	if (!state) throw new Error('BaseFlowMap: review state is missing')
	return state
}
