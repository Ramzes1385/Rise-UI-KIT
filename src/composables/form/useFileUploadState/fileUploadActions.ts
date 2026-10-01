/** Утилиты: добавление, замена и удаление файлов в состоянии загрузки */
import { UI_TEXT } from '@/locales/messages'
import type { FileUploadContext } from './types/useFileUploadState.types'
import type { UploadedFile } from '@components/BaseFileUpload/types/BaseFileUpload.types'
import { buildUploadItem, commitUploadItem, releaseItem, reportError, validateFiles } from './fileUploadItems'

function emitChange(ctx: FileUploadContext): void {
	ctx.options.onChange(ctx.uploadedFiles.value.map(uploadedFile => uploadedFile.file))
}

/** Описание: множественный режим — добавляет валидные файлы до maxCount */
async function appendFiles(ctx: FileUploadContext, files: File[]): Promise<void> {
	const maxCount = ctx.options.getMaxCount()
	const remaining = maxCount - ctx.uploadedFiles.value.length
	if (remaining <= 0) {
		reportError(ctx, `${UI_TEXT.FILE_MAX_COUNT_PREFIX} ${maxCount}`)
		return
	}

	ctx.internalErrors.value = []
	const valid = validateFiles(ctx, files.slice(0, remaining))

	for (const file of valid) {
		commitUploadItem(ctx, await buildUploadItem(file))
	}

	emitChange(ctx)
}

/**
 * Одиночный режим: новый валидный файл заменяет выбранный, как у нативного input без multiple.
 * Раньше файлы копились до maxCount, и потребитель, читающий files[0] из change, получал старый файл.
 * maxCount здесь не применяется; невалидный файл выбранный не вытесняет.
 */
async function replaceFile(ctx: FileUploadContext, files: File[]): Promise<void> {
	ctx.internalErrors.value = []
	const [file] = validateFiles(ctx, files)
	if (!file) return

	const selectionId = ++ctx.selection.id
	const replacedItems = ctx.uploadedFiles.value
	ctx.uploadedFiles.value = []
	replacedItems.forEach(item => releaseItem(ctx, item))

	const item = await buildUploadItem(file)
	if (selectionId !== ctx.selection.id) return
	commitUploadItem(ctx, item)
	ctx.options.onChange([file])
}

/** Описание: добавляет файлы с учётом режима выбора (одиночный — замена, множественный — до maxCount) */
async function addFiles(ctx: FileUploadContext, files: File[]): Promise<void> {
	/* istanbul ignore next — defensive: пустой массив отсекается на уровне input change */
	if (files.length === 0) return

	if (!(ctx.options.getIsMultiple?.() ?? true)) {
		await replaceFile(ctx, files)
		return
	}

	await appendFiles(ctx, files)
}

/** Описание: удаляет файл из списка, освобождает превью и сообщает новый список */
function removeFile(ctx: FileUploadContext, item: UploadedFile): void {
	ctx.uploadedFiles.value = ctx.uploadedFiles.value.filter(uploadedFile => uploadedFile.id !== item.id)
	releaseItem(ctx, item)
	emitChange(ctx)
}

export { addFiles, removeFile }
