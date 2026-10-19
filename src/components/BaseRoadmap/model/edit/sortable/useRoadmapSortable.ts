import { stageUnder, topicUnder } from './roadmapSortableDom'
import { createSortableActions } from './roadmapSortableActions'
import { useSortable } from '@composables/interaction/useSortable'
import type { RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import { stagePlace, stepStage, stepTopic, topicPlace } from '../data/roadmapPlaces'
import type { RoadmapSortableActions, RoadmapSortableOptions, RoadmapTopicPlace } from '../../../types/internal/roadmapEdit.internal.types'

function shared({ rootRef, edit, isDisabled }: RoadmapSortableOptions, actions: RoadmapSortableActions) {
	const find = (selector: string): HTMLElement | null => rootRef.value!.querySelector<HTMLElement>(selector)
	return {
		rootRef,
		isDisabled,
		focusItem: actions.focusHandle,
		onStart: () => (edit.draft.value = edit.viewData.value),
		onCancel: (_id: string, done: () => void) => actions.cancel(done),
		find,
	}
}

function stageSortable(options: RoadmapSortableOptions, actions: RoadmapSortableActions) {
	const { find, ...base } = shared(options, actions)
	const data = () => options.edit.viewData.value
	return useSortable<RoadmapStage, number>({
		...base,
		itemId: stage => stage.id,
		locate: id => stagePlace(data(), id),
		isSamePlace: (left, right) => left === right,
		stepPlace: (id, key) => stepStage(data(), id, key),
		dropPlace: point => stageUnder(data(), point),
		itemElement: id => find(`[data-roadmap-stage="${id}"]`),
		flip: { source: data, items: { selector: '[data-roadmap-stage]', key: 'roadmapStage' } },
		onPreview: actions.preview,
		onDrop: (move, done) => void actions.drop({ id: move.id, kind: 'stage' }, done),
		onAnnounce: (message, id) => actions.announce(message, id, 'stage'),
	})
}

function topicSortable(options: RoadmapSortableOptions, actions: RoadmapSortableActions) {
	const { find, ...base } = shared(options, actions)
	const data = () => options.edit.viewData.value
	return useSortable<RoadmapTopic, RoadmapTopicPlace>({
		...base,
		itemId: topic => topic.id,
		locate: id => topicPlace(data(), id),
		isSamePlace: (left, right) => left?.stage === right?.stage && left?.index === right?.index,
		stepPlace: (id, key) => stepTopic(data(), id, key),
		dropPlace: (point, id) => topicUnder(data(), point, id),
		itemElement: id => find(`[data-roadmap-topic="${id}"]`),
		flip: { source: data, items: { selector: '[data-roadmap-topic]', key: 'roadmapTopic' } },
		onPreview: actions.preview,
		onDrop: (move, done) => void actions.drop({ id: move.id, kind: 'topic' }, done),
		onAnnounce: (message, id) => actions.announce(message, id, 'topic'),
	})
}

export function useRoadmapSortable(options: RoadmapSortableOptions) {
	const actions = createSortableActions(options)
	const stages = stageSortable(options, actions)
	const topics = topicSortable(options, actions)
	return {
		stages,
		topics,
		moveBy: actions.moveBy,
		focusHandle: actions.focusHandle,
		onHandleKeydown(event: KeyboardEvent, item: { kind: 'stage'; value: RoadmapStage } | { kind: 'topic'; value: RoadmapTopic }): void {
			if (event.isComposing) return
			if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
				event.preventDefault()
				void actions.moveBy(item.value.id, event.key === 'ArrowUp' ? -1 : 1)
				return
			}
			const sortable = item.kind === 'stage' ? stages : topics
			if (sortable.handleGrabbedKeydown(event) || event.key !== ' ') return
			event.preventDefault()
			if (item.kind === 'stage') stages.grab(item.value)
			else topics.grab(item.value)
		},
	}
}
