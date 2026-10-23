import { computed } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { FlowGraph } from '../../types/api/flowLayout.types'
import type { FlowModelInternal } from '../../types/internal/core/flowRenderInternal.types'

function addNeighbourhood(graph: FlowGraph, id: string, set: Set<string>): void {
	const edge = graph.edges.get(id)
	if (edge) {
		for (const key of [id, edge.source, edge.target]) set.add(key)
		return
	}
	if (!graph.nodes.has(id)) return
	set.add(id)
	for (const link of [...graph.outgoing(id), ...graph.incoming(id)]) {
		for (const key of [link.id, link.source, link.target]) set.add(key)
	}
}

export function useFlowHighlight(model: FlowModelInternal, hovered: Ref<string | null>): ComputedRef<ReadonlySet<string> | null> {
	return computed(() => {
		const set = new Set(model.highlighted.value)
		if (hovered.value) addNeighbourhood(model.graph.value, hovered.value, set)
		return set.size > 0 ? set : null
	})
}

export function highlightOf(active: ReadonlySet<string> | null, id: string): { isHighlighted: boolean; isDim: boolean } {
	const isHighlighted = active?.has(id) ?? false
	return { isHighlighted, isDim: active !== null && !isHighlighted }
}
