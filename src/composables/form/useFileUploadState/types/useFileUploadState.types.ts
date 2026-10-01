import type { Ref } from 'vue'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'

export interface UseFileUploadStateOptions {
	getMaxSize: () => number
	getAccept: () => string
	getMaxCount: () => number
	/** Множественный выбор; false — новый файл заменяет выбранный. Без опции файлы добавляются (прежнее поведение) */
	getIsMultiple?: () => boolean
	onError: (message: string) => void
	onChange: (files: File[]) => void
	onRemove: (file: UploadedFile) => void
}

/** Имитация прогресса загрузки: запуск по id файла и остановка всех таймеров */
export interface FileUploadProgress {
	/** Запускает имитацию прогресса файла; таймер останавливается на 100% или когда файл удалён */
	simulate: (itemId: string) => void
	/** Останавливает все таймеры (при размонтировании) */
	clearAll: () => void
}

/** Внутреннее состояние useFileUploadState, общее для действий над файлами */
export interface FileUploadContext {
	options: UseFileUploadStateOptions
	uploadedFiles: Ref<UploadedFile[]>
	internalErrors: Ref<string[]>
	progress: FileUploadProgress
	/** Номер последнего выбора в одиночном режиме: результат устаревшего чтения превью отбрасывается */
	selection: { id: number }
}
