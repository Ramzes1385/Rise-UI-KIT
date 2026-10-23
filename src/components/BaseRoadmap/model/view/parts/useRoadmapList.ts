import { useExpandTransition } from '@composables/interaction/useExpandTransition'

export function useRoadmapList() {
	return { expand: useExpandTransition() }
}
