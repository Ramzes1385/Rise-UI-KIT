import { isOptionalTopic } from './roadmapStatus'
import type { RoadmapData, RoadmapStage, RoadmapStageStatus, RoadmapTopic } from '../../types/roadmapData.types'
import type {
	RoadmapIndex,
	RoadmapStatuses,
	RoadmapSummary,
	RoadmapSummaryContext,
	RoadmapSummaryItem,
	RoadmapSummaryTotals,
} from '../../types/internal/roadmapInternal.types'

function remaining(topic: RoadmapTopic, statuses: RoadmapStatuses): number {
	return (topic.hours ?? 0) * (1 - (statuses.topics.get(topic.id)?.fraction ?? 0))
}

function isPassed(topic: RoadmapTopic, statuses: RoadmapStatuses): boolean {
	const status = statuses.topics.get(topic.id)?.status
	return status === 'done' || status === 'skipped'
}

function trackChoice(item: RoadmapSummaryItem, choice: string, context: RoadmapSummaryContext): void {
	const group = item.groups.get(choice) ?? { isPassed: false, least: null }
	group.isPassed ||= isPassed(item.topic, context.statuses)
	if (item.topic.hours !== undefined) group.least = Math.min(group.least ?? Infinity, remaining(item.topic, context.statuses))
	item.groups.set(choice, group)
}

function addRequired(totals: RoadmapSummaryTotals, item: RoadmapSummaryItem, context: RoadmapSummaryContext): void {
	const { topic } = item
	if (topic.choice !== undefined) trackChoice(item, topic.choice, context)
	else if (!isPassed(topic, context.statuses)) totals.hours += remaining(topic, context.statuses)
	if (context.statuses.topics.get(topic.id)?.status === 'available') item.candidates.push({ id: topic.id, choice: topic.choice })
}

function addTopic(totals: RoadmapSummaryTotals, item: RoadmapSummaryItem, context: RoadmapSummaryContext): void {
	const { topic, stage } = item
	const status = context.statuses.topics.get(topic.id)?.status
	totals.total += 1
	if (status === 'done') totals.done += 1
	if (status === 'in-progress') totals.inProgressId ??= topic.id
	if (!isOptionalTopic(topic, stage)) addRequired(totals, item, context)
}

function addStage(totals: RoadmapSummaryTotals, stage: RoadmapStage, context: RoadmapSummaryContext): void {
	const groups: RoadmapSummaryItem['groups'] = new Map()
	const candidates: RoadmapSummaryItem['candidates'] = []
	stage.topics.forEach(topic => {
		if (context.index.topics.get(topic.id)?.topic === topic) addTopic(totals, { topic, stage, groups, candidates }, context)
	})
	groups.forEach(group => {
		if (!group.isPassed) totals.hours += group.least ?? 0
	})
	const first = candidates.find(candidate => candidate.choice === undefined || !groups.get(candidate.choice)?.isPassed)
	totals.availableId ??= first?.id ?? null
}

export function summarizeRoadmap(data: RoadmapData, statuses: RoadmapStatuses, index: RoadmapIndex): RoadmapSummary {
	const totals: RoadmapSummaryTotals = { done: 0, total: 0, hours: 0, inProgressId: null, availableId: null }
	data.stages.forEach(stage => {
		if (index.stages.get(stage.id) === stage) addStage(totals, stage, { statuses, index })
	})
	return {
		done: totals.done,
		total: totals.total,
		percent: totals.total > 0 ? Math.round((totals.done / totals.total) * 100) : 0,
		hoursLeft: Math.round(totals.hours),
		continueTopicId: totals.inProgressId ?? totals.availableId,
	}
}

export function roadmapPathProgress(stages: { status: RoadmapStageStatus; done: number; total: number }[]): number {
	const leading = stages.findIndex(stage => stage.status !== 'done')
	if (stages.length === 0) return 0
	if (leading === -1) return 1
	const next = stages[leading]
	return (leading + (next.total > 0 ? next.done / next.total : 0)) / stages.length
}
