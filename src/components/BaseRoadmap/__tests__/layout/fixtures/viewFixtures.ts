import type { RoadmapStageView, RoadmapTopicView } from '../../../types/internal/roadmapInternal.types'
import type { RoadmapStageStatus, RoadmapTopic, RoadmapTopicStatus } from '../../../types/roadmapData.types'

interface TopicViewInput {
	id?: string
	title?: string
	status?: RoadmapTopicStatus
	missing?: string[]
	topic?: Partial<RoadmapTopic>
	isSelected?: boolean
	isAlternative?: boolean
	isBusy?: boolean
}

export function topicView(input: TopicViewInput = {}): RoadmapTopicView {
	return {
		topic: { id: input.id ?? 't1', title: input.title ?? 'Тема', ...input.topic },
		state: { status: input.status ?? 'available', done: 0, total: 0, fraction: 0, missing: input.missing ?? [] },
		isSelected: input.isSelected ?? false,
		isFiltered: false,
		isAlternative: input.isAlternative ?? false,
		isBusy: input.isBusy ?? false,
	}
}

interface StageViewInput {
	id?: string
	title?: string
	index?: number
	status?: RoadmapStageStatus
	topics?: RoadmapTopicView[]
	isExpanded?: boolean
	requires?: string[]
}

export function stageView(input: StageViewInput = {}): RoadmapStageView {
	const id = input.id ?? 's1'
	const topics = input.topics ?? [topicView()]
	return {
		stage: { id, title: input.title ?? 'Этап', requires: input.requires, topics: topics.map(view => view.topic) },
		index: input.index ?? 0,
		status: input.status ?? 'available',
		done: 0,
		total: topics.length,
		hours: 0,
		isExpanded: input.isExpanded ?? false,
		topics,
		headingId: `${id}-heading`,
		panelId: `${id}-panel`,
	}
}

interface ManyOptions {
	count: number
	topics?: number
	expanded?: number[]
	title?: (index: number) => string
}

export function manyStages({ count, topics = 0, expanded = [], title }: ManyOptions): RoadmapStageView[] {
	return Array.from({ length: count }, (_, index) =>
		stageView({
			id: `s${index + 1}`,
			index,
			title: title ? title(index) : `Этап ${index + 1}`,
			isExpanded: expanded.includes(index),
			topics: Array.from({ length: topics }, (__, topic) =>
				topicView({ id: `s${index + 1}-t${topic + 1}`, title: `Тема ${index + 1}.${topic + 1}` }),
			),
		}),
	)
}

export function ui(part: string): string {
	return `base-roadmap__${part}`
}
