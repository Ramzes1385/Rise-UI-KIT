import { watch } from 'vue'
import { computed, useId } from 'vue'
import { useSyncedRef } from './state/useSyncedRef'
import { buildStageViews } from './state/roadmapViews'
import { buildRoadmapIndex } from './progress/roadmapStatus'
import { useRoadmapExpanded } from './state/useRoadmapExpanded'
import { useRoadmapSelection } from './state/useRoadmapSelection'
import { useRoadmapProgress } from './progress/useRoadmapProgress'
import { validateRoadmap, warnRoadmapIssues } from './progress/roadmapValidate'
import { roadmapPathProgress, summarizeRoadmap } from './progress/roadmapSummary'
import type { BaseRoadmapEmits, BaseRoadmapProps, RoadmapTopicState } from '../types/BaseRoadmap.types'

export function useRoadmapModel(props: BaseRoadmapProps, emit: BaseRoadmapEmits) {
	const data = useSyncedRef(() => props.data)
	const index = computed(() => buildRoadmapIndex(data.value))
	const validation = computed(() => validateRoadmap(data.value, index.value))
	watch(validation, value => warnRoadmapIssues(value.issues), { immediate: true })

	const requires = computed(() => validation.value.requires)
	const { progress, statuses, busy, ...changes } = useRoadmapProgress({ props, emit, data, index, requires })
	const summary = computed(() => summarizeRoadmap(data.value, statuses.value, index.value))
	const selection = useRoadmapSelection({ props, emit, index })
	const expansion = useRoadmapExpanded({ props, emit, index, currentStageId: computed(() => statuses.value.currentStageId) })

	const uid = useId()
	const stageViews = computed(() =>
		buildStageViews({
			data: data.value,
			statuses: statuses.value,
			expanded: expansion.expandedIds.value,
			filter: selection.filter.value,
			selectedId: selection.selectedId.value,
			idPrefix: uid,
		}),
	)

	function continueLearning(): void {
		const id = summary.value.continueTopicId
		const entry = id === null ? undefined : index.value.topics.get(id)
		if (!entry) return
		expansion.expandStage(entry.stage.id, true)
		selection.selectTopic(entry.topic.id)
	}

	return {
		data,
		index,
		issues: computed(() => validation.value.issues),
		progress,
		statuses,
		busyTopics: busy,
		summary,
		stageViews,
		pathProgress: computed(() => roadmapPathProgress(stageViews.value)),
		...selection,
		...expansion,
		...changes,
		continueLearning,
		getTopicState: (id: string): RoadmapTopicState | null => statuses.value.topics.get(id) ?? null,
	}
}
