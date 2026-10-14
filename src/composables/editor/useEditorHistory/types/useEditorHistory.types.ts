import type { ComputedRef, Ref } from 'vue'

/**
 * Вид правки для истории отмены.
 * `typing` и `deleting` склеиваются при быстром наборе или удалении, `drag` — части одного перетаскивания,
 * `command` (команда тулбара, вставка, режим кода) — всегда отдельный шаг.
 */
export type EditorHistoryKind = 'command' | 'deleting' | 'drag' | 'typing'

/** Точка выделения: путь из индексов детей от корня области и смещение в текстовом узле или номер ребёнка */
export interface EditorSelectionPoint {
	/** Индексы детей от корня; подряд идущие текстовые узлы считаются одним, пустые пропускаются */
	path: number[]
	/** Для текста — число символов от начала цепочки текстовых узлов, для элемента — номер ребёнка */
	offset: number
}

/** Выделение, записанное путями: переживает пересборку DOM из строки HTML */
export interface EditorSelectionPath {
	anchor: EditorSelectionPoint
	focus: EditorSelectionPoint
}

/** Разница двух строк HTML: общий префикс и суффикс отброшены, остаётся удалённое и вставленное */
export interface EditorHtmlPatch {
	/** Длина общего начала строк */
	start: number
	/** Фрагмент, который был в старой строке */
	removed: string
	/** Фрагмент, который стал в новой строке */
	inserted: string
}

/** Шаг отмены: патч HTML и выделение до и после правки */
export interface EditorHistoryEntry {
	kind: EditorHistoryKind
	patch: EditorHtmlPatch
	selectionBefore: EditorSelectionPath | null
	selectionAfter: EditorSelectionPath | null
	/** Время последней правки шага (мс), по нему набор склеивается */
	time: number
	/** Число правок, склеенных в шаг */
	count: number
}

/** Текущее состояние, от которого считаются патчи */
interface EditorHistoryPresent {
	html: string
	selection: EditorSelectionPath | null
}

/** Изменяемое состояние истории: стеки и открытый для склейки шаг */
export interface EditorHistoryState {
	undo: EditorHistoryEntry[]
	redo: EditorHistoryEntry[]
	present: EditorHistoryPresent | null
	open: EditorHistoryEntry | null
	captured: EditorSelectionPath | null
	/** `innerHTML` области сразу после последней записи или восстановления: по нему находятся правки мимо истории */
	lastDom: string
}

export interface UseEditorHistoryOptions {
	/** Область ввода, чьё содержимое записывается */
	root: Ref<HTMLElement | null>
	/** История работает только когда включена (не режим чтения, не режим кода) */
	isEnabled: () => boolean
	/** Вызывается после отмены или повтора, когда DOM уже восстановлен */
	onRestore: () => void
}

export interface EditorHistory {
	/** Есть что отменить (и история включена) */
	canUndo: ComputedRef<boolean>
	/** Есть что повторить (и история включена) */
	canRedo: ComputedRef<boolean>
	/** Запоминает выделение «до» правки; вызывается перед изменением DOM */
	capture: () => void
	/** Записывает правку после изменения DOM: новый шаг или склейка с открытым; без изменений HTML ничего не делает */
	record: (kind: EditorHistoryKind) => void
	/** Отменяет последний шаг; false, если нечего отменять */
	undo: () => boolean
	/** Повторяет отменённый шаг; false, если нечего повторять */
	redo: () => boolean
	/** Очищает стеки и берёт текущее содержимое области за исходное */
	reset: () => void
	/** Обрабатывает Ctrl/⌘+Z, Ctrl/⌘+Shift+Z, Ctrl+Y; true — сочетание наше, `preventDefault` уже вызван */
	handleKeyDown: (event: KeyboardEvent) => boolean
	/** Гасит нативные `historyUndo` и `historyRedo` и запускает свою отмену; перед другим вводом запоминает выделение */
	handleBeforeInput: (event: InputEvent, isComposing: boolean) => boolean
}

/** Направление шага истории */
export type EditorHistoryDirection = 'redo' | 'undo'

/** «Единица» среди детей узла: цепочка текстовых узлов подряд — одна единица, пустые текстовые узлы не считаются */
export interface EditorSelectionUnit {
	index: number
	/** Узел продолжает цепочку текстовых узлов, начатую раньше */
	isContinuation: boolean
}

/** Правка, которую нужно записать: вид и время */
export interface EditorHistoryChange {
	kind: EditorHistoryKind
	now: number
}

/** Описание сделанной правки: HTML до и после, выделение до и после */
export interface EditorHistoryEdit {
	base: string
	html: string
	before: EditorSelectionPath | null
	after: EditorSelectionPath | null
}
