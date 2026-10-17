import { estimateTextWidth } from '../routing/textWidth'
import { resolveGroupKind, resolveNodeKind } from '../notations/resolveKind'
import type { FlowLayoutRun, FlowLayoutScope } from '../../types/internal/core/flowLayoutScope.types'
import type { FlowLayoutEdge, FlowLayoutGroup, FlowLayoutInput, FlowLayoutNode } from '../../types/api/flowLayout.types'
import type { FlowGroup, FlowLayoutSettings, FlowNode, FlowPoint, FlowPortSide, FlowSize } from '../../types/data/flowData.types'

const DEFAULTS = { algorithm: 'layered', direction: 'LR', routing: 'curved', nodeGap: 40, rankGap: 80, gridSize: 8 } as const
const LABEL_PADDING = 40
const MAX_WIDTH = 320
const HEADER_START = 28
const HEADER_TOP = 32

function mergeLayoutSettings(scope: FlowLayoutScope, run?: FlowLayoutRun): FlowLayoutInput['settings'] {
	return { ...DEFAULTS, ...scope.notation.layout, ...scope.data.layout, ...scope.overrides, ...run?.settings }
}

function nodeSize(node: FlowNode, scope: FlowLayoutScope): FlowSize {
	const base = resolveNodeKind(node.kind, scope.notation, scope.registry)
	const wanted = estimateTextWidth(node.label, 13) + LABEL_PADDING
	const width = node.size?.width ?? Math.min(MAX_WIDTH, Math.max(base.size.width, base.render === 'html' ? wanted : 0))
	return { width, height: node.size?.height ?? base.size.height }
}

function fixedOf(node: FlowNode, algorithm: string, run?: FlowLayoutRun): FlowPoint | undefined {
	if (run?.ids && !run.ids.includes(node.id)) return run.current?.get(node.id) ?? node.position
	if (run?.isForced) return undefined
	if (algorithm === 'manual') return node.position
	return node.isPinned ? node.position : undefined
}

function createNodes(scope: FlowLayoutScope, algorithm: string, run?: FlowLayoutRun): FlowLayoutNode[] {
	return scope.data.nodes.map((node, order) => ({
		id: node.id,
		kind: node.kind,
		props: node.props,
		size: nodeSize(node, scope),
		group: node.group,
		fixed: fixedOf(node, algorithm, run),
		order,
	}))
}

function sideOf(node: FlowNode | undefined, portId: string | undefined, scope: FlowLayoutScope): FlowPortSide | undefined {
	if (!node || !portId) return undefined
	const ports = node.ports ?? resolveNodeKind(node.kind, scope.notation, scope.registry).ports
	return ports?.find(port => port.id === portId)?.side
}

function createEdges(scope: FlowLayoutScope): FlowLayoutEdge[] {
	const byId = new Map(scope.data.nodes.map(node => [node.id, node]))
	return scope.data.edges.map(edge => ({
		id: edge.id,
		source: edge.source,
		target: edge.target,
		sourceSide: sideOf(byId.get(edge.source), edge.sourcePort, scope),
		targetSide: sideOf(byId.get(edge.target), edge.targetPort, scope),
	}))
}

function headerOf(group: FlowGroup, scope: FlowLayoutScope): { layout: FlowLayoutGroup['layout']; header: FlowSize } {
	const kind = resolveGroupKind(group.kind, scope.notation, scope.registry)
	const header = kind.header === 'start' ? { width: HEADER_START, height: 0 } : { width: 0, height: HEADER_TOP }
	return { layout: kind.layout, header }
}

function createGroups(scope: FlowLayoutScope): FlowLayoutGroup[] {
	return (scope.data.groups ?? []).map((group, index) => ({
		id: group.id,
		parent: group.parent,
		order: group.order ?? index,
		...headerOf(group, scope),
	}))
}

export function createLayoutInput(scope: FlowLayoutScope, run?: FlowLayoutRun): FlowLayoutInput {
	const settings: FlowLayoutSettings = mergeLayoutSettings(scope, run)
	const algorithm = settings.algorithm ?? DEFAULTS.algorithm
	return {
		nodes: createNodes(scope, algorithm, run),
		edges: createEdges(scope),
		groups: createGroups(scope),
		settings: mergeLayoutSettings(scope, run),
	}
}
