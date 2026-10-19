import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_REVIEW } from '@/locales/messages'
import { roadmapReviewAdapter } from './roadmapReviewAdapter'
import type { RoadmapData } from '../../types/roadmapData.types'
import type { RoadmapChange, RoadmapEntity } from '../../types/roadmapEdit.types'
import { describeChanges } from '@components/BaseFlowMap/model/review/reviewSuggestions'
import type { ReviewChangeInfo } from '@components/BaseFlowMap/types/internal/review/reviewCore.types'

export function roadmapElementName(data: RoadmapData, entity: RoadmapEntity, id: string): string {
	for (const stage of data.stages) {
		if (entity === 'stage' && stage.id === id) return stage.title
		const topic = entity === 'topic' ? stage.topics.find(item => item.id === id) : undefined
		if (topic) return topic.title
	}
	return id
}

function nameOf(info: ReviewChangeInfo, data: RoadmapData): string {
	const value = info.value as { title?: string } | undefined
	return value?.title ?? roadmapElementName(data, info.entity as RoadmapEntity, info.id)
}

const TITLES = {
	add: UI_ROADMAP_REVIEW.TITLE_ADD,
	remove: UI_ROADMAP_REVIEW.TITLE_REMOVE,
	rename: UI_ROADMAP_REVIEW.TITLE_RENAME,
	move: UI_ROADMAP_REVIEW.TITLE_MOVE,
	update: UI_ROADMAP_REVIEW.TITLE_UPDATE,
} as const

export function proposalTitle(changes: readonly RoadmapChange[], data: RoadmapData): string {
	const infos = describeChanges(changes, roadmapReviewAdapter)
	if (infos.length === 0) return UI_ROADMAP_REVIEW.PROPOSAL_UNTITLED
	const first = formatMessage(TITLES[infos[0].kind], { name: nameOf(infos[0], data) })
	return infos.length === 1 ? first : formatMessage(UI_ROADMAP_REVIEW.TITLE_MORE, { title: first, n: infos.length - 1 })
}
