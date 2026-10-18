import { edge, group, map, node } from '../fixtures/flowData'
import { clipToShape } from '../../../../model/routing/shapes'
import { computeRoutes } from '../../../../model/layout/flowRoutes'
import { createRandom, pickOne, randomInt } from '../fixtures/seeded'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import { orthogonalRouter } from '../../../../model/routing/orthogonal'
import { createLayoutRegistry } from '../../../../model/layout/registry'
import { createLayoutInput } from '../../../../model/layout/flowLayoutInput'
import { createScope, hasOverlaps, isInside, notationWith, plainNotation } from '../fixtures/layoutScope'

describe('вход раскладки', () => {
	it('узел svg-вида получает размер вида, а не по подписи', () => {
		const data = map({
			notation: 'rules',
			nodes: [node('f', { kind: 'free', label: 'Очень длинная подпись узла, которая не должна менять размер' })],
		})
		const { nodes } = runFlowLayout(createScope(data, { notation: notationWith() }))
		expect(nodes.f).toMatchObject({ width: 30, height: 30 })
	})

	it('стороны связи берутся из портов узла или вида; неизвестные порты и узлы дают undefined', () => {
		const data = map({
			notation: 'rules',
			nodes: [
				node('s', { kind: 'store' }),
				node('t', { kind: 'task', ports: [{ id: 'top', side: 'top' }] }),
				node('u', { kind: 'task' }),
			],
			edges: [
				edge('1', ['s', 't'], { sourcePort: 'out', targetPort: 'top' }),
				edge('2', ['s', 'u'], { sourcePort: 'nothing', targetPort: 'x' }),
				edge('3', ['s', 'ghost'], { targetPort: 'x' }),
				edge('4', ['ghost', 'u']),
			],
		})
		const input = createLayoutInput(createScope(data, { notation: notationWith() }))
		const byId = Object.fromEntries(input.edges.map(item => [item.id, item]))
		expect(byId['1']).toMatchObject({ sourceSide: 'right', targetSide: 'top' })
		expect(byId['2']).toMatchObject({ sourceSide: undefined, targetSide: undefined })
		expect(byId['3'].targetSide).toBeUndefined()
		expect(byId['4'].sourceSide).toBeUndefined()
	})

	it('заголовки групп: start даёт ширину, top — высоту', () => {
		const data = map({ groups: [group('l', { kind: 'lane' }), group('z', { kind: 'zone' })] })
		const input = createLayoutInput(createScope(data, { notation: plainNotation }))
		expect(input.groups.find(item => item.id === 'l')?.header).toEqual({ width: 28, height: 0 })
		expect(input.groups.find(item => item.id === 'z')?.header).toEqual({ width: 0, height: 32 })
	})

	it('algorithm: undefined в данных возвращает к layered', () => {
		const data = map({ nodes: [node('a')], layout: { algorithm: undefined, gridSize: 0 } })
		const scope = createScope(data)
		expect(Object.keys(runFlowLayout({ ...scope, data: { ...data, layout: { algorithm: undefined, gridSize: 0 } } }).nodes)).toEqual([
			'a',
		])
	})

	it('реестр раскладок: layered и manual встроены, повтор id предупреждает', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		expect([...createLayoutRegistry([]).keys()]).toEqual(['layered', 'manual'])
		expect(warn).not.toHaveBeenCalled()
		createLayoutRegistry([{ id: 'layered', run: () => ({ nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } }) }])
		expect(warn).toHaveBeenCalledTimes(1)
		warn.mockRestore()
	})

	it('группы с одинаковым order сохраняют порядок в списке', () => {
		const data = map({
			groups: [group('b', { kind: 'lane', order: 1 }), group('a', { kind: 'lane', order: 1 })],
			nodes: [node('x', { group: 'b' }), node('y', { group: 'a' })],
		})
		const { groups } = runFlowLayout(createScope(data, { notation: plainNotation, layout: { direction: 'LR' } }))
		expect(groups.b.y).toBeLessThan(groups.a.y)
	})
})

describe('сложные вложенности групп', () => {
	it('полоса внутри яруса и ярус с пирами: узлы не пересекаются, всё конечно и детерминировано', () => {
		const data = map({
			groups: [
				group('t1', { kind: 'layer' }),
				group('t2', { kind: 'layer' }),
				group('l1', { kind: 'lane', parent: 't1' }),
				group('l2', { kind: 'lane', parent: 't1' }),
				group('l3', { kind: 'lane' }),
				group('stray', { kind: 'lane', parent: 't2' }),
			],
			nodes: [
				node('a', { group: 'l1' }),
				node('b', { group: 'l2' }),
				node('c', { group: 'l1' }),
				node('d', { group: 'l2' }),
				node('e', { group: 't2' }),
				node('f', { group: 'l3' }),
				node('g', { group: 'stray' }),
			],
			edges: [
				edge('1', ['a', 'b']),
				edge('2', ['c', 'd']),
				edge('3', ['a', 'd']),
				edge('4', ['b', 'e']),
				edge('5', ['e', 'f']),
				edge('6', ['f', 'g']),
			],
		})
		const scope = createScope(data, { notation: plainNotation, layout: { direction: 'TB' } })
		const first = runFlowLayout(scope)
		expect(hasOverlaps(Object.values(first.nodes))).toBe(false)
		expect(Object.values(first.nodes).every(rect => Number.isFinite(rect.x + rect.y + rect.width + rect.height))).toBe(true)
		expect(runFlowLayout(scope)).toEqual(first)
	})

	it('случайные карты с полосами, ярусами и рамками (200 зёрен): узлы не пересекаются, полосы содержат узлы', () => {
		const kinds = ['lane', 'layer', 'zone'] as const
		let checked = 0
		for (let seed = 1; seed <= 200; seed += 1) {
			const random = createRandom(seed)
			const groups = Array.from({ length: 1 + randomInt(random, 4) }, (_, index) =>
				group(`g${index}`, { kind: pickOne(random, kinds) }),
			)
			const nodes = Array.from({ length: 2 + randomInt(random, 9) }, (_, index) =>
				node(`n${index}`, { group: random() < 0.7 ? pickOne(random, groups).id : undefined }),
			)
			const edges = Array.from({ length: randomInt(random, 12) }, (_, index) =>
				edge(`e${index}`, [pickOne(random, nodes).id, pickOne(random, nodes).id]),
			)
			const direction = pickOne(random, ['LR', 'RL', 'TB', 'BT'] as const)
			const result = runFlowLayout(createScope(map({ groups, nodes, edges }), { notation: plainNotation, layout: { direction } }))
			expect(Object.keys(result.nodes).length, `зерно ${seed}`).toBe(nodes.length)
			expect(hasOverlaps(Object.values(result.nodes)), `зерно ${seed}`).toBe(false)
			checked += 1
			for (const item of nodes) {
				const strip = item.group ? result.groups[item.group] : undefined
				const kind = groups.find(candidate => candidate.id === item.group)?.kind
				if (strip && kind !== 'zone') expect(isInside(result.nodes[item.id], strip), `зерно ${seed} ${item.id}`).toBe(true)
			}
		}
		expect(checked).toBeGreaterThan(0)
	})

	it('лишняя группа-пул с вложенной дорожкой без узлов не ломает раскладку', () => {
		const data = map({
			groups: [
				group('pool', { kind: 'pool' }),
				group('lane', { kind: 'lane', parent: 'pool' }),
				group('zone', { kind: 'zone', parent: 'lane' }),
			],
			nodes: [node('a', { group: 'zone' })],
		})
		const { groups } = runFlowLayout(createScope(data, { notation: plainNotation }))
		expect(groups.pool).toBeDefined()
	})
})

describe('маршруты: редкие пути', () => {
	it('связь, которой нет среди связей раскладки, пропускается', () => {
		const data = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'b']), edge('2', ['b', 'a'])] })
		const scope = createScope(data, { layout: { direction: 'LR' } })
		const layout = runFlowLayout(scope)
		const subset = createLayoutInput(scope).edges.filter(item => item.id === '1')
		expect(Object.keys(computeRoutes(scope, layout, subset))).toEqual(['1'])
	})

	it('маршрутизатор плагина может вернуть нулевые отрезки — путь остаётся корректным', () => {
		const a = { x: 10, y: 10 }
		const route = () => [a, a, { x: 50, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 10 }]
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const data = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'b'], { routing: 'orthogonal' })] })
		const scope = createScope(data, { routers: [{ id: 'orthogonal', route }] })
		const layout = runFlowLayout(scope)
		const routes = computeRoutes(scope, layout, createLayoutInput(scope).edges)
		expect(routes['1'].path).toMatch(/^M10 10 L10 10/)
		expect(routes['1'].path).not.toContain('NaN')
		warn.mockRestore()
	})

	it('ортогональная связь огибает с той стороны, где короче', () => {
		const source = { x: 0, y: 0, width: 100, height: 50 }
		const tall = { x: 300, y: 0, width: 100, height: 200 }
		const horizontal = orthogonalRouter.route(
			{ id: 'e', source: 'a', target: 'b', sourceSide: 'left', targetSide: 'left' },
			{ source, target: tall, obstacles: [] },
		)
		expect(Math.min(...horizontal.map(point => point.y))).toBeLessThan(0)
		const wide = { x: 0, y: 300, width: 200, height: 50 }
		const vertical = orthogonalRouter.route(
			{ id: 'e', source: 'a', target: 'b', sourceSide: 'top', targetSide: 'top' },
			{ source: { x: 100, y: 0, width: 100, height: 50 }, target: wide, obstacles: [] },
		)
		expect(vertical.length).toBeGreaterThan(2)
		const left = orthogonalRouter.route(
			{ id: 'e', source: 'a', target: 'b', sourceSide: 'top', targetSide: 'top' },
			{ source: { x: 0, y: 0, width: 100, height: 50 }, target: wide, obstacles: [] },
		)
		expect(Math.min(...left.map(point => point.x))).toBeLessThan(0)
		expect(vertical.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
	})

	it('луч, параллельный ребру многоугольника, находит остальные рёбра', () => {
		const rect = { x: 0, y: 0, width: 100, height: 50 }
		for (const shape of ['parallelogram', 'hexagon', 'diamond'] as const) {
			const point = clipToShape(shape, rect, { x: 500, y: 25 })
			expect(point.y).toBeCloseTo(25, 6)
			expect(point.x).toBeGreaterThan(50)
		}
		const top = clipToShape('parallelogram', rect, { x: 50, y: -500 })
		expect(top.y).toBe(0)
	})
})
