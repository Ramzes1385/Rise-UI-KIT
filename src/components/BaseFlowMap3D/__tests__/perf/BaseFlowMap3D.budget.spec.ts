import type { Object3D } from 'three'
import { InstancedMesh, Mesh } from 'three'
import { useFlowMap3DEnvironment } from '../helpers/flowMap3d.test-utils'
import type { FlowMapData } from '@components/BaseFlowMap/types/data/flowData.types'

const env = useFlowMap3DEnvironment()

const KINDS = ['database', 'queue', 'service', 'cache', 'gateway', 'client']

const BIG: FlowMapData = {
	version: 1,
	title: 'Большая',
	nodes: Array.from({ length: 300 }, (_, index) => ({ id: `n${index}`, label: `Узел ${index}`, kind: KINDS[index % KINDS.length] })),
	edges: Array.from({ length: 450 }, (_, index) => ({
		id: `e${index}`,
		source: `n${index % 300}`,
		target: `n${(index * 7 + 1) % 300}`,
	})).filter(edge => edge.source !== edge.target),
}

function measure(root: Object3D) {
	let drawCalls = 0
	let triangles = 0
	const geometries = new Set<unknown>()
	root.traverse(object => {
		if (!(object instanceof Mesh) || !object.visible) return
		drawCalls += 1
		geometries.add(object.geometry)
		const { index, attributes } = object.geometry
		const base = index ? index.count / 3 : (attributes.position?.count ?? 0) / 3
		triangles += object instanceof InstancedMesh ? base * object.count : base
	})
	return { drawCalls, triangles, geometries: geometries.size }
}

describe('BaseFlowMap3D: бюджет сцены на 300 узлов', () => {
	it('геометрий не больше 80', async () => {
		const map = await env.renderMap({ data: BIG })
		const result = measure(map.scene())
		expect(result.triangles).toBeGreaterThan(0)
		expect(result.geometries).toBeLessThanOrEqual(80)
	}, 60_000)

	it('треугольников не больше 350 тыс.', async () => {
		const map = await env.renderMap({ data: BIG })
		expect(measure(map.scene()).triangles).toBeLessThanOrEqual(350_000)
	}, 60_000)

	it('вызовов отрисовки не больше 60', async () => {
		const map = await env.renderMap({ data: BIG })
		expect(measure(map.scene()).drawCalls).toBeLessThanOrEqual(60)
	}, 60_000)
})
