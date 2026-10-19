import { describe, expect, it } from 'vitest'
import { UI_FLOW_EPC } from '@/locales/messages'
import { flowEpc } from '../../../../model/notations/epc'
import { edge, map, node } from '../../fixtures/flow2Data'
import { createHarness } from '../../fixtures/flow2Harness'
import { buildFlowGraph } from '../../../../model/data/flowGraph'
import type { FlowMapData } from '../../../../types/data/flowData.types'
import { simulateEpc } from '../../../../model/notations/epc/epcSimulate'
import { hasOverlaps, issuesOf, layoutOf, verdictOf } from '../../fixtures/notationKit'
import { alternationOf, epcKindOf, isAside, isControl } from '../../../../model/notations/epc/epcRules'

const ev = (id: string, extra = {}) => node(id, { kind: 'event', ...extra })
const fn = (id: string, extra = {}) => node(id, { kind: 'function', ...extra })
const gate = (id: string, kind: 'and' | 'or' | 'xor') => node(id, { kind })
const ctl = (id: string, ends: [string, string]) => edge(id, ends, { kind: 'control' })

function data(nodes: ReturnType<typeof node>[], edges: ReturnType<typeof edge>[] = []): FlowMapData {
	return map({ notation: 'epc', nodes, edges })
}

describe('EPC: виды и вспомогательные', () => {
	it('короткие виды разбираются с префиксом нотации и без', () => {
		expect(epcKindOf({ kind: 'epc:event' })).toBe('event')
		expect(alternationOf({ kind: 'epc:function' })).toBe('function')
		expect(alternationOf({ kind: 'and' })).toBe('neutral')
		expect(isAside({ kind: 'information' })).toBe(true)
		expect(isAside({ kind: 'event' })).toBe(false)
		expect(isControl(edge('e', ['a', 'b']))).toBe(true)
		expect(isControl(edge('e', ['a', 'b'], { kind: 'assignment' }))).toBe(false)
	})

	it('каждый вид и связь нотации имеет подпись, а фигуры-функции и значки отдают разметку', () => {
		for (const [id, kind] of Object.entries(flowEpc.nodeKinds)) {
			expect(kind.label(), id).not.toBe('')
			const shape = kind.shape
			if (typeof shape.path === 'function') expect(shape.path({ width: 120, height: 50 })).toMatch(/^M/)
			if (shape.markers) expect(shape.markers(node('x', { kind: id }))).toHaveLength(1)
			for (const prop of Object.values(kind.props ?? {})) expect(prop.label()).not.toBe('')
		}
		for (const kind of Object.values(flowEpc.edgeKinds)) expect(kind.label()).not.toBe('')
		expect(flowEpc.rulesSummary?.()).toBe(UI_FLOW_EPC.RULES_SUMMARY)
		expect(flowEpc.label()).toBe(UI_FLOW_EPC.NOTATION)
	})

	it('коннекторы рисуют знак: ∧, ∨ и XOR', () => {
		const marks = ['and', 'or', 'xor'].map(id => flowEpc.nodeKinds[id].shape.markers?.(node('x'))[0].text)
		expect(marks).toEqual(['∧', '∨', 'XOR'])
	})
})

describe('EPC: правила связей, отказ с причиной', () => {
	const flow = data([ev('e1'), ev('e2'), fn('f1'), fn('f2'), gate('and1', 'and'), gate('x1', 'xor'), gate('o1', 'or')])

	it('событие → функция и функция → событие разрешены', () => {
		expect(verdictOf(flowEpc, flow, ['e1', 'f1'])).toBe(true)
		expect(verdictOf(flowEpc, flow, ['f1', 'e1'])).toBe(true)
	})

	it('событие → событие запрещено с кодом epc-event-event и причиной из словаря', () => {
		expect(verdictOf(flowEpc, flow, ['e1', 'e2'])).toEqual({ code: 'epc-event-event', message: UI_FLOW_EPC.RULE_EVENT_EVENT })
	})

	it('функция → функция запрещена с кодом epc-function-function', () => {
		expect(verdictOf(flowEpc, flow, ['f1', 'f2'])).toEqual({
			code: 'epc-function-function',
			message: UI_FLOW_EPC.RULE_FUNCTION_FUNCTION,
		})
	})

	it('через коннектор чередование тоже проверяется: событие → И → событие запрещено, событие → И → функция можно', () => {
		const chain = data([ev('e1'), gate('g', 'and'), ev('e2'), fn('f1')], [ctl('c1', ['e1', 'g'])])
		expect(verdictOf(flowEpc, chain, ['g', 'e2'])).toMatchObject({ code: 'epc-event-event' })
		expect(verdictOf(flowEpc, chain, ['g', 'f1'])).toBe(true)
	})

	it('функция → И → функция запрещена, и коннектор после коннектора ищет роль по цепочке', () => {
		const chain = data([fn('f1'), gate('g1', 'and'), gate('g2', 'or'), fn('f2')], [ctl('c1', ['f1', 'g1']), ctl('c2', ['g1', 'g2'])])
		expect(verdictOf(flowEpc, chain, ['g2', 'f2'])).toMatchObject({ code: 'epc-function-function' })
	})

	it('роли коннектора ищутся и вперёд: коннектор перед функцией, за которой функция', () => {
		const chain = data([fn('f1'), gate('g', 'and'), fn('f2')], [ctl('c1', ['g', 'f2'])])
		expect(verdictOf(flowEpc, chain, ['f1', 'g'])).toMatchObject({ code: 'epc-function-function' })
	})

	it('очень длинная цепочка коннекторов обрывает поиск и связь не блокируется', () => {
		const gates = Array.from({ length: 70 }, (_, index) => gate(`g${index}`, 'and'))
		const links = gates.slice(1).map((item, index) => ctl(`c${index}`, [gates[index].id, item.id]))
		const chain = data([ev('e1'), ...gates, ev('e2')], [ctl('start', ['e1', 'g0']), ctl('end', ['g69', 'e2']), ...links])
		expect(verdictOf(flowEpc, chain, ['g0', 'g1'])).toBe(true)
	})

	it('связь коннектора в никуда при поиске ролей пропускается', () => {
		const dangling = data([gate('g', 'and'), ev('e1')], [ctl('c1', ['g', 'нет'])])
		expect(verdictOf(flowEpc, dangling, ['e1', 'g'])).toBe(true)
	})

	it('цикл коннекторов не зацикливает поиск', () => {
		const loop = data([gate('g1', 'and'), gate('g2', 'and'), ev('e1')], [ctl('c1', ['g1', 'g2']), ctl('c2', ['g2', 'g1'])])
		expect(verdictOf(flowEpc, loop, ['g2', 'e1'])).toBe(true)
	})

	it('событие → ИЛИ/XOR с двумя выходами запрещено (epc-event-split), для И разрешено', () => {
		const split = data(
			[ev('e1'), gate('x', 'xor'), fn('f1'), fn('f2'), gate('a', 'and')],
			[ctl('c1', ['x', 'f1']), ctl('c2', ['x', 'f2'])],
		)
		expect(verdictOf(flowEpc, split, ['e1', 'x'])).toEqual({ code: 'epc-event-split', message: UI_FLOW_EPC.RULE_EVENT_SPLIT })
		expect(verdictOf(flowEpc, split, ['e1', 'a'])).toBe(true)
	})

	it('XOR после события, у которого уже есть выход, запрещает второй выход', () => {
		const split = data([ev('e1'), gate('x', 'xor'), fn('f1'), fn('f2')], [ctl('c0', ['e1', 'x']), ctl('c1', ['x', 'f1'])])
		expect(verdictOf(flowEpc, split, ['x', 'f2'])).toMatchObject({ code: 'epc-event-split' })
	})

	it('XOR после события с одним выходом разрешён: расщепление ещё не случилось', () => {
		const split = data([ev('e1'), gate('x', 'xor'), fn('f1')], [ctl('c0', ['e1', 'x'])])
		expect(verdictOf(flowEpc, split, ['x', 'f1'])).toBe(true)
	})

	it('XOR, перед которым стоит функция, второй выход допускает', () => {
		const split = data([fn('f0'), gate('x', 'xor'), ev('e1'), ev('e2')], [ctl('c0', ['f0', 'x']), ctl('c1', ['x', 'e1'])])
		expect(verdictOf(flowEpc, split, ['x', 'e2'])).toBe(true)
	})

	it('организация и информация не участвуют в потоке управления: epc-aside-flow', () => {
		const aside = data([node('o', { kind: 'org-unit' }), node('i', { kind: 'information' }), fn('f'), ev('e')])
		expect(verdictOf(flowEpc, aside, ['o', 'f'])).toEqual({ code: 'epc-aside-flow', message: UI_FLOW_EPC.RULE_ASIDE_FLOW })
		expect(verdictOf(flowEpc, aside, ['e', 'i'])).toMatchObject({ code: 'epc-aside-flow' })
	})

	it('назначение: организация или информация с функцией — можно, остальное — epc-assignment', () => {
		const aside = data([node('o', { kind: 'org-unit' }), node('i', { kind: 'information' }), fn('f'), fn('g'), ev('e')])
		expect(verdictOf(flowEpc, aside, ['o', 'f', 'assignment'])).toBe(true)
		expect(verdictOf(flowEpc, aside, ['f', 'i', 'assignment'])).toBe(true)
		expect(verdictOf(flowEpc, aside, ['i', 'f', 'assignment'])).toBe(true)
		expect(verdictOf(flowEpc, aside, ['o', 'i', 'assignment'])).toEqual({
			code: 'epc-assignment',
			message: UI_FLOW_EPC.RULE_ASSIGNMENT,
		})
		expect(verdictOf(flowEpc, aside, ['f', 'g', 'assignment'])).toMatchObject({ code: 'epc-assignment' })
		expect(verdictOf(flowEpc, aside, ['e', 'f', 'assignment'])).toMatchObject({ code: 'epc-assignment' })
	})

	it('пользователь не может соединить два события: connect возвращает отказ правила с причиной', async () => {
		const { controller } = createHarness(data([ev('e1'), ev('e2')]), { notations: [flowEpc] })
		const result = await controller.connect('e1', 'e2')
		expect(result.isApplied).toBe(false)
		expect(result.reject).toMatchObject({ by: 'rule', code: 'epc-event-event', message: UI_FLOW_EPC.RULE_EVENT_EVENT })
	})
})

describe('EPC: предупреждения', () => {
	it('функция без входа и без выхода — два предупреждения с названием функции', () => {
		const issues = issuesOf(flowEpc, data([fn('f1', { label: 'Проверить' })]))
		expect(issues.map(item => item.code).sort()).toEqual(['epc-end', 'epc-start'])
		expect(issues.every(item => item.level === 'warning' && item.target?.id === 'f1')).toBe(true)
		expect(issues[0].message).toContain('Проверить')
	})

	it('без подписи название — id; событие и коннектор концов не требуют', () => {
		const issues = issuesOf(flowEpc, data([fn('f1', { label: '' }), ev('e1'), gate('g', 'and')]))
		expect(issues).toHaveLength(2)
		expect(issues[0].message).toContain('f1')
	})

	it('функция с входом и выходом чистая; связи назначения не считаются потоком', () => {
		const ok = data(
			[ev('e1'), fn('f1'), ev('e2'), node('o', { kind: 'org-unit' })],
			[ctl('c1', ['e1', 'f1']), ctl('c2', ['f1', 'e2']), edge('a', ['o', 'f1'], { kind: 'assignment' })],
		)
		expect(issuesOf(flowEpc, ok)).toEqual([])
		const onlyAssigned = data([fn('f1'), node('o', { kind: 'org-unit' })], [edge('a', ['o', 'f1'], { kind: 'assignment' })])
		expect(
			issuesOf(flowEpc, onlyAssigned)
				.map(item => item.code)
				.sort(),
		).toEqual(['epc-end', 'epc-start'])
	})

	it('в данных два события подряд — epc-alternation на целевом узле', () => {
		const bad = data([ev('e1'), ev('e2', { label: 'Второе' })], [ctl('c1', ['e1', 'e2'])])
		const issue = issuesOf(flowEpc, bad).find(item => item.code === 'epc-alternation')
		expect(issue).toMatchObject({ level: 'warning', target: { entity: 'node', id: 'e2' } })
		expect(issue?.message).toContain('Второе')
	})

	it('две функции подряд — тоже epc-alternation', () => {
		const bad = data([fn('f1'), fn('f2')], [ctl('c1', ['f1', 'f2'])])
		expect(issuesOf(flowEpc, bad).some(item => item.code === 'epc-alternation')).toBe(true)
	})

	it('событие, из которого выходит ИЛИ/XOR с двумя выходами — epc-event-split на событии', () => {
		const bad = data(
			[ev('e0', { label: 'Старт' }), gate('x', 'xor'), fn('f1'), fn('f2')],
			[ctl('c0', ['e0', 'x']), ctl('c1', ['x', 'f1']), ctl('c2', ['x', 'f2'])],
		)
		const issue = issuesOf(flowEpc, bad).find(item => item.code === 'epc-event-split')
		expect(issue?.target).toEqual({ entity: 'node', id: 'e0' })
		expect(issue?.message).toContain('Старт')
	})

	it('связи с висящим концом и связи рядом с организацией не дают предупреждений по связи', () => {
		const odd = data(
			[ev('e1'), node('o', { kind: 'org-unit' })],
			[ctl('c1', ['e1', 'нет']), ctl('c2', ['o', 'e1']), ctl('c3', ['e1', 'o'])],
		)
		expect(issuesOf(flowEpc, odd)).toEqual([])
	})
})

describe('EPC: раскладка epc', () => {
	const line = data(
		[ev('e1'), fn('f1'), ev('e2'), node('org', { kind: 'org-unit' }), node('inf', { kind: 'information' })],
		[
			ctl('c1', ['e1', 'f1']),
			ctl('c2', ['f1', 'e2']),
			edge('a1', ['org', 'f1'], { kind: 'assignment' }),
			edge('a2', ['f1', 'inf'], { kind: 'assignment' }),
		],
	)

	it('поток идёт сверху вниз, организация слева от функции, информация справа, наложений нет', () => {
		const { nodes } = layoutOf(flowEpc, line)
		expect(nodes.e1.y).toBeLessThan(nodes.f1.y)
		expect(nodes.f1.y).toBeLessThan(nodes.e2.y)
		expect(nodes.org.x + nodes.org.width).toBeLessThan(nodes.f1.x)
		expect(nodes.inf.x).toBeGreaterThan(nodes.f1.x + nodes.f1.width)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('результат детерминирован: два прогона дают то же самое', () => {
		expect(layoutOf(flowEpc, line)).toEqual(layoutOf(flowEpc, line))
	})

	it('несколько организаций и информаций одной функции стоят столбцами без наложений', () => {
		const many = data(
			[fn('f'), node('o1', { kind: 'org-unit' }), node('o2', { kind: 'org-unit' }), node('i1', { kind: 'information' })],
			[
				edge('a1', ['o1', 'f'], { kind: 'assignment' }),
				edge('a2', ['o2', 'f'], { kind: 'assignment' }),
				edge('a3', ['f', 'i1'], { kind: 'assignment' }),
			],
		)
		const { nodes } = layoutOf(flowEpc, many)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
		expect(nodes.o1.x).toBe(nodes.o2.x)
		expect(nodes.o2.y).toBeGreaterThan(nodes.o1.y)
	})

	it('назначение через вторую сторону: организация указана целью — всё равно слева', () => {
		const reverse = data([fn('f'), node('o', { kind: 'org-unit' })], [edge('a', ['f', 'o'], { kind: 'assignment' })])
		const { nodes } = layoutOf(flowEpc, reverse)
		expect(nodes.o.x).toBeLessThan(nodes.f.x)
	})

	it('организация без связи с потоком уходит под основную схему, в ряд', () => {
		const orphan = data(
			[ev('e1'), fn('f1'), node('o1', { kind: 'org-unit' }), node('o2', { kind: 'org-unit' }), node('i', { kind: 'information' })],
			[ctl('c', ['e1', 'f1']), edge('a', ['o1', 'i'], { kind: 'assignment' })],
		)
		const { nodes } = layoutOf(flowEpc, orphan)
		const mainBottom = Math.max(nodes.e1.y + nodes.e1.height, nodes.f1.y + nodes.f1.height)
		expect(nodes.o1.y).toBeGreaterThan(mainBottom)
		expect(nodes.o2.y).toBe(nodes.o1.y)
		expect(nodes.o2.x).toBeGreaterThan(nodes.o1.x)
		expect(nodes.i.y).toBe(nodes.o1.y)
	})

	it('1 элемент, 2 элемента и пустая карта раскладываются', () => {
		const empty = layoutOf(flowEpc, data([]))
		expect(empty.nodes).toEqual({})
		expect(empty.bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 })
		const one = layoutOf(flowEpc, data([ev('e1')]))
		expect(Object.keys(one.nodes)).toEqual(['e1'])
		expect(one.bounds.width).toBeGreaterThan(0)
		const two = layoutOf(flowEpc, data([ev('e1'), fn('f1')], [ctl('c', ['e1', 'f1'])]))
		expect(two.nodes.f1.y).toBeGreaterThan(two.nodes.e1.y)
	})

	it('много элементов: цепочка из 40 звеньев без наложений, границы охватывают всё', () => {
		const nodes = Array.from({ length: 40 }, (_, index) => (index % 2 === 0 ? ev(`n${index}`) : fn(`n${index}`)))
		const edges = nodes.slice(1).map((item, index) => ctl(`c${index}`, [nodes[index].id, item.id]))
		const { nodes: rects, bounds } = layoutOf(flowEpc, data(nodes, edges))
		expect(hasOverlaps(Object.values(rects))).toBe(false)
		for (const rect of Object.values(rects)) {
			expect(rect.x).toBeGreaterThanOrEqual(bounds.x)
			expect(rect.y + rect.height).toBeLessThanOrEqual(bounds.y + bounds.height)
		}
	})

	it('закреплённый узел остаётся на своём месте, а сетка выравнивает остальные', () => {
		const pinned = data([ev('e1', { position: { x: 500, y: 500 }, isPinned: true }), fn('f1')], [ctl('c', ['e1', 'f1'])])
		const { nodes } = layoutOf(flowEpc, pinned, { gridSize: 8 })
		expect(nodes.e1).toMatchObject({ x: 500, y: 500 })
		expect(nodes.f1.x % 8).toBe(0)
		expect(nodes.f1.y % 8).toBe(0)
	})

	it('группы сохраняются вокруг своих узлов', () => {
		const grouped = {
			...data([ev('e1', { group: 'g' }), fn('f1', { group: 'g' })], [ctl('c', ['e1', 'f1'])]),
			groups: [{ id: 'g', kind: 'lane', label: 'Дорожка' }],
		}
		const { nodes, groups } = layoutOf(flowEpc, grouped)
		expect(groups.g.width).toBeGreaterThan(nodes.e1.width)
	})
})

describe('EPC: simulate', () => {
	function steps(source: FlowMapData, choices = {}) {
		return simulateEpc(buildFlowGraph(source), choices)?.steps ?? []
	}

	it('линейный процесс проходит от события через функцию к событию', () => {
		const linear = data([ev('e1'), fn('f1'), ev('e2')], [ctl('c1', ['e1', 'f1']), ctl('c2', ['f1', 'e2'])])
		const scenario = simulateEpc(buildFlowGraph(linear), {})
		expect(scenario).toMatchObject({ id: 'epc-simulation', label: UI_FLOW_EPC.SIMULATION })
		expect(edgesOf(linear)).toEqual(['c1', 'c2'])
	})

	it('функция без входа не считается стартом, а организация и информация — тем более', () => {
		const lonely = data([fn('f1'), node('o', { kind: 'org-unit' }), node('i', { kind: 'information' })])
		expect(steps(lonely)).toEqual([])
	})

	const edgesOf = (source: FlowMapData, choices = {}) =>
		[...JSON.stringify(steps(source, choices)).matchAll(/"edge":"([^"]+)"/g)].map(match => match[1])

	it('XOR выбирает ветку по choices, И идёт по всем веткам', () => {
		const branch = data(
			[ev('e0'), gate('x', 'xor'), fn('fa'), fn('fb')],
			[ctl('c0', ['e0', 'x']), ctl('ca', ['x', 'fa']), ctl('cb', ['x', 'fb'])],
		)
		expect(edgesOf(branch, { x: 'cb' })).toEqual(['c0', 'cb'])
		expect(edgesOf(branch, { x: 'ca' })).toEqual(['c0', 'ca'])
		const parallel = data(
			[ev('e0'), gate('a', 'and'), fn('fa'), fn('fb')],
			[ctl('c0', ['e0', 'a']), ctl('ca', ['a', 'fa']), ctl('cb', ['a', 'fb'])],
		)
		expect(edgesOf(parallel)).toEqual(['c0', 'ca', 'cb'])
	})

	it('ИЛИ выбирает несколько веток списком через запятую', () => {
		const branch = data(
			[ev('e0'), gate('o', 'or'), fn('fa'), fn('fb'), fn('fc')],
			[ctl('c0', ['e0', 'o']), ctl('ca', ['o', 'fa']), ctl('cb', ['o', 'fb']), ctl('cc', ['o', 'fc'])],
		)
		expect(edgesOf(branch, { o: 'ca,cc' })).toEqual(['c0', 'ca', 'cc'])
	})
})
