import { nextTick } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { findRoadmapEntity } from '../changes/roadmapFind'
import { applyRoadmapChanges } from '../changes/roadmapChanges'
import type { RoadmapData } from '../../../types/roadmapData.types'
import { previewMove, stagePlace, stepStage, stepTopic, topicPlace } from '../data/roadmapPlaces'
import type { RoadmapSortableActions, RoadmapSortableOptions, RoadmapTopicPlace } from '../../../types/internal/roadmapEdit.internal.types'

function toTarget(place: number | RoadmapTopicPlace): { stage?: string; index: number } {
	return typeof place === 'number' ? { index: place } : place
}

function movedText(data: RoadmapData, id: string, kind: 'stage' | 'topic'): string | null {
	const found = findRoadmapEntity(data, id)
	if (!found) return null
	if (kind === 'stage') {
		return formatMessage(UI_ROADMAP_EDIT.MOVED_STAGE, { title: found.stage.title, n: found.stageIndex + 1, m: data.stages.length })
	}
	return formatMessage(UI_ROADMAP_EDIT.MOVED_TOPIC, {
		title: found.topic?.title ?? id,
		stage: found.stage.title,
		n: found.topicIndex + 1,
		m: found.stage.topics.length,
	})
}

function finalPlace(data: RoadmapData, { id, kind }: { id: string; kind: 'stage' | 'topic' }): number | RoadmapTopicPlace | null {
	return kind === 'stage' ? stagePlace(data, id) : topicPlace(data, id)
}

export function createSortableActions({ rootRef, edit }: RoadmapSortableOptions): RoadmapSortableActions {
	const data = () => edit.viewData.value
	function focusHandle(id: string): void {
		void nextTick(() => rootRef.value?.querySelector<HTMLElement>(`[data-roadmap-handle="${id}"]`)?.focus())
	}
	return {
		focusHandle,
		preview(id, place) {
			const change = previewMove(data(), id, place)
			if (change) edit.draft.value = applyRoadmapChanges(data(), [change])
		},
		async drop({ id, kind }, done) {
			const final = edit.draft.value
			edit.draft.value = null
			const place = final === null ? null : finalPlace(final, { id, kind })
			if (place !== null) await edit.move(id, toTarget(place))
			done()
		},
		cancel(done) {
			edit.draft.value = null
			done()
		},
		announce(message, id, kind) {
			const title = findRoadmapEntity(data(), id)
			const name = title?.topic?.title ?? title?.stage.title ?? id
			if (message === 'PICKED') {
				edit.announce(
					formatMessage(kind === 'stage' ? UI_ROADMAP_EDIT.PICKED_STAGE : UI_ROADMAP_EDIT.PICKED_TOPIC, { title: name }),
				)
				return
			}
			const text = movedText(data(), id, kind)
			if (text !== null) edit.announce(text)
		},
		async moveBy(id, delta) {
			const key = delta < 0 ? 'ArrowUp' : 'ArrowDown'
			const place = stagePlace(data(), id) === null ? stepTopic(data(), id, key) : stepStage(data(), id, key)
			if (place === null) return
			await edit.move(id, toTarget(place))
			focusHandle(id)
		},
	}
}
