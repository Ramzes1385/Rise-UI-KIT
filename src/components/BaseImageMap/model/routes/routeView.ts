import type { ImageMapLayer } from '../../types/imageMapData.types'
import type { ImageMapRouteLine, ImageMapRouteMarker, ImageMapRouteNode, RouteGraph, RoutePath } from '../../types/ImageMapRoutes.types'

function nodeRuns(graph: RouteGraph, path: RoutePath, layer: string): ImageMapRouteNode[][] {
	return path.nodes.reduce<ImageMapRouteNode[][]>((runs, node, index) => {
		if (graph.layerOf(node) !== layer) return runs
		const previous = path.nodes[index - 1]
		const isContinued = previous && graph.layerOf(previous) === layer && !path.links[index - 1]?.transition
		if (isContinued) runs[runs.length - 1]?.push(node)
		else runs.push([node])
		return runs
	}, [])
}

export function routeLines(graph: RouteGraph, path: RoutePath, layer: ImageMapLayer): ImageMapRouteLine[] {
	return nodeRuns(graph, path, layer.id)
		.filter(run => run.length > 1)
		.map(run => ({
			id: run.map(node => node.id).join('-'),
			points: run.map(node => `${node.x * layer.width},${node.y * layer.height}`).join(' '),
		}))
}

function markerKind(path: RoutePath, index: number): ImageMapRouteMarker['kind'] | undefined {
	if (index === 0) return 'start'
	if (index === path.nodes.length - 1) return 'end'
	if (path.links[index - 1]?.transition || path.links[index]?.transition) return 'transition'
	return undefined
}

export function routeMarkers(graph: RouteGraph, path: RoutePath, layer: string): ImageMapRouteMarker[] {
	return path.nodes.flatMap((node, index) => {
		const kind = markerKind(path, index)
		if (!kind || graph.layerOf(node) !== layer) return []
		return [{ id: `${kind}-${node.id}`, kind, style: { left: `${node.x * 100}%`, top: `${node.y * 100}%` } }]
	})
}
