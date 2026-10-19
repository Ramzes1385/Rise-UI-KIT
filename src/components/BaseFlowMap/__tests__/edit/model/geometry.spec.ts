import { portsOf } from '../../../model/edit/geometry/editPorts'
import { snapMove } from '../../../model/edit/geometry/editSnap'
import type { FlowMapData } from '../../../types/data/flowData.types'
import { alignPositions, distributePositions } from '../../../model/edit/actions/editAlign'
import { buildClip, parseClip, pasteClip, PASTE_OFFSET } from '../../../model/edit/actions/editClipboard'
import {
	areaOf,
	centerOf,
	containsPoint,
	intersects,
	rectBetween,
	shifted,
	snapToGrid,
	toCanvas,
	toScreen,
	unionOf,
} from '../../../model/edit/geometry/editGeometry'

const rect = (x: number, y: number, size: [number, number] = [100, 50]) => ({ x, y, width: size[0], height: size[1] })

describe('геометрия правки', () => {
	const view = { viewport: { x: 10, y: 20, zoom: 2 }, box: { left: 100, top: 50 } as DOMRect }

	it('toCanvas и toScreen обратны друг другу; без рамки отступ нулевой', () => {
		const canvas = toCanvas({ clientX: 210, clientY: 170 }, view)
		expect(canvas).toEqual({ x: 50, y: 50 })
		expect(toScreen(canvas, view)).toEqual({ x: 110, y: 120 })
		expect(toCanvas({ clientX: 30, clientY: 40 }, { viewport: view.viewport, box: undefined })).toEqual({ x: 10, y: 10 })
	})

	it('прямоугольники: между точками, пересечение, содержание точки, объединение, центр, сдвиг, площадь', () => {
		expect(rectBetween({ x: 10, y: 40 }, { x: 4, y: 8 })).toEqual({ x: 4, y: 8, width: 6, height: 32 })
		expect(intersects(rect(0, 0), rect(99, 49))).toBe(true)
		expect(intersects(rect(0, 0), rect(100, 0))).toBe(false)
		expect(intersects(rect(0, 0), rect(0, 50))).toBe(false)
		expect(containsPoint(rect(0, 0), { x: 100, y: 50 })).toBe(true)
		expect(containsPoint(rect(0, 0), { x: 101, y: 10 })).toBe(false)
		expect(containsPoint(rect(0, 0), { x: -1, y: 10 })).toBe(false)
		expect(unionOf([rect(0, 0), rect(150, 100, [20, 20])])).toEqual({ x: 0, y: 0, width: 170, height: 120 })
		expect(centerOf(rect(10, 10, [100, 50]))).toEqual({ x: 60, y: 35 })
		expect(shifted(rect(1, 2), { x: 3, y: 4 })).toEqual(rect(4, 6))
		expect(areaOf(rect(0, 0, [10, 5]))).toBe(50)
	})

	it('snapToGrid: шаг сетки; нулевой шаг оставляет значение', () => {
		expect(snapToGrid(13, 8)).toBe(16)
		expect(snapToGrid(13, 0)).toBe(13)
	})
})

describe('порты узла', () => {
	it('без объявленных портов — четыре стороны по центрам', () => {
		const ports = portsOf(undefined, rect(0, 0, [100, 40]))
		expect(ports.map(port => [port.side, port.point.x, port.point.y])).toEqual([
			['top', 50, 0],
			['right', 100, 20],
			['bottom', 50, 40],
			['left', 0, 20],
		])
		expect(portsOf([], rect(0, 0, [100, 40]))).toHaveLength(4)
	})

	it('объявленные порты: сторона по умолчанию — справа, смещение и подпись', () => {
		const ports = portsOf(
			[
				{ id: 'in', side: 'left', offset: 0.25, label: 'вход' },
				{ id: 'out' },
				{ id: 'up', side: 'top' },
				{ id: 'down', side: 'bottom', offset: 1 },
			],
			rect(0, 0, [100, 40]),
		)
		expect(ports).toEqual([
			{ id: 'in', side: 'left', point: { x: 0, y: 10 }, label: 'вход' },
			{ id: 'out', side: 'right', point: { x: 100, y: 20 }, label: undefined },
			{ id: 'up', side: 'top', point: { x: 50, y: 0 }, label: undefined },
			{ id: 'down', side: 'bottom', point: { x: 100, y: 40 }, label: undefined },
		])
	})
})

describe('привязка при перемещении', () => {
	const base = { grid: 8, tolerance: 6, isGrid: true, isGuides: true }

	it('к сетке без соседей', () => {
		const result = snapMove({ ...base, moving: [rect(0, 0, [160, 56])], others: [], delta: { x: 13, y: 19 } })
		expect(result.delta).toEqual({ x: 16, y: 16 })
		expect(result.guides).toEqual([])
	})

	it('Alt (без привязки) и нулевая сетка не двигают дельту', () => {
		const free = snapMove({
			...base,
			isGrid: false,
			isGuides: false,
			moving: [rect(0, 0)],
			others: [rect(5, 5)],
			delta: { x: 3, y: 4 },
		})
		expect(free).toEqual({ delta: { x: 3, y: 4 }, guides: [] })
		const noGrid = snapMove({ ...base, grid: 0, moving: [rect(0, 0)], others: [], delta: { x: 3, y: 4 } })
		expect(noGrid.delta).toEqual({ x: 3, y: 4 })
	})

	it('к центру соседа: направляющая «центр» и расстояние между рамками', () => {
		const result = snapMove({ ...base, moving: [rect(0, 0, [60, 50])], others: [rect(0, 150)], delta: { x: 22, y: 0 } })
		expect(result.delta.x).toBe(20)
		const guide = result.guides.find(item => item.axis === 'x')
		expect(guide).toMatchObject({ at: 50, from: 0, to: 200 })
		expect(guide?.marks).toEqual([
			{ at: 100, size: 100 },
			{ at: 100, size: null },
		])
	})

	it('к краю соседа по обеим осям; соседи вплотную не дают метки расстояния', () => {
		const result = snapMove({ ...base, moving: [rect(0, 0)], others: [rect(300, 50)], delta: { x: 202, y: 52 } })
		expect(result.delta).toEqual({ x: 200, y: 50 })
		expect(result.guides.map(item => item.axis)).toEqual(['x', 'y'])
		const touching = result.guides[0]
		expect(touching.marks).toEqual([])
	})

	it('вне допуска сосед не влияет, срабатывает сетка', () => {
		const result = snapMove({ ...base, moving: [rect(0, 0)], others: [rect(500, 500)], delta: { x: 13, y: 13 } })
		expect(result.delta).toEqual({ x: 16, y: 16 })
		expect(result.guides).toEqual([])
	})
})

describe('выравнивание и распределение', () => {
	const items = [
		{ id: 'a', rect: rect(0, 0, [100, 40]) },
		{ id: 'b', rect: rect(200, 100, [60, 20]) },
		{ id: 'c', rect: rect(500, 30, [40, 80]) },
	]

	it('меньше двух узлов — ничего', () => {
		expect(alignPositions([items[0]], 'left')).toEqual({})
		expect(distributePositions(items.slice(0, 2), 'x')).toEqual({})
	})

	it.each([
		['left', { a: { x: 0, y: 0 }, b: { x: 0, y: 100 }, c: { x: 0, y: 30 } }],
		['right', { a: { x: 440, y: 0 }, b: { x: 480, y: 100 }, c: { x: 500, y: 30 } }],
		['center', { a: { x: 220, y: 0 }, b: { x: 240, y: 100 }, c: { x: 250, y: 30 } }],
		['top', { a: { x: 0, y: 0 }, b: { x: 200, y: 0 }, c: { x: 500, y: 0 } }],
		['bottom', { a: { x: 0, y: 80 }, b: { x: 200, y: 100 }, c: { x: 500, y: 40 } }],
		['middle', { a: { x: 0, y: 40 }, b: { x: 200, y: 50 }, c: { x: 500, y: 20 } }],
	] as const)('выровнять: %s', (mode, expected) => {
		expect(alignPositions(items, mode)).toEqual(expected)
	})

	it('распределить по x и по y — равные промежутки, крайние на месте', () => {
		const byX = distributePositions([items[2], items[0], items[1]], 'x')
		expect(byX.a).toEqual({ x: 0, y: 0 })
		expect(byX.c).toEqual({ x: 500, y: 30 })
		expect(byX.b.x).toBeCloseTo(270)
		const byY = distributePositions(items, 'y')
		expect(byY.a).toEqual({ x: 0, y: 0 })
		expect(byY.c.y).toBeCloseTo(30)
		expect(byY.b.y).toBeCloseTo(100)
		expect(Object.keys(byY)).toEqual(['a', 'c', 'b'])
	})
})

describe('буфер обмена', () => {
	const data: FlowMapData = {
		version: 1,
		nodes: [
			{ id: 'a', kind: 'service', label: 'A', position: { x: 10, y: 10 } },
			{ id: 'b', kind: 'service', label: 'B' },
			{ id: 'c', kind: 'service', label: 'C', group: 'g1' },
			{ id: 'd', kind: 'service', label: 'D' },
		],
		edges: [
			{ id: 'e1', source: 'a', target: 'b' },
			{ id: 'e2', source: 'a', target: 'd' },
			{ id: 'e3', source: 'c', target: 'a' },
		],
		groups: [
			{ id: 'g1', kind: 'zone', label: 'G1' },
			{ id: 'g2', kind: 'zone', label: 'G2', parent: 'g1' },
		],
	}

	it('buildClip берёт выбранное, содержимое выбранных групп и связи внутри набора; позицию — из раскладки', () => {
		const clip = buildClip(data, ['a', 'b', 'g1'], { b: { x: 5, y: 6 } })
		expect(clip.riseFlow).toBe(1)
		expect(clip.nodes.map(node => node.id)).toEqual(['a', 'b', 'c'])
		expect(clip.nodes.find(node => node.id === 'b')?.position).toEqual({ x: 5, y: 6 })
		expect(clip.nodes.find(node => node.id === 'a')?.position).toEqual({ x: 10, y: 10 })
		expect(clip.edges.map(edge => edge.id)).toEqual(['e1', 'e3'])
		expect(clip.groups.map(group => group.id)).toEqual(['g1'])
		expect(buildClip({ version: 1, nodes: [], edges: [] }, [], {}).groups).toEqual([])
	})

	it('parseClip принимает только свой формат', () => {
		expect(parseClip(JSON.stringify({ riseFlow: 1, nodes: [] }))).toEqual({ riseFlow: 1, nodes: [], edges: [], groups: [] })
		expect(parseClip('не json')).toBeNull()
		expect(parseClip('null')).toBeNull()
		expect(parseClip(JSON.stringify({ riseFlow: 2, nodes: [] }))).toBeNull()
		expect(parseClip(JSON.stringify({ riseFlow: 1, nodes: 'x' }))).toBeNull()
		const full = { riseFlow: 1, nodes: [{ id: 'n' }], edges: [{ id: 'e' }], groups: [{ id: 'g' }] }
		expect(parseClip(JSON.stringify(full))).toEqual(full)
	})

	it('pasteClip даёт новые id, переносит ссылки на группы и родителей, сдвигает на 24 px и закрепляет', () => {
		const clip = buildClip(data, ['a', 'b', 'g1', 'g2'], { b: { x: 5, y: 6 } })
		const pasted = pasteClip(data, clip, { x: PASTE_OFFSET, y: PASTE_OFFSET })
		const oldIds = new Set(['a', 'b', 'c', 'd', 'e1', 'e2', 'e3', 'g1', 'g2'])
		for (const item of [...pasted.nodes, ...pasted.edges, ...pasted.groups]) expect(oldIds.has(item.id)).toBe(false)
		expect(new Set([...pasted.nodes, ...pasted.edges, ...pasted.groups].map(item => item.id)).size).toBe(
			pasted.nodes.length + pasted.edges.length + pasted.groups.length,
		)
		const [first] = pasted.nodes
		expect(first.position).toEqual({ x: 34, y: 34 })
		expect(first.isPinned).toBe(true)
		const child = pasted.groups.find(group => group.label === 'G2')
		const parent = pasted.groups.find(group => group.label === 'G1')
		expect(child?.parent).toBe(parent?.id)
		expect(parent?.parent).toBeUndefined()
		const inGroup = pasted.nodes.find(node => node.label === 'C')
		expect(inGroup?.group).toBe(parent?.id)
		expect(pasted.nodes.find(node => node.label === 'B')?.group).toBeUndefined()
		const ids = new Set(pasted.nodes.map(node => node.id))
		expect(pasted.edges.every(edge => ids.has(edge.source) && ids.has(edge.target) && edge.points === undefined)).toBe(true)
	})

	it('pasteClip: узлы без позиции остаются без неё, связь с чужим концом отбрасывается', () => {
		const clip = parseClip(
			JSON.stringify({
				riseFlow: 1,
				nodes: [
					{ id: 'x', kind: 'service', label: 'X' },
					{ id: 'y', kind: 'service', label: 'Y', isPinned: false },
				],
				edges: [
					{ id: 'q', source: 'x', target: 'y' },
					{ id: 'w', source: 'x', target: 'nowhere' },
				],
			}),
		)!
		const pasted = pasteClip(data, clip, { x: 24, y: 24 })
		expect(pasted.nodes.map(node => node.position)).toEqual([undefined, undefined])
		expect(pasted.nodes[1].isPinned).toBe(false)
		expect(pasted.edges).toHaveLength(1)
		expect(pasted.groups).toEqual([])
	})
})
