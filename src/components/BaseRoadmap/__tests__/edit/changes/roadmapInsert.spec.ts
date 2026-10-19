import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { editData, roadmap, stage, topic } from '../fixtures/editFixtures'
import { applyRoadmapChanges } from '../../../model/edit/changes/roadmapChanges'
import { buildAlternative } from '../../../model/edit/changes/roadmapAlternative'
import { buildDuplicate, buildTemplate } from '../../../model/edit/changes/roadmapInsert'

describe('buildDuplicate', () => {
	it('неизвестный id — unknown', () => {
		expect(buildDuplicate(editData(), 'ghost')).toMatchObject({ code: 'unknown' })
	})

	it('тема: копия сразу после оригинала, новый id и подпись «копия»', () => {
		const data = editData()
		const built = buildDuplicate(data, 'a')
		const next = applyRoadmapChanges(data, built as never)
		expect(next.stages[0].topics.map(item => item.id)).toEqual(['a', 'topic-1', 'b', 'c'])
		expect(next.stages[0].topics[1]).toMatchObject({ hours: 2, title: `Тема a ${UI_ROADMAP_EDIT.COPY_SUFFIX}` })
	})

	it('этап: копия темы с переназначенными id, внутренние требования ведут на копии, внешние остаются', () => {
		const data = roadmap([
			stage('s1', [topic('a'), topic('b', { requires: ['a', 'outer'] }), topic('c')], { requires: ['x'] }),
			stage('s2', []),
		])
		const next = applyRoadmapChanges(data, buildDuplicate(data, 's1') as never)
		const copy = next.stages[1]
		expect(next.stages.map(item => item.id)).toEqual(['s1', 'stage-1', 's2'])
		expect(copy).toMatchObject({ title: `Этап s1 ${UI_ROADMAP_EDIT.COPY_SUFFIX}`, requires: ['x'] })
		expect(copy.topics.map(item => item.id)).toEqual(['topic-1', 'topic-2', 'topic-3'])
		expect(copy.topics[1].requires).toEqual(['topic-1', 'outer'])
		expect(copy.topics[0].requires).toBeUndefined()
		expect(data.stages[0].topics[1].requires).toEqual(['a', 'outer'])
	})
})

describe('buildTemplate', () => {
	it('нет шаблона или он пуст — invalid', () => {
		const data = editData()
		expect(buildTemplate(data, undefined)).toMatchObject({ code: 'invalid' })
		expect(buildTemplate(data, { id: 't', title: 'Пустой' })).toMatchObject({ code: 'invalid' })
	})

	it('шаблон с данными заменяет путь копией, не самим объектом', () => {
		const template = { id: 't', title: 'T', data: roadmap([stage('n', [])], { title: 'Из шаблона' }) }
		const built = buildTemplate(editData(), template) as { type: string; value?: unknown }[]
		expect(built.at(-1)).toMatchObject({ type: 'add', entity: 'stage' })
		expect(built.at(-1)?.value).not.toBe(template.data.stages[0])
	})

	it('шаблон этапа: свой id сохраняется, занятый заменяется, индекс из места вставки', () => {
		const data = editData()
		const free = buildTemplate(
			data,
			{ id: 't', title: 'T', stage: { id: 'fresh', title: 'Эт', topics: [{ id: 'q', title: 'Q' }] } },
			{ index: 1 },
		)
		expect(free).toMatchObject([{ index: 1, value: { id: 'fresh', topics: [{ id: 'q' }] } }])
		const taken = buildTemplate(data, {
			id: 't',
			title: 'T',
			stage: { id: 's1', title: 'Эт', topics: [{ title: 'без id' }, { id: 'a', title: 'A' }] },
		})
		expect(taken).toMatchObject([{ value: { id: 'stage-1', topics: [{ id: 'topic-1' }, { id: 'topic-2' }] } }])
	})

	it('шаблон темы: в указанный или последний этап; без этапов — invalid', () => {
		const data = editData()
		const template = { id: 't', title: 'T', topic: { title: 'Новая' } }
		expect(buildTemplate(data, template, { stage: 's2', index: 0 })).toMatchObject([
			{ entity: 'topic', stage: 's2', index: 0, value: { id: 'topic-1' } },
		])
		expect(buildTemplate(data, template)).toMatchObject([{ entity: 'topic', stage: 's3' }])
		expect(buildTemplate(roadmap([]), template)).toMatchObject({ code: 'invalid' })
		expect(buildTemplate(data, { ...template, topic: { id: '', title: 'Пустой id' } })).toMatchObject([{ value: { id: 'topic-1' } }])
	})
})

describe('buildAlternative', () => {
	const data = () =>
		roadmap([
			stage('s', [topic('a'), topic('b'), topic('c', { choice: 'g' }), topic('d', { choice: 'g' }), topic('e', { choice: 'g' })]),
		])

	it('неизвестный id, этап и первая тема — пустой набор', () => {
		expect(buildAlternative(data(), 'ghost', true)).toEqual([])
		expect(buildAlternative(data(), 's', true)).toEqual([])
		expect(buildAlternative(data(), 'a', true)).toEqual([])
	})

	it('включение: предыдущая без группы получает общую, с группой — присоединяемся к ней', () => {
		const first = buildAlternative(data(), 'b', true)
		expect(first).toEqual([
			{ type: 'update', entity: 'topic', id: 'a', patch: { choice: 'choice-s' }, previous: { choice: undefined } },
			{ type: 'update', entity: 'topic', id: 'b', patch: { choice: 'choice-s' }, previous: { choice: undefined } },
		])
		const join = roadmap([stage('s', [topic('c', { choice: 'g' }), topic('x')])])
		expect(buildAlternative(join, 'x', true)).toEqual([
			{ type: 'update', entity: 'topic', id: 'x', patch: { choice: 'g' }, previous: { choice: undefined } },
		])
	})

	it('выключение: в группе из трёх уходит одна тема, из двух — обе, без группы — ничего', () => {
		expect(buildAlternative(data(), 'd', false)).toHaveLength(1)
		const pair = roadmap([stage('s', [topic('c', { choice: 'g' }), topic('d', { choice: 'g' })])])
		expect(buildAlternative(pair, 'd', false)).toHaveLength(2)
		expect(buildAlternative(data(), 'a', false)).toEqual([])
	})
})
