import { computed, shallowRef, watch } from 'vue'
import { useReviewThreads } from './state/useReviewThreads'
import { useReviewProposals } from './state/useReviewProposals'
import type { RoadmapReviewData } from '../../types/roadmapEdit.types'
import type { RoadmapReviewContext, RoadmapReviewOptions, RoadmapReviewState } from '../../types/internal/roadmapReview.types'

export function useRoadmapReview(options: RoadmapReviewOptions): RoadmapReviewState {
	const state = shallowRef<RoadmapReviewData>({ ...options.review() })
	watch(options.review, value => (state.value = { ...value }))
	const context: RoadmapReviewContext = {
		options,
		state,
		currentUser: computed(() => state.value.currentUser),
		now: options.now ?? Date.now,
		commit(patch) {
			state.value = { ...state.value, ...patch }
			options.emitReview(state.value)
		},
	}
	return { ...useReviewProposals(context), ...useReviewThreads(context), currentUser: context.currentUser }
}
