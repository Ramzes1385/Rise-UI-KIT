import type { Ref } from 'vue'
import type { EditorToolbar } from './EditorLinkDialog.types'
import type { EditorComposition } from './EditorComposition.types'
import type { useEditorState } from '@composables/editor/useEditorState'
import type { EditorHistoryKind } from '@composables/editor/useEditorHistory'

/** Источник правки: событие ввода (вид берётся из `inputType`) или готовый вид; без него правка считается командой */
export type EditorInputSource = EditorHistoryKind | Event

export interface EditorInputDeps {
	editorRef: Ref<HTMLDivElement | null>
	sanitize: (html: string) => string
	emitValue: (value: string) => void
	composition: EditorComposition
	toolbar: EditorToolbar
	state: ReturnType<typeof useEditorState>
}

export interface EditorInputHandlers {
	/** Обрабатывает правку содержимого: запись в историю, отправка значения, активные форматы */
	handleInput: (source?: EditorInputSource) => void
	/** Вызывается после отмены или повтора: отправляет восстановленное значение и обновляет состояние */
	restore: () => void
}
