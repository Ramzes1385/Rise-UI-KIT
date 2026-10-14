import type { Ref } from 'vue'
import type { useEditorToolbar } from '@composables/editor/useEditorToolbar'
import type { EditorUploadMedia, EditorUploadResult } from './BaseEditor.types'

/** Ответ `uploadMedia`: адрес или `{ src, alt }` */
export type EditorUploadAnswer = string | EditorUploadResult

/** Вид вставляемого файла */
export type EditorMediaKind = 'image' | 'video'

/** Файл вставки или перетаскивания и его вид */
export interface EditorMediaFile {
	file: File
	kind: EditorMediaKind
}

/** Заглушка, поставленная в область на время загрузки */
export interface EditorUploadSlot {
	id: number
	/** HTML области сразу после вставки заглушки: по нему видно, что после неё ничего не менялось */
	snapshot: string | null
}

export interface EditorUploadContext {
	editorRef: Ref<HTMLDivElement | null>
	toolbar: ReturnType<typeof useEditorToolbar>
	/** Очистка HTML перед вставкой адреса от приложения */
	sanitize: (html: string) => string
	/** Текущая функция загрузки (`uploadMedia`) */
	getUpload: () => EditorUploadMedia | undefined
	/** Редактор только для чтения или отключён */
	isLocked: () => boolean
	/** Записать правку DOM как шаг истории и отправить значение */
	commit: () => void
	/** Загрузка не удалась */
	onError: (file: File, error: unknown) => void
}
