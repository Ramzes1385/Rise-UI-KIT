import { UI_PLURAL, UI_ROADMAP } from '@/locales/messages'
import { formatMessage, formatNumber, pluralize } from '@/locales/state'
import type { RoadmapStageView, RoadmapTopicView } from '../../../types/internal/roadmapInternal.types'
import type { RoadmapStageStatus, RoadmapTopic, RoadmapTopicStatus } from '../../../types/roadmapData.types'

const HOURS_FRACTION_DIGITS = 1

const TOPIC_STATUS_TEXT: Record<RoadmapTopicStatus, () => string> = {
	done: () => UI_ROADMAP.TOPIC_DONE,
	'in-progress': () => UI_ROADMAP.TOPIC_IN_PROGRESS,
	available: () => UI_ROADMAP.TOPIC_AVAILABLE,
	locked: () => UI_ROADMAP.TOPIC_LOCKED,
	skipped: () => UI_ROADMAP.TOPIC_SKIPPED,
}

const STAGE_STATUS_TEXT: Record<RoadmapStageStatus, () => string> = {
	done: () => UI_ROADMAP.STAGE_DONE.toLowerCase(),
	current: () => UI_ROADMAP.STAGE_CURRENT.toLowerCase(),
	available: () => '',
	locked: () => UI_ROADMAP.STAGE_LOCKED.toLowerCase(),
}

const LIVE_TEXT: Record<RoadmapTopicStatus | 'reset', () => string> = {
	done: () => UI_ROADMAP.LIVE_DONE,
	'in-progress': () => UI_ROADMAP.LIVE_PROGRESS,
	skipped: () => UI_ROADMAP.LIVE_SKIPPED,
	available: () => UI_ROADMAP.LIVE_RESET,
	locked: () => UI_ROADMAP.LIVE_RESET,
	reset: () => UI_ROADMAP.LIVE_RESET,
}

export function formatHours(hours: number): string {
	const rounded = Math.round(hours * 10 ** HOURS_FRACTION_DIGITS) / 10 ** HOURS_FRACTION_DIGITS
	return formatMessage(UI_ROADMAP.HOURS, { n: formatNumber(rounded, { maximumFractionDigits: HOURS_FRACTION_DIGITS }) })
}

export function formatMinutes(minutes: number): string {
	if (minutes < 60) return formatMessage(UI_ROADMAP.MINUTES, { n: formatNumber(minutes) })
	return formatHours(minutes / 60)
}

export function topicStatusText(status: RoadmapTopicStatus): string {
	return TOPIC_STATUS_TEXT[status]()
}

export function summaryDoneText(done: number, total: number): string {
	return formatMessage(UI_ROADMAP.SUMMARY_DONE, { done: formatNumber(done), of: pluralize(UI_PLURAL.ROADMAP_OF_TOPICS, total) })
}

export function subtopicsText(done: number, total: number): string {
	return formatMessage(UI_ROADMAP.TOPIC_SUBTOPICS, { done: formatNumber(done), of: pluralize(UI_PLURAL.ROADMAP_OF_SUBTOPICS, total) })
}

export function liveText(status: RoadmapTopicStatus | 'reset', title: string, count: { done: number; total: number }): string {
	return formatMessage(LIVE_TEXT[status](), {
		title,
		done: formatNumber(count.done),
		of: pluralize(UI_PLURAL.ROADMAP_OF_TOPICS, count.total),
	})
}

export function topicMetaText(view: RoadmapTopicView): string {
	const { state, topic } = view
	if (state.status === 'in-progress' && state.total > 0) {
		return formatMessage(UI_ROADMAP.SUMMARY_DONE, { done: formatNumber(state.done), of: formatNumber(state.total) })
	}
	return topic.hours === undefined ? '' : formatHours(topic.hours)
}

export function topicKindText(topic: RoadmapTopic, isAlternative: boolean): string {
	if (isAlternative) return UI_ROADMAP.KIND_ALTERNATIVE
	return topic.kind === 'optional' ? UI_ROADMAP.KIND_OPTIONAL : UI_ROADMAP.KIND_REQUIRED
}

export function topicSrText(view: RoadmapTopicView, missingTitles: string[]): string {
	const { state, topic, isAlternative } = view
	const status =
		state.status === 'locked' && missingTitles.length
			? formatMessage(UI_ROADMAP.TOPIC_NEEDS, { titles: missingTitles.join(', ') })
			: topicStatusText(state.status).toLowerCase()
	const parts = [status]
	if (state.status === 'in-progress' && state.total > 0) parts.push(subtopicsText(state.done, state.total))
	if (isAlternative) parts.push(UI_ROADMAP.KIND_ALTERNATIVE.toLowerCase())
	else if (topic.kind === 'optional') parts.push(UI_ROADMAP.KIND_OPTIONAL.toLowerCase())
	if (topic.isRecommended) parts.push(UI_ROADMAP.RECOMMENDED)
	return parts.join(', ')
}

export function stageMetaText(view: RoadmapStageView, unlockTitle?: string): string {
	if (view.status === 'locked' && unlockTitle) return formatMessage(UI_ROADMAP.STAGE_UNLOCK, { title: unlockTitle })
	const hours = formatHours(view.hours)
	if (view.status === 'done')
		return formatMessage(UI_ROADMAP.STAGE_TOTAL, { topics: pluralize(UI_PLURAL.ROADMAP_TOPICS, view.total), hours })
	return formatMessage(UI_ROADMAP.STAGE_PROGRESS, {
		done: formatNumber(view.done),
		of: pluralize(UI_PLURAL.ROADMAP_OF_TOPICS, view.total),
		hours,
	})
}

export function stageStatusText(status: RoadmapStageStatus): string {
	return STAGE_STATUS_TEXT[status]()
}

export function subtitleText(description: string | undefined, stages: number, topics: number): string {
	if (description) return description
	return formatMessage(UI_ROADMAP.SUBTITLE, {
		stages: pluralize(UI_PLURAL.ROADMAP_STAGES, stages),
		topics: pluralize(UI_PLURAL.ROADMAP_TOPICS, topics),
	})
}

export function ringFraction(status: RoadmapTopicStatus, fraction: number): number {
	if (status === 'done') return 1
	if (status === 'in-progress') return fraction > 0 ? fraction : 0.5
	return 0
}
