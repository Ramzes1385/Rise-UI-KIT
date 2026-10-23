import { buildRoadmapIndex } from '../../../model/progress/roadmapStatus'
import type { RoadmapData, RoadmapProgress } from '../../../types/roadmapData.types'
import { progressOf, roadmap, stage, statusesOf, topic } from '../fixtures/roadmapFixtures'
import { roadmapPathProgress, summarizeRoadmap } from '../../../model/progress/roadmapSummary'

function summary(data: RoadmapData, progress: RoadmapProgress = progressOf()) {
	return summarizeRoadmap(data, statusesOf(data, progress), buildRoadmapIndex(data))
}

describe('summarizeRoadmap', () => {
	it('пустой роадмап: нули и нет темы для продолжения', () => {
		expect(summary(roadmap([]))).toEqual({ done: 0, total: 0, percent: 0, hoursLeft: 0, continueTopicId: null })
	})

	it('считает изученные темы и процент с округлением', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b'), topic('c')])])
		expect(summary(data, progressOf({ a: { status: 'done' } }))).toMatchObject({ done: 1, total: 3, percent: 33 })
		expect(summary(data, progressOf({ a: { status: 'done' }, b: { status: 'done' } }))).toMatchObject({ done: 2, percent: 67 })
	})

	it('пропущенная тема не входит в done', () => {
		const data = roadmap([stage('s', [topic('a')])])
		expect(summary(data, progressOf({ a: { status: 'skipped' } }))).toMatchObject({ done: 0, total: 1, percent: 0 })
	})

	it('часы не заданы — осталось 0', () => {
		expect(summary(roadmap([stage('s', [topic('a')])])).hoursLeft).toBe(0)
	})

	it('часы: сумма обязательных тем, пройденные не считаются, тема в работе — по остатку', () => {
		const subtopics = [
			{ id: 'x', title: 'X' },
			{ id: 'y', title: 'Y' },
		]
		const data = roadmap([stage('s', [topic('a', { hours: 4 }), topic('b', { hours: 6, subtopics }), topic('c', { hours: 10 })])])
		const progress = progressOf({ a: { status: 'done' }, b: { subtopics: ['x'] }, c: { status: 'skipped' } })
		expect(summary(data, progress).hoursLeft).toBe(3)
	})

	it('optional-темы и optional-этапы в часы не входят', () => {
		const data = roadmap([
			stage('s', [topic('a', { hours: 2 }), topic('o', { hours: 5, kind: 'optional' })]),
			stage('opt', [topic('b', { hours: 7 })], { kind: 'optional' }),
		])
		expect(summary(data).hoursLeft).toBe(2)
	})

	it('группа choice: берётся самая короткая тема с hours; тема без hours не участвует', () => {
		const data = roadmap([
			stage('s', [topic('a', { choice: 'g', hours: 8 }), topic('b', { choice: 'g', hours: 3 }), topic('c', { choice: 'g' })]),
		])
		expect(summary(data).hoursLeft).toBe(3)
	})

	it('группа choice без hours у тем — 0 часов', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g' }), topic('b', { choice: 'g' })])])
		expect(summary(data).hoursLeft).toBe(0)
	})

	it('группа choice: остаток учитывает долю начатой темы', () => {
		const subtopics = [
			{ id: 'x', title: 'X' },
			{ id: 'y', title: 'Y' },
		]
		const data = roadmap([stage('s', [topic('a', { choice: 'g', hours: 10, subtopics }), topic('b', { choice: 'g', hours: 8 })])])
		expect(summary(data, progressOf({ a: { subtopics: ['x'] } })).hoursLeft).toBe(5)
	})

	it('пройденная группа choice в часы не входит', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g', hours: 8 }), topic('b', { choice: 'g', hours: 3 })])])
		expect(summary(data, progressOf({ a: { status: 'done' } })).hoursLeft).toBe(0)
	})

	it('часы округляются', () => {
		const data = roadmap([stage('s', [topic('a', { hours: 1.4 }), topic('b', { hours: 1.4 })])])
		expect(summary(data).hoursLeft).toBe(3)
	})

	it('«Продолжить»: первая тема в процессе важнее первой доступной', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b'), topic('c')])])
		expect(summary(data, progressOf({ c: { status: 'in-progress' } })).continueTopicId).toBe('c')
	})

	it('«Продолжить»: без темы в процессе — первая доступная обязательная', () => {
		const data = roadmap([stage('s', [topic('o', { kind: 'optional' }), topic('a', { requires: ['o'] }), topic('b')])])
		expect(summary(data).continueTopicId).toBe('b')
	})

	it('«Продолжить»: доступные темы ищутся по этапам по порядку, у первого этапа без кандидатов берётся следующий', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b')])])
		expect(summary(data, progressOf({ a: { status: 'done' } })).continueTopicId).toBe('b')
	})

	it('«Продолжить»: тема из уже пройденной группы choice пропускается', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g' }), topic('b', { choice: 'g' }), topic('c')])])
		expect(summary(data, progressOf({ a: { status: 'skipped' } })).continueTopicId).toBe('c')
	})

	it('«Продолжить»: непройденная группа даёт первую свою тему', () => {
		const data = roadmap([stage('s', [topic('a', { choice: 'g' }), topic('b', { choice: 'g' })])])
		expect(summary(data).continueTopicId).toBe('a')
	})

	it('«Продолжить»: всё пройдено — null', () => {
		const data = roadmap([stage('s', [topic('a')])])
		expect(summary(data, progressOf({ a: { status: 'done' } })).continueTopicId).toBeNull()
	})

	it('темы и этапы с повторным id не считаются дважды', () => {
		const data = roadmap([stage('s', [topic('a'), topic('a')]), stage('s', [topic('b')])])
		expect(summary(data).total).toBe(1)
	})
})

describe('summarizeRoadmap: статусы не знают тему', () => {
	it('тема без записи в статусах считается целиком непройденной', () => {
		const data = roadmap([stage('s', [topic('a', { hours: 4 })])])
		const empty = { topics: new Map(), stages: new Map(), currentStageId: null }
		expect(summarizeRoadmap(data, empty, buildRoadmapIndex(data))).toMatchObject({ done: 0, total: 1, hoursLeft: 4 })
	})
})

describe('roadmapPathProgress', () => {
	it('пустой список — 0', () => {
		expect(roadmapPathProgress([])).toBe(0)
	})

	it('все этапы пройдены — 1', () => {
		expect(roadmapPathProgress([{ status: 'done', done: 1, total: 1 }])).toBe(1)
	})

	it('пройденные этапы плюс доля текущего', () => {
		const stages = [
			{ status: 'done' as const, done: 2, total: 2 },
			{ status: 'current' as const, done: 1, total: 4 },
			{ status: 'available' as const, done: 0, total: 3 },
			{ status: 'locked' as const, done: 0, total: 1 },
		]
		expect(roadmapPathProgress(stages)).toBeCloseTo(1.25 / 4)
	})

	it('первый непройденный этап без тем даёт долю 0', () => {
		expect(roadmapPathProgress([{ status: 'current', done: 0, total: 0 }])).toBe(0)
	})
})
