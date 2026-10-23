import type { Ref } from 'vue'
import type { EditorHistoryKind } from '../../useEditorHistory'
import type { EditorActiveStates } from './useEditorToolbar.types'

export interface UseToolbarCommandsOptions {
	editorRef: Ref<HTMLDivElement | null>
	onInput: (kind?: EditorHistoryKind) => void
	/** Вызывается перед правкой DOM: запоминает выделение «до» для истории отмены */
	onBeforeChange?: () => void
	activeStates: EditorActiveStates
	updateActiveStates: () => void
	saveSelection: () => void
	restoreSelection: () => boolean
	ensureSelection: () => void
	isCodeMode: Ref<boolean>
	codeContent: Ref<string>
	wrapCodeSelection: (open: string, close: string) => void
	insertCodeAtCursor: (html: string) => void
	getCodeTextarea: () => HTMLTextAreaElement | null
	promptForUrl?: () => string | null
	/** Адрес `blob:` для вставляемого файла; освобождается при размонтировании и сбросе истории */
	createMediaUrl: (file: Blob) => string
}

/** Часть опций команд, которая нужна правке DOM: область, выделение и сообщение о вводе */
export type EditorEditContext = Pick<
	UseToolbarCommandsOptions,
	'editorRef' | 'ensureSelection' | 'onBeforeChange' | 'onInput' | 'saveSelection' | 'updateActiveStates'
>

/** Свойство встроенного стиля, которое меняют цветовые команды */
export type InlineStyleProperty = 'backgroundColor' | 'color'

/** Разметка медиа по адресу файла: для режима кода и для визуального режима */
export interface MediaMarkup {
	code: (url: string) => string
	visual: (url: string) => string
}

/** Выделение и текстовый узел с кареткой внутри редактора */
export interface CaretTextNode {
	sel: Selection
	node: Text
}

/** Значение ссылки: проверенный адрес и признак «открывать в новой вкладке» */
export interface EditorLinkValue {
	url: string
	isNewTab: boolean
}
