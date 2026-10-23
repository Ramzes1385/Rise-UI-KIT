import { editData, roadmap, stage, topic } from '../fixtures/editFixtures'
import { findRoadmapEntity, roadmapTitle } from '../../../model/edit/changes/roadmapFind'
import { findRoadmapCycle, wouldCreateCycle } from '../../../model/edit/changes/roadmapCycles'

describe('findRoadmapEntity и roadmapTitle', () => {
	it('находит этап, тему и ничего для неизвестного id', () => {
		const data = editData()
		expect(findRoadmapEntity(data, 's2')).toMatchObject({ stageIndex: 1, topicIndex: -1 })
		expect(findRoadmapEntity(data, 's2')?.topic).toBeUndefined()
		expect(findRoadmapEntity(data, 'e')).toMatchObject({ stageIndex: 1, topicIndex: 1, topic: { id: 'e' } })
		expect(findRoadmapEntity(data, 'ghost')).toBeNull()
	})

	it('название: темы, этапа или сам id', () => {
		const data = editData()
		expect(roadmapTitle(data, 'a')).toBe('Тема a')
		expect(roadmapTitle(data, 's1')).toBe('Этап s1')
		expect(roadmapTitle(data, 'ghost')).toBe('ghost')
	})
})

describe('findRoadmapCycle', () => {
	it('прямая зависимость темы даёт цикл с путём', () => {
		const data = editData()
		expect(findRoadmapCycle(data, 'a', 'b')).toEqual(['a', 'b', 'a'])
		expect(wouldCreateCycle(data, 'a', 'b')).toBe(true)
	})

	it('без зависимости цикла нет, неизвестные id тоже', () => {
		const data = editData()
		expect(wouldCreateCycle(data, 'b', 'a')).toBe(false)
		expect(wouldCreateCycle(data, 'ghost', 'a')).toBe(false)
		expect(wouldCreateCycle(data, 'a', 'ghost')).toBe(false)
	})

	it('тема зависит от требований своего этапа, этап — от своих обязательных тем', () => {
		const data = editData()
		expect(wouldCreateCycle(data, 's1', 'd')).toBe(true)
		expect(wouldCreateCycle(data, 'a', 'd')).toBe(true)
		expect(wouldCreateCycle(data, 's2', 'a')).toBe(false)
	})

	it('необязательный этап и темы-альтернативы в зависимости не входят', () => {
		const data = roadmap([
			stage('opt', [topic('x')], { kind: 'optional' }),
			stage('main', [topic('m', { kind: 'optional' }), topic('n', { choice: 'g' }), topic('p')]),
		])
		expect(wouldCreateCycle(data, 'x', 'opt')).toBe(false)
		expect(wouldCreateCycle(data, 'm', 'main')).toBe(false)
		expect(wouldCreateCycle(data, 'n', 'main')).toBe(false)
		expect(wouldCreateCycle(data, 'p', 'main')).toBe(true)
	})

	it('цепочка из трёх звеньев и повторный заход по общей зависимости', () => {
		const data = roadmap([
			stage('s', [
				topic('a', { requires: ['b', 'c'] }),
				topic('b', { requires: ['d'] }),
				topic('c', { requires: ['d'] }),
				topic('d'),
			]),
		])
		expect(findRoadmapCycle(data, 'd', 'a')).toEqual(['d', 'a', 'b', 'd'])
		expect(wouldCreateCycle(data, 'c', 'b')).toBe(false)
		expect(wouldCreateCycle(data, 'ghost', 'a')).toBe(false)
	})
})
