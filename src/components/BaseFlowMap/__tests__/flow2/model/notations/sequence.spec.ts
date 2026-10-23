import { describe, expect, it } from 'vitest'
import { UI_FLOW_SEQUENCE } from '@/locales/messages'
import { createScope } from '../../fixtures/flow2Scope'
import { edge, map, node } from '../../fixtures/flow2Data'
import { createHarness } from '../../fixtures/flow2Harness'
import { buildFlowGraph } from '../../../../model/data/flowGraph'
import { computeRoutes } from '../../../../model/layout/flowRoutes'
import { flowSequence } from '../../../../model/notations/sequence'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import { placeMarkers } from '../../../../model/render/shapes/shapeMarkers'
import { createLayoutInput } from '../../../../model/layout/flowLayoutInput'
import type { FlowMapData, FlowValue } from '../../../../types/data/flowData.types'
import { simulateSequence } from '../../../../model/notations/sequence/sequenceSimulate'
import { hasOverlaps, isInside, issuesOf, layoutOf, verdictOf } from '../../fixtures/notationKit'
import { fragmentPath, HEADER_TOP, lifelinePath } from '../../../../model/notations/sequence/sequencePaths'
import { isLifeline, lifecycleOf, sequenceKindOf, textProp } from '../../../../model/notations/sequence/sequenceRules'

const life = (id: string, extra = {}) => node(id, { kind: 'lifeline', ...extra })
const msg = (id: string, ends: [string, string], ...rest: [string?, Record<string, FlowValue>?]) =>
	edge(id, ends, { ...rest[1], kind: rest[0] ?? 'sync' })
const frag = (id: string, props: Record<string, FlowValue>, extra = {}) => node(id, { kind: 'fragment', props, ...extra })

function data(nodes: ReturnType<typeof node>[], edges: ReturnType<typeof edge>[] = []): FlowMapData {
	return map({ notation: 'sequence', nodes, edges })
}

describe('Sequence: подписи сообщений (v6.2, isLabelObstacle)', () => {
	const labelled = data(
		[life('a'), life('b'), life('c'), frag('f', { from: 'm1', to: 'm2' })],
		[msg('m1', ['a', 'c'], 'sync', {}), msg('m2', ['c', 'a'], 'reply')].map(item => ({ ...item, label: `сообщение ${item.id}` })),
	)

	it('линии жизни, акторы и фрагменты помечены isLabelObstacle=false', () => {
		for (const kind of ['lifeline', 'actor', 'fragment']) expect(flowSequence.nodeKinds[kind].isLabelObstacle).toBe(false)
	})

	it('подпись сообщения, проходящего через чужую линию жизни и фрагмент, размещается на середине линии', () => {
		const scope = createScope({ ...labelled, notation: flowSequence.id }, { notation: flowSequence })
		const layout = runFlowLayout(scope)
		const routes = computeRoutes(scope, layout, createLayoutInput(scope).edges)
		for (const id of ['m1', 'm2']) {
			const label = routes[id].label
			expect(label).not.toBeNull()
			const points = routes[id].points
			expect(label?.point.x).toBeCloseTo((points[0].x + points[1].x) / 2)
			expect(label?.point.y).toBeCloseTo(points[0].y)
		}
	})
})

describe('Sequence: вспомогательные и фигуры', () => {
	it('виды разбираются с префиксом нотации и без, actor тоже линия жизни', () => {
		expect(sequenceKindOf({ kind: 'sequence:actor' })).toBe('actor')
		expect(sequenceKindOf({})).toBe('')
		expect(isLifeline({ kind: 'actor' })).toBe(true)
		expect(isLifeline({ kind: 'fragment' })).toBe(false)
		expect(textProp({ props: { a: 'x', b: '', c: 3 } }, 'a')).toBe('x')
		expect(textProp({ props: { a: 'x', b: '', c: 3 } }, 'b')).toBeUndefined()
		expect(textProp({ props: { c: 3 } }, 'c')).toBeUndefined()
		expect(textProp({}, 'a')).toBeUndefined()
	})

	it('пути фигур: заголовок линии жизни с пунктиром и рамка фрагмента с вкладкой', () => {
		expect(lifelinePath({ width: 150, height: 100 })).toMatch(/^M6 -6H144/)
		expect(lifelinePath({ width: 150, height: 100 })).toContain('M75 28V34')
		expect(fragmentPath({ width: 300, height: 120 })).toBe('M0 0H300V120H0ZM0 0H44V16L38 22H0Z')
		expect(HEADER_TOP).toBe(-6)
	})

	it('у линии жизни название стоит по центру заголовка (top-center), у актора справа значок человека', () => {
		const lifeline = flowSequence.nodeKinds.lifeline.shape.markers?.(life('l', { label: 'Сервис' })) ?? []
		expect(lifeline).toEqual([{ text: 'Сервис', placement: 'top-center' }])
		const placed = placeMarkers(lifeline, { width: 150, height: 40 })
		expect(placed[0]).toMatchObject({ text: 'Сервис', anchor: 'middle', x: 75 })
		const actor = flowSequence.nodeKinds.actor.shape.markers?.(life('a', { label: 'Клиент' })) ?? []
		expect(actor.map(item => item.placement)).toEqual(['top-center', 'top-end'])
	})

	it('метка фрагмента: оператор и условие в скобках, по умолчанию alt', () => {
		const marks = (props?: Record<string, FlowValue>) => flowSequence.nodeKinds.fragment.shape.markers?.(node('f', { props })) ?? []
		expect(marks({ operator: 'loop', guard: 'пока есть' })[0].text).toBe('loop [пока есть]')
		expect(marks({ operator: 'opt', guard: '' })[0].text).toBe('opt')
		expect(marks()[0]).toEqual({ text: 'alt', placement: 'top-start' })
		expect(marks({ operator: 3 })[0].text).toBe('alt')
	})

	it('все виды, связи и операторы подписаны; крест у destroy', () => {
		for (const kind of [...Object.values(flowSequence.nodeKinds), ...Object.values(flowSequence.edgeKinds)])
			expect(kind.label()).not.toBe('')
		const operator = flowSequence.nodeKinds.fragment.props?.operator
		expect(operator?.options?.map(item => item.value)).toEqual(['alt', 'opt', 'loop', 'par', 'break', 'critical', 'ref'])
		for (const option of operator?.options ?? []) expect(option.label()).not.toBe('')
		for (const prop of Object.values(flowSequence.nodeKinds.fragment.props ?? {})) expect(prop.label()).not.toBe('')
		expect(flowSequence.edgeKinds.destroy.endMarker).toBe('cross')
		expect(flowSequence.rulesSummary?.()).toBe(UI_FLOW_SEQUENCE.RULES_SUMMARY)
		expect(flowSequence.label()).toBe(UI_FLOW_SEQUENCE.NOTATION)
	})
})

describe('Sequence: lifecycleOf', () => {
	it('запоминает строку первого create и первого destroy на линию', () => {
		const result = lifecycleOf([
			{ kind: 'sync', target: 'a' },
			{ kind: 'create', target: 'b' },
			{ kind: 'sequence:create', target: 'b' },
			{ kind: 'destroy', target: 'b' },
			{ kind: 'sequence:destroy', target: 'b' },
			{ target: 'c' },
		])
		expect([...result.created]).toEqual([['b', 1]])
		expect([...result.destroyed]).toEqual([['b', 3]])
	})

	it('пустой список связей — пустой жизненный цикл', () => {
		const result = lifecycleOf([])
		expect(result.created.size + result.destroyed.size).toBe(0)
	})
})

describe('Sequence: правила, отказ с причиной', () => {
	const base = data([life('a'), life('b', { label: 'Бэк' }), frag('f', {})], [msg('m1', ['a', 'b']), msg('m2', ['a', 'b'], 'create')])

	it('сообщение между линиями жизни разрешено', () => {
		expect(verdictOf(flowSequence, base, ['a', 'b'])).toBe(true)
	})

	it('фрагмент не соединяется сообщением — sequence-fragment', () => {
		const denied = { code: 'sequence-fragment', message: UI_FLOW_SEQUENCE.RULE_FRAGMENT }
		expect(verdictOf(flowSequence, base, ['f', 'a'])).toEqual(denied)
		expect(verdictOf(flowSequence, base, ['a', 'f'])).toEqual(denied)
	})

	it('создать линию дважды нельзя — sequence-create-once с названием линии', () => {
		const verdict = verdictOf(flowSequence, base, ['a', 'b', 'create'])
		expect(verdict).toMatchObject({ code: 'sequence-create-once' })
		expect((verdict as { message: string }).message).toContain('Бэк')
	})

	it('без подписи в сообщении об отказе — id линии; другой вид сообщения создание не блокирует', () => {
		const plain = data([life('a'), life('b', { label: '' })], [msg('m', ['a', 'b'], 'create')])
		expect((verdictOf(flowSequence, plain, ['a', 'b', 'create']) as { message: string }).message).toContain('b')
		expect(verdictOf(flowSequence, base, ['a', 'b', 'sync'])).toBe(true)
	})

	it('connect у пользователя: сообщение на фрагмент и от него отклоняется canConnect с причиной, повторное создание — тоже', async () => {
		const { controller } = createHarness(base, { notations: [flowSequence] })
		const onFragment = await controller.connect('a', 'f')
		expect(onFragment.reject).toMatchObject({ by: 'rule', code: 'sequence-fragment', message: UI_FLOW_SEQUENCE.RULE_FRAGMENT })
		const fromFragment = await controller.connect('f', 'a')
		expect(fromFragment.reject).toMatchObject({ by: 'rule', code: 'sequence-fragment', message: UI_FLOW_SEQUENCE.RULE_FRAGMENT })
		const twice = await controller.connect('a', 'b', { kind: 'create' })
		expect(twice.reject).toMatchObject({ by: 'rule', code: 'sequence-create-once' })
		expect(twice.reject?.message).toContain('Бэк')
	})
})

describe('Sequence: предупреждения', () => {
	it('фрагмент без from/to или с from после to — sequence-fragment-range с названием', () => {
		const bad = data(
			[
				life('a'),
				life('b'),
				frag('f1', {}, { label: 'Без границ' }),
				frag('f2', { operator: 'loop', from: 'm2', to: 'm1' }, { label: '' }),
				frag('f3', {}, { label: '' }),
			],
			[msg('m1', ['a', 'b']), msg('m2', ['b', 'a'])],
		)
		const issues = issuesOf(flowSequence, bad).filter(item => item.code === 'sequence-fragment-range')
		expect(issues.map(item => item.target?.id)).toEqual(['f1', 'f2', 'f3'])
		expect(issues[0].message).toContain('Без границ')
		expect(issues[1].message).toContain('loop')
		expect(issues[2].message).toContain('f3')
	})

	it('верный диапазон предупреждения не даёт; границы по неизвестным сообщениям — даёт', () => {
		const ok = data(
			[life('a'), life('b'), frag('f', { from: 'm1', to: 'm2' }), frag('g', { from: 'нет', to: 'm2' })],
			[msg('m1', ['a', 'b']), msg('m2', ['b', 'a'])],
		)
		expect(issuesOf(flowSequence, ok).map(item => item.target?.id)).toEqual(['g'])
	})

	it('сообщение до создания линии — sequence-before-create', () => {
		const bad = data(
			[life('a'), life('b', { label: 'Новая' }), life('c', { label: '' })],
			[
				msg('m1', ['a', 'b'], 'sync', { label: 'Рано' }),
				msg('m2', ['a', 'b'], 'create'),
				msg('m3', ['a', 'c'], 'sync', { label: '' }),
				msg('m4', ['a', 'c'], 'create'),
			],
		)
		const issue = issuesOf(flowSequence, bad).find(item => item.code === 'sequence-before-create')
		expect(issue?.target).toEqual({ entity: 'edge', id: 'm1' })
		expect(issue?.message).toContain('Рано')
		expect(issue?.message).toContain('Новая')
		const blank = issuesOf(flowSequence, bad).find(item => item.target?.id === 'm3')
		expect(blank?.message).toContain('m3')
		expect(blank?.message).toContain('c')
	})

	it('сообщение после уничтожения линии — sequence-after-destroy; сама связь destroy не считается', () => {
		const bad = data(
			[life('a'), life('b')],
			[msg('m1', ['a', 'b']), msg('m2', ['a', 'b'], 'destroy'), msg('m3', ['a', 'b'], 'sync', { label: '' })],
		)
		const issues = issuesOf(flowSequence, bad)
		expect(issues.map(item => [item.code, item.target?.id])).toEqual([['sequence-after-destroy', 'm3']])
		expect(issues[0].message).toContain('m3')
	})

	it('правильный порядок: создание, работа, уничтожение — без предупреждений', () => {
		const ok = data(
			[life('a'), life('b')],
			[msg('m1', ['a', 'b'], 'create'), msg('m2', ['a', 'b']), msg('m3', ['b', 'a'], 'reply'), msg('m4', ['a', 'b'], 'destroy')],
		)
		expect(issuesOf(flowSequence, ok)).toEqual([])
	})

	it('связь к узлу, которого нет, не ломает проверку', () => {
		const odd = data([life('a')], [msg('m1', ['a', 'нет'])])
		expect(issuesOf(flowSequence, odd)).toEqual([])
	})
})

describe('Sequence: раскладка sequence', () => {
	const three = data([life('a'), life('b'), life('c')], [msg('m1', ['a', 'b']), msg('m2', ['b', 'c']), msg('m3', ['c', 'a'], 'reply')])

	it('линии жизни стоят в ряд слева направо, сообщения — горизонтальные отрезки на своих строках', () => {
		const { nodes, edges } = layoutOf(flowSequence, three)
		expect(nodes.a.x).toBeLessThan(nodes.b.x)
		expect(nodes.b.x).toBeLessThan(nodes.c.x)
		expect(nodes.a.y).toBe(0)
		expect(edges?.m1).toHaveLength(2)
		expect(edges?.m1[0].y).toBe(edges?.m1[1].y)
		expect(edges?.m2[0].y).toBeGreaterThan(edges?.m1[0].y ?? 0)
		expect(edges?.m1[0].x).toBeCloseTo(nodes.a.x + nodes.a.width / 2)
		expect(edges?.m1[1].x).toBeCloseTo(nodes.b.x + nodes.b.width / 2)
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})

	it('результат детерминирован', () => {
		expect(layoutOf(flowSequence, three)).toEqual(layoutOf(flowSequence, three))
	})

	it('петля «себе»: четыре точки справа от линии жизни', () => {
		const loop = data([life('a')], [msg('m1', ['a', 'a'])])
		const { nodes, edges } = layoutOf(flowSequence, loop)
		const route = edges?.m1 ?? []
		expect(route).toHaveLength(4)
		const centre = nodes.a.x + nodes.a.width / 2
		expect(route[0].x).toBe(centre)
		expect(route[1].x).toBeGreaterThan(centre)
		expect(route[2].y).toBeGreaterThan(route[1].y)
	})

	it('create: заголовок начинается на строке создания, сообщение упирается в заголовок сбоку', () => {
		const created = data(
			[life('a'), life('b'), life('c')],
			[msg('m1', ['a', 'b']), msg('m2', ['a', 'c'], 'create'), msg('m3', ['c', 'a'], 'reply')],
		)
		const { nodes, edges } = layoutOf(flowSequence, created)
		expect(nodes.c.y).toBeGreaterThan(nodes.a.y)
		const arrow = edges?.m2 ?? []
		expect(arrow[1].x).toBe(nodes.c.x)
		const back = layoutOf(flowSequence, data([life('a'), life('c')], [msg('m1', ['c', 'a'], 'create'), msg('m2', ['a', 'c'])]))
		expect(back.edges?.m1[1].x).toBe(back.nodes.a.x + back.nodes.a.width)
	})

	it('destroy: линия жизни обрывается на строке уничтожения', () => {
		const destroyed = data(
			[life('a'), life('b')],
			[msg('m1', ['a', 'b']), msg('m2', ['a', 'b'], 'destroy'), msg('m3', ['b', 'a'], 'reply')],
		)
		const { nodes } = layoutOf(flowSequence, destroyed)
		const plain = layoutOf(
			flowSequence,
			data([life('a'), life('b')], [msg('m1', ['a', 'b']), msg('m2', ['a', 'b']), msg('m3', ['b', 'a'])]),
		)
		expect(nodes.b.height).toBeLessThan(plain.nodes.b.height)
		expect(nodes.a.height).toBe(plain.nodes.a.height)
	})

	it('destroy: линия жизни кончается ровно на стрелке уничтожения, там же стоит крест', () => {
		const destroyed = data(
			[life('a'), life('b')],
			[msg('m1', ['a', 'b']), msg('m2', ['a', 'b'], 'destroy'), msg('m3', ['b', 'a'], 'reply')],
		)
		const { nodes, edges } = layoutOf(flowSequence, destroyed)
		expect(nodes.b.y + nodes.b.height).toBe(edges?.m2[0].y)
		const open = layoutOf(flowSequence, data([life('a'), life('b')], [msg('m1', ['a', 'b']), msg('m2', ['a', 'b'])]))
		expect(open.nodes.b.y + open.nodes.b.height).toBeGreaterThan(open.edges?.m2[0].y ?? 0)
	})

	it('фрагмент охватывает колонки и строки своих сообщений', () => {
		const framed = data(
			[life('a'), life('b'), life('c'), frag('f', { from: 'm2', to: 'm3' })],
			[msg('m1', ['a', 'b']), msg('m2', ['b', 'c']), msg('m3', ['c', 'b']), msg('m4', ['b', 'a'])],
		)
		const { nodes, edges } = layoutOf(flowSequence, framed)
		expect(nodes.f.x).toBeLessThan(nodes.b.x)
		expect(nodes.f.x + nodes.f.width).toBeGreaterThan(nodes.c.x + nodes.c.width)
		expect(nodes.f.y).toBeLessThan(edges?.m2[0].y ?? 0)
		expect(nodes.f.y + nodes.f.height).toBeGreaterThan(edges?.m3[0].y ?? 0)
		expect(nodes.f.y).toBeGreaterThan(edges?.m1[0].y ?? 0)
	})

	it('вложенные фрагменты: внешний вмещает внутренний с запасом; равные не вкладываются', () => {
		const nested = data(
			[
				life('a'),
				life('b'),
				frag('outer', { from: 'm1', to: 'm3' }),
				frag('inner', { from: 'm2', to: 'm2' }),
				frag('twin', { from: 'm2', to: 'm2' }),
			],
			[msg('m1', ['a', 'b']), msg('m2', ['b', 'a']), msg('m3', ['a', 'b'])],
		)
		const { nodes } = layoutOf(flowSequence, nested)
		expect(isInside(nodes.inner, nodes.outer)).toBe(true)
		expect(nodes.outer.x).toBeLessThan(nodes.inner.x)
		expect(nodes.twin).toEqual(nodes.inner)
	})

	it('фрагмент без границ охватывает все сообщения; фрагмент без сообщений — все линии', () => {
		const whole = data([life('a'), life('b'), frag('f', {})], [msg('m1', ['a', 'b']), msg('m2', ['b', 'a'])])
		const { nodes, edges } = layoutOf(flowSequence, whole)
		expect(nodes.f.y).toBeLessThan(edges?.m1[0].y ?? 0)
		expect(nodes.f.y + nodes.f.height).toBeGreaterThan(edges?.m2[0].y ?? 0)
		const bare = layoutOf(flowSequence, data([life('a'), life('b'), frag('f', {})]))
		expect(bare.nodes.f.x).toBeLessThan(bare.nodes.a.x)
		expect(bare.nodes.f.x + bare.nodes.f.width).toBeGreaterThan(bare.nodes.b.x + bare.nodes.b.width)
	})

	it('сообщение на фрагмент не имеет маршрута (фрагмент — не линия жизни)', () => {
		const odd = data([life('a'), frag('f', {})], [msg('m1', ['a', 'f'])])
		expect(layoutOf(flowSequence, odd).edges?.m1).toEqual([])
	})

	it('закреплённая линия жизни держит свою колонку', () => {
		const pinned = data([life('a', { position: { x: 700, y: 0 }, isPinned: true }), life('b')], [msg('m1', ['a', 'b'])])
		expect(layoutOf(flowSequence, pinned).nodes.a.x).toBe(700)
	})

	it('широкая линия жизни увеличивает шаг колонок', () => {
		const wide = data([life('a', { size: { width: 300, height: 400 } }), life('b')], [msg('m1', ['a', 'b'])])
		const narrow = data([life('a'), life('b')], [msg('m1', ['a', 'b'])])
		expect(layoutOf(flowSequence, wide).nodes.b.x).toBeGreaterThan(layoutOf(flowSequence, narrow).nodes.b.x)
	})

	it('1 элемент, 2 элемента и пустая карта', () => {
		const empty = layoutOf(flowSequence, data([]))
		expect(empty.nodes).toEqual({})
		expect(empty.edges).toEqual({})
		expect(empty.bounds).toEqual({ x: 0, y: 0, width: 0, height: 0 })
		const one = layoutOf(flowSequence, data([life('a')]))
		expect(one.nodes.a.height).toBeGreaterThanOrEqual(40)
		expect(one.bounds.width).toBeGreaterThan(0)
		const two = layoutOf(flowSequence, data([life('a'), life('b')], [msg('m1', ['a', 'b'])]))
		expect(two.nodes.b.x).toBeGreaterThan(two.nodes.a.x)
	})

	it('много сообщений: 50 строк идут строго вниз', () => {
		const lines = [life('a'), life('b')]
		const edges = Array.from({ length: 50 }, (_, index) => msg(`m${index}`, index % 2 ? ['b', 'a'] : ['a', 'b']))
		const { edges: routes, nodes } = layoutOf(flowSequence, data(lines, edges))
		const ys = edges.map(item => routes?.[item.id][0].y ?? 0)
		expect(ys).toEqual([...ys].sort((first, second) => first - second))
		expect(new Set(ys).size).toBe(50)
		expect(nodes.a.height).toBeGreaterThan(ys[49])
	})
})

describe('Sequence: simulate', () => {
	const flow = data(
		[life('a'), life('b')],
		[
			msg('m1', ['a', 'b'], 'sync', { label: 'Запрос', props: { latency: 120 } }),
			msg('m2', ['b', 'a'], 'reply', { label: 'Ответ', props: { latency: 'много' } }),
			msg('m3', ['a', 'b'], 'async'),
		],
	)

	it('сообщения идут по порядку связей, задержка берётся из props.latency', () => {
		const scenario = simulateSequence(buildFlowGraph(flow), {})
		expect(scenario).toMatchObject({ id: 'sequence-simulation', label: UI_FLOW_SEQUENCE.SIMULATION, timing: 'latency' })
		expect(scenario?.steps).toEqual([
			{ id: 'sequence-1', edge: 'm1', label: 'Запрос', via: 'sync', latency: 120 },
			{ id: 'sequence-2', edge: 'm2', label: 'Ответ', via: 'reply', latency: undefined },
			{ id: 'sequence-3', edge: 'm3', label: undefined, via: 'async', latency: undefined },
		])
	})

	it('без сообщений сценария нет', () => {
		expect(simulateSequence(buildFlowGraph(data([life('a')])), {})).toBeNull()
	})
})
