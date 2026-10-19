import { BUILT_IN_STATUS_IDS, resolveStatus } from './panelStatus'
import type { FlowShape } from '../../types/api/flowNotation.types'
import type { FlowNodeKindDef } from '../../types/api/flowNotation.types'
import type { FlowLegendEdgeShapes, FlowLegendRow, FlowPanelsSource } from '../../types/internal/flowPanels.types'

function nodeRow(id: string, def: FlowNodeKindDef, isExternal?: boolean): FlowLegendRow {
	const sample = { entity: 'node' as const, kind: id }
	return {
		id: `node:${id}`,
		entity: 'node',
		label: def.label(),
		shape: def.shape.shape,
		isExternal: isExternal ?? def.isExternal,
		sample,
	}
}

function presentNodeRows(source: FlowPanelsSource): FlowLegendRow[] {
	const seen = new Map<string, FlowLegendRow>()
	for (const node of source.data.nodes) {
		if (!seen.has(node.kind)) seen.set(node.kind, nodeRow(node.kind, source.nodeKind(node), node.isExternal))
	}
	return [...seen.values()]
}

function presentEdgeRows(source: FlowPanelsSource): FlowLegendRow[] {
	const seen = new Map<string, FlowLegendRow>()
	for (const edge of source.data.edges) {
		const kind = edge.kind ?? source.notation.defaultEdgeKind
		if (seen.has(kind)) continue
		const { label, stroke, startMarker, endMarker, color } = source.edgeKind(edge)
		const sample = { entity: 'edge' as const, kind }
		seen.set(kind, { id: `edge:${kind}`, entity: 'edge', label: label(), edge: { stroke, startMarker, endMarker, color }, sample })
	}
	return [...seen.values()]
}

function usedStatuses(source: FlowPanelsSource): Set<string> {
	const used = new Set<string>()
	source.data.nodes.forEach(node => node.status && used.add(node.status))
	source.data.edges.forEach(edge => edge.status && used.add(edge.status))
	Object.values(source.live.nodes ?? {}).forEach(entry => entry.status && used.add(entry.status))
	Object.values(source.live.edges ?? {}).forEach(entry => entry.status && used.add(entry.status))
	return used
}

function statusRows(source: FlowPanelsSource): FlowLegendRow[] {
	const used = usedStatuses(source)
	const order = [...BUILT_IN_STATUS_IDS, ...(source.data.statuses ?? []).map(item => item.id)]
	return [...new Set(order)]
		.filter(id => used.has(id))
		.map(id => {
			const status = resolveStatus(id, source.data)
			return { id: `status:${id}`, entity: 'status' as const, label: status.label, status, sample: { status: id } }
		})
}

function declaredRows(source: FlowPanelsSource): FlowLegendRow[] {
	const items = source.notation.legend?.(source.data) ?? []
	const rows: FlowLegendRow[] = []
	for (const item of items) {
		const sample = item.sample
		if ('status' in sample)
			rows.push({ id: item.id, entity: 'status', label: item.label, status: resolveStatus(sample.status, source.data), sample })
		else if (sample.entity === 'node' && source.notation.nodeKinds[sample.kind]) {
			rows.push({ ...nodeRow(sample.kind, source.notation.nodeKinds[sample.kind]!), id: item.id, label: item.label, sample })
		} else if (sample.entity === 'edge' && source.notation.edgeKinds[sample.kind]) {
			const { stroke, startMarker, endMarker, color } = source.notation.edgeKinds[sample.kind]!
			rows.push({ id: item.id, entity: 'edge', label: item.label, edge: { stroke, startMarker, endMarker, color }, sample })
		}
	}
	return rows
}

export function buildLegendRows(source: FlowPanelsSource): FlowLegendRow[] {
	const declared = declaredRows(source)
	if (declared.length)
		return [...declared, ...statusRows(source).filter(row => !declared.some(item => item.status?.id === row.status?.id))]
	return [...presentNodeRows(source), ...presentEdgeRows(source), ...statusRows(source)]
}

const SHAPE_PATHS: Record<FlowShape, string> = {
	rect: 'M2 2h20v10H2z',
	'round-rect': 'M5 2h14a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z',
	pill: 'M7 2h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 2z',
	ellipse: 'M2 7a10 5 0 1 0 20 0 10 5 0 1 0-20 0',
	circle: 'M6.5 7a5.5 5.5 0 1 0 11 0 5.5 5.5 0 1 0-11 0',
	diamond: 'M12 1l10 6-10 6L2 7z',
	hexagon: 'M7 1h10l5 6-5 6H7L2 7z',
	parallelogram: 'M7 2h15l-5 10H2z',
	cylinder: 'M4 3.5c0-1 3.6-1.8 8-1.8s8 .8 8 1.8v7c0 1-3.6 1.8-8 1.8s-8-.8-8-1.8zM4 3.5c0 1 3.6 1.8 8 1.8s8-.8 8-1.8',
	document: 'M3 2h18v8c-3 2-6-1-9 1s-6 0-9-1z',
	person: 'M12 1.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 1 0 0-5zM6 13c0-3 2.7-5 6-5s6 2 6 5z',
	note: 'M2 2h16l4 4v6H2z',
	'open-rect': 'M22 2H2v10h20',
	'parallel-lines': 'M2 2h20M2 12h20',
	path: 'M2 2h20v10H2z',
}

const END_MARKS: Record<string, { path: string; isFilled: boolean }[]> = {
	arrow: [{ path: 'M23 7l-6-3.5v7z', isFilled: true }],
	'open-arrow': [{ path: 'M17 3.5L23 7l-6 3.5', isFilled: false }],
	'double-arrow': [
		{ path: 'M23 7l-5-3v6z', isFilled: true },
		{ path: 'M17 7l-5-3v6z', isFilled: true },
	],
}

const START_MARKS: Record<string, { path: string; isFilled: boolean }[]> = {
	circle: [{ path: 'M1 7a2.5 2.5 0 1 0 5 0 2.5 2.5 0 1 0-5 0', isFilled: false }],
	diamond: [{ path: 'M1 7l3-2.5L7 7 4 9.5z', isFilled: false }],
	slash: [{ path: 'M6 10l3-6', isFilled: false }],
}

const DASHES = { solid: '', dashed: '4 3', dotted: '1 3' }

export function shapePath(shape: FlowShape | undefined): string {
	return SHAPE_PATHS[shape ?? 'rect']
}

export function edgeSample(row: FlowLegendRow): FlowLegendEdgeShapes {
	const edge = row.edge
	return {
		line: 'M1 7h22',
		dash: DASHES[edge?.stroke ?? 'solid'],
		marks: [...(START_MARKS[edge?.startMarker ?? 'none'] ?? []), ...(END_MARKS[edge?.endMarker ?? 'none'] ?? [])],
	}
}
