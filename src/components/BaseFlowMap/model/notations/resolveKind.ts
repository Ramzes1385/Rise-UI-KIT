import { warn } from '@/locales/warn'
import { UI_FLOW_MAP } from '@/locales/messages'
import { BASE_GROUP_KINDS, FALLBACK_EDGE_KIND, FALLBACK_GROUP_KIND, FALLBACK_NODE_KIND } from './base'
import type { FlowEdgeKindDef, FlowGroupKindDef, FlowNodeKindDef, FlowNotation } from '../../types/api/flowNotation.types'

export function parseKindRef(kind: string): { notation: string | null; kind: string } {
	const index = kind.indexOf(':')
	return index < 0 ? { notation: null, kind } : { notation: kind.slice(0, index), kind: kind.slice(index + 1) }
}

function pick<T>(
	table: (notation: FlowNotation) => Record<string, T> | undefined,
	kind: string,
	scope: { own: FlowNotation; registry: ReadonlyMap<string, FlowNotation> },
): { notation: FlowNotation; def: T | undefined } {
	const ref = parseKindRef(kind)
	const notation = ref.notation === null ? scope.own : (scope.registry.get(ref.notation) ?? scope.own)
	return { notation, def: table(notation)?.[ref.kind] }
}

const reported = new Set<string>()

function reportUnknown(kind: string, notation: FlowNotation): void {
	const key = `${notation.id}:${kind}`
	if (reported.has(key)) return
	reported.add(key)
	warn(UI_FLOW_MAP.WARN_UNKNOWN_KIND, { kind, notation: notation.id })
}

export function findNodeKind(kind: string, own: FlowNotation, registry: ReadonlyMap<string, FlowNotation>): FlowNodeKindDef | undefined {
	return pick(item => item.nodeKinds, kind, { own, registry }).def
}

export function resolveNodeKind(kind: string, own: FlowNotation, registry: ReadonlyMap<string, FlowNotation>): FlowNodeKindDef {
	const { notation, def } = pick(item => item.nodeKinds, kind, { own, registry })
	if (def) return def
	reportUnknown(kind, notation)
	return FALLBACK_NODE_KIND
}

export function resolveEdgeKind(kind: string | undefined, own: FlowNotation, registry: ReadonlyMap<string, FlowNotation>): FlowEdgeKindDef {
	const name = kind ?? own.defaultEdgeKind
	const { notation, def } = pick(item => item.edgeKinds, name, { own, registry })
	if (def) return def
	reportUnknown(name, notation)
	return FALLBACK_EDGE_KIND
}

export function resolveGroupKind(kind: string, own: FlowNotation, registry: ReadonlyMap<string, FlowNotation>): FlowGroupKindDef {
	const { notation, def } = pick(item => item.groupKinds, kind, { own, registry })
	const found = def ?? BASE_GROUP_KINDS[parseKindRef(kind).kind]
	if (found) return found
	reportUnknown(kind, notation)
	return FALLBACK_GROUP_KIND
}
