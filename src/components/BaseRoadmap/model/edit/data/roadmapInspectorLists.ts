import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapMaterial, RoadmapMaterialKind, RoadmapSubtopic, RoadmapTopic } from '../../../types/roadmapData.types'

export function nextSubtopic(topic: RoadmapTopic): RoadmapSubtopic {
	const taken = new Set((topic.subtopics ?? []).map(item => item.id))
	let number = taken.size + 1
	while (taken.has(`s${number}`)) number += 1
	return { id: `s${number}`, title: formatMessage(UI_ROADMAP_EDIT.NEW_SUBTOPIC, { n: (topic.subtopics?.length ?? 0) + 1 }) }
}

export function newMaterial(kind: RoadmapMaterialKind): RoadmapMaterial {
	return { title: UI_ROADMAP_EDIT.NEW_MATERIAL, kind, url: '' }
}

export function replaceAt<T>(list: readonly T[], position: number, change: Partial<T>): T[] {
	return list.map((item, index) => (index === position ? { ...item, ...change } : item))
}

export function listPatch<T>(
	key: 'subtopics' | 'materials',
	current: readonly T[] | undefined,
	change: (list: T[]) => T[],
): Record<string, unknown> {
	const next = change([...(current ?? [])])
	return { [key]: next.length > 0 ? next : undefined }
}
