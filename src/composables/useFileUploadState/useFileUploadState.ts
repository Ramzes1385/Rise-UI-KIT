/** Composable: управление состоянием загрузки файлов (валидация, drag-and-drop, прогресс) */
import { computed, onBeforeUnmount, ref } from 'vue'
import {
	UI_TEXT,
	UI_TIMING,
	UI_PROGRESS_STEP_MIN,
	UI_PROGRESS_STEP_RANGE,
} from '@constants'
import { createImagePreview, getExtension, validateFile } from '@utils/fileUtils'
import { generateId } from '@utils/idUtils'
import type { UseFileUploadStateOptions } from './useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/model/BaseFileUpload.types'

/** Описание: управляет состоянием загрузки файлов — валидация, добавление, удаление, drag-and-drop и симуляция прогресса загрузки */
function useFileUploadState(options: UseFileUploadStateOptions) {
	const { getMaxSize, getAccept, getMaxCount, onError, onChange, onRemove } = options

	const uploadedFiles = ref<UploadedFile[]>([])
	const isDragOver = ref(false)
	const internalErrors = ref<string[]>([])

	const progressIntervals = new Set<ReturnType<typeof setInterval>>()

	const displayErrors = computed(() => internalErrors.value)
	const hasError = computed(() => displayErrors.value.length > 0)

	function validateFiles(files: File[]): File[] {
		const valid: File[] = []

		for (const file of files) {
			const result = validateFile(file, {
				maxSize: getMaxSize(),
				accept: getAccept(),
			})
			if (!result.isValid) {
				for (const err of result.errors) {
					internalErrors.value.push(err)
					onError(err)
				}
				continue
			}
			valid.push(file)
		}

		return valid
	}

	async function addFiles(files: File[]): Promise<void> {
		/* istanbul ignore next — defensive: пустой массив отсекается на уровне input change */
		if (files.length === 0) return

		const maxCount = getMaxCount()
		const remaining = maxCount - uploadedFiles.value.length
		if (remaining <= 0) {
			const errorMessage = `${UI_TEXT.FILE_MAX_COUNT_PREFIX} ${maxCount}`
			internalErrors.value.push(errorMessage)
			onError(errorMessage)
			return
		}

		internalErrors.value = []
		const toAdd = files.slice(0, remaining)
		const valid = validateFiles(toAdd)

		for (const file of valid) {
			await createUploadItem(file)
		}

		onChange(
			uploadedFiles.value.map(uploadedFile => uploadedFile.file),
		)
	}

	async function createUploadItem(file: File): Promise<void> {
		const previewUrl = await createImagePreview(file)
		uploadedFiles.value.push({
			id: generateId(),
			file,
			name: file.name,
			size: file.size,
			type: file.type,
			extension: getExtension(file.name),
			previewUrl,
			status: previewUrl ? 'uploading' : 'pending',
			progress: 0,
		})

		if (previewUrl) {
			simulateUploadProgress(uploadedFiles.value[uploadedFiles.value.length - 1].id)
		}
	}

	function simulateUploadProgress(itemId: string): void {
		const interval = setInterval(() => {
			const item = uploadedFiles.value.find(f => f.id === itemId)
			if (!item) {
				clearInterval(interval)
				progressIntervals.delete(interval)
				return
			}
			item.progress = Math.min(item.progress + Math.floor(Math.random() * UI_PROGRESS_STEP_RANGE) + UI_PROGRESS_STEP_MIN, 100)
			if (item.progress >= 100) {
				item.status = 'done'
				item.progress = 100
				clearInterval(interval)
				progressIntervals.delete(interval)
			}
		}, UI_TIMING.PROGRESS_INTERVAL)
		progressIntervals.add(interval)
	}

	function handleRemove(item: UploadedFile): void {
		uploadedFiles.value = uploadedFiles.value.filter(uploadedFile => uploadedFile.id !== item.id)
		/* istanbul ignore next — previewUrl присутствует только для image-файлов */
		if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
		onRemove(item)
		onChange(
			uploadedFiles.value.map(uploadedFile => uploadedFile.file),
		)
	}

	function handleDragOver(): void {
		isDragOver.value = true
	}

	function handleDragLeave(): void {
		isDragOver.value = false
	}

	function handleDrop(e: DragEvent): void {
		isDragOver.value = false
		if (e.dataTransfer?.files) {
			addFiles(Array.from(e.dataTransfer.files))
		}
	}

	onBeforeUnmount(() => {
		progressIntervals.forEach(clearInterval)
		progressIntervals.clear()
	})

	return {
		uploadedFiles,
		isDragOver,
		internalErrors,
		displayErrors,
		hasError,
		addFiles,
		handleRemove,
		handleDragOver,
		handleDragLeave,
		handleDrop,
	}
}

export { useFileUploadState }
