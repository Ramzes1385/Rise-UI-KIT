import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { RoadmapModel } from '../../types/internal/roadmapView.types'
import type { RoadmapReviewTarget } from '../../types/internal/roadmapReview.types'

export function useRoadmapReviewView(
	model: RoadmapModel,
	selected: ComputedRef<{ view: { topic: { id: string } } } | null | undefined>,
	select: (id: string | null) => void,
) {
	return {
		isReviewing: model.isReviewing,
		reviewState: model.reviewer.state,
		reviewTarget: computed<RoadmapReviewTarget | null>(() =>
			selected.value ? { entity: 'topic', id: selected.value.view.topic.id } : null,
		),
		showReviewTarget: (target: RoadmapReviewTarget): void => {
			if (target.entity === 'topic') select(target.id)
		},
	}
}
