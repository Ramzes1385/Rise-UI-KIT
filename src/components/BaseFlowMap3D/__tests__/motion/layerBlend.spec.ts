import type { FlowMap3DSnapshot } from '../../types/internal/flowMap3dInternal.types'
import { BoxGeometry, BufferAttribute, BufferGeometry, Group, InstancedMesh, Mesh, MeshBasicMaterial } from 'three'
import { easeInOut, freeCulling, mixSlots, sameTopology, slotsOf, sourcesOf } from '../../model/motion/layers/layerBlend'

function meshOf(): Mesh {
	return new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial())
}

describe('slotsOf и sourcesOf', () => {
	it('собирают вершины мешей и матрицы экземпляров во вложенных объектах', () => {
		const root = new Group()
		const mesh = meshOf()
		const nested = new Group()
		const instanced = new InstancedMesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial(), 2)
		nested.add(instanced)
		root.add(mesh, nested)
		const slots = slotsOf([root])
		expect(slots).toHaveLength(2)
		expect(slots[0].attribute).toBe(mesh.geometry.getAttribute('position'))
		expect(slots[1].attribute).toBe(instanced.instanceMatrix)
		expect(slots[0].to).not.toBe(slots[0].attribute.array)
		expect(sourcesOf([root]).map(source => source.length)).toEqual(slots.map(slot => slot.to.length))
	})

	it('пропускают объекты с `noBlend` вместе с потомками и меши без вершин', () => {
		const root = new Group()
		const skipped = new Group()
		skipped.userData.noBlend = true
		skipped.add(meshOf())
		const bare = new Mesh(new BufferGeometry(), new MeshBasicMaterial())
		root.add(skipped, bare, new Group())
		expect(slotsOf([root])).toEqual([])
		expect(sourcesOf([root])).toEqual([])
	})
})

describe('mixSlots', () => {
	it('смешивает исходные и конечные значения по доле и просит обновить буфер', () => {
		const attribute = new BufferAttribute(new Float32Array([10, 20]), 1)
		const slots = [{ attribute, to: Float32Array.from([10, 20]) }]
		mixSlots(slots, [Float32Array.from([0, 0])], 0.25)
		expect(Array.from(attribute.array)).toEqual([2.5, 5])
		expect(attribute.version).toBeGreaterThan(0)
	})

	it('пропускает ячейки без исходных значений или другой длины', () => {
		const attribute = new BufferAttribute(new Float32Array([7, 7]), 1)
		mixSlots([{ attribute, to: Float32Array.from([1, 1]) }], [], 0.5)
		mixSlots([{ attribute, to: Float32Array.from([1, 1]) }], [Float32Array.from([0])], 0.5)
		expect(Array.from(attribute.array)).toEqual([7, 7])
	})
})

describe('freeCulling', () => {
	it('отключает отсечение кадром у всего, кроме `noBlend`', () => {
		const root = new Group()
		const kept = meshOf()
		kept.userData.noBlend = true
		const freed = meshOf()
		root.add(kept, freed)
		freeCulling([root])
		expect(freed.frustumCulled).toBe(false)
		expect(kept.frustumCulled).toBe(true)
	})
})

function snapshotOf(parts: {
	nodes?: string[]
	groups?: Array<[string, string, number]>
	edges?: Array<[string, string, number]>
}): FlowMap3DSnapshot {
	return {
		nodes: (parts.nodes ?? []).map(id => ({ id })),
		groups: (parts.groups ?? []).map(([id, base, depth]) => ({ id, base, depth })),
		edges: (parts.edges ?? []).map(([id, shape, count]) => ({ id, shape, points: new Array(count) })),
	} as unknown as FlowMap3DSnapshot
}

describe('sameTopology', () => {
	const base = snapshotOf({ nodes: ['a'], groups: [['g', 'plate', 0]], edges: [['e', 'ribbon', 3]] })

	it('одинаковое устройство — истина', () => {
		expect(sameTopology(base, snapshotOf({ nodes: ['a'], groups: [['g', 'plate', 0]], edges: [['e', 'ribbon', 3]] }))).toBe(true)
	})

	it('другие узлы, группы или связи — ложь', () => {
		expect(sameTopology(base, snapshotOf({ nodes: ['b'], groups: [['g', 'plate', 0]], edges: [['e', 'ribbon', 3]] }))).toBe(false)
		expect(sameTopology(base, snapshotOf({ nodes: ['a'], groups: [['g', 'dashed', 0]], edges: [['e', 'ribbon', 3]] }))).toBe(false)
		expect(sameTopology(base, snapshotOf({ nodes: ['a'], groups: [['g', 'plate', 0]], edges: [['e', 'ribbon', 4]] }))).toBe(false)
		expect(sameTopology(base, snapshotOf({ nodes: ['a', 'b'], groups: [['g', 'plate', 0]], edges: [['e', 'ribbon', 3]] }))).toBe(false)
	})
})

describe('easeInOut', () => {
	it('плавная кривая от 0 до 1, значения вне отрезка прижимаются', () => {
		expect(easeInOut(-1)).toBe(0)
		expect(easeInOut(0)).toBe(0)
		expect(easeInOut(0.25)).toBeCloseTo(0.0625)
		expect(easeInOut(0.5)).toBeCloseTo(0.5)
		expect(easeInOut(0.75)).toBeCloseTo(0.9375)
		expect(easeInOut(1)).toBe(1)
		expect(easeInOut(5)).toBe(1)
	})
})
