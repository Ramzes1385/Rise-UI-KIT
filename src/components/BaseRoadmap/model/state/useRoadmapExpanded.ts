import { computed } from 'vue'
import { useSyncedRef } from './useSyncedRef'
import type { UseRoadmapExpandedOptions } from '../../types/internal/roadmapInternal.types'

export function useRoadmapExpanded({ props, emit, index, currentStageId }: UseRoadmapExpandedOptions) {
	const manual = useSyncedRef<string[] | null>(() => props.expanded ?? null)
	const expandedIds = computed<string[]>(() => manual.value ?? (currentStageId.value ? [currentStageId.value] : []))

	function setExpanded(ids: string[]): void {
		manual.value = ids
		emit('update:expanded', ids)
	}

	return {
		expandedIds,
		expandStage(id: string, isOpen?: boolean): void {
			if (!index.value.stages.has(id)) return
			const isOpened = expandedIds.value.includes(id)
			if ((isOpen ?? !isOpened) === isOpened) return
			setExpanded(isOpened ? expandedIds.value.filter(opened => opened !== id) : [...expandedIds.value, id])
		},
		expandAll: (): void => setExpanded([...index.value.stages.keys()]),
		collapseAll: (): void => setExpanded([]),
	}
}
