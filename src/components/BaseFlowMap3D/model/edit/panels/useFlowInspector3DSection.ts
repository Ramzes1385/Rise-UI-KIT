import { computed } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FLOW_MAP_3D } from '@/locales/messages'
import { quarterOf } from '../../data/snapshotNodes'
import type { FlowInspector3DSectionProps } from '../../../types/internal/flowMap3dEdit.types'

const TINT_COUNT = 6
const DEFAULT_TINT = '#2f6fed'

export function useFlowInspector3DSection(props: FlowInspector3DSectionProps) {
	const swatches = Array.from({ length: TINT_COUNT }, (_item, index) => ({
		value: `var(--rise-chart-${index + 1})`,
		label: formatMessage(UI_FLOW_MAP_3D.TINT_SWATCH, { index: index + 1 }),
	}))
	const customTint = computed(() => props.node.model3d?.tint ?? DEFAULT_TINT)
	const position = computed(() =>
		formatMessage(UI_FLOW_MAP_3D.POSITION_VALUE, {
			x: Math.round(props.x),
			y: Math.round(props.y),
			angle: quarterOf(props.node.model3d?.rotation),
		}),
	)
	return { swatches, customTint, position }
}
