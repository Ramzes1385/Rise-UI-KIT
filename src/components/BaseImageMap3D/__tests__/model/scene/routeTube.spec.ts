import { Vector3 } from 'three'
import type { ImageMap3DData } from '../../../types/imageMap3dData.types'
import { createRouteTube, growRoute, routePoints, routeSegments } from '../../../model/scene/routeTube'
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
		const tube = createRouteTube(routeSegments({ graph, path: found }, DATA), DATA)
		expect(tube?.group.name).toBe('rise-route')
		const total = tube?.geometries[0].index?.count as number
		growRoute(tube as NonNullable<typeof tube>, 0)
		expect(tube?.geometries[0].drawRange.count).toBe(0)
		expect(tube?.group.children[2].visible).toBe(false)
		growRoute(tube as NonNullable<typeof tube>, 0.5)
		const half = tube?.geometries[0].drawRange.count as number
		expect(half).toBeGreaterThan(0)
		expect(half).toBeLessThan(total)
		expect(half % 48).toBe(0)
		growRoute(tube as NonNullable<typeof tube>, 1)
		expect(tube?.geometries[0].drawRange.count).toBe(total)
		expect(tube?.group.children[2].visible).toBe(true)
	})

	it('путь из совпадающих точек — без трубки', () => {
		expect(createRouteTube({ runs: [[new Vector3(1, 2, 3), new Vector3(1, 2, 3)]], markers: [] }, DATA)).toBeNull()
	})

	it('режим single: участок текущего этажа и метка перехода, как в 2D', () => {
		const { graph, path: found } = path()
		const lift = 800 * 0.005 * 2
		const first = routeSegments({ graph, path: found }, DATA, 'f1')
		expect(first.runs.map(run => run.map(point => point.toArray()))).toEqual([
			[
				[80, lift, 200],
				[400, lift, 200],
			],
		])
		expect(first.markers.map(marker => marker.kind)).toEqual(['start', 'transition'])
		const second = routeSegments({ graph, path: found }, DATA, 'f2')
		expect(second.runs.map(run => run.length)).toEqual([2])
		expect(second.markers.map(marker => marker.kind)).toEqual(['transition', 'end'])
		expect(second.markers[0].position.toArray()).toEqual([480, 300 + lift, 200])
	})

	it('маршрут, не заходящий на этаж, — пустой участок и нет трубки', () => {
		const { graph, path: found } = path()
		const segments = routeSegments({ graph, path: found }, DATA, 'nope')
		expect(segments).toEqual({ runs: [], markers: [] })
		expect(createRouteTube(segments, DATA)).toBeNull()
	})

	it('несколько участков растут по очереди; метка конца видна только в конце', () => {
		const a = [new Vector3(0, 0, 0), new Vector3(100, 0, 0)]
		const b = [new Vector3(0, 100, 0), new Vector3(100, 100, 0)]
		const tube = createRouteTube({ runs: [a, b], markers: [{ kind: 'end', position: b[1] }] }, DATA) as NonNullable<
			ReturnType<typeof createRouteTube>
		>
		const [first, second] = tube.geometries
		growRoute(tube, 0.5)
		expect(first.drawRange.count).toBe(first.index?.count)
		expect(second.drawRange.count).toBe(0)
		growRoute(tube, 0.75)
		expect(second.drawRange.count).toBeGreaterThan(0)
		expect(second.drawRange.count).toBeLessThan(second.index?.count as number)
		expect(tube.end?.visible).toBe(false)
		growRoute(tube, 1)
		expect(second.drawRange.count).toBe(second.index?.count)
		expect(tube.end?.visible).toBe(true)
	})
})
