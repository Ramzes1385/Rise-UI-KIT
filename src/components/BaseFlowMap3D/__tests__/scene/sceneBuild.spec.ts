import { Color, Group, Mesh } from 'three'
import { mockWebGL } from '../helpers/flowMap3d.test-utils'
import { buildGroups } from '../../model/scene/build/buildGroups'
import { createPalette } from '../../model/scene/flowMap3dPalette'
import { buildEdges } from '../../model/scene/build/edges/buildEdges'
import { buildBlobs } from '../../model/scene/build/layout/buildBlobs'
import { buildArrows } from '../../model/scene/build/edges/buildArrows'
import { createLabelBatch } from '../../model/scene/build/groundLabels'
import { buildLayout } from '../../model/scene/build/layout/buildLayout'
import { useFlowMap3DSnapshot } from '../../model/data/useFlowMap3DSnapshot'
import { buildLayers, flagsOfSnapshot } from '../../model/scene/buildLayers'
import { edge, fakeModel, group, node, rect, route } from '../helpers/fakeModel.test-utils'
import type { FlowMap3DEdgeItem, FlowMap3DSnapshot } from '../../types/internal/flowMap3dInternal.types'

const FULL = {
	groups: [
		group('g0', { model3d: { base: 'plate' } }),
		group('g1', { model3d: { base: 'dashed' } }),
		group('g2', { model3d: { base: 'none' } }),
	],
	groupRects: { g0: rect(0, 0, 200, 100), g1: rect(300, 0, 200, 100), g2: rect(600, 0, 200, 100) },
	nodes: [node('a', { group: 'g0' }), node('b', { group: 'g1' }), node('c', { group: 'g2' })],
	rects: { a: rect(40, 20, 80, 40), b: rect(340, 20, 80, 40), c: rect(640, 20, 80, 40) },
	edges: [edge('e1', 'a', 'b'), edge('e2', 'b', 'c')],
	routes: { e1: route([80, 40], [380, 40]), e2: route([380, 40], [680, 40]) },
	bounds: rect(0, 0, 800, 100),
}

function snapshotOf(parts: Record<string, unknown> = {}, isLayered = false): FlowMap3DSnapshot {
	return useFlowMap3DSnapshot(fakeModel({ ...FULL, ...parts }), () => isLayered).value
}

const paletteOf = () => createPalette(document.createElement('div'))

describe('buildGroups', () => {
	beforeEach(() => mockWebGL(true))

	it('пунктирная рамка и плита — по основанию группы, «none» не рисуется', () => {
		const built = buildGroups(snapshotOf().groups, paletteOf())
		expect(built.group.children).toHaveLength(2)
		const next = paletteOf()
		built.recolor(next)
	})

	it('при «Слоях» плиты верхних групп уступают ярусам; без групп и без плит — пусто', () => {
		const snapshot = snapshotOf({}, true)
		expect(buildGroups(snapshot.groups, paletteOf(), { hasSlabs: true }).group.children).toHaveLength(1)
		expect(buildGroups([], paletteOf()).group.children).toHaveLength(0)
		const onlyNone = snapshot.groups.filter(item => item.base === 'none')
		expect(buildGroups(onlyNone, paletteOf()).group.children).toHaveLength(0)
	})
})

describe('buildEdges', () => {
	beforeEach(() => mockWebGL(true))

	function itemsOf(): FlowMap3DEdgeItem[] {
		const [first, second] = snapshotOf().edges
		return [
			first,
			{ ...second, id: 'dashed', stroke: 'dashed' },
			{ ...first, id: 'dotted', stroke: 'dotted', color: 'var(--rise-error)' },
			{ ...second, id: 'tube', shape: 'tube' },
			{ ...first, id: 'tube2', shape: 'tube', color: 'var(--rise-success)' },
		]
	}

	it('связи группируются по форме, штриху и цвету: ленты и трубки в одной группе', () => {
		const edges = buildEdges(itemsOf(), paletteOf())
		expect(edges.group.children.length).toBe(6)
	})

	it('подсветка гасит остальные и рисует наложение только для лент; снятие возвращает', () => {
		const items = itemsOf()
		const edges = buildEdges(items, paletteOf())
		const overlay = edges.group.children.at(-1) as Group
		edges.setHighlight(new Set(['e1', 'tube']))
		expect(overlay.children).toHaveLength(1)
		edges.setHighlight(new Set(['tube']))
		expect(overlay.children).toHaveLength(0)
		edges.setHighlight(new Set(['e1']))
		edges.recolor(paletteOf())
		edges.setHighlight(null)
		expect(overlay.children).toHaveLength(0)
	})
})

describe('buildArrows', () => {
	beforeEach(() => mockWebGL(true))

	it('стрелки есть у связей с маркером; без маркеров — пустая сетка и безопасные вызовы', () => {
		const withArrows = buildArrows(snapshotOf().edges, paletteOf())
		expect(withArrows.mesh).not.toBeNull()
		withArrows.setOpacity(true)
		withArrows.recolor(paletteOf())
		withArrows.dispose()
		const none = buildArrows(snapshotOf({ edgeKind: { endMarker: 'none' } }).edges, paletteOf())
		expect(none.mesh).toBeNull()
		none.setOpacity(false)
		none.recolor(paletteOf())
		none.dispose()
		expect(buildArrows(snapshotOf({ edgeKind: { endMarker: undefined } }).edges, paletteOf()).mesh).toBeNull()
	})
})

describe('buildBlobs и подписи на земле', () => {
	beforeEach(() => mockWebGL(true))

	it('пятна — по числу узлов, для пустой сцены их нет', () => {
		const blobs = buildBlobs(snapshotOf())
		expect(blobs?.group.children).toHaveLength(1)
		blobs?.recolor(paletteOf())
		expect(buildBlobs(snapshotOf({ nodes: [], rects: {}, edges: [], routes: {} }))).toBeNull()
	})

	it('партия подписей: пустой атлас — нет сетки; метки без записи в атласе пропускаются; поворот переворачивает', () => {
		const material = { side: 0 }
		const atlas = (known: string[]) =>
			({
				material,
				get: (id: string) => (known.includes(id) ? { aspect: 2, u0: 0, u1: 1, v0: 0, v1: 1 } : undefined),
			}) as never
		const label = (id: string, angle = 0) => ({ id, text: id, x: 0, y: 0, z: 0, angle, height: 0.4, weight: 0 })
		expect(createLabelBatch(atlas([]), [label('a')]).mesh).toBeNull()
		const empty = createLabelBatch(atlas([]), [])
		expect(empty.orient(0)).toBe(false)
		empty.dispose()
		const batch = createLabelBatch(atlas(['a', 'b']), [label('a'), label('b', Math.PI), label('c')])
		expect(batch.mesh).toBeInstanceOf(Mesh)
		expect(batch.orient(0)).toBe(true)
		expect(batch.orient(0)).toBe(false)
		expect(batch.orient(Math.PI)).toBe(true)
		batch.dispose()
	})
})

describe('buildLayers', () => {
	beforeEach(() => mockWebGL(true))

	it('плоская сцена: плиты скрыты, стрелок и флагов нет; «Слои» их показывают', () => {
		const flat = buildLayers(snapshotOf(), paletteOf())
		expect(flat.flags).toEqual([])
		expect(flat.group.children[0].visible).toBe(false)
		const layered = buildLayers(snapshotOf({}, true), paletteOf())
		expect(layered.flags.length).toBeGreaterThan(0)
		layered.setBlend(0.5)
		layered.setBlend(2)
		layered.setBlend(-1)
		layered.recolor(paletteOf())
		flat.recolor(paletteOf())
		flat.setBlend(1)
	})

	it('стрелка между ярусами смотрит туда, где больше потока; без потока стрелки нет', () => {
		const down = snapshotOf({ edges: [edge('e1', 'b', 'a'), edge('e2', 'c', 'b')], routes: FULL.routes }, true)
		expect(buildLayers(down, paletteOf()).group.children).toHaveLength(2)
		const none = snapshotOf({ edges: [], routes: {} }, true)
		const arrows = buildLayers(none, paletteOf()).group.children[1] as Group
		expect(arrows.children).toHaveLength(0)
	})

	it('вложенная группа берёт ярус родителя; совпавшие и вертикальные центры не ломают стрелку', () => {
		const nested = snapshotOf(
			{
				groups: [...FULL.groups, group('g0c', { parent: 'g0' })],
				groupRects: { ...FULL.groupRects, g0c: rect(20, 20, 100, 60) },
				nodes: [node('a', { group: 'g0c' }), node('b', { group: 'g1' }), node('c', { group: 'g2' })],
			},
			true,
		)
		expect(buildLayers(nested, paletteOf()).group.children.length).toBe(2)
		const same = snapshotOf({}, true)
		const lifted = { ...same, groups: same.groups.map(item => ({ ...item, y: 0, rect: { x0: 0, z0: 0, x1: 2, z1: 2 } })) }
		expect((buildLayers(lifted, paletteOf()).group.children[1] as Group).children).toHaveLength(0)
		const vertical = {
			...same,
			groups: same.groups.map((item, index) => ({ ...item, y: index * 2.5, rect: { x0: 0, z0: 0, x1: 2, z1: 2 } })),
		}
		expect((buildLayers(vertical, paletteOf()).group.children[1] as Group).children.length).toBeGreaterThan(0)
	})

	it('родитель, которого нет среди групп, ярус не ломает', () => {
		const snapshot = snapshotOf({}, true)
		const orphan = {
			...snapshot,
			groups: snapshot.groups.map(item => (item.id === 'g0' ? { ...item, group: { ...item.group, parent: 'нет такой' } } : item)),
		}
		expect(buildLayers(orphan, paletteOf()).group.children).toHaveLength(2)
	})

	it('флаги — только у верхних групп с подписью', () => {
		const snapshot = snapshotOf({}, true)
		const flags = flagsOfSnapshot({
			...snapshot,
			groups: snapshot.groups.map(item => ({ ...item, label: item.id === 'g0' ? '' : item.label })),
		})
		expect(flags.map(flag => flag.id)).toEqual(['flag:g1'])
	})
})

describe('buildLayout', () => {
	beforeEach(() => mockWebGL(true))

	it('собирает корни по режимам: с ярусами и пятнами и без них', () => {
		const snapshot = snapshotOf()
		const plain = buildLayout(snapshot, paletteOf(), { hasSlabs: false, hasBlobs: false })
		expect(plain.blobs).toBeNull()
		const full = buildLayout(snapshot, paletteOf(), { hasSlabs: true, hasBlobs: true })
		expect(full.roots.length).toBe(plain.roots.length + 2)
		expect(new Color()).toBeDefined()
	})
})
