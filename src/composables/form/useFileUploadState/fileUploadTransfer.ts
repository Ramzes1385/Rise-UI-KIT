/** Утилиты: загрузка файлов функцией приложения `uploader` — прогресс, итог, отмена */
import type { Ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { UI_FILE_UPLOAD } from '@/locales/messages'
import type { FileUploaderContext, UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'
import type {
	FileUploadJob,
	FileUploadTransfer,
	FileUploadTransferState as TransferState,
	UseFileUploadStateOptions,
} from './types/useFileUploadState.types'

/** Описание: прогресс в целых процентах 0–100; нечисловое значение — 0 */
function clampProgress(percent: number): number {
	if (!Number.isFinite(percent)) return 0
	return Math.min(100, Math.max(0, Math.round(percent)))
}

/** Описание: текст ошибки загрузки — message ошибки или общий текст словаря */
function uploadErrorMessage(error: unknown): string {
	if (error instanceof Error && error.message) return error.message
	if (typeof error === 'string' && error) return error
	return UI_FILE_UPLOAD.UPLOAD_ERROR
}

/** Описание: актуальный (реактивный) элемент списка по id; null — файл удалён */
function findItem(state: TransferState, itemId: string): UploadedFile | null {
	return state.uploadedFiles.value.find(item => item.id === itemId) ?? null
}

function finishSuccess(state: TransferState, item: UploadedFile, response: unknown): void {
	item.status = 'done'
	item.progress = 100
	state.announcement.value = formatMessage(UI_FILE_UPLOAD.UPLOADED, { name: item.name })
	state.options.onUploadSuccess?.(item, response)
}

function finishError(state: TransferState, item: UploadedFile, error: unknown): void {
	const message = uploadErrorMessage(error)
	item.status = 'error'
	item.error = message
	state.announcement.value = formatMessage(UI_FILE_UPLOAD.UPLOAD_FAILED, { name: item.name, message })
	state.options.onUploadError?.(item, message)
}

/** Описание: итог загрузки применяется, только если она не отменена и файл ещё в списке */
function settle(state: TransferState, job: FileUploadJob, apply: (item: UploadedFile) => void): void {
	if (job.controller.signal.aborted) return
	state.controllers.delete(job.itemId)
	const item = findItem(state, job.itemId)
	if (item) apply(item)
}

function runUpload(state: TransferState, job: FileUploadJob, upload: (context: FileUploaderContext) => Promise<unknown>): void {
	const { signal } = job.controller
	const onProgress = (percent: number): void => {
		const live = signal.aborted ? null : findItem(state, job.itemId)
		if (live?.status === 'uploading') live.progress = clampProgress(percent)
	}
	Promise.resolve()
		.then(() => upload({ onProgress, signal }))
		.then(
			response => settle(state, job, live => finishSuccess(state, live, response)),
			(error: unknown) => settle(state, job, live => finishError(state, live, error)),
		)
}

/** Описание: создаёт загрузчик файлов списка; без `uploader` файлы остаются выбранными (`selected`) */
function createUploadTransfer(
	options: UseFileUploadStateOptions,
	uploadedFiles: Ref<UploadedFile[]>,
	announcement: Ref<string>,
): FileUploadTransfer {
	const state: TransferState = { options, uploadedFiles, announcement, controllers: new Map() }

	function abort(itemId: string): void {
		state.controllers.get(itemId)?.abort()
		state.controllers.delete(itemId)
	}

	function start(itemId: string): void {
		const item = findItem(state, itemId)
		const uploader = options.getUploader?.()
		if (!item || !uploader) return
		abort(itemId)
		const controller = new AbortController()
		state.controllers.set(itemId, controller)
		item.status = 'uploading'
		item.progress = 0
		item.error = undefined
		const { file } = item
		runUpload(state, { itemId, controller }, context => uploader(file, context))
	}

	function abortAll(): void {
		state.controllers.forEach(controller => controller.abort())
		state.controllers.clear()
	}

	return { start, abort, abortAll }
}

export { createUploadTransfer }
