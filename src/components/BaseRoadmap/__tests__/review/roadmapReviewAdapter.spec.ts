import type { RoadmapChange } from '../../types/roadmapEdit.types'
import { editData, stage, topic } from '../edit/fixtures/editFixtures'
import { isRoadmapProposalStale, roadmapDescribeAdapter, roadmapReviewAdapter } from '../../model/review/format/roadmapReviewAdapter'

const data = editData()
const describe_ = roadmapDescribeAdapter.describe
const applicable = (change: RoadmapChange, base = data): boolean => roadmapReviewAdapter.isApplicable?.(base, change) as boolean

describe('roadmapReviewAdapter.describe', () => {
	it('root не описывается', () => {
		expect(describe_({ type: 'root', patch: {}, previous: {} })).toBeNull()
	})

	it('update: только название — rename, иначе update; поля сравниваются с предыдущим', () => {
		const rename = describe_({ type: 'update', entity: 'topic', id: 'a', patch: { title: 'X' }, previous: { title: 'Тема a' } })
		expect(rename).toMatchObject({ kind: 'rename', entity: 'topic', id: 'a' })
		expect(rename?.fields).toEqual([{ field: 'title', before: 'Тема a', after: 'X' }])
		const mixed = describe_({
			type: 'update',
			entity: 'stage',
			id: 's1',
			patch: { title: 'X', kind: 'optional' },
			previous: { title: 'a' },
		})
		expect(mixed?.kind).toBe('update')
		const same = describe_({ type: 'update', entity: 'stage', id: 's1', patch: { title: 'a' }, previous: { title: 'a' } })
		expect(same?.kind).toBe('update')
		expect(same?.fields).toEqual([])
	})

	it('move — поле position с откуда и куда; add и remove несут значение', () => {
		expect(describe_({ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 })).toMatchObject({
			kind: 'move',
			fields: [{ field: 'position', before: 0, after: 2 }],
		})
		const value = topic('n')
		expect(describe_({ type: 'add', entity: 'topic', stage: 's1', value, index: 0 })).toMatchObject({ kind: 'add', id: 'n', value })
		expect(describe_({ type: 'remove', entity: 'stage', id: 's1', value: stage('s1', []), index: 0 })).toMatchObject({
			kind: 'remove',
			id: 's1',
		})
	})
})

describe('roadmapReviewAdapter.isApplicable', () => {
	it('add: занятый id или неизвестный этап — нельзя', () => {
		expect(applicable({ type: 'add', entity: 'stage', value: stage('new', []), index: 0 })).toBe(true)
		expect(applicable({ type: 'add', entity: 'stage', value: stage('s1', []), index: 0 })).toBe(false)
		expect(applicable({ type: 'add', entity: 'topic', stage: 's1', value: topic('n'), index: 0 })).toBe(true)
		expect(applicable({ type: 'add', entity: 'topic', stage: 'ghost', value: topic('n'), index: 0 })).toBe(false)
		expect(applicable({ type: 'add', entity: 'topic', stage: 's1', value: topic('a'), index: 0 })).toBe(false)
	})

	it('move: на месте и существующий этап назначения', () => {
		expect(applicable({ type: 'move', entity: 'stage', id: 's2', from: 1, to: 0 })).toBe(true)
		expect(applicable({ type: 'move', entity: 'stage', id: 's2', from: 0, to: 1 })).toBe(false)
		const place = (stageId: string, index: number) => ({ stage: stageId, index })
		expect(applicable({ type: 'move', entity: 'topic', id: 'a', from: place('s1', 0), to: place('s2', 0) })).toBe(true)
		expect(applicable({ type: 'move', entity: 'topic', id: 'a', from: place('s1', 1), to: place('s2', 0) })).toBe(false)
		expect(applicable({ type: 'move', entity: 'topic', id: 'a', from: place('ghost', 0), to: place('s2', 0) })).toBe(false)
		expect(applicable({ type: 'move', entity: 'topic', id: 'a', from: place('s1', 0), to: place('ghost', 0) })).toBe(false)
	})

	it('update: элемент существует и прежние значения совпадают', () => {
		const update = (id: string, previous: Record<string, unknown>, entity: 'topic' | 'stage' = 'topic'): RoadmapChange => ({
			type: 'update',
			entity,
			id,
			patch: {},
			previous,
		})
		expect(applicable(update('a', { title: 'Тема a', hours: 2 }))).toBe(true)
		expect(applicable(update('a', { title: 'другое' }))).toBe(false)
		expect(applicable(update('ghost', {}))).toBe(false)
		expect(applicable(update('s1', { title: 'Этап s1' }, 'stage'))).toBe(true)
		expect(applicable(update('a', { description: undefined }))).toBe(true)
	})

	it('remove: элемент должен существовать; root: прежние поля корня совпадают', () => {
		expect(applicable({ type: 'remove', entity: 'topic', id: 'a', stage: 's1', value: topic('a'), index: 0 })).toBe(true)
		expect(applicable({ type: 'remove', entity: 'stage', id: 'ghost', value: stage('ghost', []), index: 0 })).toBe(false)
		expect(applicable({ type: 'root', patch: { title: 'N' }, previous: { title: 'Путь' } })).toBe(true)
		expect(applicable({ type: 'root', patch: { title: 'N' }, previous: { title: 'Другой' } })).toBe(false)
	})
})

describe('isRoadmapProposalStale', () => {
	it('цепочка проверяется на последовательно изменённых данных', () => {
		const addStage: RoadmapChange = { type: 'add', entity: 'stage', value: stage('n', []), index: 0 }
		const addTopic: RoadmapChange = { type: 'add', entity: 'topic', stage: 'n', value: topic('t'), index: 0 }
		expect(isRoadmapProposalStale(data, [addStage, addTopic])).toBe(false)
		expect(isRoadmapProposalStale(data, [addTopic])).toBe(true)
		expect(isRoadmapProposalStale(data, [])).toBe(false)
		expect(isRoadmapProposalStale(data, [addStage, addStage])).toBe(true)
	})
})
