import type { RoadmapTopicState } from '../../types/BaseRoadmap.types'
import type {
	RoadmapCompletions,
	RoadmapIndex,
	RoadmapStatusContext,
	RoadmapStatusInput,
	RoadmapStatuses,
} from '../../types/internal/roadmapInternal.types'
import type {
	RoadmapData,
	RoadmapProgress,
	RoadmapProgressStatus,
	RoadmapStage,
	RoadmapStageStatus,
	RoadmapTopic,
	RoadmapTopicStatus,
} from '../../types/roadmapData.types'

const LOCKED_STATE: RoadmapTopicState = { status: 'locked', done: 0, total: 0, fraction: 0, missing: [] }

export function buildRoadmapIndex(data: RoadmapData): RoadmapIndex {
	const stages: RoadmapIndex['stages'] = new Map()
	const topics: RoadmapIndex['topics'] = new Map()
	data.stages.forEach((stage, stageIndex) => {
		if (!stages.has(stage.id) && !topics.has(stage.id)) stages.set(stage.id, stage)
		stage.topics.forEach(topic => {
			if (!stages.has(topic.id) && !topics.has(topic.id)) topics.set(topic.id, { topic, stage, stageIndex })
		})
	})
	return { stages, topics }
}

export function isOptionalTopic(topic: RoadmapTopic, stage: RoadmapStage): boolean {
	return topic.kind === 'optional' || stage.kind === 'optional'
}

function isPassed(status: RoadmapTopicStatus): boolean {
	return status === 'done' || status === 'skipped'
}

function countChecked(topic: RoadmapTopic, progress: RoadmapProgress): number {
	const marked = progress.topics[topic.id]?.subtopics ?? []
	return (topic.subtopics ?? []).filter(subtopic => marked.includes(subtopic.id)).length
}

function deriveStatus(explicit: RoadmapProgressStatus | undefined, checked: number, total: number): RoadmapTopicStatus {
	if (explicit === 'done' || (total > 0 && checked === total)) return 'done'
	if (explicit === 'skipped') return 'skipped'
	return explicit === 'in-progress' || checked > 0 ? 'in-progress' : 'available'
}

function explicitStatus(progress: RoadmapProgress, topic: RoadmapTopic): RoadmapProgressStatus | undefined {
	return progress.topics[topic.id]?.status ?? topic.defaultStatus
}

function isSatisfied(context: RoadmapStatusContext, id: string): boolean {
	const stage = context.index.stages.get(id)
	if (stage) return stage.kind === 'optional' || isStageDone(context, stage)
	return isPassed(topicStateOf(context, id).status)
}

function unmetOf(context: RoadmapStatusContext, id: string): string[] {
	return (context.requires.get(id) ?? []).filter(target => !isSatisfied(context, target))
}

function topicStateOf(context: RoadmapStatusContext, id: string): RoadmapTopicState {
	const known = context.topics.get(id)
	const entry = context.index.topics.get(id)
	if (known || !entry || context.visiting.has(id)) return known ?? LOCKED_STATE
	context.visiting.add(id)
	const missing = [...unmetOf(context, id), ...unmetOf(context, entry.stage.id)]
	context.visiting.delete(id)
	const total = entry.topic.subtopics?.length ?? 0
	const checked = countChecked(entry.topic, context.progress)
	const status = missing.length ? 'locked' : deriveStatus(explicitStatus(context.progress, entry.topic), checked, total)
	const fraction = total > 0 ? checked / total : Number(status === 'done')
	const state = { status, done: checked, total, fraction, missing }
	context.topics.set(id, state)
	return state
}

function isStagePassed(context: RoadmapStatusContext, stage: RoadmapStage): boolean {
	const groups = new Map<string, boolean>()
	let areRequiredPassed = true
	for (const topic of stage.topics) {
		if (topic.kind === 'optional' || !context.index.topics.has(topic.id)) continue
		const isTopicPassed = isPassed(topicStateOf(context, topic.id).status)
		if (topic.choice === undefined) areRequiredPassed &&= isTopicPassed
		else groups.set(topic.choice, (groups.get(topic.choice) ?? false) || isTopicPassed)
	}
	return areRequiredPassed && [...groups.values()].every(Boolean)
}

function isStageDone(context: RoadmapStatusContext, stage: RoadmapStage): boolean {
	const known = context.stageDone.get(stage.id)
	if (known !== undefined) return known
	if (context.visiting.has(stage.id)) return false
	context.visiting.add(stage.id)
	const isDone = unmetOf(context, stage.id).length === 0 && isStagePassed(context, stage)
	context.visiting.delete(stage.id)
	context.stageDone.set(stage.id, isDone)
	return isDone
}

function stageStatusOf(context: RoadmapStatusContext, stage: RoadmapStage, currentId: string | null): RoadmapStageStatus {
	if (unmetOf(context, stage.id).length) return 'locked'
	if (isStageDone(context, stage)) return 'done'
	return stage.id === currentId ? 'current' : 'available'
}

function findCurrentStage(context: RoadmapStatusContext): string | null {
	for (const stage of context.index.stages.values()) {
		const isOpen = unmetOf(context, stage.id).length === 0 && !isStageDone(context, stage)
		if (isOpen && stage.kind !== 'optional') return stage.id
	}
	return null
}

export function computeRoadmapStatuses({ data, progress, requires, index = buildRoadmapIndex(data) }: RoadmapStatusInput): RoadmapStatuses {
	const context: RoadmapStatusContext = { index, requires, progress, topics: new Map(), stageDone: new Map(), visiting: new Set() }
	const topics = new Map<string, RoadmapTopicState>()
	index.topics.forEach((_, id) => topics.set(id, topicStateOf(context, id)))
	const currentStageId = findCurrentStage(context)
	const stages = new Map<string, RoadmapStageStatus>()
	index.stages.forEach(stage => stages.set(stage.id, stageStatusOf(context, stage, currentStageId)))
	return { topics, stages, currentStageId }
}

export function diffRoadmapCompletions(before: RoadmapStatuses, after: RoadmapStatuses): RoadmapCompletions {
	const topics: string[] = []
	const stages: string[] = []
	after.topics.forEach((state, id) => {
		if (state.status === 'done' && before.topics.get(id)?.status !== 'done') topics.push(id)
	})
	after.stages.forEach((status, id) => {
		if (status === 'done' && before.stages.get(id) !== 'done') stages.push(id)
	})
	return { topics, stages }
}
