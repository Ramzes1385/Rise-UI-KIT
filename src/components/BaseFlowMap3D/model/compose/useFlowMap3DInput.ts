import { useFlowMap3DContext } from '../view/useFlowMap3DContext'
import { useFlowMap3DList } from '../interaction/useFlowMap3DList'
import { useFlowMap3DFocus } from '../interaction/useFlowMap3DFocus'
import { useFlowMap3DPointer } from '../interaction/useFlowMap3DPointer'
import { useFlowMap3DKeyboard } from '../interaction/useFlowMap3DKeyboard'
import { useFlowPick } from '@components/BaseFlowMap/model/context/useFlowPick'
import type { FlowMap3DComposeParts, FlowMap3DStage } from '../../types/internal/flowMap3dCompose.types'

export function useFlowMap3DInput(parts: FlowMap3DComposeParts, stage: FlowMap3DStage) {
	const { core, focused, hovered } = parts
	const { model } = core
	const context = useFlowMap3DContext({
		model,
		camera: stage.camera,
		state: core.state,
		onFrame: stage.viewport.onFrame,
		focused,
		hovered,
		isReducedMotion: core.isReducedMotion,
		isVisible: core.isVisible,
		announce: core.announce,
	})
	const pick = useFlowPick(model, context, { hovered, isDisabled: () => Boolean(parts.props.isDisabled) })
	const focus = useFlowMap3DFocus({
		model,
		focused,
		announce: core.announce,
		isVisible: id => stage.labels.spots.get(id)?.isVisible ?? false,
		reveal: stage.camera.fly,
	})
	return {
		pick,
		focus,
		keyboard: useFlowMap3DKeyboard({ model, labels: stage.labels, camera: stage.camera, focus: { ...focus, focused }, pick }),
		pointer: useFlowMap3DPointer({
			hostRef: parts.refs.viewportRef,
			getContent: () => stage.scene.content.value,
			getCamera: () => stage.viewport.camera.value,
			pick,
			pinchZoom: stage.camera.pinchZoom,
		}),
		list: useFlowMap3DList({ model, pick, focus, reveal: stage.camera.fly }),
	}
}
