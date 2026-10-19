import { computed } from 'vue'
import { useSyncedRef } from './useSyncedRef'
import type { RoadmapModeState } from '../../types/internal/roadmapEdit.internal.types'
import type { BaseRoadmapEmits, BaseRoadmapProps, RoadmapMode } from '../../types/BaseRoadmap.types'

export function useRoadmapMode(props: BaseRoadmapProps, emit: BaseRoadmapEmits): RoadmapModeState {
	const mode = useSyncedRef<RoadmapMode>(() => props.mode ?? 'view')
	return {
		currentMode: mode,
		isEditing: computed(() => mode.value === 'edit'),
		isReviewing: computed(() => mode.value === 'review'),
		setMode(next: RoadmapMode): void {
			if (next === mode.value) return
			mode.value = next
			emit('update:mode', next)
		},
	}
}
