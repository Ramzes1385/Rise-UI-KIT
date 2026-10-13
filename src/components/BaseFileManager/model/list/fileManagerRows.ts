import { computed } from 'vue'
import type { Ref } from 'vue'
import { entryIcon, formatEntrySize, formatModified } from '../lib/fileManagerEntries'
import type { FileManagerCore, FileManagerDndState, FileManagerEditing, FileManagerRow } from '../../types/FileManagerInternal.types'

export function useFileManagerRows(core: FileManagerCore, editing: Ref<FileManagerEditing | null>, dnd: FileManagerDndState) {
	return computed((): FileManagerRow[] =>
		core.entries.value.map(item => ({
			item,
			icon: entryIcon(item),
			size: formatEntrySize(item),
			modified: formatModified(item.modifiedAt),
			isFolder: item.type === 'folder',
			isSelected: core.selection.selectedSet.value.has(item.id),
			isEditing: editing.value?.mode === 'rename' && editing.value.id === item.id,
			isDragging: dnd.draggingIds.value.includes(item.id),
			isDropTarget: item.type === 'folder' && dnd.dropTargetId.value === item.id,
			tabIndex: core.selection.tabbableId.value === item.id ? 0 : -1,
		})),
	)
}
