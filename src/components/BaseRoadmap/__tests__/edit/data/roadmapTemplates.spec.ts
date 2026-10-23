import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapTopic } from '../../../types/roadmapData.types'
import { importRoadmap } from '../../../model/edit/data/roadmapImport'
import { editData, roadmap, stage, topic } from '../fixtures/editFixtures'
import {
	collectRoadmapIds,
	mergeRoadmapTemplates,
	stageFromTemplate,
	topicFromTemplate,
	uniqueRoadmapId,
} from '../../../model/edit/data/roadmapTemplates'

describe('id шаблонов', () => {
	it('collectRoadmapIds собирает id этапов и тем', () => {
		expect([...collectRoadmapIds(editData())]).toEqual(['s1', 'a', 'b', 'c', 's2', 'd', 'e', 's3'])
	})

	it('uniqueRoadmapId берёт первый свободный номер и занимает его', () => {
		const taken = new Set(['topic-1', 'topic-2'])
		expect(uniqueRoadmapId(taken, 'topic')).toBe('topic-3')
		expect(taken.has('topic-3')).toBe(true)
		expect(uniqueRoadmapId(taken, 'topic')).toBe('topic-4')
		expect(uniqueRoadmapId(new Set(), 'stage')).toBe('stage-1')
	})

	it('тема из шаблона: свободный id сохраняется, пустой, отсутствующий или занятый заменяется', () => {
		const taken = new Set(['busy'])
		expect(topicFromTemplate({ id: 'mine', title: 'T' }, taken).id).toBe('mine')
		expect(taken.has('mine')).toBe(true)
		expect(topicFromTemplate({ title: 'T' }, taken).id).toBe('topic-1')
		expect(topicFromTemplate({ id: '', title: 'T' }, taken).id).toBe('topic-2')
		expect(topicFromTemplate({ id: 'busy', title: 'T' }, taken).id).toBe('topic-3')
	})

	it('шаблон не делится объектами с результатом', () => {
		const source = { title: 'T', subtopics: [{ id: 's1', title: 'S' }] }
		const result = topicFromTemplate(source, new Set())
		expect(result.subtopics).toEqual(source.subtopics)
		expect(result.subtopics).not.toBe(source.subtopics)
	})

	it('этап из шаблона получает id и id для каждой темы', () => {
		const taken = new Set(['stage-1'])
		const result = stageFromTemplate(
			{ title: 'E', kind: 'optional', topics: [{ title: 'A' } as RoadmapTopic, { id: 'x', title: 'B' }] },
			taken,
		)
		expect(result).toMatchObject({ id: 'stage-2', kind: 'optional', topics: [{ id: 'topic-1' }, { id: 'x' }] })
	})
})

describe('mergeRoadmapTemplates', () => {
	it('без своих — пять встроенных с понятными подписями', () => {
		const list = mergeRoadmapTemplates(undefined)
		expect(list.map(item => item.id)).toEqual(['empty', 'stage', 'topic', 'topic-subtopics', 'choice'])
		expect(list[0]).toMatchObject({ title: UI_ROADMAP_EDIT.TPL_EMPTY, data: { stages: [] } })
		expect(list[3].topic?.subtopics).toHaveLength(3)
		expect(list[4].stage?.topics.map(item => item.choice)).toEqual(['choice', 'choice'])
	})

	it('свои идут после встроенных, с тем же id — заменяют встроенный', () => {
		const own = { id: 'topic', title: 'Моя тема', topic: { title: 'X' } }
		const extra = { id: 'extra', title: 'Ещё', stage: { title: 'E', topics: [] } }
		const list = mergeRoadmapTemplates([own, extra])
		expect(list.map(item => item.id)).toEqual(['empty', 'stage', 'topic-subtopics', 'choice', 'topic', 'extra'])
		expect(list.find(item => item.id === 'topic')?.title).toBe('Моя тема')
	})
})

describe('importRoadmap', () => {
	const valid = () => roadmap([stage('s', [topic('a')])])

	it('принимает объект и JSON-строку, возвращая копию', () => {
		const source = valid()
		const fromObject = importRoadmap(source)
		expect(fromObject).toEqual(source)
		expect(fromObject).not.toBe(source)
		expect(importRoadmap(JSON.stringify(source))).toEqual(source)
	})

	it('не JSON, не объект и неполная форма — отказ с текстом загрузки', () => {
		const bad = { code: 'invalid', text: UI_ROADMAP_EDIT.REJECT_IMPORT }
		expect(importRoadmap('{не json')).toEqual(bad)
		expect(importRoadmap('null')).toEqual(bad)
		expect(importRoadmap('5')).toEqual(bad)
		expect(importRoadmap({ ...valid(), version: 'x' } as never)).toEqual(bad)
		expect(importRoadmap({ ...valid(), title: undefined } as never)).toEqual(bad)
		expect(importRoadmap({ ...valid(), stages: 'нет' } as never)).toEqual(bad)
		expect(importRoadmap({ ...valid(), stages: [null] } as never)).toEqual(bad)
		expect(importRoadmap({ ...valid(), stages: [{ id: 's' }] } as never)).toEqual(bad)
	})

	it('повтор id и цикл зависимостей блокируют загрузку, остальные замечания — нет', () => {
		const issues = { code: 'invalid', text: UI_ROADMAP_EDIT.REJECT_IMPORT_ISSUES }
		expect(importRoadmap(roadmap([stage('s', [topic('a'), topic('a')])]))).toEqual(issues)
		expect(importRoadmap(roadmap([stage('s', [topic('a', { requires: ['b'] }), topic('b', { requires: ['a'] })])]))).toEqual(issues)
		const unknownRequire = roadmap([stage('s', [topic('a', { requires: ['ghost'] })])])
		expect(importRoadmap(unknownRequire)).toEqual(unknownRequire)
	})
})
