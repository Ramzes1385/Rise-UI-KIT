import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { ROADMAP_DATA_VERSION } from '../../types/roadmapData.types'
import type { RoadmapTemplate } from '../../types/roadmapEdit.types'
import type { RoadmapData, RoadmapStage, RoadmapTopic } from '../../types/roadmapData.types'

export const ROADMAP_BUILTIN_TEMPLATE_IDS = ['empty', 'stage', 'topic', 'topic-subtopics', 'choice'] as const

export function collectRoadmapIds(data: RoadmapData): Set<string> {
	return new Set(data.stages.flatMap(stage => [stage.id, ...stage.topics.map(topic => topic.id)]))
}

export function uniqueRoadmapId(taken: Set<string>, base: string): string {
	let number = 1
	while (taken.has(`${base}-${number}`)) number += 1
	const id = `${base}-${number}`
	taken.add(id)
	return id
}

function cloneJson<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T
}

function keepOrCreate(taken: Set<string>, id: string | undefined, base: string): string {
	if (id === undefined || id === '' || taken.has(id)) return uniqueRoadmapId(taken, base)
	taken.add(id)
	return id
}

export function topicFromTemplate(template: NonNullable<RoadmapTemplate['topic']>, taken: Set<string>): RoadmapTopic {
	return { ...cloneJson(template), id: keepOrCreate(taken, template.id, 'topic') }
}

export function stageFromTemplate(template: NonNullable<RoadmapTemplate['stage']>, taken: Set<string>): RoadmapStage {
	const id = keepOrCreate(taken, template.id, 'stage')
	const topics = template.topics.map(topic => topicFromTemplate(topic, taken))
	return { ...cloneJson({ ...template, topics: [] }), id, topics }
}

export function builtinRoadmapTemplates(): RoadmapTemplate[] {
	const subtopic = (n: number) => ({ id: `s${n}`, title: formatMessage(UI_ROADMAP_EDIT.NEW_SUBTOPIC, { n }) })
	return [
		{
			id: 'empty',
			title: UI_ROADMAP_EDIT.TPL_EMPTY,
			subtitle: UI_ROADMAP_EDIT.TPL_EMPTY_HINT,
			data: { version: ROADMAP_DATA_VERSION, title: '', stages: [] },
		},
		{ id: 'stage', title: UI_ROADMAP_EDIT.TPL_STAGE, stage: { title: UI_ROADMAP_EDIT.NEW_STAGE, topics: [] } },
		{ id: 'topic', title: UI_ROADMAP_EDIT.TPL_TOPIC, topic: { title: UI_ROADMAP_EDIT.NEW_TOPIC } },
		{
			id: 'topic-subtopics',
			title: UI_ROADMAP_EDIT.TPL_TOPIC_SUBTOPICS,
			topic: { title: UI_ROADMAP_EDIT.NEW_TOPIC, subtopics: [subtopic(1), subtopic(2), subtopic(3)] },
		},
		{
			id: 'choice',
			title: UI_ROADMAP_EDIT.TPL_CHOICE,
			stage: {
				title: UI_ROADMAP_EDIT.NEW_STAGE,
				topics: [
					{ id: 'choice-a', title: UI_ROADMAP_EDIT.NEW_CHOICE_A, choice: 'choice' },
					{ id: 'choice-b', title: UI_ROADMAP_EDIT.NEW_CHOICE_B, choice: 'choice' },
				],
			},
		},
	]
}

export function mergeRoadmapTemplates(custom: readonly RoadmapTemplate[] | undefined): RoadmapTemplate[] {
	const own = custom ?? []
	return [...builtinRoadmapTemplates().filter(item => !own.some(template => template.id === item.id)), ...own]
}

export function templateKind(template: RoadmapTemplate): 'data' | 'stage' | 'topic' | null {
	if (template.data) return 'data'
	if (template.stage) return 'stage'
	return template.topic ? 'topic' : null
}
