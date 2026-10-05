import { layerElevation, sceneSettings } from './sceneLayout'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import type { RouteTube } from '../../types/internal/imageMap3dInternal.types'
import type { RouteGraph, RoutePath } from '@components/BaseImageMap/types/ImageMapRoutes.types'
import { CurvePath, Group, LineCurve3, Mesh, MeshBasicMaterial, SphereGeometry, TubeGeometry, Vector3 } from 'three'

const RADIUS_RATIO = 0.005
const SEGMENTS_PER_LINK = 24
const RADIAL_SEGMENTS = 8
const MARKER_SCALE = 2.6
const ROUTE_RENDER_ORDER = 3

function nodePoint(graph: RouteGraph, data: ImageMap3DData, node: RoutePath['nodes'][number]): Vector3 {
	const settings = sceneSettings(data)
	const index = Math.max(
		data.layers.findIndex(layer => layer.id === graph.layerOf(node)),
		0,
	)
	const layer = data.layers[index]
	const lift = settings.extent * RADIUS_RATIO * 2
	return new Vector3(node.x * layer.width, layerElevation(layer, index, settings) + lift, node.y * layer.height)
}

export function routePoints(graph: RouteGraph, path: RoutePath, data: ImageMap3DData): Vector3[] {
	return path.nodes.flatMap((node, index) => {
		const point = nodePoint(graph, data, node)
		const previous = index > 0 && path.links[index - 1]?.transition ? nodePoint(graph, data, path.nodes[index - 1]) : null
		return previous && previous.y !== point.y ? [new Vector3(previous.x, point.y, previous.z), point] : [point]
	})
}

function routeCurve(points: Vector3[]): CurvePath<Vector3> {
	const curve = new CurvePath<Vector3>()
	points.slice(1).forEach((point, index) => {
		if (!point.equals(points[index])) curve.add(new LineCurve3(points[index], point))
	})
	return curve
}

function createMarker(position: Vector3, radius: number, material: MeshBasicMaterial): Mesh {
	const marker = new Mesh(new SphereGeometry(radius * MARKER_SCALE, 16, 12), material)
	marker.position.copy(position)
	marker.renderOrder = ROUTE_RENDER_ORDER
	return marker
}

export function createRouteTube(points: Vector3[], data: ImageMap3DData): RouteTube | null {
	const curve = routeCurve(points)
	if (!curve.curves.length) return null
	const radius = sceneSettings(data).extent * RADIUS_RATIO
	const line = new MeshBasicMaterial({ depthTest: false, transparent: true })
	const start = new MeshBasicMaterial({ depthTest: false, transparent: true })
	const end = new MeshBasicMaterial({ depthTest: false, transparent: true })
	const geometry = new TubeGeometry(curve, curve.curves.length * SEGMENTS_PER_LINK, radius, RADIAL_SEGMENTS, false)
	const tube = new Mesh(geometry, line)
	tube.renderOrder = ROUTE_RENDER_ORDER
	const group = new Group()
	group.name = 'rise-route'
	group.add(tube, createMarker(points[0], radius, start), createMarker(points[points.length - 1], radius, end))
	return { group, geometry, materials: { line, start, end } }
}

export function growRoute(tube: RouteTube, progress: number): void {
	const step = RADIAL_SEGMENTS * 6
	const total = tube.geometry.index?.count ?? 0
	const count = progress >= 1 ? total : Math.floor((total * Math.max(progress, 0)) / step) * step
	tube.geometry.setDrawRange(0, count)
	const [, , end] = tube.group.children
	end.visible = progress >= 1
}
