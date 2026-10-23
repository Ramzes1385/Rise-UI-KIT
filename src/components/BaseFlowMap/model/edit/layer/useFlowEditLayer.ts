import { portsOf } from '../geometry/editPorts'
import { getFlowEditing } from '../useFlowEditing'
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useFlowMapContext } from '../../context/flowContext'
import type { FlowEditLayerPort } from '../../../types/internal/edit/flowEditApi.types'
import type { FlowModelInternal } from '../../../types/internal/core/flowRenderInternal.types'

function linkPath(from: { x: number; y: number }, to: { x: number; y: number }): string {
	const middle = (from.x + to.x) / 2
	return `M${from.x} ${from.y} C${middle} ${from.y} ${middle} ${to.y} ${to.x} ${to.y}`
}

function portItems(model: FlowModelInternal, ids: readonly string[]): FlowEditLayerPort[] {
	return ids.flatMap(id => {
		const node = model.graph.value.nodes.get(id)!
		return portsOf(node.ports ?? model.nodeKind(node).ports, model.layout.value.nodes[id]).map(port => ({
			...port,
			key: `${id}|${port.id}|${port.side}`,
			node: id,
		}))
	})
}

export function useFlowEditLayer() {
	const { model, viewport } = useFlowMapContext()
	const editing = getFlowEditing(model)
	const { state } = editing.context.env
	const anchor = shallowRef<Element | null>(null)
	const isMounted = ref(false)
	onMounted(() => (isMounted.value = true))
	const host = computed(() => (isMounted.value ? (anchor.value?.closest('.base-flow-map__canvas') ?? null) : null))
	const zoom = computed(() => viewport.value.zoom)
	const link = computed(() => {
		const current = state.link.value
		if (!current) return null
		const rect = current.target ? model.layout.value.nodes[current.target.node] : undefined
		return { ...current, path: linkPath(current.from, current.to), ring: rect }
	})
	return {
		host,
		anchor,
		isActive: state.isActive,
		scale: computed(() => 1 / zoom.value),
		marquee: state.marquee,
		ghosts: computed(() =>
			state.ghosts.value.map(ghost => ({ ...ghost, label: model.graph.value.nodes.get(ghost.id)?.label ?? ghost.id })),
		),
		guides: state.guides,
		drop: computed(() => (state.dropGroup.value ? model.layout.value.groups[state.dropGroup.value] : undefined)),
		link,
		ports: computed(() => (state.isEditing.value ? portItems(editing.context.env.model, state.portNodes.value) : [])),
		hotPort: computed(() =>
			state.link.value?.target ? `${state.link.value.target.node}|${state.link.value.target.port ?? ''}` : null,
		),
	}
}
