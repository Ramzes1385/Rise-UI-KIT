import { layoutCompound } from '../../layout/compound'
import { applyFixed, snapToGrid } from '../../layout/placement'
import type { FlowLayoutAlgorithm, FlowLayoutInput, FlowLayoutResult } from '../../../types/api/flowLayout.types'

function runC4Nested(input: FlowLayoutInput): FlowLayoutResult {
	const settings = { ...input.settings, direction: 'TB' as const }
	return snapToGrid(input, applyFixed(input, layoutCompound({ ...input, settings })))
}

export const c4Layout: FlowLayoutAlgorithm = { id: 'c4-nested', run: runC4Nested }
