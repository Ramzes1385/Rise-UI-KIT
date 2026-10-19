import type { FlowLiveState } from '../../types/api/flowController.types'
import type { FlowMetric, FlowStatus } from '../../types/data/flowData.types'
import type { FlowEventBus, FlowLiveEntry, FlowState, FlowStateApi } from '../../types/internal/core/flowModelCore.types'

function mergeEntries<T extends object>(
	base: Record<string, T> | undefined,
	patch: Record<string, T> | undefined,
): Record<string, T> | undefined {
	if (!patch) return base
	const next = { ...base }
	for (const [id, value] of Object.entries(patch)) next[id] = { ...next[id], ...value }
	return next
}

function mergeLive(base: FlowLiveState, patch: FlowLiveState): FlowLiveState {
	return { nodes: mergeEntries(base.nodes, patch.nodes), edges: mergeEntries(base.edges, patch.edges) }
}

function entityOf(state: FlowState, id: string): 'nodes' | 'edges' {
	return state.data.value.edges.some(edge => edge.id === id) ? 'edges' : 'nodes'
}

function withEntry(state: FlowState, id: string, change: Partial<FlowLiveEntry>): void {
	const key = entityOf(state, id)
	const current = (state.live.value[key] ?? {}) as Record<string, FlowLiveEntry>
	state.live.value = { ...state.live.value, [key]: { ...current, [id]: { ...current[id], ...change } } }
}

function baseMetrics(state: FlowState, id: string): FlowMetric[] {
	const key = entityOf(state, id)
	const live = (state.live.value[key] as Record<string, FlowLiveEntry> | undefined)?.[id]?.metrics
	const item = [...state.data.value.nodes, ...state.data.value.edges].find(other => other.id === id)
	return live ?? item?.metrics ?? []
}

function replaceMetrics(current: readonly FlowMetric[], metrics: readonly FlowMetric[]): FlowMetric[] {
	const incoming = new Map(metrics.map(metric => [metric.id, metric]))
	const kept = current.map(metric => incoming.get(metric.id) ?? metric)
	return [...kept, ...metrics.filter(metric => !current.some(item => item.id === metric.id))]
}

function highlightIds(state: FlowState, path: string[] | { from: string; to: string }): string[] {
	return Array.isArray(path) ? path : state.graph.value.path(path.from, path.to)
}

export function createStateApi(state: FlowState, events: FlowEventBus): FlowStateApi {
	return {
		select(ids, mode = 'replace') {
			state.groups.reveal(ids)
			const current = state.selection.value
			const next = nextSelection(current, ids, mode)
			state.selection.value = next
			events.emit('update:selection', next)
		},
		getSelection: () => [...state.selection.value],
		highlightPath(path) {
			const ids = highlightIds(state, path)
			const edges = state.data.value.edges.filter(edge => ids.includes(edge.id))
			state.highlighted.value = new Set([...ids, ...edges.flatMap(edge => [edge.source, edge.target])])
			return ids
		},
		clearHighlight: () => (state.highlighted.value = new Set()),
		setLive: patch => (state.live.value = mergeLive(state.live.value, patch)),
		setStatus: (id, status: FlowStatus | null) => withEntry(state, id, { status: status ?? undefined }),
		setMetrics: (id, metrics) => withEntry(state, id, { metrics: replaceMetrics(baseMetrics(state, id), metrics) }),
		getData: () => state.data.value,
		getGraph: () => state.graph.value,
		exportJson: () => JSON.stringify(state.data.value, null, 2),
		validate() {
			const issues = state.issues.value
			events.emit('validate', issues)
			return issues
		},
	}
}

function toggled(current: readonly string[], ids: readonly string[]): string[] {
	const set = new Set(current)
	for (const id of ids) {
		if (set.has(id)) set.delete(id)
		else set.add(id)
	}
	return [...set]
}

function nextSelection(current: readonly string[], ids: readonly string[], mode: 'replace' | 'add' | 'toggle'): string[] {
	if (mode === 'replace') return [...ids]
	return mode === 'add' ? [...new Set([...current, ...ids])] : toggled(current, ids)
}
