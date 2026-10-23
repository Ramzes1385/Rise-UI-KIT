import { progressOf, roadmap, stage, statusesOf, topic } from '../fixtures/roadmapFixtures'
import { buildRoadmapIndex, computeRoadmapStatuses, diffRoadmapCompletions, isOptionalTopic } from '../../../model/progress/roadmapStatus'

describe('buildRoadmapIndex', () => {
	it('индексирует этапы и темы с этапом и его номером', () => {
		const first = stage('s1', [topic('a')])
		const second = stage('s2', [topic('b')])
		const index = buildRoadmapIndex(roadmap([first, second]))
		expect([...index.stages.keys()]).toEqual(['s1', 's2'])
		expect(index.topics.get('b')).toMatchObject({ stage: second, stageIndex: 1 })
	})

	it('при повторе id побеждает первое вхождение', () => {
		const original = topic('a', { title: 'Первая' })
		const index = buildRoadmapIndex(roadmap([stage('s1', [original, topic('a', { title: 'Вторая' })]), stage('s1', [topic('c')])]))
		expect(index.topics.get('a')?.topic).toBe(original)
		expect(index.stages.size).toBe(1)
		expect(index.topics.has('c')).toBe(true)
	})

	it('тема с id этапа и этап с id темы в индекс не попадают', () => {
		const index = buildRoadmapIndex(roadmap([stage('s1', [topic('s1'), topic('x')]), stage('x', [])]))
		expect(index.topics.has('s1')).toBe(false)
		expect(index.stages.has('x')).toBe(false)
	})
})

describe('isOptionalTopic', () => {
	it('тема optional или тема в optional-этапе — необязательна', () => {
		expect(isOptionalTopic(topic('a', { kind: 'optional' }), stage('s', []))).toBe(true)
		expect(isOptionalTopic(topic('a'), stage('s', [], { kind: 'optional' }))).toBe(true)
		expect(isOptionalTopic(topic('a', { kind: 'required' }), stage('s', [], { kind: 'required' }))).toBe(false)
	})
})

describe('computeRoadmapStatuses: темы', () => {
	it('без прогресса тема доступна, fraction 0', () => {
		const { topics } = statusesOf(roadmap([stage('s', [topic('a')])]))
		expect(topics.get('a')).toEqual({ status: 'available', done: 0, total: 0, fraction: 0, missing: [] })
	})

	it('явные done, skipped и in-progress', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b'), topic('c')])])
		const { topics } = statusesOf(data, progressOf({ a: { status: 'done' }, b: { status: 'skipped' }, c: { status: 'in-progress' } }))
		expect([...topics.values()].map(state => state.status)).toEqual(['done', 'skipped', 'in-progress'])
		expect(topics.get('a')?.fraction).toBe(1)
		expect(topics.get('b')?.fraction).toBe(0)
	})

	it('отмечена часть подтем — in-progress с долей', () => {
		const data = roadmap([
			stage('s', [
				topic('a', {
					subtopics: [
						{ id: 'x', title: 'X' },
						{ id: 'y', title: 'Y' },
					],
				}),
			]),
		])
		const state = statusesOf(data, progressOf({ a: { subtopics: ['x'] } })).topics.get('a')
		expect(state).toMatchObject({ status: 'in-progress', done: 1, total: 2, fraction: 0.5 })
	})

	it('отмечены все подтемы — done; неизвестные id подтем не считаются', () => {
		const data = roadmap([stage('s', [topic('a', { subtopics: [{ id: 'x', title: 'X' }] })])])
		const state = statusesOf(data, progressOf({ a: { subtopics: ['x', 'ghost'] } })).topics.get('a')
		expect(state).toMatchObject({ status: 'done', done: 1, total: 1, fraction: 1 })
		const ghostOnly = statusesOf(data, progressOf({ a: { subtopics: ['ghost'] } })).topics.get('a')
		expect(ghostOnly).toMatchObject({ status: 'available', done: 0 })
	})

	it('явный skipped не перекрывает done по подтемам, а done побеждает skipped', () => {
		const data = roadmap([stage('s', [topic('a', { subtopics: [{ id: 'x', title: 'X' }] })])])
		const state = statusesOf(data, progressOf({ a: { status: 'skipped', subtopics: ['x'] } })).topics.get('a')
		expect(state?.status).toBe('done')
	})

	it('закрыта требованием темы: в missing — id нераспройденной темы', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b', { requires: ['a'] })])])
		expect(statusesOf(data).topics.get('b')).toMatchObject({ status: 'locked', missing: ['a'] })
		expect(statusesOf(data, progressOf({ a: { status: 'skipped' } })).topics.get('b')?.status).toBe('available')
	})

	it('явный done у закрытой темы игнорируется', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b', { requires: ['a'] })])])
		expect(statusesOf(data, progressOf({ b: { status: 'done' } })).topics.get('b')?.status).toBe('locked')
	})

	it('в missing сначала требования темы, потом этапа', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b'), topic('c', { requires: ['b'] })], { requires: ['s1'] })])
		expect(statusesOf(data).topics.get('c')?.missing).toEqual(['b', 's1'])
	})

	it('требование к этапу выполнено, когда этап пройден', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b')], { requires: ['s1'] })])
		expect(statusesOf(data).topics.get('b')?.status).toBe('locked')
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).topics.get('b')?.status).toBe('available')
	})

	it('требование к optional-этапу считается выполненным', () => {
		const data = roadmap([stage('s1', [topic('a')], { kind: 'optional' }), stage('s2', [topic('b', { requires: ['s1'] })])])
		const { requires } = { requires: new Map([['b', ['s1']]]) }
		const result = computeRoadmapStatuses({ data, progress: progressOf(), requires })
		expect(result.topics.get('b')?.status).toBe('available')
	})

	it('защита от повторного входа: тема в группе, требующая свой этап, не вешает вычисление', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g' })])])
		const requires = new Map([['a', ['s']]])
		const result = computeRoadmapStatuses({ data, progress: progressOf(), requires })
		expect(result.topics.get('a')?.status).toBe('locked')
		expect(result.stages.get('s')).toBe('current')
	})

	it('цикл между темами не вешает вычисление: обе закрыты', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b')])])
		const requires = new Map([
			['a', ['b']],
			['b', ['a']],
		])
		const { topics } = computeRoadmapStatuses({ data, progress: progressOf(), requires })
		expect(topics.get('a')?.status).toBe('locked')
		expect(topics.get('b')?.status).toBe('locked')
	})

	it('неизвестная цель требования считается невыполненной', () => {
		const data = roadmap([stage('s', [topic('a')])])
		const result = computeRoadmapStatuses({ data, progress: progressOf(), requires: new Map([['a', ['ghost']]]) })
		expect(result.topics.get('a')).toMatchObject({ status: 'locked', missing: ['ghost'] })
	})

	it('индекс строится сам, если не передан', () => {
		const data = roadmap([stage('s', [topic('a')])])
		const result = computeRoadmapStatuses({ data, progress: progressOf(), requires: new Map() })
		expect(result.topics.has('a')).toBe(true)
	})
})

describe('computeRoadmapStatuses: этапы', () => {
	it('первый непройденный этап — current, следующий доступный, закрытый по requires — locked', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b')]), stage('s3', [topic('c')], { requires: ['s1'] })])
		const { stages, currentStageId } = statusesOf(data)
		expect(currentStageId).toBe('s1')
		expect([...stages.values()]).toEqual(['current', 'available', 'locked'])
	})

	it('пройденный этап — done, current переходит дальше', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b')])])
		const { stages, currentStageId } = statusesOf(data, progressOf({ a: { status: 'done' } }))
		expect([...stages.values()]).toEqual(['done', 'current'])
		expect(currentStageId).toBe('s2')
	})

	it('все пройдено — currentStageId null', () => {
		const data = roadmap([stage('s1', [topic('a')])])
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).currentStageId).toBeNull()
	})

	it('пустой этап пройден; пустой роадмап — без current', () => {
		expect(statusesOf(roadmap([stage('s', [])])).stages.get('s')).toBe('done')
		expect(statusesOf(roadmap([])).currentStageId).toBeNull()
	})

	it('optional-темы этапу не нужны', () => {
		const data = roadmap([stage('s', [topic('a'), topic('o', { kind: 'optional' })])])
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).stages.get('s')).toBe('done')
	})

	it('в группе choice этапу хватает одной пройденной темы', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g' }), topic('b', { choice: 'g' })])])
		expect(statusesOf(data).stages.get('s')).toBe('current')
		expect(statusesOf(data, progressOf({ b: { status: 'skipped' } })).stages.get('s')).toBe('done')
	})

	it('непройденная группа держит этап, даже если обязательные пройдены', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b', { choice: 'g' }), topic('c', { choice: 'g' })])])
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).stages.get('s')).toBe('current')
	})

	it('optional-этап не становится current и не нужен следующим', () => {
		const data = roadmap([stage('o', [topic('a')], { kind: 'optional' }), stage('s', [topic('b')], { requires: ['o'] })])
		const result = computeRoadmapStatuses({ data, progress: progressOf(), requires: new Map([['s', ['o']]]) })
		expect(result.currentStageId).toBe('s')
		expect(result.stages.get('o')).toBe('available')
		expect(result.stages.get('s')).toBe('current')
	})

	it('optional-этап не current; done, когда пройдены его обязательные темы', () => {
		const data = roadmap([stage('o', [topic('a')], { kind: 'optional' })])
		expect(statusesOf(data).stages.get('o')).toBe('available')
		expect(statusesOf(data, progressOf({ a: { status: 'done' } })).stages.get('o')).toBe('done')
	})

	it('этап с повторным id и темой с неиндексированным id не ломает расчёт', () => {
		const data = roadmap([stage('s', [topic('a'), topic('s')])])
		const { topics, stages } = statusesOf(data, progressOf({ a: { status: 'done' } }))
		expect(topics.has('s')).toBe(false)
		expect(stages.get('s')).toBe('done')
	})

	it('цикл между этапами: расчёт завершается, этапы закрыты', () => {
		const data = roadmap([stage('s1', [topic('a')], { requires: ['s2'] }), stage('s2', [topic('b')], { requires: ['s1'] })])
		const result = computeRoadmapStatuses({
			data,
			progress: progressOf({ a: { status: 'done' }, b: { status: 'done' } }),
			requires: new Map([
				['s1', ['s2']],
				['s2', ['s1']],
			]),
		})
		expect([...result.stages.values()]).toEqual(['locked', 'locked'])
		expect(result.currentStageId).toBeNull()
	})
})

describe('diffRoadmapCompletions', () => {
	it('возвращает только вновь пройденные темы и этапы (done), без пропущенных', () => {
		const data = roadmap([stage('s1', [topic('a'), topic('b')]), stage('s2', [topic('c')])])
		const before = statusesOf(data, progressOf({ a: { status: 'done' } }))
		const after = statusesOf(data, progressOf({ a: { status: 'done' }, b: { status: 'done' }, c: { status: 'skipped' } }))
		expect(diffRoadmapCompletions(before, after)).toEqual({ topics: ['b'], stages: ['s1', 's2'] })
	})

	it('без изменений — пусто', () => {
		const data = roadmap([stage('s1', [topic('a')])])
		const same = statusesOf(data, progressOf({ a: { status: 'done' } }))
		expect(diffRoadmapCompletions(same, same)).toEqual({ topics: [], stages: [] })
	})
})
