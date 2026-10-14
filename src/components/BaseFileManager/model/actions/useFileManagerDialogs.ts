import { computed, nextTick, ref } from 'vue'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { formatMessage, getLocale, pluralize } from '@/locales/state'
import type { FileManagerCore } from '../../types/FileManagerInternal.types'
import { canMoveTo, folderToNodeId, folderTree, nodeIdToFolder } from '../lib/fileManagerIndex'

function isUsableOpener(element: HTMLElement | null): element is HTMLElement {
	if (!element?.isConnected || element.closest('[role="option"]')) return false
	return !element.hasAttribute('disabled') && element.getAttribute('aria-disabled') !== 'true'
}

function useOpenerFocus(core: FileManagerCore) {
	let opener: HTMLElement | null = null
	return {
		remember(): void {
			const active = document.activeElement
			opener = active instanceof HTMLElement && active !== document.body ? active : null
		},
		restore(isRowFocus = false): void {
			const target = opener
			opener = null
			if (!isRowFocus && isUsableOpener(target)) void nextTick(() => target.focus())
			else core.requestFocus(null)
		},
	}
}

function useDeleteDialog(core: FileManagerCore) {
	const isOpen = ref(false)
	const ids = ref<string[]>([])
	const hasFolder = computed(() => ids.value.some(id => core.index.value.byId.get(id)?.type === 'folder'))
	const focus = useOpenerFocus(core)

	return {
		isDeleteOpen: isOpen,
		deleteTitle: computed(() => {
			if (ids.value.length === 1)
				return formatMessage(UI_FILE_MANAGER.DELETE_ONE_TITLE, { name: core.index.value.byId.get(ids.value[0])?.name ?? '' })
			const count = pluralize(getLocale().plural.FILE_MANAGER_ITEMS, ids.value.length)
			return formatMessage(UI_FILE_MANAGER.DELETE_MANY_TITLE, { count })
		}),
		deleteDescription: computed(() =>
			hasFolder.value
				? `${UI_FILE_MANAGER.DELETE_DESCRIPTION} ${UI_FILE_MANAGER.DELETE_FOLDER_NOTE}`
				: UI_FILE_MANAGER.DELETE_DESCRIPTION,
		),
		requestDelete(targets: string[] = core.selection.actionIds.value): void {
			if (core.canOperate.value && targets.length) {
				focus.remember()
				ids.value = [...targets]
				isOpen.value = true
			}
		},
		closeDelete(isConfirmed: boolean): void {
			isOpen.value = false
			if (isConfirmed) core.emit('delete', ids.value)
			focus.restore(isConfirmed)
		},
	}
}

function useMoveDialog(core: FileManagerCore) {
	const isOpen = ref(false)
	const ids = ref<string[]>([])
	const target = ref<string | null | undefined>(undefined)
	const focus = useOpenerFocus(core)

	return {
		isMoveOpen: isOpen,
		moveNodes: computed(() => folderTree(core.index.value, core.rootName.value, id => !canMoveTo(core.index.value, ids.value, id))),
		moveSelectedIds: computed(() => (target.value === undefined ? [] : [folderToNodeId(target.value)])),
		canSubmitMove: computed(() => target.value !== undefined && canMoveTo(core.index.value, ids.value, target.value)),
		requestMove(targets: string[] = core.selection.actionIds.value): void {
			if (core.canOperate.value && targets.length) {
				focus.remember()
				ids.value = [...targets]
				target.value = undefined
				isOpen.value = true
			}
		},
		setMoveTarget(nodeIds: string[]): void {
			if (nodeIds.length) target.value = nodeIdToFolder(nodeIds[0])
		},
		closeMove(isConfirmed: boolean): void {
			isOpen.value = false
			if (isConfirmed && target.value !== undefined && canMoveTo(core.index.value, ids.value, target.value))
				core.emit('move', ids.value, target.value)
			focus.restore(isConfirmed)
		},
	}
}

function useUploadDialog(core: FileManagerCore) {
	const isOpen = ref(false)
	const files = ref<File[]>([])
	const sessionKey = ref(0)
	const focus = useOpenerFocus(core)

	function close(): void {
		isOpen.value = false
		files.value = []
		sessionKey.value++
		focus.restore()
	}

	return {
		isUploadOpen: isOpen,
		uploadFiles: files,
		uploadKey: sessionKey,
		closeUpload: close,
		requestUpload(): void {
			if (core.canOperate.value) {
				focus.remember()
				isOpen.value = true
			}
		},
		setUploadFiles(next: File[]): void {
			files.value = next
		},
		submitUpload(): void {
			if (files.value.length) core.emit('upload', [...files.value], core.folderId.value)
			close()
		},
	}
}

export function useFileManagerDialogs(core: FileManagerCore) {
	return { ...useDeleteDialog(core), ...useMoveDialog(core), ...useUploadDialog(core) }
}
