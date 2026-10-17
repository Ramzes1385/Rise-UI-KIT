import { computed } from 'vue'
import { useSyncedRef } from './useSyncedRef'
import type { RoadmapFilter } from '../../types/BaseRoadmap.types'
import type { UseRoadmapSelectionOptions } from '../../types/internal/roadmapInternal.types'

export function useRoadmapSelection({ props, emit, index }: UseRoadmapSelectionOptions) {
	const filter = useSyncedRef<RoadmapFilter>(() => props.filter ?? 'all')
	const selectedId = useSyncedRef(() => props.selected ?? null)
	const selectedTopic = computed(() => (selectedId.value === null ? null : (index.value.topics.get(selectedId.value)?.topic ?? null)))

	return {
		filter,
		selectedId,
		selectedTopic,
		setFilter(value: RoadmapFilter): void {
			if (value === filter.value) return
			filter.value = value
			emit('update:filter', value)
		},
		selectTopic(id: string | null): void {
			const next = id !== null && index.value.topics.has(id) ? id : null
			if (next === selectedId.value) return
			selectedId.value = next
			emit('update:selected', next)
			emit('select', selectedTopic.value)
		},
	}
}
