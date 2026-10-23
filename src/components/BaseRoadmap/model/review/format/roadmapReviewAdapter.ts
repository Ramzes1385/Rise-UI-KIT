import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import { applyRoadmapChanges } from '../../edit/changes/roadmapChanges'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import { diffFields, isReviewEqual } from '@components/BaseFlowMap/model/review/data/reviewDiff'
import type { RoadmapEntityChange, RoadmapUpdateChange as UpdateChange } from '../../../types/internal/roadmapReview.types'
import type {
	ReviewAdapter,
	ReviewChangeInfo,
	ReviewChangeKind,
	ReviewField,
} from '@components/BaseFlowMap/types/internal/review/reviewCore.types'

function updateKind(fields: readonly ReviewField[]): ReviewChangeKind {
	return fields.length > 0 && fields.every(item => item.field === 'title') ? 'rename' : 'update'
}

function describeUpdate(change: UpdateChange): ReviewChangeInfo {
	const fields = diffFields(change.patch, change.previous)
	return { kind: updateKind(fields), entity: change.entity, id: change.id, fields }
}

function describeMove(change: Extract<RoadmapChange, { type: 'move' }>): ReviewChangeInfo {
	const field = { field: 'position', before: change.from, after: change.to }
	return { kind: 'move', entity: change.entity, id: change.id, fields: [field] }
}

function describeRoadmapChange(change: RoadmapChange): ReviewChangeInfo | null {
	if (change.type === 'root') return null
	if (change.type === 'update') return describeUpdate(change)
	if (change.type === 'move') return describeMove(change)
	const id = change.type === 'add' ? change.value.id : change.id
	return { kind: change.type, entity: change.entity, id, fields: [], value: change.value }
}

function findStage(data: RoadmapData, id: string): RoadmapStage | undefined {
	return data.stages.find(stage => stage.id === id)
}

function findTopic(data: RoadmapData, id: string): RoadmapTopic | undefined {
	for (const stage of data.stages) {
		const found = stage.topics.find(topic => topic.id === id)
		if (found) return found
	}
	return undefined
}

function findEntity(data: RoadmapData, entity: 'stage' | 'topic', id: string): object | undefined {
	return entity === 'stage' ? findStage(data, id) : findTopic(data, id)
}

function isAddApplicable(data: RoadmapData, change: Extract<RoadmapChange, { type: 'add' }>): boolean {
	if (findEntity(data, change.entity, change.value.id)) return false
	return change.entity === 'stage' || findStage(data, change.stage) !== undefined
}

function isMoveApplicable(data: RoadmapData, change: Extract<RoadmapChange, { type: 'move' }>): boolean {
	if (change.entity === 'stage') return data.stages[change.from]?.id === change.id
	return findStage(data, change.from.stage)?.topics[change.from.index]?.id === change.id && findStage(data, change.to.stage) !== undefined
}

function isUpdateApplicable(data: RoadmapData, change: UpdateChange): boolean {
	const found = findEntity(data, change.entity, change.id) as Record<string, unknown> | undefined
	if (!found) return false
	return Object.entries(change.previous).every(([field, value]) => isReviewEqual(found[field], value))
}

function isRoadmapEntityChangeApplicable(data: RoadmapData, change: RoadmapEntityChange): boolean {
	if (change.type === 'add') return isAddApplicable(data, change)
	if (change.type === 'move') return isMoveApplicable(data, change)
	if (change.type === 'update') return isUpdateApplicable(data, change)
	return findEntity(data, change.entity, change.id) !== undefined
}

function isRoadmapChangeApplicable(data: RoadmapData, change: RoadmapChange): boolean {
	if (change.type !== 'root') return isRoadmapEntityChangeApplicable(data, change)
	const current = data as unknown as Record<string, unknown>
	return Object.entries(change.previous).every(([field, value]) => isReviewEqual(current[field], value))
}

export const roadmapReviewAdapter: ReviewAdapter<RoadmapChange, RoadmapData> = {
	describe: describeRoadmapChange,
	isApplicable: isRoadmapChangeApplicable,
}

export function isRoadmapProposalStale(data: RoadmapData, changes: readonly RoadmapChange[]): boolean {
	let current = data
	for (const change of changes) {
		if (!isRoadmapChangeApplicable(current, change)) return true
		current = applyRoadmapChanges(current, [change])
	}
	return false
}

export const roadmapDescribeAdapter: ReviewAdapter<RoadmapChange> = { describe: describeRoadmapChange }
