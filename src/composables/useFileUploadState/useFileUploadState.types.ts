import type { UploadedFile } from '@components/BaseFileUpload/model/BaseFileUpload.types'

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
