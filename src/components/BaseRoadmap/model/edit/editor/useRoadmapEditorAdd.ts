import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { buildDuplicate } from '../changes/roadmapInsert'
import { collectRoadmapIds, uniqueRoadmapId } from '../data/roadmapTemplates'
import type { RoadmapEditController, RoadmapInspectorState } from '../../../types/internal/roadmapEdit.internal.types'

function selectedStageIndex(edit: RoadmapEditController, inspector: RoadmapInspectorState): number {
	const id = inspector.owner.value?.id
	const index = edit.viewData.value.stages.findIndex(stage => stage.id === id)
	return index < 0 ? edit.viewData.value.stages.length : index + 1
}

export function useRoadmapEditorAdd(edit: RoadmapEditController, inspector: RoadmapInspectorState) {
	async function addStage(): Promise<void> {
		const id = uniqueRoadmapId(collectRoadmapIds(edit.viewData.value), 'stage')
		const isAdded = await edit.addStage({ id, title: UI_ROADMAP_EDIT.NEW_STAGE, topics: [] }, selectedStageIndex(edit, inspector))
		if (isAdded) inspector.select(id)
	}

	async function addTopic(stageId?: string): Promise<void> {
		const stages = edit.viewData.value.stages
		const stage = stageId ?? inspector.owner.value?.id ?? stages[stages.length - 1]?.id
		if (stage === undefined) return
		const id = uniqueRoadmapId(collectRoadmapIds(edit.viewData.value), 'topic')
		if (await edit.addTopic(stage, { id, title: UI_ROADMAP_EDIT.NEW_TOPIC })) inspector.select(id)
	}

	const duplicate = (id: string): Promise<boolean> =>
		edit.run({
			name: 'duplicate',
			label: formatMessage(UI_ROADMAP_EDIT.LABEL_DUPLICATE, {
				title: edit.find(id)?.topic?.title ?? edit.find(id)?.stage.title ?? id,
			}),
			build: data => buildDuplicate(data, id),
		})

	return { addStage, addTopic, duplicate }
}
