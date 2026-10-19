import { describe, expect, it, vi } from 'vitest'
import { UI_FLOW_EVENT_STORMING } from '@/locales/messages'
import { edge, group, map, node } from '../../fixtures/flow2Data'
import type { FlowMapData } from '../../../../types/data/flowData.types'
import { flowEventStorming } from '../../../../model/notations/eventStorming'
import { hasOverlaps, isInside, issuesOf, layoutOf } from '../../fixtures/notationKit'
import { stormingKindOf } from '../../../../model/notations/eventStorming/eventStormingRules'

const es = (id: string, kind: string, extra = {}) => node(id, { kind, ...extra })
const link = (id: string, ends: [string, string]) => edge(id, ends, { kind: 'flow' })

function data(parts: Partial<FlowMapData>): FlowMapData {
	return map({ notation: 'event-storming', ...parts })
}

describe('Event Storming: виды', () => {
	it('девять стикеров, связь flow, группа context; подписи непустые', () => {
		expect(Object.keys(flowEventStorming.nodeKinds)).toHaveLength(9)
		for (const kind of [
			...Object.values(flowEventStorming.nodeKinds),
			...Object.values(flowEventStorming.edgeKinds),
			...Object.values(flowEventStorming.groupKinds ?? {}),
		]) {
			expect(kind.label()).not.toBe('')
		}
		expect(flowEventStorming.nodeKinds['external-system'].isExternal).toBe(true)
		expect(flowEventStorming.rulesSummary?.()).toBe(UI_FLOW_EVENT_STORMING.RULES_SUMMARY)
		expect(flowEventStorming.label()).toBe(UI_FLOW_EVENT_STORMING.NOTATION)
		expect(stormingKindOf({ kind: 'event-storming:command' })).toBe('command')
	})
})

describe('Event Storming: предупреждения грамматики', () => {
	const sample = data({
		nodes: [
			es('a', 'actor', { label: 'Покупатель' }),
			es('c', 'command', { label: 'Оформить' }),
			es('ag', 'aggregate'),
			es('ev', 'domain-event', { label: 'Заказ создан' }),
			es('p', 'policy'),
			es('rm', 'read-model'),
			es('x', 'external-system'),
			es('h', 'hotspot'),
			es('o', 'opportunity'),
		],
	})

	function warn(ends: [string, string]) {
		return issuesOf(flowEventStorming, { ...sample, edges: [link('e', ends)] })
	}

	it('разрешённые переходы предупреждений не дают', () => {
		const allowed: [string, string][] = [
			['a', 'c'],
			['c', 'ag'],
			['c', 'x'],
			['ag', 'ev'],
			['x', 'ev'],
			['ev', 'p'],
			['ev', 'rm'],
			['ev', 'c'],
			['p', 'c'],
			['rm', 'a'],
		]
		for (const ends of allowed) expect(warn(ends), ends.join('→')).toEqual([])
	})

	it('заметки (горячая точка, возможность) связываются с чем угодно в обе стороны', () => {
		for (const ends of [
			['h', 'ev'],
			['ev', 'h'],
			['o', 'c'],
			['a', 'o'],
		] as [string, string][])
			expect(warn(ends)).toEqual([])
	})

	it('нарушение грамматики — es-grammar на связи с названиями концов и перечнем ожидаемого', () => {
		const issues = warn(['c', 'ev'])
		expect(issues).toHaveLength(1)
		expect(issues[0]).toMatchObject({ level: 'warning', code: 'es-grammar', target: { entity: 'edge', id: 'e' } })
		expect(issues[0].message).toContain('Оформить')
		expect(issues[0].message).toContain('Заказ создан')
		expect(issues[0].message).toContain(UI_FLOW_EVENT_STORMING.EXPECTED_COMMAND)
	})

	it('у каждого вида с правилами есть подсказка «ожидается», у заметки её нет', () => {
		const sources: [string, string][] = [
			['a', 'ev'],
			['c', 'ev'],
			['ag', 'c'],
			['x', 'c'],
			['ev', 'ag'],
			['p', 'ev'],
			['rm', 'ev'],
		]
		for (const ends of sources) {
			const [issue] = warn(ends)
			expect(issue.code, ends.join('→')).toBe('es-grammar')
		}
	})

	it('вид без подписи в названии — id; связи на несуществующие узлы пропускаются', () => {
		const blank = { ...sample, nodes: [...sample.nodes, es('z', 'command', { label: '' }), es('y', 'actor', { label: '' })] }
		const issues = issuesOf(flowEventStorming, {
			...blank,
			edges: [link('e1', ['ag', 'a']), link('e2', ['нет', 'a']), link('e3', ['a', 'нет']), link('e4', ['z', 'y'])],
		})
		expect(issues).toHaveLength(2)
		expect(issues[0].message).toContain('ag')
		expect(issues[1].message).toContain('z')
		expect(issues[1].message).toContain('y')
	})

	it('источник вида, которого нет в грамматике, подсказки не имеет, но предупреждение даёт', () => {
		const odd = data({ nodes: [es('u', 'неизвестный'), es('c', 'command')], edges: [link('e', ['u', 'c'])] })
		expect(issuesOf(flowEventStorming, odd)).toHaveLength(1)
	})
})

describe('Event Storming: раскладка timeline', () => {
	const flow = data({
		nodes: [
			es('a', 'actor'),
			es('c', 'command'),
			es('ag', 'aggregate'),
			es('ev', 'domain-event'),
			es('p', 'policy'),
			es('c2', 'command'),
			es('ev2', 'domain-event'),
		],
		edges: [
			link('1', ['a', 'c']),
			link('2', ['c', 'ag']),
			link('3', ['ag', 'ev']),
			link('4', ['ev', 'p']),
			link('5', ['p', 'c2']),
			link('6', ['c2', 'ev2']),
		],
	})

	it('время идёт слева направо: ранг растёт по связям, полосы — по видам сверху вниз', () => {
		const { nodes } = layoutOf(flowEventStorming, flow)
		expect(nodes.a.x).toBeLessThan(nodes.c.x)
		expect(nodes.c.x).toBeLessThan(nodes.ag.x)
		expect(nodes.ag.x).toBeLessThan(nodes.ev.x)
		expect(nodes.a.y).toBeLessThan(nodes.c.y)
		expect(nodes.c.y).toBeLessThan(nodes.ag.y)
		expect(nodes.ag.y).toBeLessThan(nodes.ev.y)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('стикеры одной полосы и ранга ставятся друг под другом', () => {
		const stack = data({
			nodes: [es('c', 'command'), es('e1', 'domain-event'), es('e2', 'domain-event'), es('e3', 'domain-event')],
			edges: [link('1', ['c', 'e1']), link('2', ['c', 'e2']), link('3', ['c', 'e3'])],
		})
		const { nodes } = layoutOf(flowEventStorming, stack)
		expect(nodes.e1.x).toBe(nodes.e2.x)
		expect(nodes.e2.y).toBeGreaterThan(nodes.e1.y)
		expect(nodes.e3.y).toBeGreaterThan(nodes.e2.y)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('обратная связь (цикл) не уводит ранги: события после политики возвращаются к первой команде', () => {
		const loop = data({
			nodes: [es('c', 'command'), es('ev', 'domain-event'), es('p', 'policy')],
			edges: [link('1', ['c', 'ev']), link('2', ['ev', 'p']), link('3', ['p', 'c'])],
		})
		const { nodes } = layoutOf(flowEventStorming, loop)
		expect(nodes.c.x).toBeLessThan(nodes.ev.x)
		expect(nodes.ev.x).toBeLessThan(nodes.p.x)
	})

	it('петля на себе и связи на несуществующие узлы раскладку не ломают', () => {
		const odd = data({
			nodes: [es('c', 'command'), es('ev', 'domain-event')],
			edges: [link('1', ['c', 'c']), link('2', ['c', 'нет']), link('3', ['нет', 'ev']), link('4', ['c', 'ev'])],
		})
		const { nodes } = layoutOf(flowEventStorming, odd)
		expect(nodes.c.x).toBeLessThan(nodes.ev.x)
	})

	it('неизвестный вид уходит в последнюю полосу', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const odd = data({ nodes: [es('u', 'неизвестный'), es('o', 'opportunity')] })
		const { nodes } = layoutOf(flowEventStorming, odd)
		expect(nodes.u.y).toBeGreaterThan(nodes.o.y)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('неизвестный')
		warn.mockRestore()
	})

	it('контексты охватывают свои стикеры, вложенные контексты — вложены; пустой контекст не рисуется', () => {
		const grouped = data({
			groups: [
				group('outer', { kind: 'context' }),
				group('inner', { kind: 'context', parent: 'outer' }),
				group('empty', { kind: 'context' }),
			],
			nodes: [es('c', 'command', { group: 'outer' }), es('ev', 'domain-event', { group: 'inner' }), es('ev2', 'domain-event')],
			edges: [link('1', ['c', 'ev']), link('2', ['ev', 'ev2'])],
		})
		const { nodes, groups } = layoutOf(flowEventStorming, grouped)
		expect(isInside(nodes.c, groups.outer)).toBe(true)
		expect(isInside(nodes.ev, groups.inner)).toBe(true)
		expect(isInside(groups.inner, groups.outer)).toBe(true)
		expect(groups.empty).toBeUndefined()
		expect(groups.inner.height).toBeGreaterThan(nodes.ev.height)
	})

	it('детерминизм и 0/1/2 элемента', () => {
		expect(layoutOf(flowEventStorming, flow)).toEqual(layoutOf(flowEventStorming, flow))
		const empty = layoutOf(flowEventStorming, data({}))
		expect(empty.nodes).toEqual({})
		expect(empty.bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 })
		expect(Object.keys(layoutOf(flowEventStorming, data({ nodes: [es('a', 'actor')] })).nodes)).toEqual(['a'])
		const two = layoutOf(
			flowEventStorming,
			data({ nodes: [es('c', 'command'), es('ev', 'domain-event')], edges: [link('1', ['c', 'ev'])] }),
		)
		expect(two.nodes.ev.x).toBeGreaterThan(two.nodes.c.x)
	})

	it('много стикеров: 60 событий в цепочке без наложений, границы охватывают всё', () => {
		const events = Array.from({ length: 60 }, (_, index) => es(`n${index}`, index % 3 === 0 ? 'command' : 'domain-event'))
		const links = events.slice(1).map((item, index) => link(`l${index}`, [events[index].id, item.id]))
		const { nodes, bounds } = layoutOf(flowEventStorming, data({ nodes: events, edges: links }))
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
		for (const rect of Object.values(nodes)) expect(isInside(rect, bounds)).toBe(true)
	})

	it('закреплённый стикер остаётся, остальные выравниваются по сетке', () => {
		const pinned = data({
			nodes: [es('c', 'command', { position: { x: 300, y: 300 }, isPinned: true }), es('ev', 'domain-event')],
			edges: [link('1', ['c', 'ev'])],
		})
		const { nodes } = layoutOf(flowEventStorming, pinned, { gridSize: 8 })
		expect(nodes.c).toMatchObject({ x: 300, y: 300 })
		expect(nodes.ev.y % 8).toBe(0)
	})
})
