import { computed, shallowRef } from 'vue'
import { currentLocale } from '@/locales/state'
import { validateRoadmap } from '../../progress/roadmapValidate'
import type { RoadmapEditController, RoadmapEditCounts, RoadmapTool } from '../../../types/internal/roadmapEdit.internal.types'

function lacksMaterials(topic: { materials?: unknown[] }): boolean {
	return (topic.materials?.length ?? 0) === 0
}

export function useRoadmapEditorState(edit: RoadmapEditController) {
	const tool = shallowRef<RoadmapTool>('select')
	const linkFrom = shallowRef<string | null>(null)
	const collapsed = shallowRef<ReadonlySet<string>>(new Set())
	const counts = computed<RoadmapEditCounts>(() => {
		const data = edit.viewData.value
		const topics = data.stages.flatMap(stage => stage.topics)
		void edit.history.state.value
		return {
			stages: data.stages.length,
			topics: topics.length,
			changes: edit.history.list().filter(item => !item.isUndone).length,
			issues: validateRoadmap(data).issues.length + topics.filter(lacksMaterials).length,
		}
	})
	const toggle = (id: string, isOpen: boolean): void => {
		const next = new Set(collapsed.value)
		if (isOpen) next.delete(id)
		else next.add(id)
		collapsed.value = next
	}
	return {
		tool,
		linkFrom,
		counts,
		isExpanded: (id: string): boolean => !collapsed.value.has(id),
		toggleStage: (id: string): void => toggle(id, collapsed.value.has(id)),
		expandStage: (id: string): void => toggle(id, true),
		expandAll: (): void => {
			collapsed.value = new Set()
		},
		collapseAll: (): void => {
			collapsed.value = new Set(edit.viewData.value.stages.map(stage => stage.id))
		},
		setTool: (value: RoadmapTool): void => {
			tool.value = value
			linkFrom.value = null
		},
		savedText: (value: Date | string | number | null | undefined): string => {
			if (value === null || value === undefined) return ''
			const date = new Date(value)
			if (Number.isNaN(date.getTime())) return ''
			return new Intl.DateTimeFormat(currentLocale.value.intl, { hour: '2-digit', minute: '2-digit' }).format(date)
		},
	}
}
