import { formatNumber } from '@/locales/state'
import { UI_FLOW_SCENARIO } from '@/locales/messages'
import { guardConsole } from '../helpers/consoleGuard.test-utils'
import { formatDuration } from '../../model/scenario/announce/formatDuration'
import { act, edge, graphOf, node } from '../helpers/flowFixtures.test-utils'
import { actionDetail, actionEnds, actionLatency, actionTitle, describeAction } from '../../model/scenario/announce/describeAction'

guardConsole()

const graph = graphOf(
	[node('web'), node('api'), node('lonely', 'service', { label: 'Одинокий' })],
	[edge('call', 'web', 'api'), edge('dangling', 'web', 'ghost'), edge('orphan', 'phantom', 'api')],
)

describe('formatDuration', () => {
	const n = (value: number, options?: Intl.NumberFormatOptions) => formatNumber(value, options)

	it('меньше секунды — миллисекунды, округлённые', () => {
		expect(formatDuration(0)).toBe(`0 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(formatDuration(18)).toBe(`18 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(formatDuration(999.6)).toBe(`${n(1000)} ${UI_FLOW_SCENARIO.UNIT_MS}`)
	})

	it('до минуты — секунды с десятой', () => {
		expect(formatDuration(1000)).toBe(`1 ${UI_FLOW_SCENARIO.UNIT_S}`)
		expect(formatDuration(1240)).toBe(`${n(1.2, { maximumFractionDigits: 1 })} ${UI_FLOW_SCENARIO.UNIT_S}`)
		expect(formatDuration(59999)).toBe(`${n(60, { maximumFractionDigits: 1 })} ${UI_FLOW_SCENARIO.UNIT_S}`)
	})

	it('до часа — минуты и секунды, нулевой остаток не пишется', () => {
		expect(formatDuration(60000)).toBe(`1 ${UI_FLOW_SCENARIO.UNIT_MIN}`)
		expect(formatDuration(125000)).toBe(`2 ${UI_FLOW_SCENARIO.UNIT_MIN} 5 ${UI_FLOW_SCENARIO.UNIT_S}`)
	})

	it('до суток — часы и минуты', () => {
		expect(formatDuration(3600000)).toBe(`1 ${UI_FLOW_SCENARIO.UNIT_H}`)
		expect(formatDuration(3600000 * 5 + 60000 * 30)).toBe(`5 ${UI_FLOW_SCENARIO.UNIT_H} 30 ${UI_FLOW_SCENARIO.UNIT_MIN}`)
	})

	it('сутки и больше — дни и часы', () => {
		expect(formatDuration(86400000)).toBe(`1 ${UI_FLOW_SCENARIO.UNIT_D}`)
		expect(formatDuration(86400000 * 2 + 3600000 * 3)).toBe(`2 ${UI_FLOW_SCENARIO.UNIT_D} 3 ${UI_FLOW_SCENARIO.UNIT_H}`)
	})

	it('отрицательное считается нулём', () => {
		expect(formatDuration(-5)).toBe(`0 ${UI_FLOW_SCENARIO.UNIT_MS}`)
	})
})

describe('описание шага', () => {
	it('концы шага по связи — подписи узлов; по узлу — только «куда»; неизвестное — пусто', () => {
		expect(actionEnds(act('a', { edge: 'call' }), graph)).toEqual({ from: 'WEB', to: 'API' })
		expect(actionEnds(act('a', { node: 'lonely' }), graph)).toEqual({ to: 'Одинокий' })
		expect(actionEnds(act('a', { edge: 'nope' }), graph)).toEqual({})
		expect(actionEnds(act('a', { node: 'nope' }), graph)).toEqual({})
		expect(actionEnds(act('a'), graph)).toEqual({})
	})

	it('связь на отсутствующий узел показывает его id', () => {
		expect(actionEnds(act('a', { edge: 'dangling' }), graph)).toEqual({ from: 'WEB', to: 'ghost' })
	})

	it('связь от отсутствующего узла показывает его id в начале', () => {
		expect(actionEnds(act('a', { edge: 'orphan' }), graph)).toEqual({ from: 'phantom', to: 'API' })
	})

	it('заголовок «откуда → куда», подробности «что · как», задержка в человеческом виде', () => {
		expect(actionTitle({ from: 'A', to: 'B' })).toBe('A → B')
		expect(actionTitle({ to: 'B' })).toBe('B')
		expect(actionTitle({})).toBe('')
		expect(actionDetail(act('a', { label: 'POST /orders', via: 'HTTPS' }))).toBe('POST /orders · HTTPS')
		expect(actionDetail(act('a', { via: 'HTTPS' }))).toBe('HTTPS')
		expect(actionDetail(act('a'))).toBe('')
		expect(actionLatency(act('a', { latency: 18 }))).toBe(`18 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(actionLatency(act('a', { latency: 0 }))).toBe(`0 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(actionLatency(act('a'))).toBe('')
	})

	it('текст для озвучки — всё через запятую, пустое пропускается', () => {
		const action = act('a', { edge: 'call', label: 'POST /orders', via: 'HTTPS', latency: 18 })
		expect(describeAction(action, graph)).toBe(`WEB → API, POST /orders, HTTPS, 18 ${UI_FLOW_SCENARIO.UNIT_MS}`)
		expect(describeAction(act('b', { node: 'lonely' }), graph)).toBe('Одинокий')
		expect(describeAction(act('c'), graph)).toBe('')
	})
})
