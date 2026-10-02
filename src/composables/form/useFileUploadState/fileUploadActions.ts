/** Утилиты: добавление, замена и удаление файлов в состоянии загрузки */
import { formatMessage } from '@/locales/state'
import { UI_FILE_UPLOAD } from '@/locales/messages'
import type { FileUploadContext } from './types/useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'
import { buildUploadItem, commitUploadItem, releaseItem, reportError, validateFiles } from './fileUploadItems'

function emitChange(ctx: FileUploadContext): void {
	ctx.options.onChange(ctx.uploadedFiles.value.map(uploadedFile => uploadedFile.file))
}

function maxCountMessage(ctx: FileUploadContext): string {
	return formatMessage(UI_FILE_UPLOAD.MAX_COUNT, { count: ctx.options.getMaxCount() })
}

/**
 * Множественный режим: сначала проверка, потом лимит — невалидные файлы не занимают места,
 * а не поместившиеся валидные отбрасываются с одной ошибкой лимита.
 */
function appendFiles(ctx: FileUploadContext, files: File[]): void {
	const valid = validateFiles(ctx, files)
	const remaining = Math.max(0, ctx.options.getMaxCount() - ctx.uploadedFiles.value.length)
	if (valid.length > remaining) reportError(ctx, maxCountMessage(ctx))

	const accepted = valid.slice(0, remaining)
	if (accepted.length === 0) return
	accepted.forEach(file => commitUploadItem(ctx, buildUploadItem(ctx, file)))
	emitChange(ctx)
}

/**
 * Одиночный режим: новый валидный файл заменяет выбранный, как у нативного input без multiple.
 * maxCount здесь не применяется; невалидный файл выбранный не вытесняет.
 */
function replaceFile(ctx: FileUploadContext, files: File[]): void {
	const [file] = validateFiles(ctx, files)
	if (!file) return

	const replacedItems = ctx.uploadedFiles.value
	ctx.uploadedFiles.value = []
	replacedItems.forEach(item => releaseItem(ctx, item))
	commitUploadItem(ctx, buildUploadItem(ctx, file))
	ctx.options.onChange([file])
}

/** Описание: добавляет файлы с учётом режима выбора; ошибки прошлого выбора заменяются новыми */
function addFiles(ctx: FileUploadContext, files: File[]): void {
	if (files.length === 0) return
	ctx.internalErrors.value = []

	if (!(ctx.options.getIsMultiple?.() ?? true)) {
		replaceFile(ctx, files)
		return
	}

	appendFiles(ctx, files)
}

/** Описание: удаляет файл из списка, снимает ошибку лимита и сообщает новый список */
function removeFile(ctx: FileUploadContext, item: UploadedFile): void {
	ctx.uploadedFiles.value = ctx.uploadedFiles.value.filter(uploadedFile => uploadedFile.id !== item.id)
	const limitMessage = maxCountMessage(ctx)
	ctx.internalErrors.value = ctx.internalErrors.value.filter(message => message !== limitMessage)
	releaseItem(ctx, item)
	emitChange(ctx)
}

/** Описание: очищает список и ошибки (reset формы); change — только если файлы были */
function clearFiles(ctx: FileUploadContext): void {
	const items = ctx.uploadedFiles.value
	ctx.uploadedFiles.value = []
	ctx.internalErrors.value = []
	items.forEach(item => releaseItem(ctx, item))
	if (items.length > 0) emitChange(ctx)
}

/** Описание: повторяет загрузку файла со статусом `error` */
function retryFile(ctx: FileUploadContext, item: UploadedFile): void {
	const live = ctx.uploadedFiles.value.find(uploadedFile => uploadedFile.id === item.id)
	if (live?.status === 'error') ctx.transfer.start(live.id)
}

export { addFiles, clearFiles, removeFile, retryFile }
