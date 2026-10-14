import type { Ref } from 'vue'
import { nextTick, reactive, ref, watch } from 'vue'
import { getExtension } from '@utils/media/fileUtils'
import { ENTRY_SELECTOR } from '../lib/fileManagerDom'
import { useFileManagerKeyboard } from './useFileManagerKeyboard'
import type { FileManagerItem } from '../../types/BaseFileManager.types'
import type { FileManagerCommands, FileManagerCore, FileManagerEditing } from '../../types/FileManagerInternal.types'

function selectName(input: HTMLInputElement, item: FileManagerItem | undefined): void {
	const extension = item?.type === 'file' ? getExtension(item.name) : ''
	input.focus()
	input.setSelectionRange(0, extension ? input.value.length - extension.length - 1 : input.value.length)
}

function rowBox(row: HTMLElement) {
	return { top: `${row.offsetTop}px`, left: `${row.offsetLeft}px`, width: `${row.offsetWidth}px`, minHeight: `${row.offsetHeight}px` }
}

export function useFileManagerList(core: FileManagerCore, commands: FileManagerCommands, editing: Ref<FileManagerEditing | null>) {
	const listRef = ref<HTMLElement | null>(null)
	const mainRef = ref<HTMLElement | null>(null)
	const editorBox = reactive({ top: '0px', left: '0px', width: 'auto', minHeight: '0px' })
	const { handleListKeydown } = useFileManagerKeyboard(core, commands, listRef)

	function findElement(id: string | null): HTMLElement | null {
		const wanted = id ?? core.selection.tabbableId.value
		const elements = Array.from(listRef.value?.querySelectorAll<HTMLElement>(ENTRY_SELECTOR) ?? [])
		return elements.find(element => element.getAttribute('data-entry-id') === wanted) ?? null
	}

	watch(core.focusRequest, request => {
		if (request) void nextTick(() => findElement(request.id)?.focus())
	})

	watch(editing, current => {
		if (!current) return
		void nextTick(() => {
			const row = current.mode === 'rename' ? findElement(current.id) : null
			if (row) Object.assign(editorBox, rowBox(row))
			const input = mainRef.value?.querySelector<HTMLInputElement>('.base-file-manager__editor input')
			if (input) selectName(input, current.mode === 'rename' ? core.index.value.byId.get(current.id) : undefined)
		})
	})

	return {
		listRef,
		mainRef,
		editorBox,
		handleListKeydown,
		handleEntryClick(item: FileManagerItem, event: MouseEvent): void {
			if (event.shiftKey) core.selection.selectRange(item.id)
			else if (event.ctrlKey || event.metaKey) core.selection.toggle(item.id)
			else core.selection.selectOnly(item.id)
		},
		handleEntryFocus(item: FileManagerItem): void {
			core.selection.setActive(item.id)
		},
		handleBackgroundClick(event: MouseEvent): void {
			if (event.target === event.currentTarget || event.target === listRef.value) core.selection.clear()
		},
	}
}
