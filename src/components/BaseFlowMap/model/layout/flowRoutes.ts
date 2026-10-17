import { placeLabels } from '../routing/labels'
import { estimateTextWidth } from '../routing/textWidth'
import { centerOf, clipToShape, resolveSides } from '../routing/shapes'
import { resolveEdgeKind, resolveNodeKind } from '../notations/resolveKind'
import type { FlowEdge, FlowPoint, FlowRect } from '../../types/data/flowData.types'
import type { FlowLayoutScope } from '../../types/internal/core/flowLayoutScope.types'
import type { FlowNodeBox, LabelRequest, RouteBuild } from '../../types/internal/core/flowRouteInternal.types'
import type { FlowLayoutEdge, FlowLayoutResult, FlowRoute, FlowRouter } from '../../types/api/flowLayout.types'

const RADIUS = 8
const LABEL_HEIGHT = 20
const LABEL_PADDING = 12
const LOOP = 28

function format(value: number): string {
	return String(Math.round(value * 100) / 100)
}

function linePath(points: readonly FlowPoint[]): string {
	return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${format(point.x)} ${format(point.y)}`).join(' ')
}

function towards(from: FlowPoint, to: FlowPoint, distance: number): FlowPoint {
	const length = Math.hypot(to.x - from.x, to.y - from.y)
	if (length === 0) return from
	const ratio = Math.min(distance, length / 2) / length
	return { x: from.x + (to.x - from.x) * ratio, y: from.y + (to.y - from.y) * ratio }
}

function roundedPath(points: readonly FlowPoint[]): string {
	if (points.length < 3) return linePath(points)
	const parts = [`M${format(points[0].x)} ${format(points[0].y)}`]
	for (let index = 1; index < points.length - 1; index += 1) {
		const [before, corner, after] = [points[index - 1], points[index], points[index + 1]]
		const [a, b] = [towards(corner, before, RADIUS), towards(corner, after, RADIUS)]
		parts.push(`L${format(a.x)} ${format(a.y)}`, `Q${format(corner.x)} ${format(corner.y)} ${format(b.x)} ${format(b.y)}`)
	}
	const last = points[points.length - 1]
	parts.push(`L${format(last.x)} ${format(last.y)}`)
	return parts.join(' ')
}

function pathFor(routing: string, points: readonly FlowPoint[]): string {
	return routing === 'orthogonal' ? roundedPath(points) : linePath(points)
}

function selfLoop(rect: FlowRect): FlowPoint[] {
	const [right, top] = [rect.x + rect.width, rect.y]
	return [
		{ x: right - LOOP, y: top },
		{ x: right - LOOP, y: top - LOOP },
		{ x: right + LOOP, y: top - LOOP },
		{ x: right + LOOP, y: top + LOOP },
		{ x: right, y: top + LOOP },
	]
}

function routingOf(edge: FlowEdge, scope: FlowLayoutScope, fallback: string): string {
	const kind = resolveEdgeKind(edge.kind, scope.notation, scope.registry)
	return edge.routing ?? kind.routing ?? fallback
}

function channelsOf(edges: readonly FlowLayoutEdge[], rects: Record<string, FlowRect>): Map<string, number> {
	const groups = new Map<string, FlowLayoutEdge[]>()
	for (const edge of edges) {
		if (!rects[edge.source] || !rects[edge.target]) continue
		const key = `${edge.source}|${resolveSides(edge, rects[edge.source], rects[edge.target]).out}`
		groups.set(key, [...(groups.get(key) ?? []), edge])
	}
	const channels = new Map<string, number>()
	for (const members of groups.values()) {
		const sorted = [...members].sort(
			(a, b) =>
				centerOf(rects[a.target]).x + centerOf(rects[a.target]).y - (centerOf(rects[b.target]).x + centerOf(rects[b.target]).y),
		)
		sorted.forEach((edge, index) => channels.set(edge.id, index - (sorted.length - 1) / 2))
	}
	return channels
}

function refineStraight(points: FlowPoint[], scope: FlowLayoutScope, ends: { source: FlowNodeBox; target: FlowNodeBox }): FlowPoint[] {
	if (points.length !== 2) return points
	const [sourceShape, targetShape] = [ends.source, ends.target].map(
		box => resolveNodeKind(box.kind, scope.notation, scope.registry).shape.shape,
	)
	return [
		clipToShape(sourceShape, ends.source.rect, centerOf(ends.target.rect)),
		clipToShape(targetShape, ends.target.rect, centerOf(ends.source.rect)),
	]
}

function pointsOf(edge: FlowEdge, build: RouteBuild, router: FlowRouter): FlowPoint[] {
	const layoutEdge = build.layoutEdges.get(edge.id) as FlowLayoutEdge
	const { layout } = build
	const [source, target] = [layout.nodes[edge.source], layout.nodes[edge.target]]
	if (edge.source === edge.target) return selfLoop(source)
	const obstacles = Object.entries(layout.nodes)
		.filter(([id]) => id !== edge.source && id !== edge.target)
		.map(([, rect]) => rect)
	const context = { source, target, obstacles, points: edge.points, channel: build.channels.get(edge.id) }
	const raw = router.route(layoutEdge, context)
	const ends = {
		source: { kind: build.kinds.get(edge.source) ?? '', rect: source },
		target: { kind: build.kinds.get(edge.target) ?? '', rect: target },
	}
	return edge.points ? raw : refineStraight(raw, build.scope, ends)
}

function buildRoute(edge: FlowEdge, build: RouteBuild): { points: FlowPoint[]; path: string } | null {
	const { layout, scope } = build
	if (!layout.nodes[edge.source] || !layout.nodes[edge.target]) return null
	const provided = layout.edges?.[edge.id]
	const routing = routingOf(edge, scope, build.fallback)
	const router = scope.routers.get(routing) ?? scope.routers.get('curved')
	if (!router) return null
	const points = provided ?? pointsOf(edge, build, router)
	return { points, path: pathFor(provided ? 'straight' : routing, points) }
}

function labelRequests(edges: readonly FlowEdge[], routes: Record<string, FlowRoute>): LabelRequest[] {
	return edges
		.filter(edge => edge.label && routes[edge.id])
		.map(edge => ({
			id: edge.id,
			points: routes[edge.id].points,
			width: estimateTextWidth(edge.label ?? '', 12) + LABEL_PADDING,
			height: LABEL_HEIGHT,
		}))
}

function fallbackRouting(scope: FlowLayoutScope): string {
	return scope.data.layout?.routing ?? scope.notation.layout?.routing ?? scope.overrides?.routing ?? 'curved'
}

export function computeRoutes(
	scope: FlowLayoutScope,
	layout: FlowLayoutResult,
	layoutEdges: readonly FlowLayoutEdge[],
): Record<string, FlowRoute> {
	const build: RouteBuild = {
		scope,
		layout,
		kinds: new Map(scope.data.nodes.map(node => [node.id, node.kind])),
		layoutEdges: new Map(layoutEdges.map(edge => [edge.id, edge])),
		channels: channelsOf(layoutEdges, layout.nodes),
		fallback: fallbackRouting(scope),
	}
	const routes: Record<string, FlowRoute> = {}
	for (const edge of scope.data.edges) {
		const built = build.layoutEdges.has(edge.id) ? buildRoute(edge, build) : null
		if (built) routes[edge.id] = { path: built.path, points: built.points, label: null }
	}
	const labels = placeLabels(labelRequests(scope.data.edges, routes), Object.values(layout.nodes))
	for (const [id, label] of Object.entries(labels)) routes[id].label = label
	return routes
}
