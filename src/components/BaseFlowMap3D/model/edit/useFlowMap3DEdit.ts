import { watch } from 'vue'
import { useNodeDrag } from './drag/useNodeDrag'
import { useEdit3DState } from './useEdit3DState'
import { useEdit3DPointer } from './useEdit3DPointer'
import { useEditOverlay } from './drag/useEditOverlay'
import { useEdit3DKeyboard } from './useEdit3DKeyboard'
import { useConnectTool } from './connect/useConnectTool'
import { useModelPalette } from './actions/useModelPalette'
import { useEdit3DActions } from './actions/useEdit3DActions'
import type { FlowMap3DEditStage } from '../../types/internal/flowMap3dEdit.types'
import type { FlowMap3DComposeParts, FlowMap3DInput } from '../../types/internal/flowMap3dCompose.types'

export function useFlowMap3DEdit(parts: FlowMap3DComposeParts, stage: FlowMap3DEditStage, input: FlowMap3DInput) {
	const { model } = parts.core
	const state = useEdit3DState(parts, stage, input)
	const getOverlay = useEditOverlay(stage)
	const base = {
		model,
		controller: model.controller,
		pick: input.pick,
		camera: stage.camera,
		viewport: stage.viewport,
		hostRef: parts.refs.viewportRef,
		getSnapshot: () => stage.snapshot.value,
		announce: parts.core.announce,
		notify: state.notify,
	}
	const actions = useEdit3DActions(base)
	const drag = useNodeDrag({ ...base, getOverlay })
	const connect = useConnectTool({ ...base, getOverlay, getSource: () => state.selected()[0] ?? null, actions })
	const palette = useModelPalette({
		model,
		getModels: () => parts.props.models,
		appModels: parts.appModels,
		getSelected: () => state.selected()[0] ?? null,
		getResolved: id => stage.scene.content.value?.nodes.registry.getHandle(id)?.preset ?? null,
	})
	const pointer = useEdit3DPointer({ parts, stage, state, drag, connect })
	watch(state.isActive, (value, previous) => {
		if (previous && !value) drag.cancel()
		if (previous && !value) pointer.reset(palette)
	})
	const onKeydown = useEdit3DKeyboard({
		...base,
		isActive: state.isActive,
		labels: stage.labels,
		actions,
		drag,
		connect,
		tool: state.tool,
		palette,
		targets: state.targets,
		setTool: pointer.setTool,
		openInspector: state.openInspector,
		isTyping: input.keyboard.isTyping,
	})
	return { ...state, actions, palette, connect, drag, onKeydown, ...pointer, guardClick: pointer.guardClick }
}
