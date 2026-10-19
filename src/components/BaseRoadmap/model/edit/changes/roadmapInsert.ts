import { findRoadmapEntity } from './roadmapFind'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { rejectInvalid, rejectUnknown } from './roadmapReject'
import type { RoadmapTemplate } from '../../../types/roadmapEdit.types'
import { buildAddStage, buildAddTopic, buildReplace, pickTarget } from './roadmapCommands'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import type { RoadmapBuilt, RoadmapInsertTarget } from '../../../types/internal/roadmapEdit.internal.types'
import { collectRoadmapIds, stageFromTemplate, topicFromTemplate, uniqueRoadmapId } from '../data/roadmapTemplates'

function copyTitle(title: string): string {
	return `${title} ${UI_ROADMAP_EDIT.COPY_SUFFIX}`
}

function copyTopic(topic: RoadmapTopic, taken: Set<string>, ids: Map<string, string>): RoadmapTopic {
	const id = uniqueRoadmapId(taken, 'topic')
	ids.set(topic.id, id)
	return { ...JSON.parse(JSON.stringify(topic)), id, title: copyTitle(topic.title) }
}

function remapRequires(topic: RoadmapTopic, ids: Map<string, string>): RoadmapTopic {
	return topic.requires ? { ...topic, requires: topic.requires.map(target => ids.get(target) ?? target) } : topic
}

function copyStage(stage: RoadmapStage, taken: Set<string>): RoadmapStage {
	const ids = new Map<string, string>()
	const id = uniqueRoadmapId(taken, 'stage')
	const topics = stage.topics.map(topic => copyTopic(topic, taken, ids))
	return {
		...JSON.parse(JSON.stringify(stage)),
		id,
		title: copyTitle(stage.title),
		topics: topics.map(topic => remapRequires(topic, ids)),
	}
}

export function buildDuplicate(data: RoadmapData, id: string): RoadmapBuilt {
	const found = findRoadmapEntity(data, id)
	if (!found) return rejectUnknown(id)
	const taken = collectRoadmapIds(data)
	if (found.topic) {
		const topic = copyTopic(found.topic, taken, new Map())
		return buildAddTopic(data, { stage: found.stage.id, topic, index: found.topicIndex + 1 })
	}
	return buildAddStage(data, copyStage(found.stage, taken), found.stageIndex + 1)
}

export function buildTemplate(data: RoadmapData, template: RoadmapTemplate | undefined, to?: RoadmapInsertTarget): RoadmapBuilt {
	if (!template) return rejectInvalid()
	if (template.data) return buildReplace(data, JSON.parse(JSON.stringify(template.data)) as RoadmapData)
	const taken = collectRoadmapIds(data)
	if (template.stage) return buildAddStage(data, stageFromTemplate(template.stage, taken), to?.index)
	if (!template.topic) return rejectInvalid()
	const stage = pickTarget(data, to)
	return stage === null
		? rejectInvalid()
		: buildAddTopic(data, { stage, topic: topicFromTemplate(template.topic, taken), index: to?.index })
}
