import { parentOf } from '../lib/fileManagerIndex'
import type { FileManagerItem } from '../../types/BaseFileManager.types'
import type { FileManagerCore } from '../../types/FileManagerInternal.types'

export function useFileManagerActions(core: FileManagerCore) {
	function navigate(folderId: string | null): void {
		if (core.canNavigate.value && folderId !== core.folderId.value) {
			if (core.query.get()) core.query.set('')
			core.path.set(folderId)
		}
	}

	function open(item: FileManagerItem): void {
		if (!core.canNavigate.value) return
		if (item.type === 'folder') {
			navigate(item.id)
			core.requestFocus(null)
		}
		core.emit('open', item)
	}

	return {
		navigate,
		open,
		openSelected(): void {
			const id = core.selection.primaryId.value
			const item = id ? core.index.value.byId.get(id) : undefined
			if (item) open(item)
		},
		goUp(): void {
			const current = core.folderId.value
			if (current !== null) navigate(parentOf(core.index.value, current))
		},
		navigateToCrumb(position: number): void {
			navigate(position === 0 ? null : (core.chain.value[position - 1]?.id ?? null))
		},
	}
}
