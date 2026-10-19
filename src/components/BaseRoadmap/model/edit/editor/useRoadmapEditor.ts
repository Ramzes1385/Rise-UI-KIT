import { formatMessage } from '@/locales/state'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { useRoadmapEditorState } from './useRoadmapEditorState'
import { handleRoadmapEditKeydown } from '../run/roadmapEditKeys'
import { useRoadmapEditorActions } from './useRoadmapEditorActions'
import { useRoadmapInspector } from '../sortable/useRoadmapInspector'
import type { RoadmapEditController } from '../../../types/internal/roadmapEdit.internal.types'

export function useRoadmapEditor(edit: RoadmapEditController, focusTitle: () => void) {
	const inspector = useRoadmapInspector(edit)
	const state = useRoadmapEditorState(edit)
	const actions = useRoadmapEditorActions(edit, inspector)

	function activate(id: string): void {
		if (state.tool.value !== 'link') {
			inspector.select(id)
			return
		}
		const from = state.linkFrom.value
		const title = edit.find(id)?.topic?.title
		if (title === undefined) return
		if (from === null) {
			state.linkFrom.value = id
			edit.announce(formatMessage(UI_ROADMAP_EDIT.LINK_PICKED, { title }))
		} else if (from !== id) {
			state.linkFrom.value = null
			void edit.addRequirement(id, from)
		}
	}

	return {
		inspector,
		...state,
		...actions,
		activate,
		focusTitle,
		onKeydown: (event: KeyboardEvent): void => handleRoadmapEditKeydown(event, { edit, inspector, state, actions, focusTitle }),
	}
}
