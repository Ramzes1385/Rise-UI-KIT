import type { ComputedRef, Ref } from 'vue'
import type {
	BaseFileManagerEmits,
	FileManagerItem,
	FileManagerProps,
	FileManagerSort,
	FileManagerSortKey,
	FileManagerView,
} from './BaseFileManager.types'

/** Плоский список записей, разложенный по `id` и по родителям */
export interface FileManagerIndex {
	byId: Map<string, FileManagerItem>
	children: Map<string | null, FileManagerItem[]>
}

/** Что не так с введённым именем */
export type FileManagerNameError = 'empty' | 'forbidden' | 'exists'

/** Что сейчас вводится в поле на месте: новое имя записи или имя новой папки */
export type FileManagerEditing = { mode: 'rename'; id: string } | { mode: 'create' }

/** Где проверяется имя: папка и запись, которую переименовывают (её имя занятым не считается) */
export interface FileManagerNameTarget {
	parentId: string | null
	exceptId?: string
}

/** Значение, которым владеет либо родитель (проп), либо менеджер сам */
export interface Controlled<T> {
	get: () => T
	set: (next: T) => void
}

/** Выбор записей текущего списка */
interface FileManagerSelection {
	/** Запись, на которой стоит фокус списка (roving tabindex) */
	tabbableId: ComputedRef<string | null>
	selectedSet: ComputedRef<Set<string>>
	/** Выбранные записи в порядке списка */
	selectedIds: ComputedRef<string[]>
	/** Записи, к которым применяется действие: выбранные, а без выбора — запись с фокусом */
	actionIds: ComputedRef<string[]>
	/** Запись, к которой применяется действие над одной записью (открыть, переименовать) */
	primaryId: ComputedRef<string | null>
	selectOnly: (id: string) => void
	toggle: (id: string) => void
	selectRange: (id: string) => void
	selectAll: () => void
	clear: () => void
	setActive: (id: string) => void
}

/** Запрос на перенос фокуса в список: `id` записи, `null` — запись с фокусом списка */
export interface FileManagerFocusRequest {
	id: string | null
}

/** Общая основа: свойства, состояние, выбор и сведения о том, что сейчас разрешено */
export interface FileManagerCore {
	props: FileManagerProps
	emit: BaseFileManagerEmits
	index: ComputedRef<FileManagerIndex>
	path: Controlled<string | null>
	view: Controlled<FileManagerView>
	sort: Controlled<FileManagerSort>
	query: Controlled<string>
	selected: Controlled<string[]>
	folderId: ComputedRef<string | null>
	chain: ComputedRef<FileManagerItem[]>
	siblings: ComputedRef<FileManagerItem[]>
	entries: ComputedRef<FileManagerItem[]>
	selection: FileManagerSelection
	rootName: ComputedRef<string>
	canOperate: ComputedRef<boolean>
	canNavigate: ComputedRef<boolean>
	focusRequest: Ref<FileManagerFocusRequest | null>
	requestFocus: (id: string | null) => void
}

/** Действия, которые вызывают клавиатура, меню и кнопки: все относятся к `actionIds` */
export interface FileManagerCommands {
	open: () => void
	rename: () => void
	remove: () => void
	move: () => void
	goUp: () => void
	createFolder: () => void
	upload: () => void
	isEditing: () => boolean
}

/** Состояние перетаскивания записей */
export interface FileManagerDndState {
	draggingIds: Ref<string[]>
	dropTargetId: Ref<string | null | undefined>
}

/** Строка списка для шаблона */
export interface FileManagerRow {
	item: FileManagerItem
	icon: string
	size: string
	modified: string
	isFolder: boolean
	isSelected: boolean
	isEditing: boolean
	isDragging: boolean
	isDropTarget: boolean
	tabIndex: number
}

/** Кнопка сортировки в заголовке списка */
export interface FileManagerSortButton {
	key: FileManagerSortKey
	label: string
	isActive: boolean
	icon?: string
	ariaLabel: string
}

/** Обработчик клавиши в списке: `true` — клавиша обработана */
export type FileManagerKeyHandler = (context: FileManagerKeyContext) => boolean

export interface FileManagerKeyContext {
	core: FileManagerCore
	commands: FileManagerCommands
	event: KeyboardEvent
}

export interface FileManagerEditorProps {
	/** Иконка записи, которую редактируют */
	icon: string
}
