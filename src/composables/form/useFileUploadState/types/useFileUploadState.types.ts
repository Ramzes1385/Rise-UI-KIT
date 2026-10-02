import type { Ref } from 'vue'
import type { FileUploader, UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'

export interface UseFileUploadStateOptions {
	getMaxSize: () => number
	getAccept: () => string
	getMaxCount: () => number
	/** Множественный выбор; false — новый файл заменяет выбранный. Без опции файлы добавляются */
	getIsMultiple?: () => boolean
	/** Функция загрузки приложения; без неё файлы только выбираются (статус `selected`) */
	getUploader?: () => FileUploader | undefined
	/** Миниатюры изображений (objectURL); false — без превью. Без опции превью создаются */
	getAllowPreview?: () => boolean
	onError: (message: string) => void
	onChange: (files: File[]) => void
	onRemove: (file: UploadedFile) => void
	/** `uploader` завершился успешно */
	onUploadSuccess?: (file: UploadedFile, response: unknown) => void
	/** `uploader` отклонил промис */
	onUploadError?: (file: UploadedFile, message: string) => void
}

/** Загрузки файлов через `uploader`: запуск, отмена одной и всех */
export interface FileUploadTransfer {
	/** Запускает загрузку файла; без `uploader` файл остаётся в статусе `selected` */
	start: (itemId: string) => void
	/** Отменяет загрузку файла (signal.abort), её итог больше не меняет список */
	abort: (itemId: string) => void
	/** Отменяет все загрузки */
	abortAll: () => void
}

/** Внутреннее состояние useFileUploadState, общее для действий над файлами */
export interface FileUploadContext {
	options: UseFileUploadStateOptions
	uploadedFiles: Ref<UploadedFile[]>
	internalErrors: Ref<string[]>
	/** Текст для live-региона: итог последней загрузки */
	announcement: Ref<string>
	transfer: FileUploadTransfer
}

/** Внутреннее состояние загрузчика: контроллер отмены на каждую идущую загрузку */
export interface FileUploadTransferState {
	options: UseFileUploadStateOptions
	uploadedFiles: Ref<UploadedFile[]>
	announcement: Ref<string>
	controllers: Map<string, AbortController>
}

/** Одна загрузка: id файла и её контроллер отмены */
export interface FileUploadJob {
	itemId: string
	controller: AbortController
}
