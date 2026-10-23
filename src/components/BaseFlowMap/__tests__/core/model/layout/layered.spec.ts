import { edge, map, node } from '../fixtures/flowData'
import { runFlowLayout } from '../../../../model/layout/useFlowLayout'
import { buildLayeredGraph } from '../../../../model/layout/layered/graph'
import type { FlowDirection } from '../../../../types/data/flowData.types'
import { createScope, hasOverlaps, isInside } from '../fixtures/layoutScope'

const chain = map({
	nodes: [node('a', { label: 'A' }), node('b', { label: 'B' }), node('c', { label: 'C' }), node('d', { label: 'D' })],
	edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c']), edge('3', ['a', 'd'])],
})

function layoutOf(direction: FlowDirection, data = chain) {
	return runFlowLayout(createScope(data, { layout: { direction } }))
}

describe('связь узла с самим собой', () => {
	it('петля не ломает раскладку', () => {
		const data = map({ nodes: [node('a'), node('b')], edges: [edge('loop', ['a', 'a']), edge('e', ['a', 'b'])] })
		const { nodes } = runFlowLayout(createScope(data))
		expect(Object.keys(nodes).sort()).toEqual(['a', 'b'])
		expect(hasOverlaps(Object.values(nodes))).toBe(false)
	})
})

describe('граф ярусов: связи внутри яруса', () => {
	const vertex = (layer: number) => ({ id: `v${layer}`, isDummy: false, main: 10, cross: 10, band: 0, layer, mainPos: 0, crossPos: 0 })

	it('связь двух узлов одного яруса запоминается как соседская; связь узла с самим собой — нет', () => {
		const graph = buildLayeredGraph(
			[vertex(0), vertex(0), vertex(1)],
			[
				[0, 1],
				[1, 1],
				[0, 2],
			],
		)
		expect(graph.peers).toEqual([[0, 1]])
		expect(graph.layers[0]).toEqual([0, 1])
	})
})

describe('раскладка layered: направления', () => {
	it('LR: ярусы растут вправо, TB: вниз, RL: влево, BT: вверх', () => {
		const lr = layoutOf('LR').nodes
		const tb = layoutOf('TB').nodes
		const rl = layoutOf('RL').nodes
		const bt = layoutOf('BT').nodes
		expect(lr.a.x).toBeLessThan(lr.b.x)
		expect(lr.b.x).toBeLessThan(lr.c.x)
		expect(tb.a.y).toBeLessThan(tb.b.y)
		expect(tb.b.y).toBeLessThan(tb.c.y)
		expect(rl.a.x).toBeGreaterThan(rl.b.x)
		expect(rl.b.x).toBeGreaterThan(rl.c.x)
		expect(bt.a.y).toBeGreaterThan(bt.b.y)
		expect(bt.b.y).toBeGreaterThan(bt.c.y)
	})

	it('направления симметричны: RL зеркалит LR, BT зеркалит TB, поперечные координаты совпадают', () => {
		const lr = layoutOf('LR')
		const rl = layoutOf('RL')
		const tb = layoutOf('TB')
		const bt = layoutOf('BT')
		expect(rl.bounds).toEqual(lr.bounds)
		expect(bt.bounds).toEqual(tb.bounds)
		for (const id of ['a', 'b', 'c', 'd']) {
			expect(rl.nodes[id].y).toBe(lr.nodes[id].y)
			expect(rl.nodes[id].x + rl.nodes[id].width).toBeCloseTo(lr.bounds.width - lr.nodes[id].x, 5)
			expect(bt.nodes[id].x).toBe(tb.nodes[id].x)
			expect(bt.nodes[id].y + bt.nodes[id].height).toBeCloseTo(tb.bounds.height - tb.nodes[id].y, 5)
		}
	})

	it('в каждом направлении узлы не налезают друг на друга, границы охватывают всё', () => {
		for (const direction of ['LR', 'RL', 'TB', 'BT'] as const) {
			const result = layoutOf(direction)
			const rects = Object.values(result.nodes)
			expect(hasOverlaps(rects), direction).toBe(false)
			expect(
				rects.every(rect =>
					isInside(rect, { ...result.bounds, width: result.bounds.width + 0.001, height: result.bounds.height + 0.001 }),
				),
				direction,
			).toBe(true)
			expect(result.bounds).toMatchObject({ x: 0, y: 0 })
		}
	})

	it('раскладка детерминирована: повторный запуск даёт тот же результат', () => {
		const first = layoutOf('LR')
		expect(layoutOf('LR')).toEqual(first)
	})

	it('пустая карта — пустой результат', () => {
		const result = runFlowLayout(createScope(map()))
		expect(result).toEqual({ nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })
	})

	it('цикл в связях не ломает раскладку, все узлы получают места', () => {
		const ring = map({
			nodes: [node('a'), node('b'), node('c')],
			edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c']), edge('3', ['c', 'a']), edge('4', ['a', 'a'])],
		})
		const result = layoutOf('LR', ring)
		expect(Object.keys(result.nodes).sort()).toEqual(['a', 'b', 'c'])
		expect(hasOverlaps(Object.values(result.nodes))).toBe(false)
		expect(Object.values(result.nodes).every(rect => Number.isFinite(rect.x) && Number.isFinite(rect.y))).toBe(true)
	})

	it('связи на неизвестные узлы игнорируются', () => {
		const dangling = map({ nodes: [node('a'), node('b')], edges: [edge('1', ['a', 'ghost']), edge('2', ['ghost', 'b'])] })
		expect(Object.keys(layoutOf('LR', dangling).nodes)).toEqual(['a', 'b'])
	})

	it('узлы без связей лежат в первом ярусе', () => {
		const lonely = map({ nodes: [node('a'), node('b'), node('c')], edges: [edge('1', ['a', 'b'])] })
		const result = layoutOf('LR', lonely).nodes
		expect(result.c.x).toBe(result.a.x)
	})

	it('размер узла: по подписи, но не меньше вида и не больше 320; явный size главнее', () => {
		const sized = map({
			nodes: [
				node('short', { label: 'x' }),
				node('long', { label: 'Очень-очень длинная подпись узла '.repeat(6) }),
				node('fixed', { size: { width: 500, height: 90 } }),
				node('half', { size: { height: 30 } }),
			],
		})
		const nodes = layoutOf('LR', sized).nodes
		expect(nodes.long.width).toBe(320)
		expect(nodes.short.width).toBeLessThan(nodes.long.width)
		expect(nodes.fixed).toMatchObject({ width: 500, height: 90 })
		expect(nodes.half.height).toBe(30)
	})

	it('компактный режим: плитки 72×56 и перенос рядов', () => {
		const wide = map({ nodes: Array.from({ length: 6 }, (_, index) => node(`n${index}`)) })
		const scope = createScope(wide, { isCompact: true })
		const result = runFlowLayout(scope)
		expect(Object.values(result.nodes).every(rect => rect.width === 72 && rect.height === 56)).toBe(true)
		const sized = createScope(map({ nodes: [node('a', { size: { width: 200 } })] }), { isCompact: true })
		expect(runFlowLayout(sized).nodes.a.width).toBe(200)
	})

	it('узлы с kind и props доходят до алгоритма (контракт v5)', () => {
		const run = vi.fn(() => ({ nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } }))
		const data = map({ nodes: [node('a', { kind: 'database', props: { engine: 'pg' } }), node('b')], layout: { algorithm: 'spy' } })
		runFlowLayout(createScope(data, { layouts: [{ id: 'spy', run }] }))
		const input = (run.mock.calls[0] as unknown as [{ nodes: { id: string; kind: string; props?: unknown; order: number }[] }])[0]
		expect(input.nodes[0]).toMatchObject({ id: 'a', kind: 'database', props: { engine: 'pg' }, order: 0 })
		expect(input.nodes[1]).toMatchObject({ id: 'b', kind: 'service', order: 1 })
	})

	it('неизвестный алгоритм — предупреждение и запасной layered; нет и запасного — пустой результат', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
		const scope = createScope(chain, { layout: { algorithm: 'nope' } })
		expect(Object.keys(runFlowLayout(scope).nodes)).toHaveLength(4)
		expect(warn).toHaveBeenCalledTimes(1)
		expect(warn.mock.calls[0][0]).toContain('nope')
		const bare = { ...scope, layouts: new Map() }
		expect(runFlowLayout(bare)).toEqual({ nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } })
		warn.mockRestore()
	})

	it('настройки: переопределения и запуск главнее данных; шаг сетки округляет координаты', () => {
		const loose = runFlowLayout(createScope(chain, { layout: { direction: 'LR', rankGap: 80 } })).nodes
		const tight = runFlowLayout(createScope(chain, { layout: { direction: 'LR', rankGap: 80 }, overrides: { rankGap: 200 } })).nodes
		expect(tight.b.x - tight.a.x).toBeGreaterThan(loose.b.x - loose.a.x)
		const snapped = runFlowLayout(createScope(chain, { layout: { direction: 'LR', gridSize: 10 } })).nodes
		expect(Object.values(snapped).every(rect => rect.x % 10 === 0 && rect.y % 10 === 0)).toBe(true)
	})
})

describe('закреплённые узлы и layout({ ids })', () => {
	const pinned = map({
		nodes: [node('a', { isPinned: true, position: { x: 400, y: 300 } }), node('b'), node('c')],
		edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c'])],
	})

	it('закреплённый узел остаётся на месте, остальные его не перекрывают', () => {
		const result = runFlowLayout(createScope(pinned, { layout: { direction: 'LR' } }))
		expect(result.nodes.a).toMatchObject({ x: 400, y: 300 })
		expect(hasOverlaps(Object.values(result.nodes))).toBe(false)
	})

	it('если закреплённый узел перекрывает свободный, свободный сдвигается по направлению раскладки', () => {
		const clash = (direction: FlowDirection) => {
			const free = map({ nodes: [node('a'), node('b')] })
			const spot = runFlowLayout(createScope(free, { layout: { direction } })).nodes.b
			const data = map({ nodes: [node('a', { isPinned: true, position: { x: spot.x, y: spot.y } }), node('b')] })
			return { spot, nodes: runFlowLayout(createScope(data, { layout: { direction } })).nodes }
		}
		const lr = clash('LR')
		expect(lr.nodes.a).toMatchObject({ x: lr.spot.x, y: lr.spot.y })
		expect(lr.nodes.b.x).toBe(lr.nodes.a.x + lr.nodes.a.width + 16)
		const rl = clash('RL')
		expect(rl.nodes.b.x).toBe(rl.nodes.a.x - rl.nodes.b.width - 16)
		const tb = clash('TB')
		expect(tb.nodes.b.y).toBe(tb.nodes.a.y + tb.nodes.a.height + 16)
		const bt = clash('BT')
		expect(bt.nodes.b.y).toBe(bt.nodes.a.y - bt.nodes.b.height - 16)
	})

	it('isForced раскладывает и закреплённые', () => {
		const forced = runFlowLayout(createScope(pinned, { layout: { direction: 'LR' } }), { isForced: true }).nodes
		expect(forced.a).not.toMatchObject({ x: 400, y: 300 })
	})

	it('manual: узлы с позицией стоят где сказано, остальные раскладываются', () => {
		const data = map({
			nodes: [node('a', { position: { x: 123, y: 45 } }), node('b')],
			edges: [edge('1', ['a', 'b'])],
			layout: { algorithm: 'manual' },
		})
		const result = runFlowLayout(createScope(data)).nodes
		expect(result.a).toMatchObject({ x: 123, y: 45 })
		expect(result.b).toBeDefined()
	})

	it('ids: двигаются только перечисленные, остальные стоят на текущих местах', () => {
		const data = map({
			nodes: [node('a', { position: { x: 7, y: 9 } }), node('b'), node('c')],
			edges: [edge('1', ['a', 'b']), edge('2', ['b', 'c'])],
		})
		const scope = createScope(data, { layout: { direction: 'LR' } })
		const current = new Map([
			['a', { x: 1000, y: 1000 }],
			['b', { x: 2000, y: 2000 }],
			['c', { x: 3000, y: 3000 }],
		])
		const result = runFlowLayout(scope, { ids: ['c'], current }).nodes
		expect(result.a).toMatchObject({ x: 1000, y: 1000 })
		expect(result.b).toMatchObject({ x: 2000, y: 2000 })
		expect(result.c.x).not.toBe(3000)
		const noCurrent = runFlowLayout(scope, { ids: ['c'] }).nodes
		expect(noCurrent.a).toMatchObject({ x: 7, y: 9 })
	})
})
