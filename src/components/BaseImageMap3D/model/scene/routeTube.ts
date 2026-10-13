import { layerElevation, sceneSettings } from './sceneLayout'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { markerKind, nodeRuns } from '@components/BaseImageMap/model/routes/routeView'
import type { RouteGraph, RoutePath } from '@components/BaseImageMap/types/ImageMapRoutes.types'
import type { Route3DPath, RouteSegments, RouteTube } from '../../types/internal/imageMap3dInternal.types'
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

export function routeSegments(route: Route3DPath, data: ImageMap3DData, layerId?: string): RouteSegments {
	const { graph, path } = route
	if (!layerId) {
		const points = routePoints(graph, path, data)
		return {
			runs: [points],
			markers: [
				{ kind: 'start', position: points[0] },
				{ kind: 'end', position: points[points.length - 1] },
			],
		}
	}
	return {
		runs: nodeRuns(graph, path, layerId)
			.filter(run => run.length > 1)
			.map(run => run.map(node => nodePoint(graph, data, node))),
		markers: path.nodes.flatMap((node, index) => {
			const kind = markerKind(path, index)
			return kind && graph.layerOf(node) === layerId ? [{ kind, position: nodePoint(graph, data, node) }] : []
		}),
	}
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

function createTubeGeometry(points: Vector3[], radius: number): TubeGeometry | null {
	const curve = routeCurve(points)
	return curve.curves.length ? new TubeGeometry(curve, curve.curves.length * SEGMENTS_PER_LINK, radius, RADIAL_SEGMENTS, false) : null
}

export function createRouteTube(segments: RouteSegments, data: ImageMap3DData): RouteTube | null {
	const radius = sceneSettings(data).extent * RADIUS_RATIO
	const materials = {
		line: new MeshBasicMaterial({ depthTest: false, transparent: true }),
		start: new MeshBasicMaterial({ depthTest: false, transparent: true }),
		end: new MeshBasicMaterial({ depthTest: false, transparent: true }),
		transition: new MeshBasicMaterial({ depthTest: false, transparent: true }),
	}
	const geometries = segments.runs.flatMap(points => createTubeGeometry(points, radius) ?? [])
	if (!geometries.length) return null
	const group = new Group()
	group.name = 'rise-route'
	geometries.forEach(geometry => {
		const tube = new Mesh(geometry, materials.line)
		tube.renderOrder = ROUTE_RENDER_ORDER
		group.add(tube)
	})
	const markers = segments.markers.map(marker => createMarker(marker.position, radius, materials[marker.kind]))
	group.add(...markers)
	const end = markers.find((_, index) => segments.markers[index].kind === 'end') ?? null
	return { group, geometries, end, materials }
}

export function growRoute(tube: RouteTube, progress: number): void {
	const step = RADIAL_SEGMENTS * 6
	const total = tube.geometries.reduce((sum, geometry) => sum + (geometry.index?.count ?? 0), 0)
	let remaining = progress >= 1 ? total : Math.floor((total * Math.max(progress, 0)) / step) * step
	tube.geometries.forEach(geometry => {
		const count = Math.min(geometry.index?.count ?? 0, remaining)
		geometry.setDrawRange(0, count)
		remaining -= count
	})
	if (tube.end) tube.end.visible = progress >= 1
}
