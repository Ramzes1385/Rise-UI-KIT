/** Composable: управление состоянием загрузки файлов (валидация, drag-and-drop, прогресс) */
import { computed, onBeforeUnmount, ref } from 'vue'
import { createUploadProgress } from './fileUploadProgress'
import { addFiles as addUploadFiles, removeFile } from './fileUploadActions'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'
import type { FileUploadContext, UseFileUploadStateOptions } from './types/useFileUploadState.types'

/** Описание: управляет состоянием загрузки файлов — валидация, добавление, удаление, drag-and-drop и симуляция прогресса загрузки */
function useFileUploadState(options: UseFileUploadStateOptions) {
	const uploadedFiles = ref<UploadedFile[]>([])
	const isDragOver = ref(false)
	const internalErrors = ref<string[]>([])
	const progress = createUploadProgress(uploadedFiles)
	const ctx: FileUploadContext = { options, uploadedFiles, internalErrors, progress, selection: { id: 0 } }

	const displayErrors = computed(() => internalErrors.value)
	const hasError = computed(() => displayErrors.value.length > 0)

	const addFiles = (files: File[]): Promise<void> => addUploadFiles(ctx, files)

	function handleDrop(e: DragEvent): void {
		isDragOver.value = false
		if (e.dataTransfer?.files) {
			addFiles(Array.from(e.dataTransfer.files))
		}
	}

	onBeforeUnmount(progress.clearAll)

	return {
		uploadedFiles,
		isDragOver,
		internalErrors,
		displayErrors,
		hasError,
		addFiles,
		handleRemove: (item: UploadedFile): void => removeFile(ctx, item),
		handleDragOver: (): void => {
			isDragOver.value = true
		},
		handleDragLeave: (): void => {
			isDragOver.value = false
		},
		handleDrop,
	}
}

export { useFileUploadState }
