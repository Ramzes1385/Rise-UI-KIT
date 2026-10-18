import { vi } from 'vitest'
import type { RoadmapStageView, RoadmapTopicView } from '../../types/internal/roadmapInternal.types'
import type { RoadmapData, RoadmapProgress, RoadmapStageStatus, RoadmapTopic, RoadmapTopicStatus } from '../../types/roadmapData.types'

export const SHELL_DATA: RoadmapData = {
	version: 1,
	id: 'shell',
	title: 'Фронтенд',
	goal: 'Работа',
	stages: [
		{
			id: 'basics',
			title: 'Основы',
			topics: [
				{
					id: 'html',
					title: 'HTML',
					description: 'Разметка страниц',
					hours: 4,
					subtopics: [
						{ id: 'tags', title: 'Теги' },
						{ id: 'forms', title: 'Формы' },
					],
					materials: [
						{ id: 'mdn', title: 'MDN', kind: 'doc', url: 'https://developer.mozilla.org/html' },
						{ title: 'Лекция', kind: 'video', minutes: 90 },
						{ title: 'Заметка', kind: 'link' },
						{ title: 'Внутренняя', kind: 'article', url: '/local' },
					],
				},
				{ id: 'css', title: 'CSS', hours: 6, requires: ['html'] },
				{ id: 'git', title: 'Git', kind: 'optional', hours: 2 },
			],
		},
		{
			id: 'frameworks',
			title: 'Фреймворки',
			requires: ['css'],
			topics: [
				{ id: 'react', title: 'React', hours: 10, choice: 'fw', isRecommended: true },
				{ id: 'vue', title: 'Vue', hours: 8, choice: 'fw' },
			],
		},
	],
}

export const EMPTY_PROGRESS: RoadmapProgress = { version: 1, topics: {} }

export const HTML_DONE: RoadmapProgress = { version: 1, topics: { html: { status: 'done' } } }

export const CSS_UNLOCKED: RoadmapProgress = {
	version: 1,
	topics: { html: { status: 'done' }, css: { status: 'done' } },
}

export function mockWidth(width: number): void {
	vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
		width,
		height: 600,
		top: 0,
		left: 0,
		bottom: 600,
		right: width,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
}

interface TopicViewInput {
	id?: string
	title?: string
	status?: RoadmapTopicStatus
	done?: number
	total?: number
	fraction?: number
	missing?: string[]
	topic?: Partial<RoadmapTopic>
	isAlternative?: boolean
	isSelected?: boolean
	isBusy?: boolean
}

const TOPIC_VIEW_DEFAULTS = {
	id: 't1',
	title: 'Тема',
	status: 'available',
	done: 0,
	total: 0,
	fraction: 0,
	missing: [] as string[],
	isAlternative: false,
	isSelected: false,
	isBusy: false,
} as const

export function topicView(input: TopicViewInput = {}): RoadmapTopicView {
	const { id, title, status, done, total, fraction, missing, isAlternative, isSelected, isBusy } = { ...TOPIC_VIEW_DEFAULTS, ...input }
	return {
		topic: { id, title, ...input.topic },
		state: { status, done, total, fraction, missing },
		isSelected,
		isFiltered: false,
		isAlternative,
		isBusy,
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
	done?: number
	hours?: number
}

export function stageView(input: StageViewInput = {}): RoadmapStageView {
	const id = input.id ?? 's1'
	const topics = input.topics ?? [topicView()]
	return {
		stage: { id, title: input.title ?? 'Этап', requires: input.requires, topics: topics.map(view => view.topic) },
		index: input.index ?? 0,
		status: input.status ?? 'available',
		done: input.done ?? 0,
		total: topics.length,
		hours: input.hours ?? 0,
		isExpanded: input.isExpanded ?? false,
		topics,
		headingId: `${id}-heading`,
		panelId: `${id}-panel`,
	}
}
