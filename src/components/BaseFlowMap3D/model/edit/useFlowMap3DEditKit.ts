import { reactive } from 'vue'
import { useFlowMap3DEdit } from './useFlowMap3DEdit'
import { useEdit3DPanels } from './panels/useEdit3DPanels'
import type { FlowMap3DEditLoaderInput } from '../../types/internal/flowMap3dEdit.types'

export function useFlowMap3DEditKit(options: FlowMap3DEditLoaderInput) {
	const { parts, stage, input, ui } = options
	const edit = useFlowMap3DEdit(parts, stage, input)
	return { edit: reactive(edit), panels: reactive(useEdit3DPanels(parts, edit, ui)) }
}
