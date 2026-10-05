import { Vector3 } from 'three'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { createRouteTube, growRoute, routePoints } from '../../../model/scene/routeTube'
import { buildRouteGraph, findRoutePath, objectNodes } from '@components/BaseImageMap/model/routes/routeGraph'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	objects: [],
	routes: {
		nodes: [
			{ id: 'a', layer: 'f1', x: 0.1, y: 0.5 },
			{ id: 'b', layer: 'f1', x: 0.5, y: 0.5 },
			{ id: 'c', layer: 'f2', x: 0.6, y: 0.5 },
			{ id: 'd', layer: 'f2', x: 0.9, y: 0.5 },
		],
		edges: [
			['a', 'b'],
			['c', 'd'],
		],
		transitions: [{ id: 'lift', type: 'elevator', nodes: ['b', 'c'] }],
	},
}

function path() {
	const graph = buildRouteGraph({ routes: DATA.routes as NonNullable<ImageMap3DData['routes']>, layers: DATA.layers, isStepFree: false })
	const found = findRoutePath(graph, objectNodes(graph, { id: 'x', type: 'point', title: 'x', x: 0.1, y: 0.5 }, 'f1'), ['d'])
	return { graph, path: found as NonNullable<typeof found> }
}

describe('BaseImageMap3D: трубка маршрута', () => {
	it('точки по узлам и высотам этажей; на переходе — подъём по вертикали', () => {
		const { graph, path: found } = path()
		const points = routePoints(graph, found, DATA)
		const lift = 800 * 0.005 * 2
		expect(points.map(point => point.toArray())).toEqual([
			[80, lift, 200],
			[400, lift, 200],
			[400, 300 + lift, 200],
			[480, 300 + lift, 200],
			[720, 300 + lift, 200],
		])
	})

	it('трубка, метки начала и конца; рост — через drawRange, конец виден в конце', () => {
		const { graph, path: found } = path()
		const tube = createRouteTube(routePoints(graph, found, DATA), DATA)
		expect(tube?.group.name).toBe('rise-route')
		const total = tube?.geometry.index?.count as number
		growRoute(tube as NonNullable<typeof tube>, 0)
		expect(tube?.geometry.drawRange.count).toBe(0)
		expect(tube?.group.children[2].visible).toBe(false)
		growRoute(tube as NonNullable<typeof tube>, 0.5)
		const half = tube?.geometry.drawRange.count as number
		expect(half).toBeGreaterThan(0)
		expect(half).toBeLessThan(total)
		expect(half % 48).toBe(0)
		growRoute(tube as NonNullable<typeof tube>, 1)
		expect(tube?.geometry.drawRange.count).toBe(total)
		expect(tube?.group.children[2].visible).toBe(true)
	})

	it('путь из совпадающих точек — без трубки', () => {
		expect(createRouteTube([new Vector3(1, 2, 3), new Vector3(1, 2, 3)], DATA)).toBeNull()
	})
})
