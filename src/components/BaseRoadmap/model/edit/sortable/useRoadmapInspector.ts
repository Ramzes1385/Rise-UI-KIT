import { computed, shallowRef } from 'vue'
import { editText } from '../data/roadmapLabels'
import { buildUpdate } from '../changes/roadmapCommands'
import { wouldCreateCycle } from '../changes/roadmapCycles'
import { buildAlternative } from '../changes/roadmapAlternative'
import { findRoadmapEntity, roadmapTitle } from '../changes/roadmapFind'
import { listPatch, newMaterial, nextSubtopic, replaceAt } from '../data/roadmapInspectorLists'
import type { RoadmapMaterial, RoadmapMaterialKind, RoadmapSubtopic } from '../../../types/roadmapData.types'
import type { RoadmapEditController, RoadmapInspectorTab } from '../../../types/internal/roadmapEdit.internal.types'

function inspectorSelectors(edit: RoadmapEditController) {
	const targetId = shallowRef<string | null>(null)
	const found = computed(() => (targetId.value === null ? null : findRoadmapEntity(edit.viewData.value, targetId.value)))
	const requireOptions = computed(() => {
		const data = edit.viewData.value
		const id = targetId.value
		return data.stages
			.flatMap(item => [
				{ value: item.id, label: item.title },
				...item.topics.map(entry => ({ value: entry.id, label: `${item.title} · ${entry.title}` })),
			])
			.filter(option => option.value !== id)
			.map(option => ({ ...option, isDisabled: id !== null && wouldCreateCycle(data, id, option.value) }))
	})
	return {
		targetId,
		requireOptions,
		topic: computed(() => found.value?.topic ?? null),
		stage: computed(() => (found.value && !found.value.topic ? found.value.stage : null)),
		owner: computed(() => found.value?.stage ?? null),
		canBeAlternative: computed(() => (found.value?.topicIndex ?? 0) > 0),
	}
}

export function useRoadmapInspector(edit: RoadmapEditController) {
	const view = inspectorSelectors(edit)
	const { targetId, topic } = view
	const tab = shallowRef<RoadmapInspectorTab>('topic')

	function command(build: Parameters<typeof edit.run>[0]['build'], mergeKey?: string): Promise<boolean> {
		const id = targetId.value
		if (id === null) return Promise.resolve(false)
		const label = editText('LABEL_UPDATE', { title: roadmapTitle(edit.viewData.value, id) })
		return edit.run({ name: 'update', label, mergeKey: mergeKey === undefined ? undefined : `${mergeKey}:${id}`, build })
	}
	const patch = (values: Record<string, unknown>, mergeKey?: string): Promise<boolean> =>
		command(data => buildUpdate(data, targetId.value as string, values), mergeKey)
	const subtopics = (change: (list: RoadmapSubtopic[]) => RoadmapSubtopic[]) =>
		patch(listPatch('subtopics', topic.value?.subtopics, change))
	const materials = (change: (list: RoadmapMaterial[]) => RoadmapMaterial[]) =>
		patch(listPatch('materials', topic.value?.materials, change))

	return {
		...view,
		tab,
		select: (id: string | null): void => {
			targetId.value = id
			tab.value = 'topic'
		},
		setTab: (value: RoadmapInspectorTab): void => {
			tab.value = value
		},
		setTitle: (value: string) => patch({ title: value }, 'title'),
		setDescription: (value: string) => patch({ description: value === '' ? undefined : value }, 'description'),
		setHours: (value: number | null) => patch({ hours: value ?? undefined }, 'hours'),
		setOptional: (isOn: boolean) => patch({ kind: isOn ? 'optional' : undefined }),
		setRequires: (list: string[]) => patch({ requires: list.length > 0 ? list : undefined }),
		setAlternative: (isOn: boolean) => command(data => buildAlternative(data, targetId.value as string, isOn)),
		moveToStage: (stageId: string) => edit.move(targetId.value as string, { stage: stageId, index: Number.MAX_SAFE_INTEGER }),
		addSubtopic: () => subtopics(list => [...list, nextSubtopic(topic.value as NonNullable<typeof topic.value>)]),
		renameSubtopic: (id: string, title: string) => subtopics(list => list.map(item => (item.id === id ? { ...item, title } : item))),
		removeSubtopic: (id: string) => subtopics(list => list.filter(item => item.id !== id)),
		addMaterial: (kind: RoadmapMaterialKind) => materials(list => [...list, newMaterial(kind)]),
		updateMaterial: (position: number, values: Partial<RoadmapMaterial>) => materials(list => replaceAt(list, position, values)),
		removeMaterial: (position: number) => materials(list => list.filter((_, index) => index !== position)),
		remove: () => edit.remove([targetId.value as string]),
	}
}
