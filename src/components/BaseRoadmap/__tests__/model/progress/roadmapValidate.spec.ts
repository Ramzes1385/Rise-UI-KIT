import type { RoadmapData } from '../../../types/roadmapData.types'
import { roadmap, stage, topic } from '../fixtures/roadmapFixtures'
import type { RoadmapStage, RoadmapTopic } from '../../../types/roadmapData.types'
import { validateRoadmap, warnRoadmapIssues } from '../../../model/progress/roadmapValidate'

function issuesOf(data: RoadmapData) {
	return validateRoadmap(data).issues
}

function codes(data: RoadmapData): string[] {
	return issuesOf(data).map(issue => issue.code)
}

describe('validateRoadmap: корректные данные', () => {
	it('нет проблем; requires — по каждому этапу и теме', () => {
		const data = roadmap([stage('s1', [topic('a')]), stage('s2', [topic('b', { requires: ['a'] })], { requires: ['s1'] })])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([])
		expect([...result.requires.entries()]).toEqual([
			['s1', []],
			['s2', ['s1']],
			['a', []],
			['b', ['a']],
		])
	})

	it('index строится сам, если не передан', () => {
		expect(validateRoadmap(roadmap([stage('s', [])])).requires.has('s')).toBe(true)
	})

	it('допустимые виды (stage.kind, topic.kind, materials.kind) проблем не дают', () => {
		const data = roadmap([
			stage('s', [topic('a', { kind: 'optional', materials: [{ title: 'M', kind: 'video' }] })], { kind: 'optional' }),
		])
		expect(issuesOf(data)).toEqual([])
	})

	it('дубль в requires убирается', () => {
		const data = roadmap([stage('s', [topic('a'), topic('b', { requires: ['a', 'a'] })])])
		expect(validateRoadmap(data).requires.get('b')).toEqual(['a'])
	})
})

describe('validateRoadmap: данные', () => {
	it('DUPLICATE_ID: повтор среди этапов, тем и между ними', () => {
		const data = roadmap([stage('s', [topic('a'), topic('a'), topic('s')]), stage('s', [])])
		expect(issuesOf(data).filter(issue => issue.code === 'DUPLICATE_ID')).toEqual([
			{ code: 'DUPLICATE_ID', params: { id: 'a' } },
			{ code: 'DUPLICATE_ID', params: { id: 's' } },
			{ code: 'DUPLICATE_ID', params: { id: 's' } },
		])
	})

	it('UNKNOWN_REQUIRE у этапа и темы, повторы схлопываются; связь не попадает в requires', () => {
		const data = roadmap([stage('s', [topic('a', { requires: ['ghost', 'ghost'] })], { requires: ['void'] })])
		expect(issuesOf(data)).toEqual([
			{ code: 'UNKNOWN_REQUIRE', params: { id: 's', target: 'void' } },
			{ code: 'UNKNOWN_REQUIRE', params: { id: 'a', target: 'ghost' } },
		])
		expect(validateRoadmap(data).requires.get('a')).toEqual([])
	})

	it('NEGATIVE_HOURS: только hours меньше нуля, 0 допустим', () => {
		const data = roadmap([stage('s', [topic('a', { hours: -1 }), topic('b', { hours: 0 }), topic('c')])])
		expect(issuesOf(data)).toEqual([{ code: 'NEGATIVE_HOURS', params: { id: 'a', value: -1 } }])
	})

	it('UNKNOWN_KIND: этап, тема, материал; в params — путь, значение и допустимые', () => {
		const data = roadmap([
			stage(
				's',
				[
					topic('a', {
						kind: 'must' as RoadmapTopic['kind'],
						materials: [
							{ title: 'ok', kind: 'doc' },
							{ title: 'bad', kind: 'podcast' as 'doc' },
						],
					}),
				],
				{ kind: 'maybe' as RoadmapStage['kind'] },
			),
		])
		expect(issuesOf(data)).toEqual([
			{ code: 'UNKNOWN_KIND', params: { path: 'stages[«s»].kind', value: 'maybe', expected: 'required | optional' } },
			{ code: 'UNKNOWN_KIND', params: { path: 'topics[«a»].kind', value: 'must', expected: 'required | optional' } },
			{
				code: 'UNKNOWN_KIND',
				params: {
					path: 'topics[«a»].materials[1].kind',
					value: 'podcast',
					expected: 'doc | article | video | course | book | practice | link',
				},
			},
		])
	})
})

describe('validateRoadmap: циклы', () => {
	it('самоссылка темы — CYCLE, связь убрана', () => {
		const data = roadmap([stage('s', [topic('a', { requires: ['a'] })])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«a» → «a»' } }])
		expect(result.requires.get('a')).toEqual([])
	})

	it('цикл через две темы: путь в params, замыкающая связь убрана, остальные остаются', () => {
		const data = roadmap([stage('s', [topic('a', { requires: ['b'] }), topic('b', { requires: ['a'] })])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«a» → «b» → «a»' } }])
		expect(result.requires.get('a')).toEqual(['b'])
		expect(result.requires.get('b')).toEqual([])
	})

	it('цикл через этапы', () => {
		const data = roadmap([stage('s1', [topic('a')], { requires: ['s2'] }), stage('s2', [topic('b')], { requires: ['s1'] })])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«s1» → «s2» → «s1»' } }])
		expect(result.requires.get('s1')).toEqual(['s2'])
		expect(result.requires.get('s2')).toEqual([])
	})

	it('цикл через тему и этап', () => {
		const data = roadmap([stage('s1', [topic('a', { requires: ['s2'] })]), stage('s2', [topic('b')], { requires: ['a'] })])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«a» → «s2» → «a»' } }])
		expect(result.requires.get('a')).toEqual(['s2'])
		expect(result.requires.get('s2')).toEqual([])
	})

	it('тема наследует requires этапа: цикл через унаследованную связь снимает связь этапа', () => {
		const data = roadmap([stage('s1', [topic('a')], { requires: ['b'] }), stage('s2', [topic('b', { requires: ['a'] })])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«b» → «a» → «b»' } }])
		expect(result.requires.get('s1')).toEqual([])
		expect(result.requires.get('b')).toEqual(['a'])
	})

	it('без цикла унаследованная связь ничего не снимает', () => {
		const data = roadmap([stage('s1', [topic('a')], { requires: ['b'] }), stage('s2', [topic('b')])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([])
		expect(result.requires.get('s1')).toEqual(['b'])
	})

	it('неявное ребро этап → его обязательные темы: тема, требующая свой этап, — цикл', () => {
		const data = roadmap([stage('s', [topic('a', { requires: ['s'] })])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«s» → «a» → «s»' } }])
		expect(result.requires.get('a')).toEqual([])
	})

	it('цикл замыкается неявным ребром: снимается последняя явная связь цикла', () => {
		const data = roadmap([stage('s0', [], { requires: ['t'] }), stage('S', [topic('t', { requires: ['S'] })])])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([{ code: 'CYCLE', params: { path: '«t» → «S» → «t»' } }])
		expect(result.requires.get('t')).toEqual([])
		expect(result.requires.get('s0')).toEqual(['t'])
	})

	it('тема группы choice и optional-тема неявного ребра от этапа не получают', () => {
		const data = roadmap([
			stage('s', [topic('a', { choice: 'g', requires: ['s'] }), topic('o', { kind: 'optional', requires: ['s'] })]),
		])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([])
		expect(result.requires.get('a')).toEqual(['s'])
		expect(result.requires.get('o')).toEqual(['s'])
	})

	it('requires на optional-этап цикла не даёт и остаётся в requires', () => {
		const data = roadmap([
			stage('o', [topic('a', { requires: ['b'] })], { kind: 'optional' }),
			stage('s', [topic('b')], { requires: ['o'] }),
		])
		const result = validateRoadmap(data)
		expect(result.issues).toEqual([])
		expect(result.requires.get('s')).toEqual(['o'])
	})

	it('у optional-этапа нет неявных рёбер к темам: тема, требующая свой optional-этап, цикла не даёт', () => {
		const data = roadmap([stage('o', [topic('a', { requires: ['o'] })], { kind: 'optional' })])
		expect(issuesOf(data)).toEqual([])
	})

	it('ромб зависимостей (общая тема достижима двумя путями) цикла не даёт', () => {
		const data = roadmap([
			stage('s', [
				topic('a'),
				topic('b', { requires: ['a'] }),
				topic('c', { requires: ['a'] }),
				topic('d', { requires: ['b', 'c'] }),
			]),
		])
		expect(issuesOf(data)).toEqual([])
	})

	it('два независимых цикла — по предупреждению на каждый', () => {
		const data = roadmap([stage('s', [topic('a', { requires: ['a'] }), topic('b', { requires: ['b'] })])])
		expect(codes(data)).toEqual(['CYCLE', 'CYCLE'])
	})

	it('требование к теме из повторного этапа (у неё нет своих рёбер) цикла не даёт', () => {
		const data = roadmap([stage('s', [topic('a')]), stage('s', [topic('x')]), stage('t', [topic('y', { requires: ['x'] })])])
		const result = validateRoadmap(data)
		expect(result.issues.map(issue => issue.code)).toEqual(['DUPLICATE_ID'])
		expect(result.requires.get('y')).toEqual(['x'])
	})

	it('повторный id: тема второго вхождения этапа с тем же id индексируется, но рёбер не имеет (цикл не ищется)', () => {
		const data = roadmap([stage('s', [topic('a')]), stage('s', [topic('x', { requires: ['x'] })])])
		const result = validateRoadmap(data)
		expect(result.issues.map(issue => issue.code)).toEqual(['DUPLICATE_ID'])
		expect(result.requires.get('x')).toEqual(['x'])
	})
})

describe('warnRoadmapIssues', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
		vi.restoreAllMocks()
	})

	it('в разработке пишет по предупреждению на проблему с подстановкой параметров', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warnRoadmapIssues([
			{ code: 'DUPLICATE_ID', params: { id: 'a' } },
			{ code: 'CYCLE', params: { path: '«a» → «a»' } },
		])
		expect(warn).toHaveBeenCalledTimes(2)
		expect(warn).toHaveBeenNthCalledWith(1, expect.stringContaining('id «a» повторяется'))
		expect(warn).toHaveBeenNthCalledWith(2, expect.stringContaining('«a» → «a»'))
	})

	it('в production молчит', () => {
		vi.stubEnv('NODE_ENV', 'production')
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warnRoadmapIssues([{ code: 'DUPLICATE_ID', params: { id: 'a' } }])
		expect(warn).not.toHaveBeenCalled()
	})

	it('без проблем ничего не пишет', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		warnRoadmapIssues([])
		expect(warn).not.toHaveBeenCalled()
	})
})
