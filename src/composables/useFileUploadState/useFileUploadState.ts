/** Composable: управление состоянием загрузки файлов (валидация, drag-and-drop, прогресс) */
import { computed, onBeforeUnmount, ref } from 'vue'
import { generateId } from '@utils/idUtils'
import { UI_TEXT } from '@/locales/messages'
import { createImagePreview, getExtension, validateFile } from '@utils/fileUtils'
import type { UseFileUploadStateOptions } from './useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/model/BaseFileUpload.types'

/** Имитация загрузки: прибавка прогресса за шаг — от PROGRESS_STEP_MIN до PROGRESS_STEP_MIN + PROGRESS_STEP_RANGE, % */
const PROGRESS_STEP_MIN = 5
const PROGRESS_STEP_RANGE = 20
/** Интервал шагов, мс */
const PROGRESS_INTERVAL_MS = 200

/** Описание: управляет состоянием загрузки файлов — валидация, добавление, удаление, drag-and-drop и симуляция прогресса загрузки */
function useFileUploadState(options: UseFileUploadStateOptions) {
	const { getMaxSize, getAccept, getMaxCount, getIsMultiple, onError, onChange, onRemove } = options

	const uploadedFiles = ref<UploadedFile[]>([])
	const isDragOver = ref(false)
	const internalErrors = ref<string[]>([])

	const progressIntervals = new Set<ReturnType<typeof setInterval>>()
	/** Номер последнего выбора в одиночном режиме: результат устаревшего чтения превью отбрасывается */
	let singleSelectionId = 0

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

		if (!(getIsMultiple?.() ?? true)) {
			await replaceFile(files)
			return
		}

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

		onChange(uploadedFiles.value.map(uploadedFile => uploadedFile.file))
	}

	/**
	 * Одиночный режим: новый валидный файл заменяет выбранный, как у нативного input без multiple.
	 * Раньше файлы копились до maxCount, и потребитель, читающий files[0] из change, получал старый файл.
	 * maxCount здесь не применяется; невалидный файл выбранный не вытесняет.
	 */
	async function replaceFile(files: File[]): Promise<void> {
		internalErrors.value = []
		const [file] = validateFiles(files)
		if (!file) return

		const selectionId = ++singleSelectionId
		const replacedItems = uploadedFiles.value
		uploadedFiles.value = []
		replacedItems.forEach(releaseItem)

		const item = await buildUploadItem(file)
		if (selectionId !== singleSelectionId) return
		commitUploadItem(item)
		onChange([file])
	}

	async function buildUploadItem(file: File): Promise<UploadedFile> {
		const previewUrl = await createImagePreview(file)
		return {
			id: generateId(),
			file,
			name: file.name,
			size: file.size,
			type: file.type,
			extension: getExtension(file.name),
			previewUrl,
			status: previewUrl ? 'uploading' : 'pending',
			progress: 0,
		}
	}

	function commitUploadItem(item: UploadedFile): void {
		uploadedFiles.value.push(item)
		if (item.previewUrl) {
			simulateUploadProgress(item.id)
		}
	}

	async function createUploadItem(file: File): Promise<void> {
		commitUploadItem(await buildUploadItem(file))
	}

	function simulateUploadProgress(itemId: string): void {
		const interval = setInterval(() => {
			const item = uploadedFiles.value.find(f => f.id === itemId)
			if (!item) {
				clearInterval(interval)
				progressIntervals.delete(interval)
				return
			}
			item.progress = Math.min(item.progress + Math.floor(Math.random() * PROGRESS_STEP_RANGE) + PROGRESS_STEP_MIN, 100)
			if (item.progress >= 100) {
				item.status = 'done'
				item.progress = 100
				clearInterval(interval)
				progressIntervals.delete(interval)
			}
		}, PROGRESS_INTERVAL_MS)
		progressIntervals.add(interval)
	}

	/** Освобождает превью и сообщает потребителю, что файл больше не выбран */
	function releaseItem(item: UploadedFile): void {
		/* istanbul ignore next — previewUrl присутствует только для image-файлов */
		if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
		onRemove(item)
	}

	function handleRemove(item: UploadedFile): void {
		uploadedFiles.value = uploadedFiles.value.filter(uploadedFile => uploadedFile.id !== item.id)
		releaseItem(item)
		onChange(uploadedFiles.value.map(uploadedFile => uploadedFile.file))
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
