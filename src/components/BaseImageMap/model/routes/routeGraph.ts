import { objectArea } from '../data/shapeGeometry'
import type { ImageMapLayer, ImageMapObject } from '../../types/imageMapData.types'
import type {
	ImageMapRouteNode,
	ImageMapRouteTransition,
	ImageMapTransitionType,
	RouteGraph,
	RouteGraphInput,
	RouteLink,
	RoutePath,
	RoutePoint,
	SearchState,
} from '../../types/ImageMapRoutes.types'

const TRANSITION_COST: Record<ImageMapTransitionType, number> = { stairs: 0.2, escalator: 0.2, ramp: 0.25, elevator: 0.3 }

export function transitionType(transition: ImageMapRouteTransition): ImageMapTransitionType {
	return transition.type ?? 'stairs'
}

export function isStepFree(transition: ImageMapRouteTransition): boolean {
	const type = transitionType(transition)
	return transition.isStepFree ?? (type === 'elevator' || type === 'ramp')
}

function walkCost(from: RoutePoint, to: RoutePoint, layer: ImageMapLayer | undefined): number {
	const ratio = layer ? layer.height / layer.width : 1
	return Math.hypot(to.x - from.x, (to.y - from.y) * ratio)
}

function addLink(links: Map<string, RouteLink[]>, from: string, link: RouteLink): void {
	links.set(from, [...(links.get(from) ?? []), link])
}

function addTransition(graph: RouteGraph, transition: ImageMapRouteTransition): void {
	const cost = transition.cost ?? TRANSITION_COST[transitionType(transition)]
	const ids = transition.nodes.filter(id => graph.nodes.has(id))
	ids.slice(1).forEach((to, index) => {
		const from = ids[index] as string
		addLink(graph.links, from, { to, cost, transition })
		if (!transition.isOneWay) addLink(graph.links, to, { to: from, cost, transition })
	})
}

export function buildRouteGraph({ routes, layers, isStepFree: onlyStepFree }: RouteGraphInput): RouteGraph {
	const layerOf = (node: ImageMapRouteNode): string => node.layer ?? layers[0]?.id ?? ''
	const layerInfo = (id: string): ImageMapLayer | undefined => layers.find(layer => layer.id === id)
	const nodes = new Map(routes.nodes.map(node => [node.id, node]))
	const graph: RouteGraph = { nodes, links: new Map(), layerOf, layerInfo }
	routes.edges.forEach(([fromId, toId]) => {
		const from = nodes.get(fromId)
		const to = nodes.get(toId)
		if (!from || !to || layerOf(from) !== layerOf(to)) return
		const cost = walkCost(from, to, layerInfo(layerOf(from)))
		addLink(graph.links, fromId, { to: toId, cost })
		addLink(graph.links, toId, { to: fromId, cost })
	})
	;(routes.transitions ?? []).filter(item => !onlyStepFree || isStepFree(item)).forEach(item => addTransition(graph, item))
	return graph
}

function objectCenter(object: ImageMapObject): { x: number; y: number } | undefined {
	const area = objectArea(object)
	return area ? { x: area.x + area.width / 2, y: area.y + area.height / 2 } : undefined
}

export function objectNodes(graph: RouteGraph, object: ImageMapObject, layer: string): string[] {
	const nodes = [...graph.nodes.values()]
	const entrances = nodes.filter(node => node.object === object.id)
	if (entrances.length) return entrances.map(node => node.id)
	const center = objectCenter(object)
	const own = nodes.filter(node => graph.layerOf(node) === layer)
	if (!center || !own.length) return []
	const info = graph.layerInfo(layer)
	const distance = (node: ImageMapRouteNode): number => walkCost(node, center, info)
	const nearest = own.reduce((best, node) => (distance(node) < distance(best) ? node : best))
	return [nearest.id]
}

function nextNode(state: SearchState): string | undefined {
	let best: string | undefined
	state.cost.forEach((cost, id) => {
		if (state.done.has(id)) return
		if (best === undefined || cost < (state.cost.get(best) as number)) best = id
	})
	return best
}

function relax(graph: RouteGraph, state: SearchState, id: string): void {
	const base = state.cost.get(id) as number
	for (const link of graph.links.get(id) ?? []) {
		const cost = base + link.cost
		if (cost < (state.cost.get(link.to) ?? Infinity)) {
			state.cost.set(link.to, cost)
			state.previous.set(link.to, { from: id, link })
		}
	}
}

function tracePath(graph: RouteGraph, state: SearchState, end: string): RoutePath {
	const ids = [end]
	const links: RouteLink[] = []
	for (let step = state.previous.get(end); step; step = state.previous.get(step.from)) {
		ids.unshift(step.from)
		links.unshift(step.link)
	}
	return { nodes: ids.map(id => graph.nodes.get(id) as ImageMapRouteNode), links, cost: state.cost.get(end) as number }
}

export function findRoutePath(graph: RouteGraph, sources: string[], targets: string[]): RoutePath | null {
	const state: SearchState = { cost: new Map(sources.map(id => [id, 0])), previous: new Map(), done: new Set() }
	const goals = new Set(targets)
	for (let id = nextNode(state); id !== undefined; id = nextNode(state)) {
		if (goals.has(id)) return tracePath(graph, state, id)
		state.done.add(id)
		relax(graph, state, id)
	}
	return null
}
