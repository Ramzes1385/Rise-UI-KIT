import { editData, stage, topic } from '../fixtures/editFixtures'
import type { RoadmapChange } from '../../../types/roadmapEdit.types'
import { applyRoadmapChanges, invertRoadmapChanges } from '../../../model/edit/changes/roadmapChanges'

const ids = (data: ReturnType<typeof editData>, stageId: string) =>
	data.stages.find(item => item.id === stageId)?.topics.map(item => item.id)

describe('applyRoadmapChanges', () => {
	it('add: этап вставляется на место, индекс зажимается в границы', () => {
		const data = editData()
		const at = applyRoadmapChanges(data, [{ type: 'add', entity: 'stage', value: stage('x', []), index: 1 }])
		expect(at.stages.map(item => item.id)).toEqual(['s1', 'x', 's2', 's3'])
		const end = applyRoadmapChanges(data, [{ type: 'add', entity: 'stage', value: stage('x', []), index: 99 }])
		expect(end.stages.map(item => item.id)).toEqual(['s1', 's2', 's3', 'x'])
		const start = applyRoadmapChanges(data, [{ type: 'add', entity: 'stage', value: stage('x', []), index: -4 }])
		expect(start.stages[0].id).toBe('x')
		expect(data.stages).toHaveLength(3)
	})

	it('add: тема встаёт в нужный этап', () => {
		const next = applyRoadmapChanges(editData(), [{ type: 'add', entity: 'topic', stage: 's2', value: topic('x'), index: 1 }])
		expect(ids(next, 's2')).toEqual(['d', 'x', 'e'])
		expect(ids(next, 's1')).toEqual(['a', 'b', 'c'])
	})

	it('remove: убирает этап и тему по id', () => {
		const data = editData()
		const noStage = applyRoadmapChanges(data, [{ type: 'remove', entity: 'stage', id: 's3', value: data.stages[2], index: 2 }])
		expect(noStage.stages.map(item => item.id)).toEqual(['s1', 's2'])
		const noTopic = applyRoadmapChanges(data, [{ type: 'remove', entity: 'topic', id: 'b', stage: 's1', value: topic('b'), index: 1 }])
		expect(ids(noTopic, 's1')).toEqual(['a', 'c'])
	})

	it('move: этап переставляется, а при несовпадении id данные не меняются', () => {
		const data = editData()
		const moved = applyRoadmapChanges(data, [{ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 }])
		expect(moved.stages.map(item => item.id)).toEqual(['s2', 's3', 's1'])
		const stale = applyRoadmapChanges(data, [{ type: 'move', entity: 'stage', id: 's2', from: 0, to: 2 }])
		expect(stale).toBe(data)
	})

	it('move: тема переносится внутри этапа и между этапами, чужая позиция — без изменений', () => {
		const data = editData()
		const inside = applyRoadmapChanges(data, [
			{ type: 'move', entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's1', index: 2 } },
		])
		expect(ids(inside, 's1')).toEqual(['b', 'c', 'a'])
		const across = applyRoadmapChanges(data, [
			{ type: 'move', entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's3', index: 0 } },
		])
		expect(ids(across, 's3')).toEqual(['a'])
		expect(ids(across, 's1')).toEqual(['b', 'c'])
		const wrongId = applyRoadmapChanges(data, [
			{ type: 'move', entity: 'topic', id: 'b', from: { stage: 's1', index: 0 }, to: { stage: 's3', index: 0 } },
		])
		expect(wrongId).toBe(data)
		const wrongStage = applyRoadmapChanges(data, [
			{ type: 'move', entity: 'topic', id: 'a', from: { stage: 'ghost', index: 0 }, to: { stage: 's3', index: 0 } },
		])
		expect(wrongStage).toBe(data)
	})

	it('update: меняет поля этапа и темы, undefined удаляет поле', () => {
		const data = editData()
		const next = applyRoadmapChanges(data, [
			{ type: 'update', entity: 'stage', id: 's1', patch: { title: 'Новый' }, previous: { title: 'Этап s1' } },
			{ type: 'update', entity: 'topic', id: 'a', patch: { hours: undefined, title: 'А' }, previous: {} },
		])
		expect(next.stages[0].title).toBe('Новый')
		expect(next.stages[0].topics[0]).toEqual({ id: 'a', title: 'А' })
		expect(data.stages[0].topics[0].hours).toBe(2)
	})

	it('root: правит поля корня, не трогая этапы', () => {
		const data = editData()
		const next = applyRoadmapChanges(data, [{ type: 'root', patch: { title: 'Другой', goal: undefined }, previous: {} }])
		expect(next.title).toBe('Другой')
		expect(next.stages).toBe(data.stages)
	})
})

describe('invertRoadmapChanges', () => {
	it('обращение возвращает данные к исходным для каждого вида изменений', () => {
		const data = editData()
		const kinds: RoadmapChange[][] = [
			[{ type: 'add', entity: 'stage', value: stage('x', [topic('y')]), index: 1 }],
			[{ type: 'add', entity: 'topic', stage: 's2', value: topic('x'), index: 0 }],
			[{ type: 'remove', entity: 'stage', id: 's2', value: data.stages[1], index: 1 }],
			[{ type: 'remove', entity: 'topic', id: 'c', stage: 's1', value: data.stages[0].topics[2], index: 2 }],
			[{ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 }],
			[{ type: 'move', entity: 'topic', id: 'a', from: { stage: 's1', index: 0 }, to: { stage: 's2', index: 1 } }],
			[{ type: 'update', entity: 'topic', id: 'a', patch: { title: 'Z' }, previous: { title: 'Тема a' } }],
			[{ type: 'root', patch: { title: 'Z' }, previous: { title: 'Путь' } }],
		]
		for (const changes of kinds) {
			const done = applyRoadmapChanges(data, changes)
			expect(applyRoadmapChanges(done, invertRoadmapChanges(changes))).toEqual(data)
		}
	})

	it('порядок обращённых изменений обратный, у add получается remove и наоборот', () => {
		const first: RoadmapChange = { type: 'add', entity: 'stage', value: stage('x', []), index: 0 }
		const second: RoadmapChange = { type: 'remove', entity: 'topic', id: 'a', stage: 's1', value: topic('a'), index: 0 }
		const inverted = invertRoadmapChanges([first, second])
		expect(inverted.map(item => item.type)).toEqual(['add', 'remove'])
		expect(inverted[0]).toMatchObject({ entity: 'topic', stage: 's1', index: 0 })
		expect(inverted[1]).toMatchObject({ entity: 'stage', id: 'x' })
	})

	it('update и root меняют местами patch и previous, move — from и to', () => {
		const [update, move] = invertRoadmapChanges([
			{ type: 'move', entity: 'stage', id: 's1', from: 0, to: 2 },
			{ type: 'update', entity: 'stage', id: 's1', patch: { title: 'B' }, previous: { title: 'A' } },
		])
		expect(update).toMatchObject({ patch: { title: 'A' }, previous: { title: 'B' } })
		expect(move).toMatchObject({ from: 2, to: 0 })
	})
})
