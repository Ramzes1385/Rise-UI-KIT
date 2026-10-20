import type { ComputedRef } from 'vue'
import { getCurrentScope, shallowRef, watch } from 'vue'
import { createRoadmapLazy } from '../edit/run/load/roadmapLazy'
import type { RoadmapReviewState } from '../../types/internal/roadmapReview.types'
import type { RoadmapEditContext, RoadmapEditLoader, RoadmapReviewLoader } from '../../types/internal/roadmapEdit.internal.types'

export function useRoadmapReviewLoader(
	context: RoadmapEditContext,
	editor: RoadmapEditLoader,
	isReviewing: ComputedRef<boolean>,
): RoadmapReviewLoader {
	const state = shallowRef<RoadmapReviewState | null>(null)
	const scope = getCurrentScope()
	const { load, error, retry } = createRoadmapLazy(
		() =>
			Promise.all([import('./useRoadmapReview'), editor.load()]).then(([{ useRoadmapReview }, edit]) => {
				const create = (): RoadmapReviewState =>
					useRoadmapReview({
						data: () => context.data.value,
						review: () => context.props.review,
						emitReview: value => context.emit('update:review', value),
						apply: (changes, label, onStep) => edit.applyChanges(changes, label, onStep),
						announce: edit.announce,
					})
				if (scope && !scope.active) return state.value as RoadmapReviewState
				state.value = scope?.run(create) ?? create()
				return state.value
			}),
		'review',
	)
	watch(
		isReviewing,
		value => {
			if (value) load().catch(() => undefined)
		},
		{ immediate: true },
	)
	return { state, load, error, retry, propose: (changes, label) => load().then(review => review.propose(changes, label)) }
}
