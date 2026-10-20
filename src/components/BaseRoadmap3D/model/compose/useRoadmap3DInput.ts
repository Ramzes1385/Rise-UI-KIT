import { useSwipe } from '@composables/interaction/useSwipe'
import { useRoadmap3DList } from '../interaction/useRoadmap3DList'
import { useRoadmap3DPointer } from '../interaction/useRoadmap3DPointer'
import { useRoadmap3DKeyboard } from '../interaction/useRoadmap3DKeyboard'
import type { Roadmap3DInputParts, Roadmap3DStageApi } from '../../types/internal/roadmap3dCompose.types'

export function useRoadmap3DInput(parts: Roadmap3DInputParts, stage: Roadmap3DStageApi) {
	const { focus, tour, model, snapshot } = parts
	const keyboard = useRoadmap3DKeyboard({
		focus,
		tour,
		model,
		camera: stage.camera,
		edit: parts.edit,
		isEditing: () => model.isEditing.value,
		getStages: () => snapshot.value.stages,
	})
	const pointer = useRoadmap3DPointer({
		hostRef: parts.hostRef,
		getContent: () => stage.content.value,
		getCamera: () => stage.viewport.camera.value,
		pinchZoom: stage.camera.pinchZoom,
		pick: {
			input: () => tour.stop(),
			hover: id => (focus.hovered.value = snapshot.value.stages.some(item => item.id === id) ? id : null),
			pick: id => {
				if (snapshot.value.stages.some(item => item.id === id)) focus.focusStage(id)
				else parts.panel.selectTopic(id)
			},
			clear: () => parts.panel.closePanel(),
		},
	})
	const swipe = useSwipe({ isVertical: () => false, threshold: 50, onSwipeNext: () => focus.go(1), onSwipePrev: () => focus.go(-1) })
	return { keyboard, pointer, swipe, list: useRoadmap3DList({ snapshot }) }
}
