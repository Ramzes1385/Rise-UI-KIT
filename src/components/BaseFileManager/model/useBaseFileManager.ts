import type { InjectionKey } from 'vue'
import { useUi } from '@composables/base/useUi'
import { computed, inject, provide } from 'vue'
import { useFileManagerCore } from './useFileManagerCore'
import { useFileManagerRows } from './list/fileManagerRows'
import { useFileManagerList } from './list/useFileManagerList'
import { useFileManagerTree } from './tree/useFileManagerTree'
import { useFileManagerDnd } from './actions/useFileManagerDnd'
import { useFileManagerMenu } from './actions/useFileManagerMenu'
import { useFileManagerEditing } from './state/useFileManagerEditing'
import { useFileManagerActions } from './actions/useFileManagerActions'
import { useFileManagerDialogs } from './actions/useFileManagerDialogs'
import { useFileManagerToolbar } from './toolbar/useFileManagerToolbar'
import type { FileManagerCommands } from '../types/FileManagerInternal.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseFileManagerEmits, FileManagerProps } from '../types/BaseFileManager.types'

const FILE_MANAGER_ELEMENTS = [
	'root',
	'sidebar',
	'main',
	'toolbar',
	'path',
	'actions',
	'search',
	'header',
	'sort',
	'list',
	'entry',
	'icon',
	'name',
	'meta',
	'editor',
	'status',
	'state',
]

function createCommands(
	actions: ReturnType<typeof useFileManagerActions>,
	editor: ReturnType<typeof useFileManagerEditing>,
	dialogs: ReturnType<typeof useFileManagerDialogs>,
): FileManagerCommands {
	return {
		open: actions.openSelected,
		goUp: actions.goUp,
		rename: () => editor.startRename(),
		remove: () => dialogs.requestDelete(),
		move: () => dialogs.requestMove(),
		createFolder: editor.startCreate,
		upload: dialogs.requestUpload,
		isEditing: () => editor.editing.value !== null,
	}
}

function createFileManager(props: FileManagerProps, emit: BaseFileManagerEmits) {
	const core = useFileManagerCore(props, emit)
	const actions = useFileManagerActions(core)
	const editor = useFileManagerEditing(core)
	const dialogs = useFileManagerDialogs(core)
	const dnd = useFileManagerDnd(core)
	const commands = createCommands(actions, editor, dialogs)

	return {
		...useStandardBaseComponent('base-file-manager', props, FILE_MANAGER_ELEMENTS),
		ui: useUi(props, 'base-file-manager'),
		sizeScale: computed(() => props.sizeScale),
		isLoading: computed(() => props.isLoading),
		error: computed(() => props.error),
		accept: computed(() => props.accept),
		maxSize: computed(() => props.maxSize),
		core,
		actions,
		editor,
		dialogs,
		dnd,
		commands,
		rows: useFileManagerRows(core, editor.editing, dnd),
		list: useFileManagerList(core, commands, editor.editing),
		menu: useFileManagerMenu(core, commands),
		tree: useFileManagerTree(core, actions.navigate),
		toolbar: useFileManagerToolbar(core, actions.navigateToCrumb),
		rootStyle: computed(() => {
			const { height } = props
			return { height: typeof height === 'number' ? `${height}px` : height }
		}),
	}
}

const FILE_MANAGER_KEY: InjectionKey<ReturnType<typeof createFileManager>> = Symbol('file-manager')

export function useBaseFileManager(props: FileManagerProps, emit: BaseFileManagerEmits) {
	const fileManager = createFileManager(props, emit)
	provide(FILE_MANAGER_KEY, fileManager)
	return fileManager
}

export function useFileManagerContext() {
	return inject(FILE_MANAGER_KEY) as ReturnType<typeof createFileManager>
}
