import { computed } from 'vue'
import type { Ref } from 'vue'
import { UI_ROADMAP } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { useRoadmapLive } from './useRoadmapLive'
import { subtitleText } from './format/roadmapText'
import { useRoadmapNarrow } from './useRoadmapNarrow'
import { useRoadmapActions } from './useRoadmapActions'
import { useRoadmapDetails } from './useRoadmapDetails'
import { useRoadmapLayouts } from './useRoadmapLayouts'
import type { SegmentedOption } from '@components/BaseSegmented'
import type { RoadmapFilter } from '../../types/BaseRoadmap.types'
import type { RoadmapModel, RoadmapProps, RoadmapSummaryView } from '../../types/internal/roadmapView.types'

function filterOptions(): SegmentedOption[] {
	return [
		{ value: 'all', label: UI_ROADMAP.FILTER_ALL },
		{ value: 'required', label: UI_ROADMAP.FILTER_REQUIRED },
		{ value: 'optional', label: UI_ROADMAP.FILTER_OPTIONAL },
	]
}

export function useRoadmapView(props: RoadmapProps, model: RoadmapModel, rootRef: Ref<HTMLElement | null>) {
	const narrow = useRoadmapNarrow({ rootRef, narrowWidth: () => props.narrowWidth, detailsPosition: () => props.detailsPosition })
	const live = useRoadmapLive()
	const details = useRoadmapDetails({ rootRef, mode: narrow.detailsMode, ...model })
	const actions = useRoadmapActions({ model, live, details })

	return {
		...narrow,
		...useRoadmapLayouts(props, () => narrow.isNarrow.value),
		...actions,
		liveText: live.text,
		selected: details.selected,
		isSheetOpen: details.isSheetOpen,
		isSidePanel: computed(() => details.isOpen.value && narrow.detailsMode.value === 'side'),
		requirements: details.requirements,
		doneSubtopics: details.doneSubtopics,
		hasNext: details.hasNext,
		closeDetails: details.close,
		openTopic: details.open,
		openNext: details.openNext,
		openRequirement: details.openRequirement,
		onDetailsKeydown: details.onKeydown,
		isSelectedBusy: computed(() => model.busyTopics.value.has(model.selectedId.value ?? '')),
		filterOptions: computed(filterOptions),
		continueText: computed(() =>
			formatMessage(UI_ROADMAP.CONTINUE, {
				topic: model.index.value.topics.get(model.summary.value.continueTopicId ?? '')?.topic.title ?? '',
			}),
		),
		goalText: computed(() => (model.data.value.goal ? formatMessage(UI_ROADMAP.GOAL, { goal: model.data.value.goal }) : undefined)),
		onSheetUpdate(isOpen: boolean): void {
			if (!isOpen) details.close()
		},
		setFilter: (value: string | number): void => model.setFilter(value as RoadmapFilter),
		summaryView: computed((): RoadmapSummaryView => ({
			...model.summary.value,
			continueId: model.summary.value.continueTopicId,
			continueTitle: model.index.value.topics.get(model.summary.value.continueTopicId ?? '')?.topic.title ?? null,
		})),
		subtitle: computed(() => subtitleText(model.data.value.description, model.data.value.stages.length, model.summary.value.total)),
	}
}
