import { computed, ref, watch } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FILE_MANAGER } from '@/locales/messages'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { nameError, uniqueName } from '../lib/fileManagerIndex'
import type { FileManagerCore, FileManagerEditing, FileManagerNameError } from '../../types/FileManagerInternal.types'

const ERROR_KEYS = { empty: 'NAME_EMPTY', forbidden: 'NAME_FORBIDDEN', exists: 'NAME_EXISTS' } as const

function useEditingState(core: FileManagerCore) {
	const editing = ref<FileManagerEditing | null>(null)
	const draft = ref('')
	const errorCode = ref<FileManagerNameError | null>(null)
	const announcement = ref('')

	watch(core.entries, entries => {
		const current = editing.value
		if (current?.mode === 'rename' && !entries.some(entry => entry.id === current.id)) editing.value = null
	})

	return {
		editing,
		draft,
		errorCode,
		announcement,
		isCreating: computed(() => editing.value?.mode === 'create'),
		editorError: computed(() => (errorCode.value ? UI_FILE_MANAGER[ERROR_KEYS[errorCode.value]] : undefined)),
		editorLabel: computed(() => {
			const current = editing.value
			if (current?.mode !== 'rename') return UI_FILE_MANAGER.CREATE_LABEL
			return formatMessage(UI_FILE_MANAGER.RENAME_LABEL, { name: core.index.value.byId.get(current.id)?.name ?? '' })
		}),
		begin(next: FileManagerEditing, name: string): void {
			editing.value = next
			draft.value = name
			announcement.value = ''
			errorCode.value = null
		},
		validate(): FileManagerNameError | null {
			const current = editing.value
			const exceptId = current?.mode === 'rename' ? current.id : undefined
			return nameError(core.index.value, { parentId: core.folderId.value, exceptId }, draft.value)
		},
		close(isRefocus: boolean): void {
			const current = editing.value
			editing.value = null
			errorCode.value = null
			if (isRefocus) core.requestFocus(current?.mode === 'rename' ? current.id : null)
		},
	}
}

function emitCommit(core: FileManagerCore, current: FileManagerEditing, name: string): string {
	if (current.mode === 'create') {
		core.emit('create-folder', core.folderId.value, name)
		return formatMessage(UI_FILE_MANAGER.FOLDER_CREATED, { name })
	}
	if (name === core.index.value.byId.get(current.id)?.name) return ''
	core.emit('rename', current.id, name)
	return formatMessage(UI_FILE_MANAGER.RENAMED, { name })
}

export function useFileManagerEditing(core: FileManagerCore) {
	const { editing, draft, errorCode, announcement, begin, validate, close, ...labels } = useEditingState(core)

	function commit(current: FileManagerEditing, isRefocus: boolean): void {
		const problem = validate()
		if (problem) {
			errorCode.value = problem
			return
		}
		const name = draft.value.trim()
		announcement.value = emitCommit(core, current, name)
		close(isRefocus)
	}

	return {
		editing,
		draft,
		announcement,
		...labels,
		handleEditorKeydown(event: KeyboardEvent): void {
			if (isImeKeydown(event)) return
			if (event.key === 'Enter' && editing.value) commit(editing.value, true)
			else if (event.key === 'Escape') close(true)
			else return
			event.preventDefault()
			event.stopPropagation()
		},
		setDraft(value: string): void {
			draft.value = value
			errorCode.value = null
		},
		finishEditing(): void {
			const current = editing.value
			if (current && validate()) close(false)
			else if (current) commit(current, false)
		},
		startRename(id: string | null = core.selection.primaryId.value): void {
			const item = id === null ? undefined : core.index.value.byId.get(id)
			if (core.canOperate.value && item) begin({ mode: 'rename', id: item.id }, item.name)
		},
		startCreate(): void {
			if (core.canOperate.value) {
				if (core.query.get()) core.query.set('')
				begin({ mode: 'create' }, uniqueName(core.index.value, core.folderId.value, UI_FILE_MANAGER.NEW_FOLDER_NAME))
			}
		},
	}
}
