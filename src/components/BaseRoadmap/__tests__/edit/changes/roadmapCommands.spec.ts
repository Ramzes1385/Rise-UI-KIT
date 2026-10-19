import type { RoadmapData } from '../../../types/roadmapData.types'
import { editData, roadmap, stage, topic } from '../fixtures/editFixtures'
import {
	buildAddStage,
	buildAddTopic,
	buildMove,
	buildRemove,
	buildReplace,
	buildRequirement,
	buildUpdate,
	isRejection,
	pickTarget,
} from '../../../model/edit/changes/roadmapCommands'

describe('buildAddStage и buildAddTopic', () => {
	it('этап: индекс зажимается, занятый id — отказ duplicate', () => {
		const data = editData()
		expect(buildAddStage(data, stage('x', []))).toEqual([{ type: 'add', entity: 'stage', value: stage('x', []), index: 3 }])
		expect(buildAddStage(data, stage('x', []), -2)).toMatchObject([{ index: 0 }])
		expect(buildAddStage(data, stage('x', []), 99)).toMatchObject([{ index: 3 }])
		expect(buildAddStage(data, stage('a', []))).toMatchObject({ code: 'duplicate' })
		expect(isRejection(buildAddStage(data, stage('s1', [])))).toBe(true)
	})

	it('тема: неизвестный этап — unknown, занятый id — duplicate, иначе add с зажатым индексом', () => {
		const data = editData()
		expect(buildAddTopic(data, { stage: 'ghost', topic: topic('x') })).toMatchObject({ code: 'unknown' })
		expect(buildAddTopic(data, { stage: 's1', topic: topic('d') })).toMatchObject({ code: 'duplicate' })
		expect(buildAddTopic(data, { stage: 's1', topic: topic('x') })).toMatchObject([{ type: 'add', entity: 'topic', index: 3 }])
		expect(buildAddTopic(data, { stage: 's1', topic: topic('x'), index: 1 })).toMatchObject([{ index: 1 }])
	})
})

describe('buildMove', () => {
	it('неизвестный id и неизвестный этап назначения — unknown', () => {
		const data = editData()
		expect(buildMove(data, 'ghost', { index: 0 })).toMatchObject({ code: 'unknown' })
		expect(buildMove(data, 'a', { stage: 'ghost', index: 0 })).toMatchObject({ code: 'unknown' })
		expect(buildMove(data, 'a', { index: 0, stage: undefined })).toEqual([])
	})

	it('этап: то же место — пустой набор, иначе move с зажатым индексом', () => {
		const data = editData()
		expect(buildMove(data, 's2', { index: 1 })).toEqual([])
		expect(buildMove(data, 's1', { index: 99 })).toEqual([{ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 }])
		expect(buildMove(data, 's3', { index: -3 })).toEqual([{ type: 'move', entity: 'stage', id: 's3', from: 2, to: 0 }])
	})

	it('тема: внутри этапа последний индекс ограничен длиной минус один, в другой этап — длиной', () => {
		const data = editData()
		expect(buildMove(data, 'a', { index: 99 })).toEqual([
			{ type: 'move', entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's1', index: 2 } },
		])
		expect(buildMove(data, 'a', { stage: 's1', index: 0 })).toEqual([])
		expect(buildMove(data, 'a', { stage: 's2', index: 99 })).toEqual([
			{ type: 'move', entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's2', index: 2 } },
		])
		expect(buildMove(data, 'a', { stage: 's3', index: 0 })).toMatchObject([{ to: { stage: 's3', index: 0 } }])
	})
})

describe('buildUpdate', () => {
	it('неизвестный id — unknown; изменений нет или только id — пустой набор', () => {
		const data = editData()
		expect(buildUpdate(data, 'ghost', { title: 'x' })).toMatchObject({ code: 'unknown' })
		expect(buildUpdate(data, 'a', { title: 'Тема a' })).toEqual([])
		expect(buildUpdate(data, 'a', { id: 'zzz' })).toEqual([])
	})

	it('собирает patch и previous только по изменившимся полям, для темы и этапа', () => {
		const data = editData()
		expect(buildUpdate(data, 'a', { title: 'Новая', hours: 2, id: 'zzz' })).toEqual([
			{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'Новая' }, previous: { title: 'Тема a' } },
		])
		expect(buildUpdate(data, 's1', { kind: 'optional' })).toEqual([
			{ type: 'update', entity: 'stage', id: 's1', patch: { kind: 'optional' }, previous: { kind: undefined } },
		])
		expect(buildUpdate(data, 'a', { hours: undefined })).toMatchObject([{ patch: { hours: undefined }, previous: { hours: 2 } }])
	})

	it('новое требование, замыкающее цикл, — отказ cycle с путём из названий', () => {
		const data = editData()
		const rejection = buildUpdate(data, 'a', { requires: ['b'] })
		expect(rejection).toMatchObject({ code: 'cycle' })
		expect((rejection as { text: string }).text).toContain('Тема a → Тема b → Тема a')
	})

	it('уже существующее требование цикл не проверяет, безопасное — проходит', () => {
		const data = editData()
		expect(buildUpdate(data, 'b', { requires: ['a', 'c'] })).toMatchObject([{ patch: { requires: ['a', 'c'] } }])
		expect(buildUpdate(data, 'c', { requires: 'не массив' })).toMatchObject([{ patch: { requires: 'не массив' } }])
	})
})

describe('buildRemove', () => {
	it('неизвестный id — unknown и ничего не удаляется', () => {
		expect(buildRemove(editData(), ['a', 'ghost'])).toMatchObject({ code: 'unknown' })
	})

	it('тема: remove и очистка требований других (остаток или поле целиком)', () => {
		const data = roadmap([
			stage('s1', [topic('a'), topic('b', { requires: ['a'] }), topic('c', { requires: ['a', 'b'] })]),
			stage('s2', [], { requires: ['a'] }),
		])
		const built = buildRemove(data, ['a']) as ReturnType<typeof buildRemove> & unknown[]
		expect(built).toEqual([
			{ type: 'remove', entity: 'topic', id: 'a', stage: 's1', value: data.stages[0].topics[0], index: 0 },
			{ type: 'update', entity: 'topic', id: 'b', patch: { requires: undefined }, previous: { requires: ['a'] } },
			{ type: 'update', entity: 'topic', id: 'c', patch: { requires: ['b'] }, previous: { requires: ['a', 'b'] } },
			{ type: 'update', entity: 'stage', id: 's2', patch: { requires: undefined }, previous: { requires: ['a'] } },
		])
	})

	it('этап удаляется вместе с темами одним remove; требования удалённых сущностей не чистятся', () => {
		const data = roadmap([
			stage('s1', [topic('a'), topic('b', { requires: ['a'] })]),
			stage('s2', [topic('c', { requires: ['s1'] })], { requires: ['s1'] }),
			stage('s3', [topic('d')]),
		])
		const built = buildRemove(data, ['s1', 's3']) as { type: string; id: string; entity: string }[]
		expect(built.filter(change => change.type === 'remove').map(change => `${change.entity}:${change.id}`)).toEqual([
			'stage:s3',
			'stage:s1',
		])
		expect(built.filter(change => change.type === 'update').map(change => change.id)).toEqual(['s2', 'c'])
	})

	it('тема из удаляемого этапа, названная в ids, не дублируется', () => {
		const data = roadmap([stage('s1', [topic('a')])])
		const built = buildRemove(data, ['a', 's1']) as { id: string }[]
		expect(built.map(change => change.id)).toEqual(['s1'])
	})
})

describe('buildRequirement', () => {
	it('неизвестные id или цель — unknown', () => {
		const data = editData()
		expect(buildRequirement(data, { id: 'ghost', target: 'a', isAdd: true })).toMatchObject({ code: 'unknown' })
		expect(buildRequirement(data, { id: 'a', target: 'ghost', isAdd: true })).toMatchObject({ code: 'unknown' })
	})

	it('добавление уже существующего и снятие отсутствующего — пустой набор', () => {
		const data = editData()
		expect(buildRequirement(data, { id: 'b', target: 'a', isAdd: true })).toEqual([])
		expect(buildRequirement(data, { id: 'b', target: 'c', isAdd: false })).toEqual([])
	})

	it('добавляет к теме и этапу, последнее снятое требование убирает поле', () => {
		const data = editData()
		expect(buildRequirement(data, { id: 'b', target: 'c', isAdd: true })).toMatchObject([{ patch: { requires: ['a', 'c'] } }])
		expect(buildRequirement(data, { id: 's3', target: 's1', isAdd: true })).toMatchObject([
			{ entity: 'stage', patch: { requires: ['s1'] } },
		])
		expect(buildRequirement(data, { id: 'b', target: 'a', isAdd: false })).toMatchObject([{ patch: { requires: undefined } }])
	})

	it('замыкающее цикл требование — отказ', () => {
		expect(buildRequirement(editData(), { id: 'a', target: 'b', isAdd: true })).toMatchObject({ code: 'cycle' })
	})
})

describe('buildReplace и pickTarget', () => {
	it('без массива этапов или названия — invalid', () => {
		const data = editData()
		expect(buildReplace(data, { version: 1, title: 'x' } as unknown as RoadmapData)).toMatchObject({ code: 'invalid' })
		expect(buildReplace(data, { version: 1, title: 5, stages: [] } as unknown as RoadmapData)).toMatchObject({ code: 'invalid' })
	})

	it('удаляет старые этапы с конца, правит корень, добавляет новые по порядку', () => {
		const data = roadmap([stage('s1', []), stage('s2', [])], { goal: 'старая' })
		const next = roadmap([stage('n1', [])], { title: 'Новый', id: 'new' })
		const built = buildReplace(data, next) as {
			type: string
			id?: string
			patch?: Record<string, unknown>
			previous?: Record<string, unknown>
		}[]
		expect(built.map(change => change.type)).toEqual(['remove', 'remove', 'root', 'add'])
		expect(built.slice(0, 2).map(change => change.id)).toEqual(['s2', 's1'])
		expect(built[2].patch).toMatchObject({ title: 'Новый', id: 'new', goal: undefined })
		expect(built[2].previous).toMatchObject({ title: 'Путь', goal: 'старая', id: undefined })
	})

	it('pickTarget: заданный этап, иначе последний, иначе null', () => {
		const data = editData()
		expect(pickTarget(data, { stage: 's2' })).toBe('s2')
		expect(pickTarget(data, undefined)).toBe('s3')
		expect(pickTarget(roadmap([]), {})).toBeNull()
	})
})
