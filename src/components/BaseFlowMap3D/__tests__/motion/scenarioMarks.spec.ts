import type { FlowMap3DTrack } from '../../types/internal/flowMap3dBuild.types'
import { buildScenarioMarks, findArrivals } from '../../model/motion/scenario/scenarioMarks'
import type { FlowScenarioAction, FlowTimelineEntry } from '@components/BaseFlowMap/types/data/flowScenario.types'

const track: FlowMap3DTrack = {
	points: [
		{ x: 0, y: 0, z: 0 },
		{ x: 10, y: 0, z: 0 },
	],
	lengths: [0, 10],
	total: 10,
}

const entry = (step: string, extra: Partial<FlowTimelineEntry> = {}): FlowTimelineEntry => ({
	step,
	start: 100,
	duration: 200,
	edge: 'e1',
	effect: 'travel',
	...extra,
})

const input = (timeline: FlowTimelineEntry[], extra: Record<string, unknown> = {}) => ({
	status: 'playing' as const,
	time: 200,
	timeline,
	tracks: new Map([['e1', track]]),
	actions: new Map<string, FlowScenarioAction>(),
	isReduced: false,
	...extra,
})

describe('buildScenarioMarks', () => {
	it('в покое меток нет', () => {
		expect(buildScenarioMarks(input([entry('s1')], { status: 'idle' }))).toEqual({ tokens: [], trails: [] })
	})

	it('шаг в пути: след показан на долю пути, токен стоит на этой доле', () => {
		const marks = buildScenarioMarks(input([entry('s1')]))
		expect(marks.trails).toEqual([{ step: 's1', edge: 'e1', shown: 0.5, isDone: false, status: undefined }])
		expect(marks.tokens).toHaveLength(1)
		expect(marks.tokens[0]).toMatchObject({ step: 's1', edge: 'e1', x: 5, y: 0, z: 0 })
	})

	it('токен несёт статус действия', () => {
		const marks = buildScenarioMarks(input([entry('s1')], { actions: new Map([['s1', { id: 's1', status: 'error' }]]) }))
		expect(marks.tokens[0].status).toBe('error')
		expect(marks.trails[0].status).toBe('error')
	})

	it('шаг до начала, без маршрута и без связи меток не даёт', () => {
		expect(buildScenarioMarks(input([entry('s1', { start: 500 })]))).toEqual({ tokens: [], trails: [] })
		expect(buildScenarioMarks(input([entry('s1')], { tracks: new Map() }))).toEqual({ tokens: [], trails: [] })
		expect(buildScenarioMarks(input([entry('s1', { edge: undefined, node: 'n' })]))).toEqual({ tokens: [], trails: [] })
	})

	it('законченный шаг оставляет полный след без токена', () => {
		const marks = buildScenarioMarks(input([entry('s1')], { time: 900 }))
		expect(marks.trails[0]).toMatchObject({ shown: 1, isDone: true })
		expect(marks.tokens).toEqual([])
	})

	it('шаг нулевой длины завершён сразу', () => {
		const marks = buildScenarioMarks(input([entry('s1', { duration: 0 })], { time: 100 }))
		expect(marks.trails[0]).toMatchObject({ shown: 1, isDone: true })
	})

	it('вспышка и уменьшенное движение показывают след целиком и без токена', () => {
		const pulse = buildScenarioMarks(input([entry('s1', { effect: 'pulse' })]))
		expect(pulse.trails[0].shown).toBe(1)
		expect(pulse.trails[0].isDone).toBe(false)
		expect(pulse.tokens).toEqual([])
		const reduced = buildScenarioMarks(input([entry('s1')], { isReduced: true }))
		expect(reduced.trails[0].shown).toBe(1)
		expect(reduced.tokens).toEqual([])
	})

	it('эффект draw рисует след без токена', () => {
		const marks = buildScenarioMarks(input([entry('s1', { effect: 'draw' })]))
		expect(marks.trails[0].shown).toBe(0.5)
		expect(marks.tokens).toEqual([])
	})

	it('параллельные ветки дают по токену на каждую', () => {
		const marks = buildScenarioMarks(input([entry('s1', { branch: 'p:0' }), entry('s2', { branch: 'p:1' })]))
		expect(marks.tokens.map(token => token.step)).toEqual(['s1', 's2'])
	})
})

describe('findArrivals', () => {
	const targets = new Map([['e1', 'db']])
	const window = (timeline: FlowTimelineEntry[], range: [number, number], actions = new Map<string, FlowScenarioAction>()) => ({
		timeline,
		actions,
		targets,
		from: range[0],
		to: range[1],
	})

	it('пустое или обратное окно никого не прибывает', () => {
		expect(findArrivals(window([entry('s1')], [300, 300]))).toEqual([])
		expect(findArrivals(window([entry('s1')], [400, 100]))).toEqual([])
	})

	it('шаг по связи прибывает в приёмник в конце, шаг по узлу — в начале', () => {
		const timeline = [entry('s1'), entry('s2', { edge: undefined, node: 'api', start: 50, duration: 10 })]
		expect(findArrivals(window(timeline, [0, 100]))).toEqual([{ step: 's2', node: 'api', animation: undefined }])
		expect(findArrivals(window(timeline, [100, 400]))).toEqual([{ step: 's1', node: 'db', animation: undefined }])
	})

	it('граница окна: начало исключено, конец включён', () => {
		expect(findArrivals(window([entry('s1')], [300, 400]))).toEqual([])
		expect(findArrivals(window([entry('s1')], [200, 300]))).toHaveLength(1)
	})

	it('связь без приёмника и шаг без узла пропускаются; анимация берётся из действия', () => {
		const actions = new Map<string, FlowScenarioAction>([['s1', { id: 's1', model3d: { animation: 'open' } }]])
		expect(findArrivals(window([entry('s1', { edge: 'ghost' }), entry('s3', { edge: undefined })], [0, 1000]))).toEqual([])
		expect(findArrivals(window([entry('s1')], [0, 1000], actions))).toEqual([{ step: 's1', node: 'db', animation: 'open' }])
	})
})
