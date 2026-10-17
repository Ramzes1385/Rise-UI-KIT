import { ROADMAP_PROGRESS_STATUSES } from '../../types/roadmapData.types'
import type { RoadmapMergeResult, RoadmapStatusPatch, RoadmapSubtopicPatch } from '../../types/internal/roadmapInternal.types'
import type { RoadmapData, RoadmapProgress, RoadmapProgressStatus, RoadmapTopic, RoadmapTopicProgress } from '../../types/roadmapData.types'

export const ROADMAP_PROGRESS_VERSION = 1
export const ROADMAP_STORAGE_PREFIX = 'rise-roadmap:'

export function emptyRoadmapProgress(): RoadmapProgress {
	return { version: ROADMAP_PROGRESS_VERSION, topics: {} }
}

export function roadmapProgressKey(data: RoadmapData): string {
	if (data.id) return data.id
	let hash = 5381
	for (let position = 0; position < data.title.length; position += 1) hash = ((hash * 33) ^ data.title.charCodeAt(position)) >>> 0
	return `roadmap-${hash.toString(36)}`
}

function write(progress: RoadmapProgress, id: string, entry: RoadmapTopicProgress): RoadmapProgress {
	return { ...progress, topics: { ...progress.topics, [id]: entry } }
}

export function withTopicStatus(progress: RoadmapProgress, { topicId, status, now }: RoadmapStatusPatch): RoadmapProgress {
	const current = progress.topics[topicId]
	if (status === null) return current ? write(progress, topicId, { updatedAt: now }) : progress
	if (current?.status === status) return progress
	return write(progress, topicId, { ...current, status, updatedAt: now })
}

export function markedSubtopics(current: RoadmapTopicProgress | undefined, topic: RoadmapTopic): string[] {
	return current?.status === 'done' ? (topic.subtopics ?? []).map(subtopic => subtopic.id) : (current?.subtopics ?? [])
}

export function withSubtopic(
	progress: RoadmapProgress,
	topic: RoadmapTopic,
	{ subtopicId, isDone, now }: RoadmapSubtopicPatch,
): RoadmapProgress {
	const all = (topic.subtopics ?? []).map(subtopic => subtopic.id)
	if (!all.includes(subtopicId)) return progress
	const current = progress.topics[topic.id]
	const marked = markedSubtopics(current, topic)
	if (marked.includes(subtopicId) === isDone) return progress
	const subtopics = isDone ? [...marked, subtopicId] : marked.filter(id => id !== subtopicId)
	const entry: RoadmapTopicProgress = { subtopics, updatedAt: now }
	if (current?.status === 'in-progress') entry.status = 'in-progress'
	return write(progress, topic.id, entry)
}

function stamp(entry: RoadmapTopicProgress | undefined): number {
	const time = entry?.updatedAt ? Date.parse(entry.updatedAt) : Number.NaN
	return Number.isNaN(time) ? -Infinity : time
}

export function mergeRoadmapProgress(current: RoadmapProgress, stored: RoadmapProgress): RoadmapMergeResult {
	const topics: Record<string, RoadmapTopicProgress> = { ...current.topics }
	const fromStored: string[] = []
	const fromLocal: string[] = []
	for (const id of new Set([...Object.keys(current.topics), ...Object.keys(stored.topics)])) {
		const local = current.topics[id]
		const remote = stored.topics[id]
		if (remote && (!local || stamp(remote) > stamp(local))) {
			topics[id] = remote
			fromStored.push(id)
		} else if (local && (!remote || stamp(local) > stamp(remote))) fromLocal.push(id)
	}
	return { progress: { ...current, topics }, fromStored, fromLocal }
}

function normalizeEntry(raw: unknown): RoadmapTopicProgress | null {
	if (typeof raw !== 'object' || raw === null) return null
	const { status, subtopics, updatedAt } = raw as Record<string, unknown>
	const entry: RoadmapTopicProgress = {}
	if (ROADMAP_PROGRESS_STATUSES.includes(status as RoadmapProgressStatus)) entry.status = status as RoadmapProgressStatus
	if (Array.isArray(subtopics)) entry.subtopics = subtopics.filter((id): id is string => typeof id === 'string')
	if (typeof updatedAt === 'string') entry.updatedAt = updatedAt
	return entry
}

export function normalizeRoadmapProgress(raw: unknown): RoadmapProgress | null {
	if (typeof raw !== 'object' || raw === null) return null
	const { version, topics } = raw as Record<string, unknown>
	if (typeof version !== 'number' || typeof topics !== 'object' || topics === null) return null
	const normalized: Record<string, RoadmapTopicProgress> = {}
	for (const [id, entry] of Object.entries(topics)) {
		const value = normalizeEntry(entry)
		if (value) normalized[id] = value
	}
	return { version, topics: normalized }
}
