import { warn } from '@/locales/warn'
import { UI_ROADMAP } from '@/locales/messages'
import { computed, shallowRef, watch } from 'vue'
import { useRoadmapStorage } from './useRoadmapStorage'
import { isDevelopmentBuild } from '@utils/seo/structuredDataUtils'
import type { RoadmapTopicState } from '../../types/BaseRoadmap.types'
import { computeRoadmapStatuses, diffRoadmapCompletions } from './roadmapStatus'
import type { RoadmapProgress, RoadmapProgressStatus, RoadmapStage, RoadmapTopic } from '../../types/roadmapData.types'
import {
	emptyRoadmapProgress,
	markedSubtopics,
	mergeRoadmapProgress,
	roadmapProgressKey,
	withSubtopic,
	withTopicStatus,
} from './roadmapProgress'
import type {
	RoadmapChangeRequest,
	RoadmapChangeSource,
	RoadmapProgressContext,
	UseRoadmapProgressOptions,
} from '../../types/internal/roadmapInternal.types'

function statusesOf(context: RoadmapProgressContext, progress: RoadmapProgress) {
	return computeRoadmapStatuses({ data: context.data.value, progress, requires: context.requires.value, index: context.index.value })
}

function setBusy(context: RoadmapProgressContext, id: string, isBusy: boolean): void {
	const next = new Set(context.busy.value)
	if (isBusy) next.add(id)
	else next.delete(id)
	context.busy.value = next
}

async function isAllowed(
	context: RoadmapProgressContext,
	request: RoadmapChangeRequest,
	versions: [RoadmapProgress, RoadmapProgress],
): Promise<boolean> {
	const entry = context.index.value.topics.get(request.topicId)
	const hook = context.props.beforeStatusChange
	if (!entry || !hook) return Boolean(entry)
	const [from, to] = versions.map(progress => (statusesOf(context, progress).topics.get(request.topicId) as RoadmapTopicState).status)
	setBusy(context, request.topicId, true)
	try {
		return (await hook({ topic: entry.topic, from, to, source: request.source })) !== false
	} catch (error) {
		if (isDevelopmentBuild()) warn(UI_ROADMAP.HOOK_FAILED, { error: String(error) })
		return false
	} finally {
		setBusy(context, request.topicId, false)
	}
}

function emitChanges(context: RoadmapProgressContext, requests: RoadmapChangeRequest[], next: RoadmapProgress): void {
	const { emit, index } = context
	const before = context.statuses.value
	context.progress.value = next
	emit('update:progress', next)
	const after = context.statuses.value
	for (const { topicId, source } of requests) {
		const topic = index.value.topics.get(topicId)?.topic
		const from = before.topics.get(topicId)?.status
		const to = after.topics.get(topicId)?.status
		if (topic && from && to && from !== to) emit('status-change', { topic, from, to, source })
	}
	const completions = diffRoadmapCompletions(before, after)
	completions.topics.forEach(id => emit('topic-complete', { topic: index.value.topics.get(id)?.topic as RoadmapTopic, progress: next }))
	completions.stages.forEach(id => emit('stage-complete', { stage: index.value.stages.get(id) as RoadmapStage, progress: next }))
}

async function runChange(
	context: RoadmapProgressContext,
	request: RoadmapChangeRequest,
	mutate: (base: RoadmapProgress) => RoadmapProgress,
): Promise<boolean> {
	const { topicId } = request
	if (context.props.isDisabled || context.busy.value.has(topicId) || !context.index.value.topics.has(topicId)) return false
	const base = context.progress.value
	const candidate = mutate(base)
	if (candidate === base || !(await isAllowed(context, request, [base, candidate]))) return false
	const latest = mutate(context.progress.value)
	if (latest === context.progress.value) return false
	emitChanges(context, [request], latest)
	return true
}

function toggleSubtopicIn(
	context: RoadmapProgressContext,
	{ id, subtopicId, isDone }: { id: string; subtopicId: string; isDone?: boolean },
): Promise<boolean> {
	const topic = context.index.value.topics.get(id)?.topic
	if (!topic || context.statuses.value.topics.get(id)?.status === 'locked') return Promise.resolve(false)
	return runChange(context, { topicId: id, source: 'subtopic' }, base =>
		withSubtopic(base, topic, {
			subtopicId,
			isDone: isDone ?? !markedSubtopics(base.topics[id], topic).includes(subtopicId),
			now: new Date().toISOString(),
		}),
	)
}

async function mergeStored(context: RoadmapProgressContext, stored: RoadmapProgress): Promise<boolean> {
	const { fromStored, fromLocal } = mergeRoadmapProgress(context.progress.value, stored)
	const take = (base: RoadmapProgress, id: string): RoadmapProgress => ({ ...base, topics: { ...base.topics, [id]: stored.topics[id] } })
	let working = context.progress.value
	const accepted: RoadmapChangeRequest[] = []
	for (const topicId of fromStored) {
		const request = { topicId, source: 'storage' as const }
		if (await isAllowed(context, request, [working, take(working, topicId)])) {
			working = take(working, topicId)
			accepted.push(request)
		}
	}
	if (accepted.length)
		emitChanges(
			context,
			accepted,
			accepted.reduce((result, { topicId }) => take(result, topicId), context.progress.value),
		)
	return fromLocal.length > 0
}

export function useRoadmapProgress(options: UseRoadmapProgressOptions) {
	const { props, emit, data } = options
	const progress = shallowRef<RoadmapProgress>(props.progress ?? emptyRoadmapProgress())
	const busy = shallowRef<ReadonlySet<string>>(new Set())
	const statuses = computed(() =>
		computeRoadmapStatuses({
			data: data.value,
			progress: progress.value,
			requires: options.requires.value,
			index: options.index.value,
		}),
	)
	const context: RoadmapProgressContext = { ...options, progress, statuses, busy }
	const now = (): string => new Date().toISOString()
	watch(
		() => props.progress,
		value => {
			if (value) progress.value = value
		},
	)
	useRoadmapStorage({
		props,
		emit,
		progress,
		key: computed(() => roadmapProgressKey(data.value)),
		merge: stored => mergeStored(context, stored),
	})

	const isLocked = (id: string): boolean => statuses.value.topics.get(id)?.status === 'locked'
	return {
		progress,
		statuses,
		busy,
		setTopicStatus: (id: string, status: RoadmapProgressStatus | null, source: RoadmapChangeSource = 'api'): Promise<boolean> =>
			status !== null && isLocked(id)
				? Promise.resolve(false)
				: runChange(context, { topicId: id, source }, base => withTopicStatus(base, { topicId: id, status, now: now() })),
		toggleSubtopic: (id: string, subtopicId: string, isDone?: boolean): Promise<boolean> =>
			toggleSubtopicIn(context, { id, subtopicId, isDone }),
		resetProgress: (): void => {
			if (props.isDisabled) return
			progress.value = emptyRoadmapProgress()
			emit('update:progress', progress.value)
		},
	}
}
