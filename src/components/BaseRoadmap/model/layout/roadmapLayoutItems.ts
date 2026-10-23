import { firstUnmetTitle, titlesOf } from '../view/format/roadmapRequirements'
import type { RoadmapStageView } from '../../types/internal/roadmapInternal.types'
import type {
	RoadmapLayoutGeometry,
	RoadmapRequirementLink,
	RoadmapSlotRef,
	RoadmapStageItem,
	RoadmapTopicItem,
} from '../../types/internal/roadmapLayout.types'

function buildTopicItems(stage: RoadmapStageView, geometry: RoadmapLayoutGeometry, stages: RoadmapStageView[]): RoadmapTopicItem[] {
	return stage.topics.map((view, index) => {
		const slot = geometry.stages[stage.index].topics[index]
		return {
			view,
			slot,
			style: { '--rl-x': slot.box.x, '--rl-y': slot.box.y, '--rl-i': index },
			missing: titlesOf(view.state.missing, stages),
		}
	})
}

export function buildStageItems(stages: RoadmapStageView[], geometry: RoadmapLayoutGeometry): RoadmapStageItem[] {
	return stages.map(view => {
		const slot = geometry.stages[view.index]
		return {
			view,
			slot,
			style: { '--rl-x': slot.box.x, '--rl-y': slot.box.y, '--rl-i': view.index },
			unlockTitle: firstUnmetTitle(view.stage.requires, stages),
			topics: view.isExpanded ? buildTopicItems(view, geometry, stages) : [],
		}
	})
}

function locate(id: string, stages: RoadmapStageView[]): RoadmapSlotRef | null {
	for (const view of stages) {
		if (view.stage.id === id) return { stage: view.index, topic: null }
		const topic = view.topics.findIndex(item => item.topic.id === id)
		if (topic !== -1 && view.isExpanded) return { stage: view.index, topic }
	}
	return null
}

export function collectRequirementLinks(stages: RoadmapStageView[]): RoadmapRequirementLink[] {
	return stages.flatMap(view =>
		view.topics.flatMap((item, topic) => {
			if (!item.isSelected || !view.isExpanded) return []
			const to: RoadmapSlotRef = { stage: view.index, topic }
			return (item.topic.requires ?? []).flatMap(id => {
				const from = locate(id, stages)
				return from ? [{ from, to }] : []
			})
		}),
	)
}
