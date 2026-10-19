import type { ComputedRef } from 'vue'
import { getCurrentScope, shallowRef, watch } from 'vue'
import type { RoadmapReviewState } from '../../types/internal/roadmapReview.types'
import type { RoadmapEditContext, RoadmapEditLoader, RoadmapReviewLoader } from '../../types/internal/roadmapEdit.internal.types'

export function useRoadmapReviewLoader(
	context: RoadmapEditContext,
	editor: RoadmapEditLoader,
	isReviewing: ComputedRef<boolean>,
): RoadmapReviewLoader {
	const state = shallowRef<RoadmapReviewState | null>(null)
	const scope = getCurrentScope()
	let pending: Promise<RoadmapReviewState> | null = null
	function load(): Promise<RoadmapReviewState> {
		pending ??= Promise.all([import('./useRoadmapReview'), editor.load()]).then(([{ useRoadmapReview }, edit]) => {
			const create = (): RoadmapReviewState =>
				useRoadmapReview({
					data: () => context.data.value,
					review: () => context.props.review,
					emitReview: value => context.emit('update:review', value),
					apply: (changes, label) => edit.applyChanges(changes, label),
					announce: edit.announce,
				})
			state.value = scope?.run(create) ?? create()
			return state.value
		})
		return pending
	}
	watch(
		isReviewing,
		value => {
			if (value) void load()
		},
		{ immediate: true },
	)
	return { state, load, propose: (changes, label) => load().then(review => review.propose(changes, label)) }
}
