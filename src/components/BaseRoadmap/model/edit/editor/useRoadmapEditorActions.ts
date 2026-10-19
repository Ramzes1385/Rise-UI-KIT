import { shallowRef } from 'vue'
import { useRoadmapEditorAdd } from './useRoadmapEditorAdd'
import type { RoadmapEditController, RoadmapInspectorState, RoadmapPending } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapEditorActions(edit: RoadmapEditController, inspector: RoadmapInspectorState) {
	const pending = shallowRef<RoadmapPending | null>(null)
	const adding = useRoadmapEditorAdd(edit, inspector)

	function requestRemove(id: string): void {
		const found = edit.find(id)
		if (!found) return
		if (found.topic || found.stage.topics.length === 0) {
			void edit.remove([id]).then(isDone => isDone && id === inspector.targetId.value && inspector.select(null))
			return
		}
		pending.value = { kind: 'stage', id, title: found.stage.title, topics: found.stage.topics.length }
	}

	function requestTemplate(id: string): void {
		const template = edit.templates.value.find(item => item.id === id)
		const isFilled = edit.viewData.value.stages.length > 0
		if (template?.data && isFilled) pending.value = { kind: 'template', id, title: template.title }
		else void insertTemplate(id)
	}

	function insertTemplate(id: string): Promise<boolean> {
		const stages = edit.viewData.value.stages
		const target = inspector.owner.value
		const stageIndex = stages.findIndex(stage => stage.id === target?.id)
		const index = stageIndex < 0 ? undefined : stageIndex + 1
		return edit.insertTemplate(id, { stage: target?.id, index })
	}

	async function confirm(): Promise<void> {
		const current = pending.value
		pending.value = null
		if (current?.kind === 'stage') await edit.remove([current.id])
		else if (current) await insertTemplate(current.id)
		if (current?.kind === 'stage' && inspector.targetId.value === current.id) inspector.select(null)
	}

	const cancel = (): void => {
		pending.value = null
	}

	return {
		pending,
		...adding,
		requestRemove,
		requestTemplate,
		confirm,
		resolve: (result: boolean): void => void (result ? confirm() : cancel()),
		cancel,
	}
}
