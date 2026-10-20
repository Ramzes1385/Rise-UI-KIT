import { computed } from 'vue'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { modelCellLabel } from '@/scene3d/models/modelTitles'
import type { FlowMap3DPaletteEntry, FlowModelPaletteProps } from '../../../types/internal/flowMap3dEdit.types'

export function useFlowModelPaletteView(props: FlowModelPaletteProps) {
	const sections = computed(() => [
		{ id: 'scheme', title: UI_FLOW_MAP_3D.PALETTE_SCHEME, items: props.groups.scheme },
		{ id: 'more', title: UI_FLOW_MAP_3D.PALETTE_MORE, items: props.groups.more },
	])
	return { sections, cellLabel: (item: FlowMap3DPaletteEntry): string => modelCellLabel(item.title, item.key) }
}
