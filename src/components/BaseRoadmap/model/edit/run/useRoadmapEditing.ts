import { useRoadmapMode } from '../../state/useRoadmapMode'
import { useRoadmapEditLoader } from './useRoadmapEditLoader'
import type { RoadmapEditContext } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapEditing(context: RoadmapEditContext) {
	const modeState = useRoadmapMode(context.props, context.emit)
	return { ...modeState, editor: useRoadmapEditLoader(context, modeState.isEditing) }
}
