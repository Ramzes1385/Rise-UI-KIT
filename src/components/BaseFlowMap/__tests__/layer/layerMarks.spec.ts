import { act } from '../helpers/flowFixtures.test-utils'
import { route } from '../helpers/mapHarness.test-utils'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { buildMarks } from '../../model/scenario/layer/layerMarks'
import type { FlowTimelineEntry } from '../../types/data/flowScenario.types'
import type { FlowMarksInput } from '../../types/internal/flowScenarioLayer.types'

guardConsole()

const routes = {
	e1: route([
		[0, 0],
		[100, 0],
	]),
	e2: route([
		[100, 0],
		[100, 100],
	]),
	flat: route([
		[5, 5],
		[5, 5],
	]),
}
const rects = { n1: { x: 10, y: 20, width: 160, height: 56 } }

function entry(extra: Partial<FlowTimelineEntry> & { step: string }): FlowTimelineEntry {
	return { start: 0, duration: 1000, effect: 'travel', ...extra }
}

function input(extra: Partial<FlowMarksInput>): FlowMarksInput {
	return { status: 'playing', time: 0, timeline: [], routes, rects, actions: new Map(), isReduced: false, ...extra }
}

describe('buildMarks', () => {
	it('до начала (idle) отметок нет, даже если время не нулевое', () => {
		const marks = buildMarks(input({ status: 'idle', time: 500, timeline: [entry({ step: 'a', edge: 'e1' })] }))
		expect(marks).toEqual({ trails: [], tokens: [], pulses: [] })
	})

	it('travel в пути: след прорисован наполовину (offset 0,5), токен на середине связи', () => {
		const marks = buildMarks(input({ time: 500, timeline: [entry({ step: 'a', edge: 'e1' })] }))
		expect(marks.trails).toEqual([{ id: 'a', path: routes.e1.path, offset: 0.5, state: 'active', status: undefined }])
		expect(marks.tokens).toHaveLength(1)
		expect(marks.tokens[0].x).toBeCloseTo(50, 0)
		expect(marks.tokens[0].y).toBe(0)
	})

	it('шаг ещё не начался — отметок нет; закончился — след целиком (done) без токена', () => {
		const timeline = [entry({ step: 'a', edge: 'e1' }), entry({ step: 'b', edge: 'e2', start: 1000 })]
		const early = buildMarks(input({ time: 500, timeline }))
		expect(early.trails.map(trail => trail.id)).toEqual(['a'])
		const later = buildMarks(input({ time: 1500, timeline }))
		expect(later.trails.map(trail => [trail.id, trail.state, trail.offset])).toEqual([
			['a', 'done', 0],
			['b', 'active', 0.5],
		])
		expect(later.tokens.map(token => token.id)).toEqual(['b'])
	})

	it('draw: след прорисовывается, токена нет', () => {
		const marks = buildMarks(input({ time: 250, timeline: [entry({ step: 'a', edge: 'e1', effect: 'draw' })] }))
		expect(marks.trails[0]).toMatchObject({ offset: 0.75, state: 'active' })
		expect(marks.tokens).toEqual([])
	})

	it('pulse по связи: след показан сразу целиком, токена нет', () => {
		const marks = buildMarks(input({ time: 250, timeline: [entry({ step: 'a', edge: 'e1', effect: 'pulse' })] }))
		expect(marks.trails[0]).toMatchObject({ offset: 0, state: 'active' })
		expect(marks.tokens).toEqual([])
	})

	it('reduced motion: участок сразу целиком, токена нет', () => {
		const marks = buildMarks(input({ time: 250, isReduced: true, timeline: [entry({ step: 'a', edge: 'e1' })] }))
		expect(marks.trails[0]).toMatchObject({ offset: 0, state: 'active' })
		expect(marks.tokens).toEqual([])
	})

	it('статус ошибки шага попадает в след и токен', () => {
		const actions = new Map([['a', act('a', { status: 'error' })]])
		const marks = buildMarks(input({ time: 500, actions, timeline: [entry({ step: 'a', edge: 'e1' })] }))
		expect(marks.trails[0].status).toBe('error')
		expect(marks.tokens[0].status).toBe('error')
	})

	it('связь без маршрута не рисуется; маршрут нулевой длины даёт след без токена', () => {
		const none = buildMarks(input({ time: 500, timeline: [entry({ step: 'a', edge: 'missing' })] }))
		expect(none).toEqual({ trails: [], tokens: [], pulses: [] })
		const flat = buildMarks(input({ time: 500, timeline: [entry({ step: 'a', edge: 'flat' })] }))
		expect(flat.trails).toHaveLength(1)
		expect(flat.tokens).toEqual([])
	})

	it('шаг с нулевой длительностью сразу завершён', () => {
		const marks = buildMarks(input({ time: 0, timeline: [entry({ step: 'a', edge: 'e1', duration: 0 })] }))
		expect(marks.trails[0]).toMatchObject({ state: 'done', offset: 0 })
		expect(marks.tokens).toEqual([])
	})

	it('pulse по узлу: рамка узла, пока шаг идёт; потом нет; неизвестный узел игнорируется', () => {
		const timeline = [
			entry({ step: 'p', node: 'n1', effect: 'pulse' }),
			entry({ step: 'q', node: 'ghost', effect: 'pulse' }),
			entry({ step: 'r' }),
		]
		const actions = new Map([['p', act('p', { status: 'warning' })]])
		const running = buildMarks(input({ time: 500, timeline, actions }))
		expect(running.pulses).toEqual([{ id: 'p', rect: rects.n1, status: 'warning' }])
		expect(buildMarks(input({ time: 1000, timeline })).pulses).toEqual([])
	})
})
