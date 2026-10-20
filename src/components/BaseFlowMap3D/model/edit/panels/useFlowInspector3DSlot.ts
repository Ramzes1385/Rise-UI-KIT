import { computed } from 'vue'
import { quarterOf } from '../../data/snapshotNodes'
import { withModel3d } from '../actions/model3dPatch'
import type { FlowInspector3DSlotProps, FlowMap3DModelInfo } from '../../../types/internal/flowMap3dEdit.types'

const QUARTER = 90

export function useFlowInspector3DSlot(props: FlowInspector3DSlotProps) {
	const node = computed(() =>
		props.target.entity === 'node' ? props.controller.getData().nodes.find(item => item.id === props.target.id) : undefined,
	)
	const info = computed((): FlowMap3DModelInfo => props.modelInfo(props.target.id))
	const rect = computed(() => props.rectOf(props.target.id))

	function patch(change: Record<string, unknown>): void {
		if (node.value) void props.controller.updateNode(node.value.id, { model3d: withModel3d(node.value, change) })
	}

	return {
		node,
		info,
		rect,
		rotate: () => patch({ rotation: (quarterOf(node.value?.model3d?.rotation) + QUARTER) % 360 }),
		tint: (value: string | null) => patch({ tint: value ?? undefined }),
		scale: (value: number) => patch({ scale: value }),
		elevation: (value: number) => patch({ elevation: value }),
	}
}
