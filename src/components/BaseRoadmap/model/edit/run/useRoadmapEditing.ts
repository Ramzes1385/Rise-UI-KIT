import { useRoadmapMode } from '../../state/useRoadmapMode'
import { useRoadmapEditLoader } from './load/useRoadmapEditLoader'
import { useRoadmapReviewLoader } from '../../review/useRoadmapReviewLoader'
import type { RoadmapEditContext } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapEditing(context: RoadmapEditContext) {
	const modeState = useRoadmapMode(context.props, context.emit)
	const editor = useRoadmapEditLoader(context, modeState.isEditing)
	return { ...modeState, editor, reviewer: useRoadmapReviewLoader(context, editor, modeState.isReviewing) }
}
