import { computed } from 'vue'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { SegmentedOption } from '@components/BaseSegmented'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import { useRoadmapEditorContext } from '../view/roadmapEditorContext'
import type { RoadmapTool } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapPalette() {
	const { edit, editor, isDisabled, publish } = useRoadmapEditorContext()
	const templates = computed<DropdownMenuItem[]>(() => [
		{ label: UI_ROADMAP_EDIT.TEMPLATES_CAPTION, type: 'label' },
		...edit.templates.value.map((template): DropdownMenuItem => ({
			label: template.subtitle === undefined ? template.title : `${template.title} · ${template.subtitle}`,
			onSelect: () => editor.requestTemplate(template.id),
		})),
	])
	return {
		isDisabled,
		publish,
		templates,
		tool: editor.tool,
		canUndo: computed(() => edit.history.state.value.canUndo),
		canRedo: computed(() => edit.history.state.value.canRedo),
		toolOptions: computed<SegmentedOption[]>(() => [
			{ value: 'select', label: UI_ROADMAP_EDIT.TOOL_SELECT, icon: 'check' },
			{ value: 'link', label: UI_ROADMAP_EDIT.TOOL_LINK, icon: 'link' },
		]),
		setTool: (value: string | number): void => editor.setTool(value as RoadmapTool),
		addStage: (): void => void editor.addStage(),
		addTopic: (): void => void editor.addTopic(),
		expandAll: editor.expandAll,
		collapseAll: editor.collapseAll,
		undo: (): void => void edit.undo(),
		redo: (): void => void edit.redo(),
	}
}
