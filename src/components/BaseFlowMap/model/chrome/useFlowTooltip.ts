import { computed } from 'vue'
import { useFlowMapContext } from '../context/flowContext'

const GAP = 8

export function useFlowTooltip() {
	const context = useFlowMapContext()
	const id = computed(() => context.hovered.value ?? context.focused.value)
	const node = computed(() => (id.value ? context.model.graph.value.nodes.get(id.value) : undefined))
	const edge = computed(() => (id.value ? context.model.graph.value.edges.get(id.value) : undefined))
	const point = computed(() => {
		const { zoom, x, y } = context.viewport.value
		const rect = node.value && context.model.layout.value.nodes[node.value.id]
		const anchor = rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height } : null
		const labelPoint = edge.value ? context.model.routes.value[edge.value.id]?.label?.point : undefined
		const source = anchor ?? labelPoint
		return source ? { left: `${x + source.x * zoom}px`, top: `${y + source.y * zoom + GAP}px` } : null
	})
	return {
		isShown: computed(() => point.value !== null && !context.isCompact.value),
		style: point,
		props: computed(() => ({
			target: { entity: node.value ? ('node' as const) : ('edge' as const), id: id.value ?? '' },
			node: node.value,
			edge: edge.value,
		})),
	}
}
