import { computed } from 'vue'
import { useRoadmapEditorContext } from '../view/roadmapEditorContext'
import { stagePlace, stepStage, stepTopic } from '../data/roadmapPlaces'

export function useRoadmapItemToolbar() {
	const { edit, editor, sort, isDisabled } = useRoadmapEditorContext()
	const id = (): string => editor.inspector.targetId.value as string
	const canStep = (key: 'ArrowUp' | 'ArrowDown') =>
		computed(() => {
			const data = edit.viewData.value
			const place = stagePlace(data, id()) === null ? stepTopic(data, id(), key) : stepStage(data, id(), key)
			return !isDisabled() && place !== null
		})
	return {
		isDisabled,
		canUp: canStep('ArrowUp'),
		canDown: canStep('ArrowDown'),
		up: (): void => void sort.moveBy(id(), -1),
		down: (): void => void sort.moveBy(id(), 1),
		duplicate: (): void => void editor.duplicate(id()),
		remove: (): void => editor.requestRemove(id()),
	}
}
