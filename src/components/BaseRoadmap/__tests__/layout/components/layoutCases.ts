import type { Component } from 'vue'
import RoadmapPath from '../../../ui/layouts/RoadmapPath.vue'
import RoadmapSnake from '../../../ui/layouts/RoadmapSnake.vue'
import { stageView, topicView, ui } from '../fixtures/viewFixtures'
import RoadmapHorizontal from '../../../ui/layouts/RoadmapHorizontal.vue'
import type { RoadmapStageView } from '../../../types/internal/roadmapInternal.types'

export interface LayoutCase {
	name: string
	kind: string
	component: Component
}

export const LAYOUT_CASES: LayoutCase[] = [
	{ name: 'RoadmapPath', kind: 'path', component: RoadmapPath },
	{ name: 'RoadmapSnake', kind: 'snake', component: RoadmapSnake },
	{ name: 'RoadmapHorizontal', kind: 'horizontal', component: RoadmapHorizontal },
]

export function sampleStages(): RoadmapStageView[] {
	return [
		stageView({
			id: 'basics',
			title: 'Основы',
			index: 0,
			status: 'current',
			isExpanded: true,
			topics: [
				topicView({ id: 'html', title: 'HTML', status: 'in-progress' }),
				topicView({ id: 'css', title: 'CSS', topic: { requires: ['html'] } }),
			],
		}),
		stageView({
			id: 'frameworks',
			title: 'Фреймворки',
			index: 1,
			status: 'locked',
			requires: ['basics'],
			topics: [topicView({ id: 'vue', title: 'Vue', status: 'locked' })],
		}),
		stageView({ id: 'empty', title: 'Пустой', index: 2, isExpanded: true, topics: [] }),
	]
}

export function layoutProps(stages: RoadmapStageView[], extra: { goal?: string; progress?: number } = {}) {
	return { stages, progress: extra.progress ?? 0.5, goal: extra.goal, ui }
}
