import { orderLayers } from './order'
import { buildStrips } from './strips'
import { assignCross, assignMain } from './coords'
import { buildLayeredGraph, wrapLayers } from './graph'
import { createGroupIndex, nodeBand, nodeTier } from './groups'
import type { FlowRect } from '../../../types/data/flowData.types'
import { assignRanks, findReversedLinks, orientLinks } from './ranks'
import type { FlowLayoutInput, FlowLayoutResult } from '../../../types/api/flowLayout.types'
import type {
	GroupIndex,
	LayeredGraph,
	LayeredLink,
	LayeredVertex,
	LayoutScope,
} from '../../../types/internal/core/layout/flowLayoutInternal.types'

function isHorizontal(input: FlowLayoutInput): boolean {
	return input.settings.direction === 'LR' || input.settings.direction === 'RL'
}

function createVertices(input: FlowLayoutInput, index: GroupIndex, byLanes: boolean): LayeredVertex[] {
	const horizontal = isHorizontal(input)
	return input.nodes.map(node => ({
		id: node.id,
		isDummy: false,
		main: horizontal ? node.size.width : node.size.height,
		cross: horizontal ? node.size.height : node.size.width,
		band: byLanes ? nodeBand(node, index) : 0,
		layer: 0,
		mainPos: 0,
		crossPos: 0,
	}))
}

function createLinks(input: FlowLayoutInput): LayeredLink[] {
	const ids = new Map(input.nodes.map((node, order) => [node.id, order]))
	return input.edges.flatMap((edge): LayeredLink[] => {
		const [source, target] = [ids.get(edge.source), ids.get(edge.target)]
		return source === undefined || target === undefined ? [] : [[source, target]]
	})
}

function rankVertices({ input, index, byLanes }: LayoutScope, vertices: LayeredVertex[]): LayeredLink[] {
	const links = createLinks(input)
	const oriented = orientLinks(links, findReversedLinks(vertices.length, links))
	const fixed = input.nodes.map(node => (byLanes ? nodeTier(node, index) : undefined))
	const ranks = assignRanks({ count: vertices.length, links: oriented, fixed })
	vertices.forEach((vertex, order) => (vertex.layer = ranks[order]))
	return oriented
}

function screenRect(vertex: LayeredVertex, total: number, input: FlowLayoutInput): FlowRect {
	const { direction } = input.settings
	if (direction === 'LR') return { x: vertex.mainPos, y: vertex.crossPos, width: vertex.main, height: vertex.cross }
	if (direction === 'RL') return { x: total - vertex.mainPos - vertex.main, y: vertex.crossPos, width: vertex.main, height: vertex.cross }
	const y = direction === 'TB' ? vertex.mainPos : total - vertex.mainPos - vertex.main
	return { x: vertex.crossPos, y, width: vertex.cross, height: vertex.main }
}

function placeVertices({ input, index, byLanes }: LayoutScope, graph: LayeredGraph) {
	const { nodeGap, rankGap, wrap } = input.settings
	const tiers = byLanes ? index.tiers.length : 0
	const tierLayers = new Set(graph.vertices.filter(vertex => !vertex.isDummy && tiers > 0).map(vertex => vertex.layer))
	orderLayers(graph)
	const rowsOf = wrapLayers(graph, wrap ?? 0, tierLayers)
	assignCross(graph, { nodeGap, rankGap, bands: byLanes ? Math.max(index.leaves.length, 1) : 1 })
	return { ...assignMain(graph, rankGap), rowsOf }
}

export function layoutFlat(input: FlowLayoutInput): FlowLayoutResult {
	if (input.nodes.length === 0) return { nodes: {}, groups: {}, bounds: { x: 0, y: 0, width: 0, height: 0 } }
	const byLanes = input.settings.byLanes !== false
	const index = createGroupIndex(input.groups)
	const vertices = createVertices(input, index, byLanes)
	const scope: LayoutScope = { input, index, byLanes }
	const graph = buildLayeredGraph(vertices, rankVertices(scope, vertices))
	const placed = placeVertices(scope, graph)
	const rects = vertices.map(vertex => screenRect(vertex, placed.total, input))
	const nodes = Object.fromEntries(input.nodes.map((node, order) => [node.id, rects[order]]))
	return buildStrips({ input, index, graph, nodes, placed, byLanes })
}
