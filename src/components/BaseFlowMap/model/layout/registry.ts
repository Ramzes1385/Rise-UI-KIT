import { layoutCompound } from './compound'
import { UI_FLOW_MAP } from '@/locales/messages'
import { applyFixed, snapToGrid } from './placement'
import { createRegistry } from '../notations/registry'
import type { FlowLayoutAlgorithm, FlowLayoutInput, FlowLayoutResult } from '../../types/api/flowLayout.types'

function runLayered(input: FlowLayoutInput): FlowLayoutResult {
	return snapToGrid(input, applyFixed(input, layoutCompound(input)))
}

const layeredLayout: FlowLayoutAlgorithm = { id: 'layered', run: runLayered }

const manualLayout: FlowLayoutAlgorithm = { id: 'manual', run: runLayered }

export function createLayoutRegistry(extra: readonly FlowLayoutAlgorithm[]): Map<string, FlowLayoutAlgorithm> {
	return createRegistry([layeredLayout, manualLayout, ...extra], () => UI_FLOW_MAP.ENTITY_LAYOUT)
}
