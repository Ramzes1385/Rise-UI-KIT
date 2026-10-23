import { computed } from 'vue'
import { entryIdOf } from '../lib/fileManagerDom'
import { UI_FILE_MANAGER } from '@/locales/messages'
import type { DropdownMenuItem } from '@components/BaseDropdownMenu'
import type { FileManagerCommands, FileManagerCore } from '../../types/FileManagerInternal.types'

function selectionGroup(count: number, canWrite: boolean, commands: FileManagerCommands): DropdownMenuItem[] {
	const group: DropdownMenuItem[] = []
	if (count === 1) group.push({ label: UI_FILE_MANAGER.OPEN, icon: 'folder-open', shortcut: 'Enter', onSelect: commands.open })
	if (count === 1 && canWrite) group.push({ label: UI_FILE_MANAGER.RENAME, shortcut: 'F2', onSelect: commands.rename })
	if (canWrite) group.push({ label: UI_FILE_MANAGER.MOVE, icon: 'arrow-right', onSelect: commands.move })
	if (canWrite) group.push({ label: UI_FILE_MANAGER.DELETE, icon: 'trash', shortcut: 'Del', isDanger: true, onSelect: commands.remove })
	return group
}

function hasMenu(count: number, canWrite: boolean): boolean {
	return count === 1 || canWrite
}

export function useFileManagerMenu(core: FileManagerCore, commands: FileManagerCommands) {
	const menuItems = computed((): DropdownMenuItem[][] => {
		const count = core.selection.selectedIds.value.length
		if (count) return [selectionGroup(count, core.canOperate.value, commands)]
		if (!core.canOperate.value) return []
		return [
			[
				{ label: UI_FILE_MANAGER.NEW_FOLDER, icon: 'plus', onSelect: commands.createFolder },
				{ label: UI_FILE_MANAGER.UPLOAD, icon: 'upload', onSelect: commands.upload },
			],
		]
	})

	function targetCount(id: string | null): number {
		if (id === null) return 0
		return core.selection.selectedSet.value.has(id) ? core.selection.selectedIds.value.length : 1
	}

	return {
		menuItems,
		isMenuDisabled: computed(() => !core.canNavigate.value),
		handleContextMenu(event: MouseEvent): void {
			const id = entryIdOf(event.target)
			const count = targetCount(id)
			if (id === null) core.selection.clear()
			else if (!core.selection.selectedSet.value.has(id)) core.selection.selectOnly(id)
			if (!hasMenu(count, core.canOperate.value)) event.stopPropagation()
		},
	}
}
