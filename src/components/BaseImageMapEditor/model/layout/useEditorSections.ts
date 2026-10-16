import { ref } from 'vue'
import type { Ref } from 'vue'
import type { EditorSectionId, EditorSectionsApi, EditorSectionsContext } from '../../types/ImageMapEditorLayout.types'

export function useEditorSections(
	narrow: { isNarrow: Ref<boolean>; isReady: Ref<boolean> },
	context: EditorSectionsContext,
): EditorSectionsApi {
	const overrides = ref<Partial<Record<EditorSectionId, boolean>>>({})

	function isDefaultOpen(id: EditorSectionId): boolean {
		if (id === 'properties') return context.hasSelection()
		return id === (context.hasLayer() ? 'objects' : 'layers')
	}

	function isOpen(id: EditorSectionId): boolean {
		return !narrow.isNarrow.value || (overrides.value[id] ?? isDefaultOpen(id))
	}

	return {
		isNarrow: narrow.isNarrow,
		isReady: narrow.isReady,
		isOpen,
		toggle(id: EditorSectionId): void {
			overrides.value = { ...overrides.value, [id]: !isOpen(id) }
		},
	}
}
