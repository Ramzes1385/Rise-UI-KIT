/** Composable: состояние загрузки файлов — валидация, лимит, drag-and-drop, загрузка функцией приложения */

import { disposeItem } from './fileUploadItems'
import { computed, onBeforeUnmount, ref } from 'vue'
import { createUploadTransfer } from './fileUploadTransfer'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'
import { addFiles as addUploadFiles, clearFiles, removeFile, retryFile } from './fileUploadActions'
import type { FileUploadContext, UseFileUploadStateOptions } from './types/useFileUploadState.types'

/**
 * Описание: управляет списком выбранных файлов. Прогресс и статус приходят только из `getUploader` приложения:
 * без него файлы остаются выбранными (`selected`), без имитации. При размонтировании загрузки отменяются, превью освобождаются.
 */
function useFileUploadState(options: UseFileUploadStateOptions) {
	const uploadedFiles = ref<UploadedFile[]>([])
	const isDragOver = ref(false)
	const internalErrors = ref<string[]>([])
	const announcement = ref('')
	const transfer = createUploadTransfer(options, uploadedFiles, announcement)
	const ctx: FileUploadContext = { options, uploadedFiles, internalErrors, announcement, transfer }
	let isDisposed = false

	const displayErrors = computed(() => internalErrors.value)

	const addFiles = (files: File[]): void => {
		if (!isDisposed) addUploadFiles(ctx, files)
	}

	onBeforeUnmount(() => {
		isDisposed = true
		transfer.abortAll()
		uploadedFiles.value.forEach(item => disposeItem(ctx, item))
	})

	return {
		uploadedFiles,
		isDragOver,
		internalErrors,
		displayErrors,
		hasError: computed(() => displayErrors.value.length > 0),
		announcement,
		addFiles,
		handleRemove: (item: UploadedFile): void => removeFile(ctx, item),
		retry: (item: UploadedFile): void => retryFile(ctx, item),
		clear: (): void => clearFiles(ctx),
		handleDragOver: (): void => {
			isDragOver.value = true
		},
		handleDragLeave: (): void => {
			isDragOver.value = false
		},
		handleDrop: (e: DragEvent): void => {
			isDragOver.value = false
			if (e.dataTransfer?.files) addFiles(Array.from(e.dataTransfer.files))
		},
	}
}

export { useFileUploadState }
