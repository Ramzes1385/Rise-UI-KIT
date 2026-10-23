import { ref } from 'vue'
import { groupRects } from '../../model/data/snapshotPlan'
import { useFlowMap3DSnapshot } from '../../model/data/useFlowMap3DSnapshot'
import { edge, fakeModel, group, node, rect, route } from '../helpers/fakeModel.test-utils'

const FULL = {
	groups: [group('g0'), group('g1')],
	groupRects: { g0: rect(0, 0, 200, 100), g1: rect(300, 0, 200, 100) },
	nodes: [node('a', { group: 'g0' }), node('b', { group: 'g1', model3d: { elevation: 1 } })],
	rects: { a: rect(40, 20, 80, 40), b: rect(340, 20, 80, 40) },
	edges: [edge('e', 'a', 'b')],
	routes: { e: route([80, 40], [380, 40]) },
	bounds: rect(0, 0, 500, 100),
}

describe('useFlowMap3DSnapshot', () => {
	it('собирает узлы, группы и связи из раскладки модели', () => {
		const snapshot = useFlowMap3DSnapshot(fakeModel(FULL), () => false).value
		expect(snapshot.nodes.map(item => item.id)).toEqual(['a', 'b'])
		expect(snapshot.groups.map(item => item.id)).toEqual(['g0', 'g1'])
		expect(snapshot.edges.map(item => item.id)).toEqual(['e'])
		expect(snapshot.unit).toBe(40)
		expect(snapshot.origin).toEqual({ x: 5.75, z: 1 })
		expect(snapshot.cell.width).toBeCloseTo(0.8)
		expect(snapshot.cell.height).toBeCloseTo(0.96)
		expect(snapshot.isLayered).toBe(false)
		expect(snapshot.bounds.x1).toBeGreaterThan(snapshot.bounds.x0)
		expect(snapshot.height).toBeCloseTo(1 + 1.35 * 1.4)
	})

	it('единица плана и расстояние ярусов берутся из `view3d`', () => {
		const snapshot = useFlowMap3DSnapshot(fakeModel({ ...FULL, view3d: { unit: 20, levelGap: 4 } }), () => true).value
		expect(snapshot.unit).toBe(20)
		expect(snapshot.nodes[1].base).toBe(4)
	})

	it('пересчитывается при смене «Слоёв»', () => {
		const isLayered = ref(false)
		const snapshot = useFlowMap3DSnapshot(fakeModel(FULL), () => isLayered.value)
		expect(snapshot.value.nodes[1].base).toBe(0)
		isLayered.value = true
		expect(snapshot.value.isLayered).toBe(true)
		expect(snapshot.value.nodes[1].base).toBe(2.5)
	})

	it('пустая карта даёт единичную рамку и минимальную высоту', () => {
		const snapshot = useFlowMap3DSnapshot(fakeModel({ groups: undefined }), () => false).value
		expect(snapshot.bounds).toEqual({ x0: 0, z0: 0, x1: 1, z1: 1 })
		expect(snapshot.height).toBe(1.35)
		expect(snapshot.cell.width).toBeCloseTo(0.8)
	})
})

describe('groupRects', () => {
	it('вложенная группа без рамки и без узлов рамки не получает и родителя не ломает', () => {
		const model = fakeModel({
			groups: [group('p'), group('c', { parent: 'p' })],
			groupRects: {},
			nodes: [],
			rects: {},
			edges: [],
			routes: {},
		})
		expect(groupRects(model).size).toBe(0)
	})
})
