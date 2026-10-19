import { UI_ROADMAP_EDIT } from '@/locales/messages'
import type { RoadmapStage } from '../../../types/roadmapData.types'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { RoadmapEditController, RoadmapEditorState } from '../../../types/internal/roadmapEdit.internal.types'

export function stageMenu(
	stage: RoadmapStage,
	context: { edit: RoadmapEditController; editor: RoadmapEditorState; rename: () => void },
): DropdownMenuItem[][] {
	const { edit, editor, rename } = context
	const isOptional = stage.kind === 'optional'
	return [
		[
			{ label: UI_ROADMAP_EDIT.MENU_RENAME, icon: 'edit', shortcut: 'F2', onSelect: rename },
			{ label: UI_ROADMAP_EDIT.MENU_DUPLICATE, icon: 'copy', shortcut: 'Ctrl D', onSelect: () => void editor.duplicate(stage.id) },
			{
				label: isOptional ? UI_ROADMAP_EDIT.MENU_REQUIRED : UI_ROADMAP_EDIT.MENU_OPTIONAL,
				icon: 'check',
				onSelect: () => void edit.update(stage.id, { kind: isOptional ? undefined : 'optional' }),
			},
		],
		[
			{
				label: UI_ROADMAP_EDIT.MENU_REMOVE,
				icon: 'trash',
				shortcut: 'Del',
				isDanger: true,
				onSelect: () => editor.requestRemove(stage.id),
			},
		],
	]
}
